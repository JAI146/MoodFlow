/**
 * Common Prisma query helpers
 *
 * These functions provide typed, reusable queries for common operations.
 * Import and use in Server Components, Server Actions, or API routes.
 *
 * Note: Authentication is handled by Supabase Auth. User ID is obtained from
 * Supabase session and passed to Prisma queries.
 */

import { prisma } from './prisma/client';
import { createClient } from './supabase/server';
import { MistakeSource, MoodLevel, Prisma, TaskType } from './generated/prisma/client';

// Helper to get current user ID from Supabase Auth
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ============================================================================
// PROFILES
// ============================================================================

export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.profile.findUnique({
    where: { id: userId },
  });
}

export async function updateProfile(updates: {
  displayName?: string;
  defaultSessionMinutes?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.profile.update({
    where: { id: userId },
    data: updates,
  });
}

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
  });
}

export async function upsertProfile(
  userId: string,
  updates: { displayName?: string | null; defaultSessionMinutes?: number },
) {
  return prisma.profile.upsert({
    where: { id: userId },
    create: {
      id: userId,
      displayName: updates.displayName ?? null,
      defaultSessionMinutes: updates.defaultSessionMinutes ?? 30,
    },
    update: {
      ...(updates.displayName !== undefined && { displayName: updates.displayName }),
      ...(updates.defaultSessionMinutes !== undefined && {
        defaultSessionMinutes: updates.defaultSessionMinutes,
      }),
    },
  });
}

// ============================================================================
// USER STATS
// ============================================================================

export async function getUserStats(userId: string) {
  return prisma.userStats.findUnique({
    where: { userId },
  });
}

/** Compute current and longest streak from actual session completion dates (UTC date strings). */
function computeStreaksFromDates(dateStrs: string[]): { current: number; longest: number } {
  const sorted = [...new Set(dateStrs)].sort();
  if (sorted.length === 0) return { current: 0, longest: 0 };
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00.000Z').getTime();
    const curr = new Date(sorted[i] + 'T00:00:00.000Z').getTime();
    const gap = (curr - prev) / (1000 * 60 * 60 * 24);
    if (gap === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  const lastDate = sorted[sorted.length - 1];
  run = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    const curr = new Date(sorted[i + 1] + 'T00:00:00.000Z').getTime();
    const prev = new Date(sorted[i] + 'T00:00:00.000Z').getTime();
    if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) run += 1;
    else break;
  }
  return { current: run, longest };
}

export async function getStreaksFromSessions(userId: string): Promise<{
  current: number;
  longest: number;
} | null> {
  const sessions = await prisma.studySession.findMany({
    where: { userId, endedAt: { not: null } },
    select: { endedAt: true },
  });
  const dateStrs = sessions
    .map((s) => s.endedAt!.toISOString().split('T')[0])
    .filter(Boolean);
  if (dateStrs.length === 0) return null;
  return computeStreaksFromDates(dateStrs);
}

/** Optional YYYY-MM-DD for the completion day (client local date). If omitted, uses server UTC. */
export async function upsertUserStatsForCompletion(
  userId: string,
  durationMinutes: number,
  completedDateStr?: string,
) {
  const todayStr =
    completedDateStr && /^\d{4}-\d{2}-\d{2}$/.test(completedDateStr)
      ? completedDateStr
      : new Date().toISOString().split('T')[0];

  const existing = await prisma.userStats.findUnique({
    where: { userId },
  });

  const prevTotalTime = existing?.totalStudyTime ?? 0;
  const prevSessions = existing?.totalSessions ?? 0;
  const prevStreak = existing?.currentStreak ?? 0;
  const prevLongest = existing?.longestStreak ?? 0;
  const lastSessionDate = existing?.lastSessionDate;

  let newStreak: number;
  if (lastSessionDate) {
    const lastStr = lastSessionDate.toISOString().split('T')[0];
    const todayMs = new Date(todayStr + 'T00:00:00.000Z').getTime();
    const lastMs = new Date(lastStr + 'T00:00:00.000Z').getTime();
    const daysDiff = Math.floor((todayMs - lastMs) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) newStreak = prevStreak;
    else if (daysDiff === 1) newStreak = prevStreak + 1;
    else newStreak = 1;
  } else {
    newStreak = 1;
  }
  const newLongest = Math.max(prevLongest, newStreak);
  const newTotalTime = prevTotalTime + durationMinutes;

  const dateOnly = new Date(todayStr + 'T00:00:00.000Z');

  return prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      totalStudyTime: newTotalTime,
      totalSessions: prevSessions + 1,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastSessionDate: dateOnly,
    },
    update: {
      totalStudyTime: newTotalTime,
      totalSessions: prevSessions + 1,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastSessionDate: dateOnly,
    },
  });
}

// ============================================================================
// COURSES
// ============================================================================

export async function getUserCourses() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.course.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createCourse(course: { name: string; description?: string; color?: string }) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.course.create({
    data: {
      ...course,
      userId,
    },
  });
}

export async function updateCourse(
  courseId: string,
  updates: {
    name?: string;
    description?: string;
    color?: string;
  },
) {
  return prisma.course.update({
    where: { id: courseId },
    data: updates,
  });
}

export async function deleteCourse(courseId: string) {
  return prisma.course.delete({
    where: { id: courseId },
  });
}

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export async function getUserAssignments(options?: {
  includeCompleted?: boolean;
  courseId?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const where: any = { userId };

  if (!options?.includeCompleted) {
    where.completedAt = null;
  }

  if (options?.courseId) {
    where.courseId = options.courseId;
  }

  return prisma.assignment.findMany({
    where,
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { dueAt: 'asc' },
  });
}

export async function getUpcomingAssignments(limit?: number) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const assignments = await prisma.assignment.findMany({
    where: {
      userId,
      dueAt: { gte: new Date() },
      completedAt: null,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { dueAt: 'asc' },
    take: limit,
  });

  return assignments;
}

export async function createAssignment(assignment: {
  title: string;
  dueAt: Date | string;
  courseId?: string;
  estimatedMinutes?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.assignment.create({
    data: {
      ...assignment,
      dueAt: typeof assignment.dueAt === 'string' ? new Date(assignment.dueAt) : assignment.dueAt,
      userId,
      courseId: assignment.courseId || undefined,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });
}

export async function completeAssignment(assignmentId: string) {
  return prisma.assignment.update({
    where: { id: assignmentId },
    data: { completedAt: new Date() },
  });
}

// ============================================================================
// EXAMS
// ============================================================================

export async function getUserExams() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.exam.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { examAt: 'asc' },
  });
}

export async function getUpcomingExams(limit?: number) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.exam.findMany({
    where: {
      userId,
      examAt: { gte: new Date() },
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { examAt: 'asc' },
    take: limit,
  });
}

export async function createExam(exam: {
  title: string;
  examAt: Date | string;
  courseId?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.exam.create({
    data: {
      ...exam,
      examAt: typeof exam.examAt === 'string' ? new Date(exam.examAt) : exam.examAt,
      userId,
      courseId: exam.courseId || undefined,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });
}

// ============================================================================
// STUDY SESSIONS
// ============================================================================

export async function createStudySession(session: {
  startedAt: Date | string;
  plannedMinutes: number;
  moodAtStart: MoodLevel;
  taskType: TaskType;
  taskId?: string;
  notes?: string | null;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.studySession.create({
    data: {
      startedAt:
        typeof session.startedAt === 'string' ? new Date(session.startedAt) : session.startedAt,
      plannedMinutes: session.plannedMinutes,
      moodAtStart: session.moodAtStart,
      taskType: session.taskType,
      taskId: session.taskId || undefined,
      notes: session.notes ?? undefined,
      userId,
    },
    include: {
      assignment: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function endStudySession(sessionId: string, notes?: string) {
  return prisma.studySession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      notes: notes || undefined,
    },
  });
}

export async function getRecentStudySessions(limit: number = 10) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.studySession.findMany({
    where: { userId },
    include: {
      assignment: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// MOOD LOGS
// ============================================================================

export async function createMoodLog(log: {
  loggedAt: Date | string;
  mood: MoodLevel;
  availableMinutes: number;
  sessionId?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.moodLog.create({
    data: {
      ...log,
      loggedAt: typeof log.loggedAt === 'string' ? new Date(log.loggedAt) : log.loggedAt,
      userId,
      sessionId: log.sessionId || undefined,
    },
  });
}

export async function getMoodHistory(limit: number = 30) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.moodLog.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// CODING PRACTICE SESSIONS
// ============================================================================

export async function createCodingPracticeSession(session: {
  language: string;
  snippetId?: string;
  startedAt: Date | string;
  endedAt: Date | string;
  durationSeconds: number;
  charactersTyped: number;
  charactersCorrect: number;
  wpm?: number;
  accuracyPercent: number;
  sessionId?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.codingPracticeSession.create({
    data: {
      ...session,
      startedAt:
        typeof session.startedAt === 'string' ? new Date(session.startedAt) : session.startedAt,
      endedAt: typeof session.endedAt === 'string' ? new Date(session.endedAt) : session.endedAt,
      userId,
      wpm: session.wpm ? new Prisma.Decimal(session.wpm) : undefined,
      accuracyPercent: new Prisma.Decimal(session.accuracyPercent),
      sessionId: session.sessionId || undefined,
    },
  });
}

export async function getCodingPracticeHistory(language?: string, limit: number = 20) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.codingPracticeSession.findMany({
    where: {
      userId,
      ...(language && { language }),
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// MISTAKE RECORDS
// ============================================================================

export async function recordMistake(mistake: {
  source: MistakeSource;
  mistakeType: string;
  context?: string;
  language?: string;
  occurredAt: Date | string;
  count?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  return prisma.mistakeRecord.create({
    data: {
      ...mistake,
      occurredAt:
        typeof mistake.occurredAt === 'string' ? new Date(mistake.occurredAt) : mistake.occurredAt,
      userId,
      count: mistake.count ?? 1,
    },
  });
}

export async function getCommonMistakes(language?: string, limit: number = 10) {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.mistakeRecord.findMany({
    where: {
      userId,
      ...(language && { language }),
    },
    orderBy: { count: 'desc' },
    take: limit,
  });
}

// ============================================================================
// SNIPPETS
// ============================================================================

export async function getSnippets(language?: string) {
  return prisma.snippet.findMany({
    where: language ? { language } : undefined,
    orderBy: { difficulty: 'asc' },
  });
}

export async function getSnippet(snippetId: string) {
  return prisma.snippet.findUnique({
    where: { id: snippetId },
  });
}
