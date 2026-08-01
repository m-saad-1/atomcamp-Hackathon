import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/organizations/check-slug?slug=<slug>
 * Public availability check for workspace URL slugs.
 * Used by the onboarding wizard for real-time availability feedback.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');

  if (!slug || !/^[a-z0-9-]{2,48}$/.test(slug)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REQUEST', message: 'Invalid slug format.' } },
      { status: 400 }
    );
  }

  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single();

  return NextResponse.json({ success: true, slug, available: !data });
}
