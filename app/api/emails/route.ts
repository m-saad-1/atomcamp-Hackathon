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
  const filter = searchParams.get('filter'); // 'unprocessed' | 'processed' | null = all

  let query = supabase
    .from('emails')
    .select(`
      id,
      sender_name,
      sender_email,
      subject,
      has_attachment,
      attachment_filename,
      received_at,
      processed,
      processing_error,
      ai_classification,
      ai_confidence,
      approval_status,
      created_at,
      candidates ( id, full_name, ai_score )
    `)
    .order('received_at', { ascending: false })
    .limit(50);

  if (filter === 'unprocessed') query = query.eq('processed', false);
  if (filter === 'processed')   query = query.eq('processed', true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({
      error:     'FETCH_FAILED',
      message:   error.message,
      recovery:  'Check Supabase connection and RLS policies.',
      retryable: true,
    }, { status: 500 });
  }

  return NextResponse.json({ emails: data ?? [] });
}
