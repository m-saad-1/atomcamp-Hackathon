'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Approval = {
  id: string; action_type: string; action_payload: Record<string, unknown>;
  preview_label: string; status: string; created_at: string;
  candidates: { id: string; full_name: string; ai_score: number | null } | null;
};

const ACTION_ICONS: Record<string, string> = {
  send_email:         '✉️',
  move_stage:         '↔️',
  schedule_interview: '📅',
  reject_candidate:   '✗',
  slack_notify:       '💬',
  create_candidate:   '👤',
};

const ACTION_RISK: Record<string, string> = {
  send_email:         'High — will create a Gmail draft',
  move_stage:         'Low — updates pipeline stage',
  schedule_interview: 'High — creates calendar event',
  reject_candidate:   'High — marks candidate as rejected',
  slack_notify:       'Low — sends a Slack message',
  create_candidate:   'Medium — creates candidate profile',
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());
  const [actioning, setActioning] = useState<Set<string>>(new Set());
  const [error, setError]         = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res  = await fetch('/api/approvals');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load approvals');
      setApprovals(data.approvals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  // Supabase Realtime — new approvals appear without a page refresh
  useEffect(() => {
    const supabase = createClient();
    const channel  = supabase
      .channel('approvals-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'approvals' },
        () => fetchApprovals())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'approvals' },
        () => fetchApprovals())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchApprovals]);

  async function decide(approvalId: string, decision: 'approved' | 'rejected') {
    setActioning((a) => new Set(a).add(approvalId));
    try {
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? 'Action failed');
      }
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActioning((a) => { const n = new Set(a); n.delete(approvalId); return n; });
    }
  }

  function toggleExpand(id: string) {
    setExpanded((e) => {
      const n = new Set(e);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve or reject every proposed AI action before it executes
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {approvals.length} pending
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && approvals.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-2xl mb-3">✓</p>
          <p className="text-lg font-medium mb-2">All caught up</p>
          <p className="text-sm">New actions will appear here as the AI processes emails.</p>
        </div>
      )}

      <div className="space-y-3">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-28" />
            ))
          : approvals.map((approval) => {
              const isActioning = actioning.has(approval.id);
              const isExpanded  = expanded.has(approval.id);
              return (
                <div key={approval.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">
                      {ACTION_ICONS[approval.action_type] ?? '⚙️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {approval.preview_label}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        Risk: {ACTION_RISK[approval.action_type] ?? 'Unknown'}
                      </p>

                      {approval.candidates && (
                        <Link href={`/dashboard/candidates/${approval.candidates.id}`}
                          className="text-xs text-blue-600 hover:underline">
                          {approval.candidates.full_name}
                          {approval.candidates.ai_score != null
                            ? ` — Score: ${approval.candidates.ai_score}/100` : ''}
                        </Link>
                      )}

                      <button onClick={() => toggleExpand(approval.id)}
                        className="text-xs text-muted-foreground hover:text-foreground mt-2 block">
                        {isExpanded ? '▲ Hide preview' : '▼ Show preview'}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 text-xs bg-muted rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(approval.action_payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border/50">
                    <button
                      onClick={() => decide(approval.id, 'rejected')}
                      disabled={isActioning}
                      className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium
                                 text-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-700
                                 disabled:opacity-40 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => decide(approval.id, 'approved')}
                      disabled={isActioning}
                      className="rounded-lg bg-green-600 text-white px-4 py-1.5 text-xs font-medium
                                 hover:bg-green-700 disabled:opacity-40 transition-colors"
                    >
                      {isActioning ? 'Executing…' : 'Approve'}
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
