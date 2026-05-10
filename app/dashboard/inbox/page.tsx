'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type Email = {
  id: string;
  sender_name:       string | null;
  sender_email:      string;
  subject:           string | null;
  has_attachment:    boolean;
  attachment_filename: string | null;
  received_at:       string | null;
  processed:         boolean;
  processing_error:  string | null;
  ai_classification: string | null;
  ai_confidence:     number | null;
  candidates: { id: string; full_name: string; ai_score: number | null } | null;
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  job_application: 'bg-blue-100 text-blue-700',
  follow_up:       'bg-purple-100 text-purple-700',
  referral:        'bg-green-100 text-green-700',
  inquiry:         'bg-amber-100 text-amber-700',
  spam:            'bg-gray-100 text-gray-500',
  other:           'bg-gray-100 text-gray-500',
};

export default function InboxPage() {
  const [emails, setEmails]         = useState<Email[]>([]);
  const [loading, setLoading]       = useState(true);
  const [polling, setPolling]       = useState(false);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [error, setError]           = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    try {
      const res  = await fetch('/api/emails');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load emails');
      setEmails(data.emails ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  async function pollInbox() {
    setPolling(true);
    try {
      const res  = await fetch('/api/gmail/poll', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Poll failed');
      await fetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Poll failed');
    } finally {
      setPolling(false);
    }
  }

  async function processEmail(emailId: string) {
    setProcessing((prev) => new Set(prev).add(emailId));
    try {
      const res  = await fetch(`/api/emails/${emailId}/process`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Processing failed');
      await fetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(emailId);
        return next;
      });
    }
  }

  if (loading) return <InboxSkeleton />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Incoming emails identified as potential candidates
          </p>
        </div>
        <button
          onClick={pollInbox}
          disabled={polling}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2
                     text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {polling ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {polling ? 'Fetching…' : 'Refresh Inbox'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {emails.length === 0 && !error && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Your inbox is empty</p>
          <p className="text-sm">
            Emails will appear here once the system polls Gmail.
            Click "Refresh Inbox" to check now.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {emails.map((email) => {
          const isProcessing = processing.has(email.id);
          const canProcess   = !email.processed || !!email.processing_error;

          return (
            <div key={email.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-ring/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {email.sender_name ?? email.sender_email}
                    </p>
                    {email.sender_name && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        &lt;{email.sender_email}&gt;
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {email.subject ?? '(no subject)'}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {email.ai_classification && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${CLASSIFICATION_COLORS[email.ai_classification] ?? 'bg-gray-100 text-gray-600'}`}>
                        {email.ai_classification.replace('_', ' ')}
                      </span>
                    )}

                    {email.has_attachment && (
                      <span className="text-xs text-muted-foreground">
                        📎 {email.attachment_filename ?? 'attachment'}
                      </span>
                    )}

                    {email.processed && !email.processing_error ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Processed
                      </span>
                    ) : email.processing_error ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Failed
                      </span>
                    ) : isProcessing ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Processing…
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Unprocessed
                      </span>
                    )}

                    {email.received_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {email.processing_error && (
                    <p className="text-xs text-red-600 mt-1 truncate">
                      Error: {email.processing_error}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {email.candidates && (
                    <Link href={`/dashboard/candidates/${email.candidates.id}`}
                      className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                      View Candidate →
                    </Link>
                  )}
                  {canProcess && (
                    <button
                      onClick={() => processEmail(email.id)}
                      disabled={isProcessing}
                      className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs
                                 font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      {isProcessing
                        ? 'Processing…'
                        : email.processing_error
                        ? 'Retry'
                        : 'Process Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InboxSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2 mb-3" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
