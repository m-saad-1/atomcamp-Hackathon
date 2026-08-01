import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in.' } },
        { status: 401 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('email_verified')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({
      success: true,
      verified: user?.email_verified ?? false,
    });
  } catch (err) {
    console.error('[verify-email-status] Error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Something went wrong.' } },
      { status: 500 }
    );
  }
}
