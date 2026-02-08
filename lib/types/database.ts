// Database types for MoodFlow

export interface Profile {
    id: string
    email: string
    full_name: string | null
    university: string | null
    major: string | null
    year_of_study: string | null
    created_at: string
    updated_at: string
}

export interface Course {
    id: string
    user_id: string
    course_name: string
    course_code: string | null
    instructor: string | null
    credits: number | null
    created_at: string
}

export interface Assignment {
    id: string
    user_id: string
    course_id: string | null
    title: string
    description: string | null
    due_date: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending' | 'in_progress' | 'completed'
    estimated_hours: number | null
    progress_percentage: number
    progress_steps: any[]
    created_at: string
    updated_at: string
}

export interface Exam {
    id: string
    user_id: string
    course_id: string | null
    exam_name: string
    exam_type: 'midterm' | 'final' | 'quiz' | 'other'
    exam_date: string
    topics: string[]
    study_status: 'not_started' | 'in_progress' | 'ready'
    created_at: string
}

export interface ScheduleBlock {
    id: string
    user_id: string
    title: string
    description: string | null
    start_time: string
    end_time: string
    recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
    is_free_time: boolean
    created_at: string
}

export interface StudySession {
    id: string
    user_id: string
    mood: 'low' | 'moderate' | 'high'
    energy_level: number
    time_allocated: number
    task_type: 'assignment' | 'exam' | 'coding' | 'reading' | 'other'
    task_id: string | null
    task_description: string | null
    duration_actual: number | null
    completed: boolean
    notes: string | null
    created_at: string
}

export interface TypingSession {
    id: string
    user_id: string
    language: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    code_snippet: string
    user_input: string | null
    wpm: number | null
    accuracy: number | null
    mistakes: any[]
    duration: number | null
    created_at: string
}

export interface UserPreferences {
    id: string
    user_id: string
    study_style: string[]
    preferred_study_times: string[]
    avg_focus_duration: number | null
    break_preference: number | null
    notification_preferences: any
    ai_personality: string
    created_at: string
    updated_at: string
}

export interface Recommendation {
    id: string
    user_id: string
    session_id: string | null
    mood: string
    time_available: number
    recommended_task: any
    was_accepted: boolean | null
    reasoning: string | null
    created_at: string
}

export interface UserStats {
    id: string
    user_id: string
    total_study_time: number
    total_sessions: number
    languages_practiced: string[]
    average_wpm: number
    average_accuracy: number
    current_streak: number
    longest_streak: number
    common_mistakes: any[]
    last_session_date: string | null
    created_at: string
    updated_at: string
}
