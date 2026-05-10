import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { decision } = await request.json() as { decision: 'approved' | 'rejected' };

  // Fetch the approval
  const { data: approval, error: fetchError } = await supabase
    .from('approvals')
    .select('*')
    .eq('id', params.id)
    .single();

  if (fetchError || !approval) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Mark approval as decided
  await supabase
    .from('approvals')
    .update({ status: decision, decided_at: new Date().toISOString() })
    .eq('id', params.id);

  // Execute the action if approved
  if (decision === 'approved') {
    const payload = approval.action_payload as Record<string, any>;

    switch (approval.action_type) {
      case 'create_candidate':
        // Promote the draft candidate to a visible profile
        if (payload.candidate_id) {
          await supabase
            .from('candidates')
            .update({ is_draft: false })
            .eq('id', payload.candidate_id);
        }
        break;

      case 'move_stage':
        // Stage already updated optimistically — nothing more to do
        break;

      case 'reject_candidate':
        if (payload.candidate_id) {
          await supabase
            .from('candidates')
            .update({ stage: 'rejected' })
            .eq('id', payload.candidate_id);
        }
        break;

      // Other action types (send_email, schedule_interview, slack_notify)
      // are handled by separate execution agents — approval status is enough
      // for them to pick up and run.
    }
  }

  if (decision === 'rejected') {
    const payload = approval.action_payload as Record<string, any>;

    // Revert the optimistic stage move if the approval was for move_stage
    if (approval.action_type === 'move_stage' && payload.candidate_id && payload.from_stage) {
      await supabase
        .from('candidates')
        .update({ stage: payload.from_stage })
        .eq('id', payload.candidate_id);
    }

    // Revert draft candidate if create_candidate was rejected
    if (approval.action_type === 'create_candidate' && payload.candidate_id) {
      await supabase
        .from('candidates')
        .delete()
        .eq('id', payload.candidate_id);
    }
  }

  return NextResponse.json({ success: true });
}
