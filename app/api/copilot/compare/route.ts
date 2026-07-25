import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!rateLimit(`copilot_compare_${user.id}`, 3, 10000)) {
      return new Response('Too Many Requests', { status: 429 });
    }

    let { candidateIds, candidateId, jobId } = await req.json();

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      if (candidateId) {
        candidateIds = [candidateId];
      } else {
        return new Response('Please provide candidateId or candidateIds to compare', { status: 400 });
      }
    }

    // Auto-fetch competitors if jobId is provided and we only have 1 candidate
    if (candidateIds.length < 2 && jobId) {
      const { data: competitors } = await supabase
        .from('applications')
        .select('candidate_id')
        .eq('job_id', jobId)
        .neq('candidate_id', candidateIds[0])
        .limit(2);
      
      if (competitors && competitors.length > 0) {
        candidateIds = [...candidateIds, ...competitors.map(c => c.candidate_id)];
      } else {
        return new Response('Not enough other candidates found for this job to compare against.', { status: 400 });
      }
    } else if (candidateIds.length < 2) {
      return new Response('Please provide at least two candidates to compare, or a jobId to auto-fetch competitors.', { status: 400 });
    }

    // Fetch minimal profiles and intelligence for comparison to save tokens
    const candidates = [];
    for (const id of candidateIds) {
      const { data: c } = await supabase.from('candidates').select('*').eq('id', id).single();
      const { data: intl } = await supabase.from('candidate_intelligence').select('*').eq('candidate_id', id).order('created_at', { ascending: false }).limit(1).single();
      if (c) {
        candidates.push({ candidate: c, intelligence: intl });
      }
    }

    let jobContext = null;
    if (jobId) {
       const { data: j } = await supabase.from('jobs').select('*').eq('id', jobId).single();
       jobContext = j;
    }

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        comparisonMatrix: z.array(z.object({
          candidateId: z.string(),
          candidateName: z.string(),
          skillsSummary: z.string(),
          experienceSummary: z.string(),
          pros: z.array(z.string()),
          cons: z.array(z.string()),
          fitScore: z.number().min(0).max(100).describe('Estimated fit score based on job context'),
        })),
        recommendation: z.string().describe('Overall recommendation on who to prioritize'),
      }),
      system: `
        You are an AI Recruiter Copilot. Compare the provided candidates against each other, 
        and specifically against the job requirements if provided. 
        Ensure comparisons are objective and evidence-based.
        
        Job Context: ${JSON.stringify(jobContext, null, 2)}
        Candidates Context: ${JSON.stringify(candidates, null, 2)}
      `,
      prompt: `Generate a comparison matrix for these candidates.`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('[Copilot Compare Error]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
