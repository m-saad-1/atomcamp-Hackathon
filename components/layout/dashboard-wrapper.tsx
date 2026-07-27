"use client"
import * as React from "react"
import { SidebarNav } from "./sidebar"
import { Header } from "./header"

export function DashboardWrapper({ 
  children, 
  userProfile, 
  userMenu 
}: { 
  children: React.ReactNode, 
  userProfile: React.ReactNode,
  userMenu: React.ReactNode 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <SidebarNav 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userProfile={userProfile} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          userMenu={userMenu} 
        />
        
        <main className="flex-1 overflow-y-auto w-full animate-in fade-in duration-[180ms]">
          <div className="max-w-[1600px] mx-auto w-full px-[32px] pt-[32px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
