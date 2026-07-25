import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { CANDIDATE_INTELLIGENCE_PROMPT, CandidateIntelligenceSchema } from '../ai/intelligence';
import { logger } from '../logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Builds the context object for the intelligence engine by fetching
 * all relevant candidate data (profile, resumes, emails, applications).
 */
export async function buildCandidateContext(supabase: SupabaseClient, candidateId: string, jobId?: string) {
  // Fetch Candidate Profile
  const { data: candidate, error: candidateErr } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single();

  if (candidateErr || !candidate) throw new Error('Candidate not found');

  // Fetch Resumes
  const { data: resumes } = await supabase
    .from('resumes')
    .select('version_number, resume_text, created_at')
    .eq('candidate_id', candidateId)
    .order('version_number', { ascending: false });

  // Fetch Emails
  const { data: emails } = await supabase
    .from('emails')
    .select('subject, body_text, received_at')
    .eq('candidate_id', candidateId)
    .order('received_at', { ascending: false });

  // Fetch Timeline
  const { data: timeline } = await supabase
    .from('candidate_timeline')
    .select('event_type, details, created_at')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });

  let jobContext = null;
  if (jobId) {
    const { data: job } = await supabase
      .from('jobs')
      .select('title, description, required_skills, nice_to_have, experience_years')
      .eq('id', jobId)
      .single();
    if (job) jobContext = job;
  }

  return {
    candidate,
    resumes: resumes || [],
    emails: emails || [],
    timeline: timeline || [],
    job_context: jobContext
  };
}

/**
 * Runs the Intelligence Engine for a candidate.
 */
export async function generateCandidateIntelligence(
  supabase: SupabaseClient, 
  candidateId: string, 
  jobId?: string
) {
  try {
    const startTime = Date.now();
    logger.info('Building context for intelligence engine', { candidateId, jobId });
    
    const context = await buildCandidateContext(supabase, candidateId, jobId);

    logger.info('Calling OpenAI for structured intelligence generation', { candidateId });

    // Ensure prompt version is logged
    let promptVersionId = null;
    const { data: existingPrompt } = await supabase
      .from('prompt_versions')
      .select('id')
      .eq('prompt_name', 'CANDIDATE_INTELLIGENCE')
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (existingPrompt) {
      promptVersionId = existingPrompt.id;
    } else {
      const { data: newPrompt } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_name: 'CANDIDATE_INTELLIGENCE',
          version_number: 1,
          model: 'gpt-4o',
          temperature: 0.1,
          system_prompt: CANDIDATE_INTELLIGENCE_PROMPT,
          user_prompt_template: 'JSON stringified context',
          changes_notes: 'Initial version'
        })
        .select('id')
        .single();
      if (newPrompt) promptVersionId = newPrompt.id;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: CANDIDATE_INTELLIGENCE_PROMPT
        },
        {
          role: "user",
          content: JSON.stringify(context, null, 2)
        }
      ],
      response_format: zodResponseFormat(CandidateIntelligenceSchema, "intelligence_report"),
      temperature: 0.1, // low temperature for determinism
    });

    const latencyMs = Date.now() - startTime;
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('OpenAI returned empty content');
    }

    const intelligenceData = JSON.parse(content);
    
    logger.info('Intelligence generated successfully', { candidateId, latencyMs });

    // Store the result
    const { data: inserted, error: insertErr } = await supabase
      .from('candidate_intelligence')
      .insert({
        candidate_id: candidateId,
        job_id: jobId || null,
        executive_summary: intelligenceData.executive_summary,
        overall_recommendation: intelligenceData.recommendation.status,
        recommendation_evidence: intelligenceData.recommendation.evidence,
        recommendation_reasoning: intelligenceData.recommendation.reasoning,
        recommendation_limitations: intelligenceData.recommendation.limitations,
        confidence_score: intelligenceData.recommendation.confidence_score,
        strengths: intelligenceData.strengths,
        weaknesses: intelligenceData.weaknesses,
        missing_information: intelligenceData.missing_information,
        interview_topics: intelligenceData.interview_topics,
        technical_assessment: intelligenceData.technical_assessment,
        experience_assessment: intelligenceData.experience_assessment,
        leadership_indicators: intelligenceData.leadership_indicators,
        communication_indicators: intelligenceData.communication_indicators,
        career_progression: intelligenceData.career_progression,
        risk_indicators: intelligenceData.risk_indicators,
        next_recommended_action: intelligenceData.next_recommended_action,
        processing_latency_ms: latencyMs,
        prompt_version_id: promptVersionId,
        is_latest: true
      })
      .select('id')
      .single();

    if (insertErr) {
      logger.error('Failed to insert candidate intelligence', { error: insertErr });
      throw insertErr;
    }

    // Log the success in audit logs for Health Metrics
    await supabase.from('audit_logs').insert({
      organization_id: context.candidate.organization_id || null,
      entity_type: 'candidate',
      entity_id: candidateId,
      event: 'Candidate Intelligence Generated',
      details: { latencyMs, confidence_score: intelligenceData.confidence_score, job_id: jobId }
    });

    return { success: true, id: inserted.id, latencyMs };

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    logger.error('Candidate Intelligence Engine failed', { candidateId, error: errMessage });
    
    // Log failure for health metrics
    await supabase.from('audit_logs').insert({
      entity_type: 'candidate',
      entity_id: candidateId,
      event: 'Candidate Intelligence Generation Failed',
      details: { error: errMessage }
    });

    return { success: false, error: errMessage };
  }
}
