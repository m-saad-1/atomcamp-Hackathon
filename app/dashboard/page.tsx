import { auth } from '@/auth';
import Link from 'next/link';

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/dashboard/stats`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const stats   = await getStats();

  const cards = [
    { label: 'Unprocessed Emails',   value: stats?.unprocessedEmails,  href: '/dashboard/inbox',      color: 'text-blue-600'   },
    { label: 'Candidate Profiles',   value: stats?.totalCandidates,    href: '/dashboard/candidates', color: 'text-green-600'  },
    { label: 'Pending Approvals',    value: stats?.pendingApprovals,   href: '/dashboard/approvals',  color: stats?.pendingApprovals > 0 ? 'text-red-600' : 'text-foreground' },
    { label: 'Interviews This Week', value: stats?.interviewsThisWeek, href: '/dashboard/pipeline',   color: 'text-purple-600' },
    { label: 'Avg Match Score',      value: stats?.avgScore != null ? `${stats.avgScore}/100` : null, href: '/dashboard/candidates', color: 'text-amber-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Good morning{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is your recruiting overview
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-card border border-border rounded-xl p-4 hover:border-ring transition-colors">
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className={`text-2xl font-semibold ${card.color}`}>
              {card.value ?? '—'}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href="/dashboard/inbox"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">
          Process Inbox
        </Link>
        <Link href="/dashboard/approvals"
          className="rounded-lg border border-border text-foreground px-4 py-2 text-sm font-medium hover:bg-muted">
          Review Approvals
          {stats?.pendingApprovals > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5">
              {stats.pendingApprovals}
            </span>
          )}
        </Link>
        <Link href="/dashboard/jobs"
          className="rounded-lg border border-border text-foreground px-4 py-2 text-sm font-medium hover:bg-muted">
          Add Job
        </Link>
      </div>
    </div>
  );
}
