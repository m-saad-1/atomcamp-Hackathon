'use client';

import { useEffect, useState } from 'react';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { Approval } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovals();
  }, []);

  async function fetchApprovals() {
    setLoading(true);
    const { data } = await supabase
      .from('approvals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (data) setApprovals(data as Approval[]);
    setLoading(false);
  }

  async function handleAction(id: string, action: 'approve' | 'reject' | 'skip') {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Action failed');

      toast({
        title: 'Action completed',
        description: `Successfully ${action}d the action.`,
      });
      
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to execute the action. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Human Approval Queue</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve actions proposed by the AI agent. Nothing happens without your confirmation.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">Loading queue...</div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-border">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">You're all caught up!</h3>
          <p className="text-muted-foreground mt-1">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map(approval => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Inline CheckCircle import since we didn't add it globally to this file
import { CheckCircle2 as CheckCircle } from 'lucide-react';
