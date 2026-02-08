import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserStats, getStreaksFromSessions } from '@/lib/queries';

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statsRow = await getUserStats(user.id);

    if (!statsRow) {
      return NextResponse.json({
        stats: {
          total_study_time: 0,
          total_sessions: 0,
          current_streak: 0,
          longest_streak: 0,
          last_session_date: null,
        },
      });
    }

    // Prefer streaks computed from actual session dates so "3 sessions in one day" = 1 day
    const fromSessions = await getStreaksFromSessions(user.id);
    let currentStreak = fromSessions ? fromSessions.current : statsRow.currentStreak;
    let longestStreak = fromSessions ? fromSessions.longest : statsRow.longestStreak;

    // Zero out current streak if last session was not today or yesterday (client's calendar)
    const clientToday = new URL(req.url).searchParams.get('clientToday');
    const todayStr =
      clientToday && /^\d{4}-\d{2}-\d{2}$/.test(clientToday)
        ? clientToday
        : new Date().toISOString().split('T')[0];
    const lastStr = statsRow.lastSessionDate?.toISOString().split('T')[0] ?? null;
    if (lastStr) {
      const todayMs = new Date(todayStr + 'T00:00:00.000Z').getTime();
      const lastMs = new Date(lastStr + 'T00:00:00.000Z').getTime();
      const daysSince = Math.floor((todayMs - lastMs) / (1000 * 60 * 60 * 24));
      if (daysSince > 1) currentStreak = 0;
    }

    return NextResponse.json({
      stats: {
        total_study_time: statsRow.totalStudyTime,
        total_sessions: statsRow.totalSessions,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_session_date: statsRow.lastSessionDate?.toISOString().split('T')[0] ?? null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
