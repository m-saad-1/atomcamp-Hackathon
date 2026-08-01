import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const Schema = z.object({
  token: z.string().uuid('Invalid token.'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = Schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Invalid or expired request.' } },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Validate token
    const { data: resetToken } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', token)
      .single();

    if (!resetToken || resetToken.used || new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: { code: 'TOKEN_EXPIRED', message: 'This reset link has expired or already been used.' } },
        { status: 410 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password + mark token used in a transaction-like sequence
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', resetToken.user_id);

    if (updateError) {
      console.error('[reset-password] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Failed to update password.' } },
        { status: 500 }
      );
    }

    // Mark token used
    await supabase.from('password_reset_tokens').update({ used: true }).eq('id', resetToken.id);

    // Revoke all active sessions (spec §18 — Revocation after password change)
    await supabase.from('sessions').delete().eq('user_id', resetToken.user_id);

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: resetToken.user_id,
      action: 'password_reset_completed',
      resource: 'users',
      result: 'success',
      ip_address: req.headers.get('x-forwarded-for') ?? req.ip,
      metadata: {},
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[reset-password] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Something went wrong.' } },
      { status: 500 }
    );
  }
}
