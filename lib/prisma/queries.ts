/**
 * Common Prisma query helpers
 * 
 * These functions provide typed, reusable queries for common operations.
 * Import and use in Server Components, Server Actions, or API routes.
 * 
 * Note: Authentication is handled by Supabase Auth. User ID is obtained from
 * Supabase session and passed to Prisma queries.
 */

import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from './client'
import { createClient } from '../supabase/server'

// Helper to get current user ID from Supabase Auth
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ============================================================================
// PROFILES
// ============================================================================

export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId()
  if (!userId) return null
  
  return prisma.profile.findUnique({
    where: { id: userId }
  })
}

export async function updateProfile(updates: {
  displayName?: string
  defaultSessionMinutes?: number
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.profile.update({
    where: { id: userId },
    data: updates
  })
}

// ============================================================================
// COURSES
// ============================================================================

export async function getUserCourses() {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  return prisma.course.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createCourse(course: {
  name: string
  description?: string
  color?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.course.create({
    data: {
      ...course,
      userId
    }
  })
}

export async function updateCourse(courseId: string, updates: {
  name?: string
  description?: string
  color?: string
}) {
  return prisma.course.update({
    where: { id: courseId },
    data: updates
  })
}

export async function deleteCourse(courseId: string) {
  return prisma.course.delete({
    where: { id: courseId }
  })
}

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export async function getUserAssignments(options?: {
  includeCompleted?: boolean
  courseId?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const where: any = { userId }
  
  if (!options?.includeCompleted) {
    where.completedAt = null
  }
  
  if (options?.courseId) {
    where.courseId = options.courseId
  }
  
  return prisma.assignment.findMany({
    where,
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: { dueAt: 'asc' }
  })
}

export async function getUpcomingAssignments(limit?: number) {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  const assignments = await prisma.assignment.findMany({
    where: {
      userId,
      dueAt: { gte: new Date() },
      completedAt: null
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: { dueAt: 'asc' },
    take: limit
  })
  
  return assignments
}

export async function createAssignment(assignment: {
  title: string
  dueAt: Date | string
  courseId?: string
  estimatedMinutes?: number
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.assignment.create({
    data: {
      ...assignment,
      dueAt: typeof assignment.dueAt === 'string' ? new Date(assignment.dueAt) : assignment.dueAt,
      userId,
      courseId: assignment.courseId || undefined
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  })
}

export async function completeAssignment(assignmentId: string) {
  return prisma.assignment.update({
    where: { id: assignmentId },
    data: { completedAt: new Date() }
  })
}

// ============================================================================
// EXAMS
// ============================================================================

export async function getUserExams() {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  return prisma.exam.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: { examAt: 'asc' }
  })
}

export async function getUpcomingExams(limit?: number) {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  return prisma.exam.findMany({
    where: {
      userId,
      examAt: { gte: new Date() }
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: { examAt: 'asc' },
    take: limit
  })
}

export async function createExam(exam: {
  title: string
  examAt: Date | string
  courseId?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.exam.create({
    data: {
      ...exam,
      examAt: typeof exam.examAt === 'string' ? new Date(exam.examAt) : exam.examAt,
      userId,
      courseId: exam.courseId || undefined
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  })
}

// ============================================================================
// STUDY SESSIONS
// ============================================================================

export async function createStudySession(session: {
  startedAt: Date | string
  plannedMinutes: number
  moodAtStart: 'low' | 'moderate' | 'high'
  taskType: 'assignment' | 'exam_prep' | 'general_study' | 'typing_game'
  taskId?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.studySession.create({
    data: {
      ...session,
      startedAt: typeof session.startedAt === 'string' ? new Date(session.startedAt) : session.startedAt,
      userId,
      taskId: session.taskId || undefined
    },
    include: {
      assignment: {
        select: {
          id: true,
          title: true
        }
      }
    }
  })
}

export async function endStudySession(sessionId: string, notes?: string) {
  return prisma.studySession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      notes: notes || undefined
    }
  })
}

export async function getRecentStudySessions(limit: number = 10) {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  return prisma.studySession.findMany({
    where: { userId },
    include: {
      assignment: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { startedAt: 'desc' },
    take: limit
  })
}

// ============================================================================
// MOOD LOGS
// ============================================================================

export async function createMoodLog(log: {
  loggedAt: Date | string
  mood: 'low' | 'moderate' | 'high'
  availableMinutes: number
  sessionId?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.moodLog.create({
    data: {
      ...log,
      loggedAt: typeof log.loggedAt === 'string' ? new Date(log.loggedAt) : log.loggedAt,
      userId,
      sessionId: log.sessionId || undefined
    }
  })
}

export async function getMoodHistory(limit: number = 30) {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  return prisma.moodLog.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: limit
  })
}

// ============================================================================
// CODING PRACTICE SESSIONS
// ============================================================================

export async function createCodingPracticeSession(session: {
  language: string
  snippetId?: string
  startedAt: Date | string
  endedAt: Date | string
  durationSeconds: number
  charactersTyped: number
  charactersCorrect: number
  wpm?: number
  accuracyPercent: number
  sessionId?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.codingPracticeSession.create({
    data: {
      ...session,
      startedAt: typeof session.startedAt === 'string' ? new Date(session.startedAt) : session.startedAt,
      endedAt: typeof session.endedAt === 'string' ? new Date(session.endedAt) : session.endedAt,
      userId,
      wpm: session.wpm ? new Decimal(session.wpm) : undefined,
      accuracyPercent: new Decimal(session.accuracyPercent),
      sessionId: session.sessionId || undefined
    }
  })
}

export async function getCodingPracticeHistory(language?: string, limit: number = 20) {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  return prisma.codingPracticeSession.findMany({
    where: {
      userId,
      ...(language && { language })
    },
    orderBy: { startedAt: 'desc' },
    take: limit
  })
}

// ============================================================================
// MISTAKE RECORDS
// ============================================================================

export async function recordMistake(mistake: {
  source: 'typing_game' | 'manual'
  mistakeType: string
  context?: string
  language?: string
  occurredAt: Date | string
  count?: number
}) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')
  
  return prisma.mistakeRecord.create({
    data: {
      ...mistake,
      occurredAt: typeof mistake.occurredAt === 'string' ? new Date(mistake.occurredAt) : mistake.occurredAt,
      userId,
      count: mistake.count ?? 1
    }
  })
}

export async function getCommonMistakes(language?: string, limit: number = 10) {
  const userId = await getCurrentUserId()
  if (!userId) return []
  
  return prisma.mistakeRecord.findMany({
    where: {
      userId,
      ...(language && { language })
    },
    orderBy: { count: 'desc' },
    take: limit
  })
}

// ============================================================================
// SNIPPETS
// ============================================================================

export async function getSnippets(language?: string) {
  return prisma.snippet.findMany({
    where: language ? { language } : undefined,
    orderBy: { difficulty: 'asc' }
  })
}

export async function getSnippet(snippetId: string) {
  return prisma.snippet.findUnique({
    where: { id: snippetId }
  })
}
