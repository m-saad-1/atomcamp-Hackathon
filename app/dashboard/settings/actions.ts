'use server';

import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrganizationName(formData: FormData) {
  const session = await auth();
  if (!session?.user?.organization_id) throw new Error('Unauthorized');
  if (session.user.role !== 'owner' && session.user.role !== 'admin') {
    throw new Error('Forbidden: Requires Admin privileges');
  }

  const name = formData.get('name') as string;
  if (!name) return { error: 'Name is required' };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('organizations')
    .update({ name })
    .eq('id', session.user.organization_id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function updateUserPreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const defaultView = formData.get('defaultView') as string;
  
  const supabase = createAdminClient();
  
  // Fetch existing
  const { data } = await supabase.from('users').select('preferences').eq('id', session.user.id).single();
  const prefs = (data?.preferences as Record<string, unknown>) || {};
  prefs.defaultView = defaultView;

  const { error } = await supabase
    .from('users')
    .update({ preferences: prefs })
    .eq('id', session.user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/settings');
  return { success: true };
}
