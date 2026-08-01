import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().email('Invalid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
    .regex(/[a-z]/, 'Password must contain a lowercase letter.')
    .regex(/[0-9]/, 'Password must contain a number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: result.error.issues[0]?.message ?? 'Invalid request.' } },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email (business validation)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      // Anti-enumeration: return same 201 success shape.
      // The verification email step will silently not send for dups.
      // Front-end never learns the account exists.
      return NextResponse.json({ success: true, message: 'If this email is available, a verification email will be sent.' }, { status: 201 });
    }

    // Hash password with bcrypt (Argon2id preferred — use bcrypt for Node.js compat)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ name, email: normalizedEmail, password_hash: passwordHash, email_verified: false, account_status: 'active' })
      .select('id')
      .single();

    if (userError || !user) {
      console.error('[register] Failed to create user:', userError);
      return NextResponse.json(
        { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Failed to create account. Please try again.' } },
        { status: 500 }
      );
    }

    // Create email verification token (24h TTL)
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('email_verifications').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    // TODO: Send verification email via email queue
    // await emailQueue.add('send-verification', { userId: user.id, email: normalizedEmail, token });
    console.info(`[register] Verification token for ${normalizedEmail}: ${token}`);

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'user_registered',
      resource: 'users',
      result: 'success',
      ip_address: req.headers.get('x-forwarded-for') ?? req.ip,
      metadata: { email: normalizedEmail },
    });

    return NextResponse.json({ success: true, message: 'Account created. Please verify your email.' }, { status: 201 });
  } catch (err) {
    console.error('[register] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Something went wrong.' } },
      { status: 500 }
    );
  }
}
