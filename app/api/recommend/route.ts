import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getStudyRecommendation } from '@/lib/ai/recommendation-engine'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { mood, timeAvailable } = await req.json()

        if (!mood || !timeAvailable) {
            return NextResponse.json(
                { error: 'Mood and time available are required' },
                { status: 400 }
            )
        }

        // Fetch user context in parallel
        const [assignmentsRes, examsRes, historyRes, preferencesRes] = await Promise.all([
            supabase
                .from('assignments')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'pending')
                .order('due_date', { ascending: true }),
            supabase
                .from('exams')
                .select('*')
                .eq('user_id', user.id)
                .order('exam_date', { ascending: true }),
            supabase
                .from('study_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10),
            supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single()
        ])

        // Get AI recommendation
        const recommendation = await getStudyRecommendation({
            mood,
            timeAvailable,
            assignments: assignmentsRes.data || [],
            exams: examsRes.data || [],
            studyHistory: historyRes.data || [],
            preferences: preferencesRes.data || {},
            currentTime: new Date()
        })

        // Save recommendation to DB
        const { data: savedRec } = await supabase
            .from('recommendations')
            .insert({
                user_id: user.id,
                mood,
                time_available: timeAvailable,
                recommended_task: recommendation,
                reasoning: recommendation.reasoning
            })
            .select()
            .single()

        return NextResponse.json({
            recommendation,
            recommendation_id: savedRec?.id
        })

    } catch (error: any) {
        console.error('Recommendation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
