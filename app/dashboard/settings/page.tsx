import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateOrganizationName, updateUserPreferences } from './actions';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.organization_id) redirect('/auth/signin');

  const supabase = createAdminClient();
  const [{ data: org }, { data: user }] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', session.user.organization_id).single(),
    supabase.from('users').select('*').eq('id', session.user.id).single()
  ]);

  const prefs = (user?.preferences as Record<string, string>) || {};

  const isAdmin = session.user.role === 'owner' || session.user.role === 'admin';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your organization and personal preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Organization</h2>
          <form action={updateOrganizationName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input id="name" name="name" defaultValue={org?.name || ''} required disabled={!isAdmin} />
            </div>
            <div className="space-y-2">
              <Label>Organization ID</Label>
              <Input value={org?.id || ''} readOnly className="text-muted-foreground bg-muted" />
            </div>
            <Button type="submit" disabled={!isAdmin}>
              {isAdmin ? 'Save Organization' : 'Requires Admin'}
            </Button>
          </form>
        </section>

        <section className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Personal Preferences</h2>
          <form action={updateUserPreferences} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultView">Default Dashboard View</Label>
              <Input id="defaultView" name="defaultView" defaultValue={prefs.defaultView || 'overview'} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={session.user.role || 'recruiter'} readOnly className="text-muted-foreground bg-muted capitalize" />
            </div>
            <Button type="submit">Save Preferences</Button>
          </form>
        </section>
      </div>
    </div>
  );
}
