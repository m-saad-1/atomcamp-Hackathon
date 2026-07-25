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
  const filter = searchParams.get('filter'); // 'unprocessed' | 'processed' | null = all

  let query = supabase
    .from('emails')
    .select(`
      id,
      sender_name,
      sender_email,
      subject,
      has_attachment,
      received_at,
      lifecycle_status,
      processing_error,
      ai_classification,
      ai_confidence,
      approval_status,
      created_at,
      email_attachments ( filename, status )
    `)
    .eq('organization_id', session.user.organization_id)
    .order('received_at', { ascending: false })
    .limit(50);

  if (filter === 'unprocessed') query = query.in('lifecycle_status', ['new', 'downloaded', 'normalized', 'attachments_ready', 'failed']);
  if (filter === 'processed')   query = query.in('lifecycle_status', ['queued_for_ai', 'archived']);

  const { data, error } = await query;

  if (error) {
    return errorResponse('FETCH_FAILED', error.message, 500);
  }

  return jsonResponse({ data: { emails: data ?? [] } });
}
