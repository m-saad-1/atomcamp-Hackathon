import { NextResponse } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api-response';
import { auth } from '@/auth';
import { pollInbox } from '@/lib/gmail/poller';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', undefined, 401);
  }

  try {
    await pollInbox(session.user.id);
    return jsonResponse({ data: { success: true, message: 'Inbox polled successfully.'  } });
  } catch (err) {
    return errorResponse(
      'POLL_FAILED',
      err instanceof Error ? err.message : String(err),
      500
    );
  }
}
