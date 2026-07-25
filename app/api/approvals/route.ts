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
    if (!session?.user?.id || !session?.user?.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const recruiterId = session.user.id;

    const tab = req.nextUrl.searchParams.get('tab') || 'pending';

    let query = supabase
      .from('actions')
      .select(`
        *,
        candidates(full_name, current_role),
        jobs(title)
      `);
      
    if (tab === 'history') {
      query = query.in('execution_status', ['completed', 'failed', 'rejected']);
    } else {
      query = query.eq('execution_status', 'pending_approval');
    }

    const { data: actions, error } = await query
      .eq('organization_id', session.user.organization_id)
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ approvals: actions });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Approvals GET Error:', msg);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
