import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import { openai } from '@/lib/openai/client';
import {
  RECRUITER_CHAT_SYSTEM_PROMPT,
  RECRUITER_AUTO_BRIEFING_PROMPT,
} from '@/lib/ai/prompts';
import { ChatRequestSchema } from '@/lib/types/schemas';
import type { ChatMessage } from '@/lib/types/schemas';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401 });
  }

  // Gap 5: Rate Limiting (20 requests per minute)
  const { rateLimit } = await import('@/lib/rate-limit');
  const allowed = rateLimit(`chat_${session.user.id}`, 20, 60000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), { status: 429 });
  }

  const body = await request.json();
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'INVALID_REQUEST', issues: parsed.error.issues }), {
      status: 400,
    });
  }

  const { message, mode } = parsed.data;
  const candidateId = params.id;

  // ── Load candidate + job context ────────────────────────────────────────────
  const { data: candidate, error: candError } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single();

  if (candError || !candidate) {
    return new Response(JSON.stringify({ error: 'CANDIDATE_NOT_FOUND' }), { status: 404 });
  }

  // Load the most relevant open job (or the job this candidate is linked to)
  const { data: application } = await supabase
    .from('applications')
    .select('job_id, jobs(*)')
    .eq('candidate_id', candidateId)
    .limit(1)
    .maybeSingle();

  const job = (application as any)?.jobs ?? { title: 'the open position', required_skills: [] };

  // ── Load or create chat session ──────────────────────────────────────────────
  const { data: existingSession } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('recruiter_id', session.user.id)
    .maybeSingle();

  const currentHistory: ChatMessage[] = existingSession?.messages ?? [];

  // ── Build system prompt with injected context ────────────────────────────────
  const systemPrompt = RECRUITER_CHAT_SYSTEM_PROMPT
    .replace('{CANDIDATE_JSON}', JSON.stringify({
      full_name: candidate.full_name,
      email: candidate.email,
      current_role: candidate.current_role,
      current_company: candidate.current_company,
      experience_years: candidate.experience_years,
      skills: candidate.skills,
      education: candidate.education,
      work_history: candidate.work_history,
      ai_summary: candidate.ai_summary,
      ai_score: candidate.ai_score,
      ai_score_breakdown: candidate.ai_score_breakdown,
      ai_strengths: candidate.ai_strengths,
      ai_weaknesses: candidate.ai_weaknesses,
      ai_recommendation: candidate.ai_recommendation,
      availability: candidate.availability,
      location: candidate.location,
    }, null, 2))
    .replace('{JOB_JSON}', JSON.stringify({
      title: job.title,
      required_skills: job.required_skills,
      nice_to_have: job.nice_to_have,
      experience_years: job.experience_years,
    }, null, 2));

  // ── Build message array for OpenAI ────────────────────────────────────────────
  const userMessage: string =
    mode === 'briefing'
      ? RECRUITER_AUTO_BRIEFING_PROMPT
      : (message ?? '');

  const openAIMessages = [
    { role: 'system' as const, content: systemPrompt },
    // Replay conversation history
    ...currentHistory
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  // Gap 4: Streaming timeout protection
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 seconds

  try {
    // ── Stream the response ────────────────────────────────────────────────────────
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      max_tokens: 600,
      messages: openAIMessages,
    }, { signal: controller.signal });

    // Collect full response to persist to DB
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(streamController) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              fullResponse += delta;
              // Server-Sent Events format for easy client consumption
              streamController.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }
          clearTimeout(timeout);

          // Persist updated history to DB
          const now = new Date().toISOString();
          const newMessages: ChatMessage[] = [
            ...currentHistory,
            { role: 'user', content: userMessage, ts: now },
            { role: 'assistant', content: fullResponse, ts: now },
          ];

          if (existingSession) {
            await supabase
              .from('chat_sessions')
              .update({ messages: newMessages })
              .eq('candidate_id', candidateId)
              .eq('recruiter_id', session!.user!.id);
          } else {
            await supabase.from('chat_sessions').insert({
              candidate_id: candidateId,
              recruiter_id: session!.user!.id,
              messages: newMessages,
            });
          }

          // Signal end of stream
          streamController.enqueue(encoder.encode('data: [DONE]\n\n'));
          streamController.close();
        } catch (err) {
          streamController.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      console.error('Streaming request timed out.');
      return new Response(JSON.stringify({ error: 'STREAM_TIMEOUT' }), { status: 504 });
    }
    return new Response(JSON.stringify({ error: 'STREAM_ERROR' }), { status: 500 });
  }
}

// GET — load existing chat history for a candidate
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401 });
  }

  const { data } = await supabase
    .from('chat_sessions')
    .select('messages')
    .eq('candidate_id', params.id)
    .eq('recruiter_id', session.user.id)
    .maybeSingle();

  return Response.json({ messages: data?.messages ?? [] });
}
