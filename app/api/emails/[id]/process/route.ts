import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase   = createAdminClient();
  const emailId    = params.id;
  const recruiterId = session.user.id; // Always from session — never from request body

  // 1. Fetch the email record
  const { data: email, error: fetchError } = await supabase
    .from('emails')
    .select('*')
    .eq('id', emailId)
    .single();

  if (fetchError || !email) {
    return NextResponse.json({ error: 'EMAIL_NOT_FOUND', message: 'Email not found.' }, { status: 404 });
  }

  if (email.processed) {
    return NextResponse.json({ error: 'ALREADY_PROCESSED', message: 'This email has already been processed.' }, { status: 409 });
  }

  // 2. Mark as processing (prevents double-clicks triggering duplicate jobs)
  await supabase
    .from('emails')
    .update({ processing_error: null })
    .eq('id', emailId);

  try {
    // 3. Classify the email with AI
    const classifyRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an AI recruiting assistant. Classify incoming emails and extract candidate information.
Return a JSON object with:
- classification: one of "job_application" | "follow_up" | "referral" | "inquiry" | "spam" | "other"
- confidence: 0.0 to 1.0
- full_name: string or null
- current_role: string or null
- current_company: string or null
- skills: string[] (top skills mentioned, empty array if none)
- experience_years: number or null
- ai_score: number 0-100 or null (overall candidate quality score)
- ai_recommendation: "strong_yes" | "yes" | "maybe" | "no" | null
- ai_strengths: string[] (2-3 key strengths, empty if not a job application)
- summary: string (1-2 sentence plain-English summary of this email)`,
        },
        {
          role: 'user',
          content: `From: ${email.sender_name ?? ''} <${email.sender_email}>
Subject: ${email.subject ?? '(no subject)'}
Has attachment: ${email.has_attachment ? `Yes (${email.attachment_filename})` : 'No'}
Body snippet: ${email.body_snippet ?? '(no body)'}`,
        },
      ],
      max_tokens: 500,
    });

    const raw  = classifyRes.choices[0]?.message?.content ?? '{}';
    const data = JSON.parse(raw);

    // 4. Update the email with classification results
    await supabase
      .from('emails')
      .update({
        processed:         true,
        ai_classification: data.classification ?? 'other',
        ai_confidence:     data.confidence     ?? null,
        processing_error:  null,
      })
      .eq('id', emailId);

    // 5. If it's a job application, queue a create_candidate approval
    if (data.classification === 'job_application') {
      // Create a draft candidate record
      const { data: candidate } = await supabase
        .from('candidates')
        .insert({
          full_name:        data.full_name     ?? email.sender_name ?? email.sender_email,
          email:            email.sender_email,
          current_role:     data.current_role  ?? null,
          current_company:  data.current_company ?? null,
          skills:           data.skills        ?? [],
          experience_years: data.experience_years ?? null,
          ai_score:         data.ai_score      ?? null,
          ai_recommendation: data.ai_recommendation ?? null,
          ai_strengths:     data.ai_strengths  ?? [],
          stage:            'applied',
          source:           'email',
          is_draft:         true, // Hidden until recruiter approves create_candidate
        })
        .select('id')
        .single();

      if (candidate) {
        // Link the email to the candidate
        await supabase
          .from('emails')
          .update({ candidate_id: candidate.id })
          .eq('id', emailId);

        // Queue the create_candidate approval for the recruiter to review
        await supabase.from('approvals').insert({
          recruiter_id:   recruiterId,
          action_type:    'create_candidate',
          action_payload: {
            candidate_id:     candidate.id,
            email_id:         emailId,
            full_name:        data.full_name ?? email.sender_name,
            ai_score:         data.ai_score,
            ai_recommendation: data.ai_recommendation,
            summary:          data.summary,
          },
          preview_label:  `Create candidate profile for ${data.full_name ?? email.sender_email}`,
          related_entity: 'candidate',
          related_id:     candidate.id,
          status:         'pending',
        });
      }
    }

    return NextResponse.json({
      success:        true,
      classification: data.classification,
      message:        'Email processed successfully.',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Record the error so the UI shows a Retry button
    await supabase
      .from('emails')
      .update({ processing_error: message })
      .eq('id', emailId);

    return NextResponse.json({
      error:     'PROCESSING_FAILED',
      message,
      recovery:  'Check your OpenAI API key and try again.',
      retryable: true,
    }, { status: 500 });
  }
}
