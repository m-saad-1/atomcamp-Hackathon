import { NextRequest, NextResponse } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api-response';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organization_id) return errorResponse('UNAUTHORIZED', undefined, 401);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('candidates').select('*').eq('id', params.id).eq('organization_id', session.user.organization_id).single();

  if (error || !data) return errorResponse('NOT_FOUND', undefined, 404);
  return jsonResponse({ data: { candidate: data } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organization_id) return errorResponse('UNAUTHORIZED', undefined, 401);

  const supabase = createAdminClient();
  const body     = await request.json();

  // Stage change → create an approval rather than updating directly
  if (body.stage) {
    const { data: current } = await supabase
      .from('candidates').select('stage, full_name').eq('id', params.id).eq('organization_id', session.user.organization_id).single();

    await supabase.from('approvals').insert({
      recruiter_id:   session.user.id,
      action_type:    'move_stage',
      action_payload: {
        candidate_id: params.id,
        from_stage:   current?.stage,
        to_stage:     body.stage,
      },
      preview_label:  `Move ${current?.full_name ?? 'candidate'} from ${current?.stage} → ${body.stage}`,
      related_entity: 'candidate',
      related_id:     params.id,
      status:         'pending',
      organization_id: session.user.organization_id,
    });

    // Optimistic update — reverted if approval is rejected
    await supabase.from('candidates').update({ stage: body.stage }).eq('id', params.id).eq('organization_id', session.user.organization_id);
    return jsonResponse({ data: { success: true, approval_created: true  } });
  }

  // Other allowed field updates
  const allowed = ['notes', 'tags', 'availability'];
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );
  await supabase.from('candidates').update(updates).eq('id', params.id).eq('organization_id', session.user.organization_id);
  return jsonResponse({ data: { success: true  } });
}
