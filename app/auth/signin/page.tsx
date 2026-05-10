'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6 bg-card p-8 rounded-xl shadow-lg border border-border">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-primary">HireMe AI</h1>
          <p className="text-muted-foreground">Sign in to access your recruitment pipeline.</p>
        </div>
        <Button
          className="w-full font-medium"
          size="lg"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        >
          <Mail className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
