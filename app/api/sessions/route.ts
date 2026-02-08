import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createStudySession, getRecentStudySessions } from '@/lib/queries';
import { MoodLevel, TaskType } from '@/lib/generated/prisma/enums';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const startedAt = body.started_at ? new Date(body.started_at) : new Date();
    const plannedMinutes = body.time_allocated ?? body.planned_minutes ?? 30;
    const moodAtStart = (body.mood ?? body.moodAtStart ?? MoodLevel.moderate) as MoodLevel;
    const rawTaskType = body.task_type ?? TaskType.general_study;
    const taskTypeMap: Record<string, TaskType> = {
      assignment: TaskType.assignment,
      exam_prep: TaskType.exam_prep,
      exam: TaskType.exam_prep,
      general_study: TaskType.general_study,
      coding: TaskType.typing_game,
      typing_game: TaskType.typing_game,
      reading: TaskType.general_study,
      review: TaskType.general_study,
    };
    const taskType = taskTypeMap[String(rawTaskType)] ?? TaskType.general_study;
    const notes = body.task_description ?? body.notes ?? null;

    const session = await createStudySession({
      startedAt,
      plannedMinutes,
      moodAtStart,
      taskType,
      taskId: body.task_id ?? undefined,
      notes,
    });

    return NextResponse.json(
      {
        session: {
          id: session.id,
          user_id: session.userId,
          started_at: session.startedAt,
          ended_at: session.endedAt,
          planned_minutes: session.plannedMinutes,
          moodAtStart: session.moodAtStart,
          task_type: session.taskType,
          task_id: session.taskId,
          notes: session.notes,
          created_at: session.createdAt,
          updated_at: session.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('Start session error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await getRecentStudySessions(20);

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        user_id: s.userId,
        started_at: s.startedAt,
        ended_at: s.endedAt,
        planned_minutes: s.plannedMinutes,
        duration_actual: s.durationActual,
        completed: s.completed,
        moodAtStart: s.moodAtStart,
        task_type: s.taskType,
        task_id: s.taskId,
        notes: s.notes,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
