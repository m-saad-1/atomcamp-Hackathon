'use client';

import { Bell, HelpCircle, Search, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <div className="flex h-full w-full items-center justify-between">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Acme Corp</span>
          <span>/</span>
          <span className="font-medium text-foreground">Dashboard</span>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex flex-1 max-w-[360px] mx-8 relative group">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search candidates, emails, jobs..." 
          className="h-10 w-full rounded-xl border border-input bg-transparent pl-9 pr-10 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Quick AI Button */}
        <button className="hidden sm:flex items-center gap-2 rounded-xl bg-[#F3E8FF] px-4 py-2 text-sm font-medium text-[#7C3AED] transition-colors hover:bg-[#E9D5FF]">
          <Sparkles className="h-4 w-4" />
          Ask AI
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
        </button>

        {/* Help */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Profile Avatar */}
        <button className="h-10 w-10 overflow-hidden rounded-full border border-border">
          <div className="h-full w-full bg-gray-200" />
        </button>
      </div>
    </div>
  );
}
