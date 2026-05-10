'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-1 py-1 transition-colors"
    >
      Sign out
    </button>
  );
}
