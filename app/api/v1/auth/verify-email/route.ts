import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  // Handle invalid or missing token directly via UI redirect
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  try {
    // Check token validity
    const { data: verification } = await supabase
      .from('email_verifications')
      .select('id, user_id, expires_at, verified_at')
      .eq('token', token)
      .single();

    if (!verification) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    if (verification.verified_at) {
      // Already verified, just send to login
      return NextResponse.redirect(new URL('/login?message=already_verified', req.url));
    }

    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/login?error=token_expired', req.url));
    }

    // Process verification inside a "transaction"
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq('id', verification.user_id);

    if (userUpdateError) throw userUpdateError;

    await supabase
      .from('email_verifications')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: verification.user_id,
      action: 'email_verified',
      resource: 'users',
      result: 'success',
      ip_address: req.headers.get('x-forwarded-for') ?? req.ip,
    });

    // If the user happens to have an active session in another tab, the polling mechanism
    // will pick up the `email_verified` state change and redirect them automatically.
    // For this tab, we redirect to login (or onboarding if we auto-login, but since we don't
    // necessarily have the session context here without setting cookies, login is safest).
    return NextResponse.redirect(new URL('/login?message=verified', req.url));
  } catch (err) {
    console.error('[verify-email] Error:', err);
    return NextResponse.redirect(new URL('/login?error=verification_failed', req.url));
  }
}
