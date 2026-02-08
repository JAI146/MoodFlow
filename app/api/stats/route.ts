import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserStats } from '@/lib/queries';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statsRow = await getUserStats(user.id);

    return NextResponse.json({
      stats: statsRow
        ? {
            total_study_time: statsRow.totalStudyTime,
            total_sessions: statsRow.totalSessions,
            current_streak: statsRow.currentStreak,
            longest_streak: statsRow.longestStreak,
            last_session_date: statsRow.lastSessionDate?.toISOString().split('T')[0] ?? null,
          }
        : {
            total_study_time: 0,
            total_sessions: 0,
            current_streak: 0,
            longest_streak: 0,
            last_session_date: null,
          },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
