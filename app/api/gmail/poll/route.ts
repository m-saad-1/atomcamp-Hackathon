import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pollInbox } from '@/lib/gmail/poller';

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // Read tokens directly from the NextAuth JWT — available even if the
  // Supabase sessions table hasn't been populated yet.
  const s = session as any;
  const tokenSet = s.access_token
    ? {
        access_token:     s.access_token     as string,
        refresh_token:    s.refresh_token    as string | null,
        token_expires_at: s.token_expires_at as number | null,
      }
    : undefined;

  if (!tokenSet?.access_token) {
    return NextResponse.json(
      {
        error:    'NO_TOKEN',
        message:  'Gmail access token is missing. Please sign out and sign back in.',
        recovery: 'Sign out from the sidebar, then sign in again with Google.',
      },
      { status: 401 }
    );
  }

  try {
    const result = await pollInbox(session.user.id, tokenSet);
    return NextResponse.json({
      success: true,
      inserted: result.inserted,
      skipped:  result.skipped,
      message:  `Fetched ${result.inserted} new email(s). ${result.skipped} already stored.`,
    });
  } catch (err) {
    console.error('[/api/gmail/poll]', err);
    return NextResponse.json(
      {
        error:    'POLL_FAILED',
        message:  err instanceof Error ? err.message : String(err),
        recovery: 'Check Gmail OAuth scopes and token validity. Try signing out and back in.',
      },
      { status: 500 }
    );
  }
}
