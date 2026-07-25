'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Dashboard Error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
      <h2 className="text-lg font-semibold text-foreground">Something went wrong!</h2>
      <p className="text-sm max-w-md">{error.message || 'An unexpected error occurred while loading this page.'}</p>
      <Button variant="outline" onClick={() => reset()} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
