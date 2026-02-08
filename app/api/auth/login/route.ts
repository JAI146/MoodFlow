import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }

        return NextResponse.json({
            user: data.user,
            session: data.session,
            message: 'Logged in successfully!'
        })

    } catch (error: any) {
        console.error('Login error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
