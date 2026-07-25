import { NextRequest, NextResponse } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api-response';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organization_id) {
    return errorResponse('UNAUTHORIZED', undefined, 401);
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
      ai_strengths, stage, tags, source, duplicate_status, created_at,
      resumes(count)
    `)
    .eq('organization_id', session.user.organization_id)
    .eq('is_draft', false)
    .eq('is_deleted', false)
    .order('ai_score', { ascending: false, nullsFirst: false });

  if (stage)  query = query.eq('stage', stage);
  if (search) query = query.or(
    `full_name.ilike.%${search}%,email.ilike.%${search}%,current_role.ilike.%${search}%`
  );

  const { data, error } = await query;

  if (error) {
    return errorResponse('FETCH_FAILED', error.message, 500);
  }

  return jsonResponse({ data: { candidates: data ?? [] } });
}
