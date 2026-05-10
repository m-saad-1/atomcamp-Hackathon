import { createServerClient } from '@/lib/supabase/server';
import { CandidateChat } from '@/components/candidates/CandidateChat';
import { ScoreBadge } from '@/components/candidates/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';

export const revalidate = 0;

export default async function CandidateProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!candidate) return notFound();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left side: Profile Info */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{candidate.full_name}</h1>
            <p className="text-xl text-muted-foreground">{candidate.current_role} @ {candidate.current_company}</p>
          </div>
          <ScoreBadge score={candidate.ai_score} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" /> {candidate.email}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" /> {candidate.phone || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {candidate.location || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" /> {candidate.experience_years} years exp
          </div>
        </div>

        {candidate.ai_summary && (
          <div>
            <h3 className="font-semibold text-lg mb-2">AI Summary</h3>
            <p className="text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
              {candidate.ai_summary}
            </p>
          </div>
        )}

        {candidate.ai_strengths?.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2 text-green-500">Top Strengths</h3>
            <ul className="space-y-2">
              {candidate.ai_strengths.map((str: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-500">•</span>
                  <span className="text-muted-foreground">{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {candidate.ai_weaknesses?.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2 text-red-500">Risks & Gaps</h3>
            <ul className="space-y-2">
              {candidate.ai_weaknesses.map((weak: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-500">•</span>
                  <span className="text-muted-foreground">{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-lg mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills?.map((skill: string) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: AI Recruiter Chat */}
      <div className="w-[400px] shrink-0 border-l border-border bg-card shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <CandidateChat candidateId={candidate.id} candidateName={candidate.full_name} />
      </div>
    </div>
  );
}
