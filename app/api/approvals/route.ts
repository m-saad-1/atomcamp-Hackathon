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
      related_entity, related_id, status, retry_count, created_at,
      candidates:related_id ( id, full_name, ai_score )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ approvals: data ?? [] });
}
