import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    // Verify DB connectivity
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      return NextResponse.json({ status: 'not_ready', error: 'Database connection failed' }, { status: 503 });
    }
    
    return NextResponse.json({ status: 'ready', timestamp: new Date().toISOString() }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ status: 'not_ready', error: 'Internal error' }, { status: 503 });
  }
}
