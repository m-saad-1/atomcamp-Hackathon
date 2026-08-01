import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const Schema = z.object({
  email: z.string().email('Invalid email address.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = Schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: result.error.issues[0]?.message ?? 'Invalid request.' } },
        { status: 400 }
      );
    }

    const email = result.data.email.toLowerCase().trim();

    // Security: ALWAYS return the same success response regardless of whether
    // the email exists. This prevents account enumeration attacks.
    // (spec §8 — Security Principle)
    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();

    if (user) {
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h TTL

      await supabase.from('password_reset_tokens').insert({
        user_id: user.id,
        token,
        expires_at: expiresAt,
        used: false,
      });

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'password_reset_requested',
        resource: 'users',
        result: 'success',
        ip_address: req.headers.get('x-forwarded-for') ?? req.ip,
        metadata: { email },
      });

      // TODO: Enqueue password reset email
      // await emailQueue.add('send-password-reset', { userId: user.id, email, token });
      console.info(`[forgot-password] Reset token for ${email}: ${token}`);
    }

    // Always return 200 with the same message
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, you'll receive a password reset link shortly.",
    });
  } catch (err) {
    console.error('[forgot-password] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Something went wrong.' } },
      { status: 500 }
    );
  }
}
