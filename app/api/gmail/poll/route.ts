import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pollInbox } from '@/lib/gmail/poller';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    await pollInbox(session.user.id);
    return NextResponse.json({ success: true, message: 'Inbox polled successfully.' });
  } catch (err) {
    return NextResponse.json({
      error:     'POLL_FAILED',
      message:   err instanceof Error ? err.message : String(err),
      recovery:  'Check Gmail OAuth scopes and token validity. Try signing out and back in.',
      retryable: true,
    }, { status: 500 });
  }
}
