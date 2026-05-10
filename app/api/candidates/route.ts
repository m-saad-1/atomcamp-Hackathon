import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const stage  = searchParams.get('stage');
  const search = searchParams.get('search');

  let query = supabase
    .from('candidates')
    .select(`
      id, full_name, email, current_role, current_company,
      skills, experience_years, ai_score, ai_recommendation,
      ai_strengths, stage, tags, source, created_at
    `)
    .eq('is_draft', false)
    .order('ai_score', { ascending: false, nullsFirst: false });

  if (stage)  query = query.eq('stage', stage);
  if (search) query = query.or(
    `full_name.ilike.%${search}%,email.ilike.%${search}%,current_role.ilike.%${search}%`
  );

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({
      error: 'FETCH_FAILED', message: error.message,
      recovery: 'Check Supabase connection.', retryable: true,
    }, { status: 500 });
  }

  return NextResponse.json({ candidates: data ?? [] });
}
