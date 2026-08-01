'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  Briefcase, 
  Sparkles, 
  CheckSquare, 
  PlayCircle, 
  BarChart3, 
  Blocks, 
  Settings,
  ChevronDown,
  Search
} from 'lucide-react';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Copilot', href: '/dashboard/copilot', icon: Sparkles },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare },
  { name: 'Execution', href: '/dashboard/execution', icon: PlayCircle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Blocks },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-4">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2 px-2 pt-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white font-bold">
          R
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">Recrion</span>
      </div>

      {/* Workspace Switcher Placeholder */}
      <button className="mb-6 flex items-center justify-between rounded-xl border border-border p-3 text-left transition-colors hover:bg-secondary">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Acme Corp</span>
            <span className="text-xs text-muted-foreground mt-1">Free Plan</span>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Global Search Hint */}
      <div className="mb-6 relative group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="h-10 w-full rounded-xl border border-input bg-transparent pl-9 pr-10 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          readOnly
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[#EEF0FF] text-[#5B5CEB]" 
                  : "text-foreground hover:bg-[#F4F5F8]"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-[#5B5CEB]" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        {/* User Profile Hook placeholder */}
        <div className="flex items-center gap-3 rounded-[14px] p-2 hover:bg-[#F4F5F8] cursor-pointer transition-colors">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">User Name</span>
            <span className="text-xs text-muted-foreground">user@example.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
