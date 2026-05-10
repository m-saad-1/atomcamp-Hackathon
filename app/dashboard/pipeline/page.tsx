'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STAGES = [
  { key: 'applied',     label: 'Applied',     color: 'border-t-blue-400'    },
  { key: 'screening',   label: 'Screening',   color: 'border-t-purple-400'  },
  { key: 'interview',   label: 'Interview',   color: 'border-t-amber-400'   },
  { key: 'final_round', label: 'Final Round', color: 'border-t-orange-400'  },
  { key: 'offered',     label: 'Offered',     color: 'border-t-green-400'   },
  { key: 'hired',       label: 'Hired',       color: 'border-t-emerald-500' },
  { key: 'rejected',    label: 'Rejected',    color: 'border-t-gray-400'    },
];

type Candidate = {
  id: string; full_name: string; current_role: string | null;
  skills: string[]; ai_score: number | null; stage: string;
};

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [dragging, setDragging]     = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/candidates')
      .then((r) => r.json())
      .then((d) => setCandidates(d.candidates ?? []))
      .finally(() => setLoading(false));
  }, []);

  const byStage = (key: string) => candidates.filter((c) => c.stage === key);

  async function handleDrop(toStage: string) {
    if (!dragging) return;
    const candidateId = dragging;
    const fromStage   = candidates.find((c) => c.id === candidateId)?.stage;
    if (!fromStage || fromStage === toStage) { setDragging(null); setDragOver(null); return; }

    // Optimistic update
    setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, stage: toStage } : c));

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ stage: toStage }),
      });
      if (!res.ok) throw new Error('Stage update failed');
    } catch {
      // Revert on error
      const res  = await fetch('/api/candidates');
      const data = await res.json();
      setCandidates(data.candidates ?? []);
    }

    setDragging(null);
    setDragOver(null);
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Drag candidates between stages. Moving a card creates an approval request.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = byStage(stage.key);
          const isOver = dragOver === stage.key;
          return (
            <div key={stage.key}
              className={`flex-shrink-0 w-56 bg-muted/40 rounded-xl border-t-2 ${stage.color}
                          ${isOver ? 'ring-2 ring-primary ring-offset-1' : ''} transition-all`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="px-3 py-2 border-b border-border/50">
                <span className="text-xs font-medium text-foreground">{stage.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{cards.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {loading
                  ? [...Array(2)].map((_, i) => (
                      <div key={i} className="h-20 bg-card rounded-lg animate-pulse" />
                    ))
                  : cards.map((c) => (
                    <div key={c.id} draggable
                      onDragStart={() => setDragging(c.id)}
                      onDragEnd={() => { setDragging(null); setDragOver(null); }}
                      className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing
                                  hover:border-ring/50 transition-colors select-none
                                  ${dragging === c.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-medium text-foreground leading-tight">{c.full_name}</p>
                        {c.ai_score != null && (
                          <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ml-1 font-medium
                            ${c.ai_score >= 80 ? 'bg-green-100 text-green-700' :
                              c.ai_score >= 60 ? 'bg-amber-100 text-amber-700' :
                                                 'bg-red-100 text-red-700'}`}>
                            {c.ai_score}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {c.current_role ?? 'Unknown role'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(c.skills ?? []).slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                      <Link href={`/dashboard/candidates/${c.id}`}
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                        onClick={(e) => e.stopPropagation()}>
                        View →
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
