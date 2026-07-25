import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { buildConversationContext } from '@/lib/copilot/context-builder';
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

    if (!rateLimit(`copilot_draft_${user.id}`, 5, 10000)) {
      return new Response('Too Many Requests', { status: 429 });
    }

    const { candidateId, sessionId, draftType, parameters, jobId } = await req.json();

    if (!candidateId || !draftType) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const context = await buildConversationContext(supabase, candidateId, sessionId || '', jobId);

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        subject: z.string().describe('The subject line of the email draft'),
        body: z.string().describe('The body of the email draft, with placeholders for missing information like [Date] or [Time]'),
        fields: z.record(z.string()).describe('A key-value map of parameters extracted or needed for the template (e.g. interviewer_name: "Alice")'),
      }),
      system: `
        You are an AI Recruiter Copilot. Generate a professional email draft based on the candidate's context.
        Draft Type: ${draftType}
        Parameters: ${JSON.stringify(parameters)}
        
        Rules:
        - Use professional tone.
        - Reference the context provided below to ensure correctness of names, roles, etc.
        - If scheduling, propose slots if provided in parameters, otherwise use placeholders.
        - Avoid disclosing sensitive information.
        
        Context: ${JSON.stringify(context, null, 2)}
      `,
      prompt: `Generate the ${draftType} email draft for candidate ${context.candidate?.full_name || 'the candidate'}.`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('[Copilot Draft Error]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
