'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { createClient } from '@/lib/supabase/client';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/approvals?tab=${activeTab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load approvals');
      setApprovals(data.approvals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  // Supabase Realtime — listen to the new 'actions' table
  useEffect(() => {
    const supabase = createClient();
    const channel  = supabase
      .channel('actions-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions', filter: 'execution_status=eq.pending_approval' },
        () => fetchApprovals())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'actions', filter: 'execution_status=eq.pending_approval' },
        () => fetchApprovals())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchApprovals]);

  async function handleProcessDecision(approvalId: string, decision: 'approve' | 'reject' | 'modify', modifiedPlan?: any) {
    try {
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ decision, modifiedPlan }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Action failed');
      }
      // Remove from UI immediately upon success
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
      throw e; // rethrow for the ApprovalCard to stop loading state if needed
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto" aria-labelledby="page-title">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 id="page-title" className="text-xl font-semibold text-foreground">Approval Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve AI-generated operational recommendations.
          </p>
        </div>
        <div className="flex items-center bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'pending' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pending
            {activeTab === 'pending' && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{approvals.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            History
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error" className="text-red-500">✕</button>
        </div>
      )}

      {!loading && approvals.length === 0 && (
        <div className="text-center py-20 text-muted-foreground" aria-live="polite">
          <p className="text-2xl mb-3" aria-hidden="true">✓</p>
          <p className="text-lg font-medium mb-2">All caught up</p>
          <p className="text-sm">New recommendations from the Recruiter Copilot will appear here.</p>
        </div>
      )}

      <div className="space-y-4">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-40" />
            ))
          : approvals.map((approval) => (
              <ApprovalCard 
                key={approval.id} 
                action={approval} 
                onProcess={handleProcessDecision} 
              />
            ))}
      </div>
    </main>
  );
}
