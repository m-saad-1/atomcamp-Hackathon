'use server';

import { auth } from '@/auth';
import { pollInbox } from '@/lib/gmail/poller';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function syncEmailsAction() {
  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  let userId = session.user.id;
  
  if (!userId && session.user.email) {
    const { data } = await supabaseAdmin.from('users').select('id').eq('email', session.user.email).single();
    if (data) userId = data.id;
  }

  if (!userId) {
     redirect('/api/auth/signout');
  }

  try {
    await pollInbox(userId);
    revalidatePath('/dashboard/inbox');
    return { success: true };
  } catch (err: any) {
    console.error('Failed to sync emails:', err);
    return { error: err.message || 'Failed to sync emails' };
  }
}
