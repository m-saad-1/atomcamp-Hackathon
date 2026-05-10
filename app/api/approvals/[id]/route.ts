import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import { getValidAccessToken } from '@/lib/gmail/auth';
import { notifySlack } from '@/lib/slack/notify';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body; // 'approve' | 'reject' | 'skip'

  const { data: approval, error: approvalErr } = await supabase
    .from('approvals')
    .select('*')
    .eq('id', params.id)
    .single();

  if (approvalErr || !approval || approval.status !== 'pending') {
    return NextResponse.json({ error: 'INVALID_APPROVAL' }, { status: 400 });
  }

  if (action === 'reject' || action === 'skip') {
    await supabase.from('approvals').update({
      status: 'rejected',
      reviewed_by: session!.user!.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', approval.id);
    return NextResponse.json({ success: true, status: 'rejected' });
  }

  // ── Execute action based on type ──────────────────────────────────────────
  try {
    const payload = approval.action_payload;

    if (approval.action_type === 'send_email') {
      const token = await getValidAccessToken(session!.user!.id);
      await sendGmail(token, payload.to, payload.subject, payload.body);
    }
    else if (approval.action_type === 'create_candidate') {
      await supabase.from('candidates').update({
        is_draft: false,
      }).eq('id', payload.candidate_id);
    }
    else if (approval.action_type === 'move_stage') {
      await supabase.from('candidates').update({
        stage: payload.to_stage,
      }).eq('id', payload.candidate_id);
      
      if (payload.application_id) {
        await supabase.from('applications').update({
          stage: payload.to_stage,
        }).eq('id', payload.application_id);
      }
    }
    else if (approval.action_type === 'slack_notify') {
      await notifySlack(payload.message, payload.candidate_id);
    }
    // Handle other actions...

    // Mark as approved and executed
    await supabase.from('approvals').update({
      status: 'approved',
      reviewed_by: session!.user!.id,
      reviewed_at: new Date().toISOString(),
      executed_at: new Date().toISOString(),
    }).eq('id', approval.id);

    return NextResponse.json({ success: true, status: 'approved' });

  } catch (err) {
    console.error('Approval execution failed:', err);
    await supabase.from('approvals').update({
      execution_error: err instanceof Error ? err.message : String(err),
      retry_count: approval.retry_count + 1,
    }).eq('id', approval.id);

    return NextResponse.json({ error: 'EXECUTION_FAILED' }, { status: 500 });
  }
}

/**
 * Send an email via Gmail API
 */
async function sendGmail(token: string, to: string, subject: string, bodyText: string) {
  // Construct raw RFC 2822 message
  const rawMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    '',
    bodyText,
  ].join('\n');

  // Base64URL encode
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gmail API Error: ${res.status} ${errorBody}`);
  }
}
