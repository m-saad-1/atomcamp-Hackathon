'use client';

import { useState } from 'react';
import { Bell, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

export function TopBar({ user }: { user?: { name?: string | null, email?: string | null, image?: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
      <h1 className="text-xl font-semibold text-foreground">Overview</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
        </Button>
        
        <div className="relative">
          <div 
            className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer border border-border overflow-hidden" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {user?.image ? (
              <Image src={user.image} alt={user.name || "Avatar"} width={32} height={32} />
            ) : (
              <UserCircle className="h-5 w-5 text-primary" />
            )}
          </div>
          
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-border mb-2">
                <p className="font-medium text-sm text-foreground truncate">{user?.name || 'Recruiter'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'Authenticated'}</p>
              </div>
              <button 
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
