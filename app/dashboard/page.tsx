import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerClient();

  const [
    { count: pendingApprovals },
    { count: activeCandidates },
    { count: unreadEmails }
  ] = await Promise.all([
    supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('is_draft', false),
    supabase.from('emails').select('*', { count: 'exact', head: true }).eq('processed', false)
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/approvals">
          <Card className="hover:border-primary/50 transition-colors bg-card/50 hover:bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Actions requiring human review</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/candidates">
          <Card className="hover:border-primary/50 transition-colors bg-card/50 hover:bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Candidates</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activeCandidates || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total across all jobs</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inbox">
          <Card className="hover:border-primary/50 transition-colors bg-card/50 hover:bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unprocessed Emails</CardTitle>
              <Mail className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{unreadEmails || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting AI parsing</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-500 mt-1">All Systems Operational</div>
            <p className="text-xs text-muted-foreground mt-2">Inbox Poller: Active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
