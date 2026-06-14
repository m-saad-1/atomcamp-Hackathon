import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('approvals')
    .select(`
      id, action_type, action_payload, preview_label,
      related_entity, related_id, status, retry_count, created_at
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const mappedData = data?.map(a => ({
    ...a,
    candidates: a.related_entity === 'candidate' ? {
      id: a.related_id,
      full_name: (a.action_payload as any)?.full_name || 'Candidate',
      ai_score: (a.action_payload as any)?.ai_score || null,
    } : null
  }));

  return NextResponse.json({ approvals: mappedData ?? [] });
}
