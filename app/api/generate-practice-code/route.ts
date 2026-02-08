import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generatePracticeCode, type PracticeLanguage } from '@/lib/ai/generate-practice-code'

const LANGUAGES: PracticeLanguage[] = ['javascript', 'python', 'typescript', 'java', 'cpp', 'rust']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const mood = body.mood as 'low' | 'moderate' | 'high' | undefined
    const timeAvailable = typeof body.timeAvailable === 'number' ? body.timeAvailable : 30
    const language = body.language && LANGUAGES.includes(body.language) ? body.language : undefined

    if (!mood || !['low', 'moderate', 'high'].includes(mood)) {
      return NextResponse.json(
        { error: 'mood is required and must be low, moderate, or high' },
        { status: 400 }
      )
    }

    const result = await generatePracticeCode({
      mood,
      timeAvailable,
      language,
    })

    return NextResponse.json({
      code: result.code,
      language: result.language,
    })
  } catch (err) {
    console.error('Generate practice code error:', err)
    const message = err instanceof Error ? err.message : 'Failed to generate practice code'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
