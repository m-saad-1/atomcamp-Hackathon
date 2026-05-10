import { createServerClient } from '@/lib/supabase/server';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';

export const revalidate = 0;

export default async function PipelinePage() {
  const supabase = createServerClient();
  
  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, full_name, current_role, ai_score, stage')
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Hiring Pipeline</h1>
        <p className="text-muted-foreground mt-2">
          Drag and drop candidates to move them between stages.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <KanbanBoard initialCandidates={candidates || []} />
      </div>
    </div>
  );
}
