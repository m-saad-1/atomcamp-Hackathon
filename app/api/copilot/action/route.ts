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

    if (!rateLimit(`copilot_action_${user.id}`, 5, 10000)) {
      return new Response('Too Many Requests', { status: 429 });
    }

    const { candidateId, sessionId, actionType, jobId } = await req.json();

    if (!candidateId || !actionType) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const context = await buildConversationContext(supabase, candidateId, sessionId || '', jobId);

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        plan: z.array(z.string()).describe('Ordered list of recommended steps for the recruiter to take'),
        justification: z.string().describe('Explanation of why this plan was recommended based on candidate context'),
      }),
      system: `
        You are an AI Recruiter Copilot. Given the candidate context and the requested action type,
        generate an action plan for the recruiter. Do not execute these steps, just recommend them.
        
        Action Type: ${actionType}
        Context: ${JSON.stringify(context, null, 2)}
      `,
      prompt: `Generate a step-by-step action plan to accomplish "${actionType}".`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('[Copilot Action Error]:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
