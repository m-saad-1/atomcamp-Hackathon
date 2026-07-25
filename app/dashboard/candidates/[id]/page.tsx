import { createAdminClient } from '@/lib/supabase/server';
import { CopilotPanel } from '@/components/copilot/CopilotPanel';
import { ScoreBadge } from '@/components/candidates/ScoreBadge';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Bot } from 'lucide-react';
import { CandidateIntelligenceCard } from '@/components/candidates/CandidateIntelligenceCard';

export const revalidate = 0;

export default async function CandidateProfilePage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', params.id)
    .single();

  const { data: resumes } = await supabase
    .from('resumes')
    .select('*')
    .eq('candidate_id', params.id)
    .order('version_number', { ascending: false });

  const { data: timeline } = await supabase
    .from('candidate_timeline')
    .select('*')
    .eq('candidate_id', params.id)
    .order('created_at', { ascending: false });

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, stage, created_at, jobs(title)')
    .eq('candidate_id', params.id)
    .order('created_at', { ascending: false });

  const { data: emails } = await supabase
    .from('emails')
    .select('id, subject, sender_name, received_at')
    .eq('candidate_id', params.id)
    .order('received_at', { ascending: false });

  const { data: intelligenceData } = await supabase
    .from('candidate_intelligence')
    .select('*')
    .eq('candidate_id', params.id)
    .eq('is_latest', true)
    .single();

  if (!candidate) return notFound();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left side: Profile Info */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              {candidate.full_name}
              {candidate.duplicate_status === 'pending_review' && (
                <Badge variant="destructive">Duplicate Review Pending</Badge>
              )}
            </h1>
            <p className="text-xl text-muted-foreground">{candidate.current_role} @ {candidate.current_company}</p>
          </div>
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

        {/* Intelligence Card Section */}
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Candidate Intelligence</h2>
          </div>
          <CandidateIntelligenceCard intelligence={intelligenceData} />
        </div>

        <div className="border-t pt-8">
          <h3 className="font-semibold text-lg mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills?.map((skill: string) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.languages?.map((lang: string) => (
              <Badge key={lang} variant="outline">{lang}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Work History</h3>
          <div className="space-y-4">
            {candidate.work_history?.map((work: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/20 pl-4 py-1">
                <h4 className="font-medium text-foreground">{work.role}</h4>
                <p className="text-sm text-muted-foreground mb-2">{work.company} | {work.duration}</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {work.responsibilities?.map((r: string, j: number) => <li key={j}>{r}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Education</h3>
          <div className="space-y-4">
            {candidate.education?.map((edu: any, i: number) => (
              <div key={i} className="border-l-2 border-primary/20 pl-4 py-1">
                <h4 className="font-medium text-foreground">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</h4>
                <p className="text-sm text-muted-foreground">{edu.institution} | {edu.year}</p>
              </div>
            ))}
          </div>
        </div>

        {candidate.projects?.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Projects</h3>
            <div className="space-y-4">
              {candidate.projects?.map((proj: any, i: number) => (
                <div key={i} className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-1">{proj.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {proj.technologies?.map((tech: string) => (
                      <span key={tech} className="text-xs bg-background border px-2 py-1 rounded">{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Right side: Resumes & Timeline */}
      <div className="w-[450px] shrink-0 border-l border-border bg-card shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col h-full">
        <CopilotPanel candidateId={params.id} className="h-[60%] shrink-0 rounded-none border-0 border-b shadow-none" />
        
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          <h3 className="font-semibold text-lg mb-4">Context</h3>
          
          <h4 className="font-semibold text-sm mb-3">Timeline</h4>
          <div className="space-y-4 mb-8">
            {timeline?.map((event) => (
              <div key={event.id} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div className="w-px h-full bg-border" />
                </div>
                <div className="pb-4">
                  <p className="font-medium capitalize">{event.event_type.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <h4 className="font-semibold text-sm mb-3">Resumes ({resumes?.length || 0})</h4>
          <div className="space-y-3 mb-8">
            {resumes?.map((resume) => (
              <div key={resume.id} className="p-3 border rounded-lg bg-background">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-sm">Version {resume.version_number}</span>
                    {resume.is_latest && <Badge variant="secondary" className="ml-2 text-[10px]">Latest</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(resume.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {resume.resume_text.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
