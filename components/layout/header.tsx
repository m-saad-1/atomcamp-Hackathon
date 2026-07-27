"use client"
import * as React from "react"
import { usePathname } from "next/navigation"
import { Menu, Bell, Plus, ChevronRight, HelpCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/ui/search"

export function Header({ onMenuClick, userMenu }: { onMenuClick: () => void, userMenu: React.ReactNode }) {
  const pathname = usePathname()
  const segments = pathname?.split('/').filter(Boolean) || []
  
  return (
    <header className="h-[72px] sticky top-0 bg-white z-30 border-b border-border flex items-center px-6 shrink-0 justify-between">
      <div className="flex items-center gap-4">
        <button aria-label="Toggle Menu" onClick={onMenuClick} className="md:hidden text-muted-foreground hover:text-foreground mr-2">
          <Menu size={24} />
        </button>
        
        {/* Breadcrumb & Title */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="flex items-center text-[12px] text-muted-foreground mb-0.5">
            <span className="hover:text-foreground cursor-pointer transition-colors">Recrion</span>
            <ChevronRight size={12} className="mx-1" />
            <span className="hover:text-foreground cursor-pointer transition-colors">Dashboard</span>
            {segments.length > 1 && (
              <>
                <ChevronRight size={12} className="mx-1" />
                <span className="font-medium text-foreground capitalize">
                  {segments[segments.length - 1]}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-[16px] font-semibold text-foreground leading-none mb-1">
              {segments.length > 1 ? segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1) : 'Operations Overview'}
            </h1>
            <span className="text-[12px] text-muted-foreground leading-none">
              {segments.length > 1 ? `Manage your ${segments[segments.length - 1]}` : 'Monitor your key recruiting metrics and activities.'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
        <div className="hidden lg:block">
          <Search aria-label="Search" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ai" size="sm" className="hidden sm:flex h-[36px] rounded-full px-4 text-[13px]">
          <Sparkles size={16} /> Ask AI
        </Button>
        <div className="flex items-center gap-1 border-r border-border pr-3">
          <Button aria-label="Help" variant="ghost" size="icon" className="w-[36px] h-[36px] text-muted-foreground rounded-full">
            <HelpCircle size={18} />
          </Button>
          <Button aria-label="Notifications" variant="ghost" size="icon" className="relative w-[36px] h-[36px] text-muted-foreground rounded-full">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white" />
          </Button>
        </div>
        <div className="pl-1 flex items-center">
          {userMenu}
        </div>
      </div>
    </header>
  )
}
