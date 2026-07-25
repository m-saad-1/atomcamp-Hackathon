import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import { CopilotPipeline } from '@/lib/copilot/pipeline';
import { RECRUITER_COPILOT_PROMPT, CopilotResponseSchema } from '@/lib/ai/copilot-prompts';
import { rateLimit } from '@/lib/rate-limit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const recruiterId = session.user.id;
    const candidateId = params.id;
    
    if (!rateLimit(`copilot_chat_${recruiterId}`, 10, 10000)) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const { message, sessionId, jobId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const { data: newSession, error: sessionErr } = await supabase
        .from('chat_sessions')
        .insert({
          recruiter_id: recruiterId,
          candidate_id: candidateId,
          job_id: jobId || null,
          title: message.substring(0, 40) + '...'
        })
        .select('id')
        .single();
        
      if (sessionErr) throw sessionErr;
      activeSessionId = newSession.id;
    }

    // Determine the org id for this recruiter (hardcoded generic fetch for pipeline metadata, usually from auth token)
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', recruiterId)
      .limit(1)
      .single();
      
    const organizationId = orgMember?.organization_id || 'unknown';

    const pipeline = new CopilotPipeline(supabase, {
      recruiterId,
      organizationId,
      candidateId,
      jobId,
      sessionId: activeSessionId,
      permissions: ['read_all'] // Placeholder for actual permissions check
    });

    const result = await pipeline.executeStream(
      message, 
      CopilotResponseSchema, 
      {
        promptTemplate: RECRUITER_COPILOT_PROMPT,
        model: 'gpt-4o',
        confidenceThreshold: 60,
        requireEvidence: true
      },
      async (validatedResponse) => {
         // Additional post-processing if needed
      }
    );

    return result.toTextStreamResponse({
      headers: {
        'x-session-id': activeSessionId
      }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Copilot Chat Error:', msg);
    
    try {
      await supabase.from('audit_logs').insert({
        entity_type: 'candidate',
        entity_id: params.id,
        event: 'Copilot Chat Failed',
        details: { error: msg }
      });
    } catch { }

    return NextResponse.json({ error: 'Internal Server Error', details: msg }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const recruiterId = session.user.id;
    const candidateId = params.id;

    // Find latest session
    const { data: latestSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestSession) {
      return NextResponse.json({ sessionId: crypto.randomUUID(), messages: [] });
    }

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('role, content, metadata')
      .eq('session_id', latestSession.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      sessionId: latestSession.id,
      messages: messages?.map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? { answer: m.content, ...m.metadata } : m.content
      })) || []
    });
  } catch (error: unknown) {
    console.error('GET Chat History Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
