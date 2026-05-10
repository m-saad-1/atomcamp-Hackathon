import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SignOutButton } from '@/components/layout/SignOutButton';

const NAV_ITEMS = [
  { href: '/dashboard',            label: 'Dashboard',  icon: '◻' },
  { href: '/dashboard/inbox',      label: 'Inbox',      icon: '✉' },
  { href: '/dashboard/candidates', label: 'Candidates', icon: '👤' },
  { href: '/dashboard/pipeline',   label: 'Pipeline',   icon: '⋮⋮' },
  { href: '/dashboard/approvals',  label: 'Approvals',  icon: '✓'  },
  { href: '/dashboard/jobs',       label: 'Jobs',       icon: '💼' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-56 border-r border-border flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <span className="font-semibold text-foreground text-sm">Recruiting Agent</span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground
                         hover:bg-muted hover:text-foreground transition-colors">
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            {session.user?.image && (
              <Image src={session.user.image} alt="Avatar"
                width={28} height={28} className="rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {session.user?.name ?? 'Recruiter'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
