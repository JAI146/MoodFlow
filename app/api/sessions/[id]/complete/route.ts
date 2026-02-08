import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma/client';
import { upsertUserStatsForCompletion } from '@/lib/queries';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { durationActual, completed, notes } = await req.json();
    const durationMinutes = durationActual ?? 0;

    const session = await prisma.studySession.updateMany({
      where: { id, userId: user.id },
      data: {
        endedAt: new Date(),
        durationActual: durationMinutes || null,
        completed: completed ?? true,
        notes: notes ?? null,
      },
    });

    if (session.count === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await upsertUserStatsForCompletion(user.id, durationMinutes);

    const updated = await prisma.studySession.findUnique({
      where: { id },
    });

    return NextResponse.json({ session: updated });
  } catch (error: unknown) {
    console.error('Complete session error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
