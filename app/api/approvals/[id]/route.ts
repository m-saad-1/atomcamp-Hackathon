import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import { ApprovalEngineService } from '@/lib/approval/engine';
import { ExecutionEngineService } from '@/lib/execution/engine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const recruiterId = session.user.id;
    const actionId = params.id;
    const { decision, reason, modifiedPlan } = await req.json();

    if (decision !== 'approve' && decision !== 'reject' && decision !== 'modify') {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const approvalEngine = new ApprovalEngineService(supabase);
    const updatedAction = await approvalEngine.processDecision(actionId, recruiterId, decision, reason, modifiedPlan, session.user.organization_id);

    if (decision === 'approve' || decision === 'modify') {
       // Trigger execution engine immediately upon approval
       const executionEngine = new ExecutionEngineService(supabase);
       await executionEngine.execute(updatedAction);
    }

    return NextResponse.json({ success: true, action: updatedAction });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Approval POST Error [${params.id}]:`, msg);
    return NextResponse.json({ error: msg || 'Internal Server Error' }, { status: 500 });
  }
}
