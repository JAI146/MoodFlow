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
            .from('courses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ courses: data })
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

        const { courses } = await req.json()

        if (!courses || !Array.isArray(courses)) {
            return NextResponse.json(
                { error: 'Courses array is required' },
                { status: 400 }
            )
        }

        // Add user_id to each course
        const coursesWithUserId = courses.map((course: any) => ({
            ...course,
            user_id: user.id
        }))

        const { data, error } = await supabase
            .from('courses')
            .insert(coursesWithUserId)
            .select()

        if (error) throw error

        return NextResponse.json({ courses: data }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
