import { NextRequest, NextResponse } from 'next/server';
import { createCodingPracticeSession } from '@/lib/queries';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      language,
      startedAt,
      endedAt,
      durationSeconds,
      charactersTyped,
      charactersCorrect,
      wpm,
      accuracyPercent,
      snippetId,
      sessionId,
    } = body;

    if (
      !language ||
      startedAt == null ||
      endedAt == null ||
      durationSeconds == null ||
      charactersTyped == null ||
      charactersCorrect == null ||
      accuracyPercent == null
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: language, startedAt, endedAt, durationSeconds, charactersTyped, charactersCorrect, accuracyPercent',
        },
        { status: 400 },
      );
    }

    const session = await createCodingPracticeSession({
      language: String(language),
      snippetId: snippetId ?? undefined,
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
      durationSeconds: Number(durationSeconds),
      charactersTyped: Number(charactersTyped),
      charactersCorrect: Number(charactersCorrect),
      wpm: wpm != null ? Number(wpm) : undefined,
      accuracyPercent: Number(accuracyPercent),
      sessionId: sessionId ?? undefined,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
