import { auth } from '@/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPlatformHealth } from '@/lib/health';
import { getIntegrations } from '@/lib/integrations';
import { createAdminClient } from '@/lib/supabase/server';

async function getOrgName(orgId: string | null) {
  if (!orgId) return 'Unknown Organization';
  const supabase = createAdminClient();
  const { data } = await supabase.from('organizations').select('name').eq('id', orgId).single();
  return data?.name || 'Unknown Organization';
}

export default async function DashboardPage() {
  const session = await auth();
  const orgName = await getOrgName(session?.user?.organization_id ?? null);
  const healthStatuses = await getPlatformHealth();
  const integrations = await getIntegrations(session?.user?.organization_id ?? '');

  const gmailIntegration = integrations.find(i => i.service === 'gmail');
  const gmailStatus = gmailIntegration?.status || 'disconnected';

  const integrationsList = [
    { name: 'Gmail', status: gmailStatus },
    { name: 'OpenAI', status: integrations.find(i => i.service === 'openai')?.status || 'pending_setup' },
    { name: 'Slack', status: integrations.find(i => i.service === 'slack')?.status || 'disconnected' },
    { name: 'Google Calendar', status: integrations.find(i => i.service === 'calendar')?.status || 'disconnected' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-2">
          Signed in as <span className="font-medium text-foreground">{session?.user?.email}</span> under <span className="font-medium text-foreground">{orgName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Integrations Panel */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Connected Integrations</h2>
          <ul className="space-y-3">
            {integrationsList.map(int => (
              <li key={int.name} className="flex justify-between items-center text-sm">
                <span className="font-medium">{int.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  int.status === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  int.status === 'pending_setup' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {int.status.replace('_', ' ').toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform Health Panel */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <ul className="space-y-3">
            {healthStatuses.map(health => (
              <li key={health.service} className="flex justify-between items-center text-sm">
                <span className="font-medium">{health.service}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{health.message}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    health.status === 'healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    health.status === 'degraded' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    health.status === 'pending_setup' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    health.status === 'not_implemented' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {health.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Navigation */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
        <div className="flex gap-4 flex-wrap">
          <Button asChild aria-label="Go to Inbox">
            <Link href="/dashboard/inbox">Inbox</Link>
          </Button>
          <Button asChild variant="outline" aria-label="Go to Pipeline">
            <Link href="/dashboard/pipeline">Pipeline</Link>
          </Button>
          <Button asChild variant="outline" aria-label="Go to Approvals">
            <Link href="/dashboard/approvals">Approvals</Link>
          </Button>
          <Button asChild variant="secondary" aria-label="Organization Settings">
            <Link href="/dashboard/settings">Organization Settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
