'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Mail, LayoutDashboard, Briefcase, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: Briefcase },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-full">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <span className="text-lg font-bold text-primary">HireMe AI</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
