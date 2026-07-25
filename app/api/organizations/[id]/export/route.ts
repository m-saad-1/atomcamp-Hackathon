import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Data Portability / GDPR Export Endpoint
 * Exports all organization data (candidates, actions) for compliance.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Verify Auth & RBAC
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify User belongs to Org and is Admin/Owner
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!member || (member.role !== 'admin' && member.role !== 'owner')) {
      return NextResponse.json({ error: 'Forbidden: Requires Admin or Owner role' }, { status: 403 });
    }

    // Fetch All Org Data for Export (Data Portability)
    const { data: candidates } = await supabase
      .from('candidates')
      .select('*, resumes(*), interviews(*)')
      .eq('organization_id', params.id);

    const { data: actions } = await supabase
      .from('actions')
      .select('*, execution_reports(*)')
      .eq('organization_id', params.id);

    const { data: chat_sessions } = await supabase
      .from('chat_sessions')
      .select('*, chat_messages(*)')
      .eq('recruiter_id', user.id);

    const exportData = {
      exported_at: new Date().toISOString(),
      organization_id: params.id,
      requested_by: user.id,
      data: {
        candidates,
        actions,
        chat_sessions,
      }
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="org_${params.id}_export.json"`
      }
    });

  } catch (error) {
    console.error('[Export Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
