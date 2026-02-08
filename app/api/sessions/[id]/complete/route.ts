import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { durationActual, completed, notes } = await req.json()

        // Update session
        const { data: session, error } = await supabase
            .from('study_sessions')
            .update({
                duration_actual: durationActual,
                completed,
                notes
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) throw error

        // Update user stats
        const { data: stats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (stats) {
            const today = new Date().toISOString().split('T')[0]
            const lastSessionDate = stats.last_session_date

            // Calculate streak
            let newStreak = stats.current_streak || 0
            if (lastSessionDate) {
                const lastDate = new Date(lastSessionDate)
                const todayDate = new Date(today)
                const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

                if (daysDiff === 0) {
                    // Same day, keep streak
                    newStreak = stats.current_streak
                } else if (daysDiff === 1) {
                    // Consecutive day, increment streak
                    newStreak = (stats.current_streak || 0) + 1
                } else {
                    // Streak broken, start over
                    newStreak = 1
                }
            } else {
                newStreak = 1
            }

            await supabase
                .from('user_stats')
                .update({
                    total_study_time: (stats.total_study_time || 0) + (durationActual || 0),
                    total_sessions: (stats.total_sessions || 0) + 1,
                    current_streak: newStreak,
                    longest_streak: Math.max(stats.longest_streak || 0, newStreak),
                    last_session_date: today
                })
                .eq('user_id', user.id)
        }

        return NextResponse.json({ session })
    } catch (error: any) {
        console.error('Complete session error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
