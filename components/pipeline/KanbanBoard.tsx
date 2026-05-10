'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Stage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreBadge } from '@/components/candidates/ScoreBadge';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const STAGES: Stage[] = ['applied', 'screening', 'interview', 'final_round', 'offered', 'hired', 'rejected'];

interface KanbanCandidate {
  id: string;
  full_name: string;
  current_role: string | null;
  ai_score: number | null;
  stage: Stage;
}

export function KanbanBoard({ initialCandidates }: { initialCandidates: KanbanCandidate[] }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCandidate = candidates.find(c => c.id === activeId);
    if (!activeCandidate) return;

    let targetStage: Stage;

    if (STAGES.includes(overId as Stage)) {
      targetStage = overId as Stage;
    } else {
      const overCandidate = candidates.find(c => c.id === overId);
      if (!overCandidate) return;
      targetStage = overCandidate.stage;
    }

    if (activeCandidate.stage === targetStage) return;

    // Optimistic update
    setCandidates(prev => prev.map(c => 
      c.id === activeId ? { ...c, stage: targetStage } : c
    ));

    try {
      // Direct update for drag-and-drop. Could also create an approval action instead.
      const { error } = await supabase
        .from('candidates')
        .update({ stage: targetStage })
        .eq('id', activeId);

      if (error) throw error;
    } catch (err) {
      toast({
        title: 'Error moving candidate',
        description: 'Failed to update stage. Reverting.',
        variant: 'destructive',
      });
      // Revert optimistic update
      setCandidates(initialCandidates);
    }
  };

  const activeCandidate = candidates.find(c => c.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full items-start">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            id={stage}
            stage={stage}
            candidates={candidates.filter(c => c.stage === stage)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCandidate ? <KanbanCard candidate={activeCandidate} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// ── Internal Components ────────────────────────────────────────────────────────

import { useDroppable } from '@dnd-kit/core';

function KanbanColumn({ id, stage, candidates }: { id: string; stage: Stage; candidates: KanbanCandidate[] }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-80 shrink-0 bg-card/40 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground capitalize">
          {stage.replace('_', ' ')}
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {candidates.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-3 min-h-[150px]">
        <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map(c => (
            <SortableKanbanCard key={c.id} candidate={c} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableKanbanCard({ candidate }: { candidate: KanbanCandidate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard candidate={candidate} />
    </div>
  );
}

function KanbanCard({ candidate, isOverlay }: { candidate: KanbanCandidate; isOverlay?: boolean }) {
  return (
    <Card className={`cursor-grab active:cursor-grabbing bg-card hover:border-primary/50 transition-colors ${isOverlay ? 'shadow-xl scale-105 border-primary/50' : 'shadow-sm'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm text-foreground line-clamp-1">{candidate.full_name}</h4>
          <ScoreBadge score={candidate.ai_score} />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">{candidate.current_role}</p>
      </CardContent>
    </Card>
  );
}
