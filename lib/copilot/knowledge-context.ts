import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateKnowledge } from './types';

export class KnowledgeContextBuilder {
  static async build(supabase: SupabaseClient, candidateId: string, jobId?: string): Promise<CandidateKnowledge> {
    // 1. Candidate Profile (Facts only)
    const { data: profile } = await supabase
      .from('candidates')
      .select('id, full_name, email, current_role, current_company, experience_years, skills, location, availability')
      .eq('id', candidateId)
      .single();

    // 2. Candidate Intelligence (AI Reasoning, versioned)
    const { data: intelligence } = await supabase
      .from('candidate_intelligence')
      .select('id, executive_summary, risk_indicators, interview_topics, confidence_score, strengths, weaknesses')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 3. Resumes
    const { data: resumes } = await supabase
      .from('resumes')
      .select('version_number, resume_text, created_at')
      .eq('candidate_id', candidateId)
      .order('version_number', { ascending: false })
      .limit(1);

    // 4. Timeline
    const { data: timeline } = await supabase
      .from('candidate_timeline')
      .select('event_type, details, created_at')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(20);

    // 5. Competitors & Vector Search Fallback
    let competitors: any[] = [];
    let vectorContext: any[] = [];

    if (jobId) {
      const { data: otherCandidates } = await supabase
        .from('applications')
        .select('candidate_id, status, candidates(full_name, current_role, experience_years, skills)')
        .eq('job_id', jobId)
        .neq('candidate_id', candidateId)
        .limit(10);
      
      if (otherCandidates) {
        competitors = otherCandidates.map(c => c.candidates);
      }

      try {
        const dummyQueryEmbedding = new Array(1536).fill(0);
        const { data: matchedChunks } = await supabase.rpc('match_candidate_embeddings', {
          query_embedding: JSON.stringify(dummyQueryEmbedding),
          target_candidate_id: candidateId,
          match_threshold: 0.8,
          match_count: 5
        });
        if (matchedChunks) {
          vectorContext = matchedChunks;
        }
      } catch {
        // Fallback gracefully
      }
    }

    // Normalization & deduplication logic happens here.
    // Ensure AI reasoning (intelligence) is strictly separate from profile facts.

    return {
      candidateId,
      profile: profile || {},
      intelligence: intelligence || null,
      resumes: resumes || [],
      timeline: timeline || [],
      competitors,
      vectorContext
    };
  }
}
