import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { buildConversationContext } from '@/lib/copilot/context-builder';
import { logAIUsage, sanitizePromptInput } from '@/lib/ai/governance';
import { z } from 'zod';

export const maxDuration = 60; // Set max duration for Vercel functions

const systemPromptTemplate = `
You are an expert AI Recruiter Copilot. Your job is to assist recruiters by answering questions about candidates.
You must strictly follow these rules:
1. ONLY use the provided platform knowledge context to answer questions.
2. NEVER hallucinate or invent information not present in the context.
3. ALWAYS provide evidence for your claims, referencing the context (e.g., "According to the resume...", "In the recruiter notes...").
4. If you are uncertain or if the information is missing from the context, explicitly state "No evidence found" or "I don't know based on the provided context."
5. Never make final hiring decisions. Provide recommendations with a confidence level (High/Medium/Low) based on the strength of the evidence.
6. Do not infer protected characteristics (race, religion, age, etc.).
7. Maintain a professional, objective tone.

Context will be provided as a JSON object containing the candidate profile, resume, intelligence data, timeline, job description, and previous chat history.
`;

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

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, candidateId, sessionId, jobId } = await req.json();

    if (!candidateId || !sessionId) {
      return new Response('Missing required parameters: candidateId, sessionId', { status: 400 });
    }

    // Ensure session exists
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
       await supabase.from('chat_sessions').insert({
         id: sessionId,
         recruiter_id: user.id,
         candidate_id: candidateId,
         job_id: jobId || null,
       });
    }

    // Save the user's message
    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage && latestUserMessage.role === 'user') {
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: latestUserMessage.content,
      });
    }

    // Build Context
    const context = await buildConversationContext(supabase, candidateId, sessionId, jobId);

    // Sanitize user inputs to prevent prompt injection
    const sanitizedMessages = messages.map((m: any) => ({
      ...m,
      content: m.role === 'user' ? sanitizePromptInput(m.content) : m.content
    }));

    // Fetch Organization ID for logging
    const { data: member } = await supabase.from('organization_members').select('organization_id').eq('user_id', user.id).single();
    const orgId = member?.organization_id || user.id; // fallback to user id if no org found

    // Generate response using Vercel AI SDK
    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPromptTemplate + '\n\nCONTEXT:\n' + JSON.stringify(context, null, 2),
      messages: sanitizedMessages,
      async onFinish({ text, usage }) {
        // Save assistant's message to DB
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: text,
        });

        // Log AI Usage for Governance
        if (usage) {
          await logAIUsage(supabase, {
            organizationId: orgId,
            recruiterId: user.id,
            promptVersion: 'v1.0.0-copilot',
            modelVersion: 'gpt-4o',
            promptType: 'copilot_chat',
            tokensPrompt: usage.promptTokens,
            tokensCompletion: usage.completionTokens,
          });
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[Copilot Error]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
