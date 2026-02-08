import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
    try {
        const { email, password, fullName } = await req.json()

        // Validation
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create user with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            user: data.user,
            message: 'Account created successfully!'
        }, { status: 201 })

    } catch (error: any) {
        console.error('Signup error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
