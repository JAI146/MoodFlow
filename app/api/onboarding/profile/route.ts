import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getProfileByUserId, upsertProfile } from '@/lib/queries';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfileByUserId(user.id);
    if (!profile) {
      return NextResponse.json({
        profile: {
          id: user.id,
          display_name: null,
          default_session_minutes: 30,
        },
      });
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        display_name: profile.displayName,
        default_session_minutes: profile.defaultSessionMinutes,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updates: { displayName?: string | null; defaultSessionMinutes?: number } = {};
    if (body.displayName !== undefined) updates.displayName = body.displayName;
    if (body.defaultSessionMinutes !== undefined)
      updates.defaultSessionMinutes = body.defaultSessionMinutes;

    const profile = await upsertProfile(user.id, updates);

    return NextResponse.json({
      profile: {
        id: profile.id,
        display_name: profile.displayName,
        default_session_minutes: profile.defaultSessionMinutes,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
