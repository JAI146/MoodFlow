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

        // Upsert user stats: save total study time, session count, current streak, longest streak
        const today = new Date().toISOString().split('T')[0]
        const { data: existingStats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()

        const prevTotalTime = existingStats?.total_study_time ?? 0
        const prevSessions = existingStats?.total_sessions ?? 0
        const prevStreak = existingStats?.current_streak ?? 0
        const prevLongest = existingStats?.longest_streak ?? 0
        const lastSessionDate = existingStats?.last_session_date ?? null

        let newStreak: number
        if (lastSessionDate) {
            const lastDate = new Date(lastSessionDate)
            const todayDate = new Date(today)
            const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
            if (daysDiff === 0) {
                newStreak = prevStreak
            } else if (daysDiff === 1) {
                newStreak = prevStreak + 1
            } else {
                newStreak = 1
            }
        } else {
            newStreak = 1
        }
        const newLongest = Math.max(prevLongest, newStreak)
        const newTotalTime = prevTotalTime + (durationActual ?? 0)

        await supabase.from('user_stats').upsert(
            {
                user_id: user.id,
                total_study_time: newTotalTime,
                total_sessions: prevSessions + 1,
                current_streak: newStreak,
                longest_streak: newLongest,
                last_session_date: today,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
        )

        return NextResponse.json({ session })
    } catch (error: any) {
        console.error('Complete session error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
