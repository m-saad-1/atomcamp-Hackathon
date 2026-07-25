'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SCORE_COLOR, REC_LABEL, STAGE_COLORS } from '@/lib/utils';

type Candidate = {
  id: string; full_name: string; email: string;
  current_role: string | null; current_company: string | null;
  skills: string[]; ai_score: number | null;
  ai_recommendation: string | null; stage: string; duplicate_status: string;
  resumes?: { count: number }[];
};



export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [stage, setStage]           = useState('');
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (stage)  params.set('stage', stage);
    fetch(`/api/candidates?${params}`)
      .then((r) => r.json())
      .then((d) => { setCandidates(d.candidates ?? []); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, stage]);

  return (
    <main className="p-6 max-w-6xl mx-auto" aria-labelledby="page-title">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 id="page-title" className="text-xl font-semibold text-foreground">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Profiles created from processed emails and uploaded resumes
          </p>
        </div>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {candidates.length} profiles
        </span>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text" placeholder="Search name, email, role…"
          aria-label="Search candidates"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2
                     text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          aria-label="Filter by stage"
          value={stage} onChange={(e) => setStage(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Stages</option>
          {['applied','screening','interview','final_round','offered','hired','rejected']
            .map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && candidates.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No candidates yet</p>
          <p className="text-sm">Process emails in the Inbox tab to create candidate profiles.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-40" />
            ))
          : candidates.map((c) => (
            <Link key={c.id} href={`/dashboard/candidates/${c.id}`}
              className="bg-card border border-border rounded-xl p-4 hover:border-ring/50 transition-colors block">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{c.full_name}</p>
                    {c.duplicate_status === 'pending_review' && (
                      <span className="text-[10px] font-medium bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-sm">
                        Duplicate Review
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.current_role ?? 'Unknown role'}
                    {c.current_company ? ` at ${c.current_company}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${SCORE_COLOR(c.ai_score)}`}>
                  {c.ai_score != null ? `${c.ai_score}/100` : 'Unscored'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {(c.skills ?? []).slice(0, 3).map((s) => (
                  <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                    {s}
                  </span>
                ))}
                {(c.skills ?? []).length > 3 && (
                  <span className="text-xs text-muted-foreground">+{c.skills.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[c.stage] ?? ''}`}>
                    {c.stage.replace('_', ' ')}
                  </span>
                  {c.resumes?.[0]?.count ? (
                    <span className="text-xs text-muted-foreground border px-1.5 py-0.5 rounded-md bg-muted/30">
                      {c.resumes[0].count} Resume{c.resumes[0].count > 1 ? 's' : ''}
                    </span>
                  ) : null}
                </div>
                {c.ai_recommendation && (
                  <span className="text-xs text-muted-foreground">
                    {REC_LABEL[c.ai_recommendation] ?? c.ai_recommendation}
                  </span>
                )}
              </div>
            </Link>
          ))}
      </div>
    </main>
  );
}
