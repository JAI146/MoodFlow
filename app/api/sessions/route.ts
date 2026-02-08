import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const now = new Date().toISOString()
        const sessionRow = {
            user_id: user.id,
            started_at: body.started_at ?? now,
            planned_minutes: body.time_allocated ?? body.planned_minutes ?? 30,
            mood_at_start: body.mood ?? body.mood_at_start ?? 'moderate',
            task_type: body.task_type ?? 'general_study',
            task_id: body.task_id ?? null,
            notes: body.task_description ?? body.notes ?? null
        }

        const { data, error } = await supabase
            .from('study_sessions')
            .insert(sessionRow)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ session: data }, { status: 201 })
    } catch (error: any) {
        console.error('Start session error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error

        return NextResponse.json({ sessions: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
