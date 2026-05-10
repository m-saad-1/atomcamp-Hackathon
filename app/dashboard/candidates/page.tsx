import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ScoreBadge } from '@/components/candidates/ScoreBadge';
import { Candidate } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const revalidate = 0;

export default async function CandidatesPage() {
  const supabase = createServerClient();
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates?.map((candidate: Candidate) => (
          <Link key={candidate.id} href={`/dashboard/candidates/${candidate.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50 hover:bg-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{candidate.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.current_role}</p>
                  </div>
                  <ScoreBadge score={candidate.ai_score} />
                </div>
                
                <div className="flex gap-2 flex-wrap mb-4">
                  {candidate.skills?.slice(0, 3).map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-secondary/50">
                      {skill}
                    </Badge>
                  ))}
                  {(candidate.skills?.length || 0) > 3 && (
                    <Badge variant="secondary" className="bg-secondary/50">
                      +{(candidate.skills?.length || 0) - 3}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border flex justify-between">
                  <span>{candidate.experience_years} years exp</span>
                  <span className="capitalize">{candidate.stage.replace('_', ' ')}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {(!candidates || candidates.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          No candidates found. Process emails or upload resumes to add candidates.
        </div>
      )}
    </div>
  );
}
