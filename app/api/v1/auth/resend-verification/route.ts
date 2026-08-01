import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in.' } },
        { status: 401 }
      );
    }

    // Check if already verified
    const { data: user } = await supabase
      .from('users')
      .select('email, email_verified')
      .eq('id', session.user.id)
      .single();

    if (!user || user.email_verified) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_VERIFIED', message: 'Email is already verified.' } },
        { status: 400 }
      );
    }

    // Delete existing unused tokens for this user to prevent clutter
    await supabase.from('email_verifications').delete().eq('user_id', session.user.id).is('verified_at', null);

    // Create new token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('email_verifications').insert({
      user_id: session.user.id,
      token,
      expires_at: expiresAt,
    });

    // TODO: Enqueue verification email
    // await emailQueue.add('send-verification', { userId: session.user.id, email: user.email, token });
    console.info(`[resend-verification] Token for ${user.email}: ${token}`);

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'verification_email_resent',
      resource: 'users',
      result: 'success',
      ip_address: req.headers.get('x-forwarded-for') ?? req.ip,
    });

    return NextResponse.json({ success: true, message: 'Verification email resent.' });
  } catch (err) {
    console.error('[resend-verification] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Something went wrong.' } },
      { status: 500 }
    );
  }
}
