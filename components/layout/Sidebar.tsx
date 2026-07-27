"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"
import { 
  LayoutDashboard, Inbox, Users, Briefcase, Bot, 
  CheckSquare, PlayCircle, BarChart3, Puzzle, Settings, X,
  ChevronDown, Sparkles, Wand2
} from "lucide-react"
import { Search } from "@/components/ui/search"

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/inbox', label: 'Inbox', icon: Inbox },
  { href: '/dashboard/candidates', label: 'Candidates', icon: Users },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/dashboard/copilot', label: 'Copilot', icon: Bot },
  { href: '/dashboard/approvals', label: 'Approvals', icon: CheckSquare },
  { href: '/dashboard/execution', label: 'Execution', icon: PlayCircle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const AI_SHORTCUTS = [
  { label: 'Draft Email', icon: Wand2 },
  { label: 'Screen Resumes', icon: Sparkles },
]

export function SidebarNav({ isOpen, onClose, userProfile }: { isOpen: boolean; onClose: () => void, userProfile: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[264px] bg-white border-r border-border flex flex-col transition-transform duration-normal ease-in-out md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-[72px] flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <span className="font-semibold text-foreground text-[18px]">Recrion</span>
          </div>
          <button aria-label="Close Sidebar" onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Workspace */}
        <div className="px-4 py-2">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-[14px] hover:bg-[#F4F5F8] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[12px] font-bold text-foreground">
                R
              </div>
              <span className="text-[14px] font-medium text-foreground">Recrion Inc</span>
            </div>
            <ChevronDown size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <Search className="w-full h-[36px]" placeholder="Search..." />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`) && item.href !== '/dashboard'
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                  isActive 
                    ? "bg-[#EEF0FF] text-brand" 
                    : "text-muted-foreground hover:bg-[#F4F5F8] hover:text-foreground"
                )}
              >
                <Icon 
                  icon={item.icon} 
                  className={cn(isActive ? "text-brand" : "text-muted-foreground")} 
                />
                {item.label}
              </Link>
            )
          })}

          <div className="my-4 border-t border-border" />

          <div className="px-3 py-2">
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">AI Shortcuts</span>
          </div>
          
          {AI_SHORTCUTS.map((item) => (
            <button 
              key={item.label} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[14px] font-medium text-muted-foreground hover:bg-[#F4F5F8] hover:text-foreground transition-colors"
            >
              <Icon icon={item.icon} className="text-ai" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div className="p-4 border-t border-border">
          {userProfile}
        </div>
      </aside>
    </>
  )
}
