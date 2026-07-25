import { SupabaseClient } from '@supabase/supabase-js';

export async function buildConversationContext(
  supabase: SupabaseClient,
  candidateId: string,
  sessionId: string,
  jobId?: string
) {
  // 1. Candidate Profile
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single();

  // 2. Resumes (Only Latest to save tokens)
  const { data: resumes } = await supabase
    .from('resumes')
    .select('version_number, resume_text, created_at')
    .eq('candidate_id', candidateId)
    .order('version_number', { ascending: false })
    .limit(1);

  // 3. Candidate Intelligence
  const { data: intelligence } = await supabase
    .from('candidate_intelligence')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // 4. Timeline
  const { data: timeline } = await supabase
    .from('candidate_timeline')
    .select('event_type, details, created_at')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false })
    .limit(20); // Limit timeline size

  // 5. Job Description & Competitors
  let jobContext = null;
  let competitors = [];
  let vectorContext = [];
  if (jobId) {
    const { data: job } = await supabase
      .from('jobs')
      .select('title, description, required_skills, nice_to_have, experience_years')
      .eq('id', jobId)
      .single();
    if (job) jobContext = job;

    // Fetch competitors for Candidate Comparison (Phase C)
    const { data: otherCandidates } = await supabase
      .from('applications')
      .select('candidate_id, status, candidates(full_name, current_role, experience_years, skills)')
      .eq('job_id', jobId)
      .neq('candidate_id', candidateId)
      .limit(10);
    
    if (otherCandidates) {
      competitors = otherCandidates.map(c => c.candidates);
    }
    
    // Hybrid Search Capability: If we have an embedding for the job description, 
    // we can retrieve relevant chunks for this candidate using pgvector
    // (This requires the worker to populate candidate_embeddings and the job embedding to be passed/calculated)
    try {
      const dummyQueryEmbedding = new Array(1536).fill(0); // Placeholder for actual embedding
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
      // Graceful fallback if pgvector is not populated or job has no embedding
    }
  }

  // 6. Previous Conversation (Chat History) - limit to 10 latest
  const { data: chatHistory } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  const formattedChat = chatHistory ? chatHistory.reverse() : [];

  return {
    candidate,
    resumes: resumes || [],
    intelligence: intelligence || null,
    timeline: timeline || [],
    job_context: jobContext,
    competitors,
    vector_context: vectorContext,
    chat_history: formattedChat
  };
}
