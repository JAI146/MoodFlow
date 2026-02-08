/**
 * Common Supabase query helpers
 * 
 * These functions provide typed, reusable queries for common operations.
 * Import and use in Server Components, Server Actions, or API routes.
 */

import { createClient } from './server'

// ============================================================================
// PROFILES
// ============================================================================

export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(updates: {
  display_name?: string
  default_session_minutes?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================================================
// COURSES
// ============================================================================

export async function getUserCourses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data ?? []
}

export async function createCourse(course: {
  name: string
  description?: string
  color?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('courses')
    .insert({
      ...course,
      user_id: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCourse(courseId: string, updates: {
  name?: string
  description?: string
  color?: string
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
  
  if (error) throw error
}

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export async function getUserAssignments(options?: {
  includeCompleted?: boolean
  courseId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  let query = supabase
    .from('assignments')
    .select(`
      *,
      courses (
        id,
        name,
        color
      )
    `)
    .order('due_at', { ascending: true })
  
  if (!options?.includeCompleted) {
    query = query.is('completed_at', null)
  }
  
  if (options?.courseId) {
    query = query.eq('course_id', options.courseId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data ?? []
}

export async function getUpcomingAssignments(limit?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  let query = supabase
    .from('assignments')
    .select(`
      *,
      courses (
        id,
        name,
        color
      )
    `)
    .gte('due_at', new Date().toISOString())
    .is('completed_at', null)
    .order('due_at', { ascending: true })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data ?? []
}

export async function createAssignment(assignment: {
  title: string
  due_at: string
  course_id?: string
  estimated_minutes?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('assignments')
    .insert({
      ...assignment,
      user_id: user.id
    })
    .select(`
      *,
      courses (
        id,
        name,
        color
      )
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function completeAssignment(assignmentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('assignments')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================================================
// EXAMS
// ============================================================================

export async function getUserExams() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      courses (
        id,
        name,
        color
      )
    `)
    .order('exam_at', { ascending: true })
  
  if (error) throw error
  return data ?? []
}

export async function getUpcomingExams(limit?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  let query = supabase
    .from('exams')
    .select(`
      *,
      courses (
        id,
        name,
        color
      )
    `)
    .gte('exam_at', new Date().toISOString())
    .order('exam_at', { ascending: true })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data ?? []
}

export async function createExam(exam: {
  title: string
  exam_at: string
  course_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('exams')
    .insert({
      ...exam,
      user_id: user.id
    })
    .select(`
      *,
      courses (
        id,
        name,
        color
      )
    `)
    .single()
  
  if (error) throw error
  return data
}

// ============================================================================
// STUDY SESSIONS
// ============================================================================

export async function createStudySession(session: {
  started_at: string
  planned_minutes: number
  mood_at_start: 'low' | 'moderate' | 'high'
  task_type: 'assignment' | 'exam_prep' | 'general_study' | 'typing_game'
  task_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      ...session,
      user_id: user.id
    })
    .select(`
      *,
      assignments (
        id,
        title
      )
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function endStudySession(sessionId: string, notes?: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('study_sessions')
    .update({
      ended_at: new Date().toISOString(),
      notes: notes ?? null
    })
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getRecentStudySessions(limit: number = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      *,
      assignments (
        id,
        title
      )
    `)
    .order('started_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data ?? []
}

// ============================================================================
// MOOD LOGS
// ============================================================================

export async function createMoodLog(log: {
  logged_at: string
  mood: 'low' | 'moderate' | 'high'
  available_minutes: number
  session_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('mood_logs')
    .insert({
      ...log,
      user_id: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getMoodHistory(limit: number = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data ?? []
}

// ============================================================================
// CODING PRACTICE SESSIONS
// ============================================================================

export async function createCodingPracticeSession(session: {
  language: string
  snippet_id?: string
  started_at: string
  ended_at: string
  duration_seconds: number
  characters_typed: number
  characters_correct: number
  wpm?: number
  accuracy_percent: number
  session_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('coding_practice_sessions')
    .insert({
      ...session,
      user_id: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getCodingPracticeHistory(language?: string, limit: number = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  let query = supabase
    .from('coding_practice_sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)
  
  if (language) {
    query = query.eq('language', language)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data ?? []
}

// ============================================================================
// MISTAKE RECORDS
// ============================================================================

export async function recordMistake(mistake: {
  source: 'typing_game' | 'manual'
  mistake_type: string
  context?: string
  language?: string
  occurred_at: string
  count?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('mistake_records')
    .insert({
      ...mistake,
      user_id: user.id,
      count: mistake.count ?? 1
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getCommonMistakes(language?: string, limit: number = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  let query = supabase
    .from('mistake_records')
    .select('*')
    .order('count', { ascending: false })
    .limit(limit)
  
  if (language) {
    query = query.eq('language', language)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data ?? []
}

// ============================================================================
// SNIPPETS
// ============================================================================

export async function getSnippets(language?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('snippets')
    .select('*')
    .order('difficulty')
  
  if (language) {
    query = query.eq('language', language)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data ?? []
}

export async function getSnippet(snippetId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', snippetId)
    .single()
  
  if (error) throw error
  return data
}
