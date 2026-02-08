import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('assignments')
            .select('*, courses(*)')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true })

        if (error) throw error

        return NextResponse.json({ assignments: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const assignment = await req.json()

        const { data, error } = await supabase
            .from('assignments')
            .insert({
                user_id: user.id,
                ...assignment
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ assignment: data }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
