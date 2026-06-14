import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { google } from 'googleapis';
const pdfParse = require('pdf-parse');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getBodyText(payload: any): string {
  if (!payload) return '';
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }
  if (payload.parts) {
    let text = '';
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64url').toString('utf-8');
      } else if (part.parts) {
        text += getBodyText(part);
      }
    }
    if (text) return text;
    // Fallback to text/html if plain doesn't exist
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64url').toString('utf-8');
      }
    }
    return text;
  }
  return '';
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const s = session as any;
  if (!s.access_token) {
    return NextResponse.json({ error: 'NO_GMAIL_TOKEN', message: 'Please sign out and back in to refresh Gmail permissions.' }, { status: 401 });
  }

  const supabase   = createAdminClient();
  const emailId    = params.id;
  const recruiterId = session.user.id;

  // 1. Fetch the email record
  const { data: email, error: fetchError } = await supabase
    .from('emails')
    .select('*')
    .eq('id', emailId)
    .single();

  if (fetchError || !email) {
    return NextResponse.json({ error: 'EMAIL_NOT_FOUND', message: 'Email not found.' }, { status: 404 });
  }

  // if (email.processed) {
  //   return NextResponse.json({ error: 'ALREADY_PROCESSED', message: 'This email has already been processed.' }, { status: 409 });
  // }

  await supabase.from('emails').update({ processing_error: null }).eq('id', emailId);

  try {
    // 2. Fetch full email and attachment from Gmail
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({
      access_token: s.access_token,
      refresh_token: s.refresh_token,
    });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id: email.gmail_message_id,
      format: 'full',
    });

    const fullBodyText = getBodyText(fullMsg.data.payload) || email.body_snippet;
    
    let cvText = '';
    
    // Find attachment
    const getAttachmentId = (payload: any): { id: string, mime: string } | null => {
      if (!payload) return null;
      if (payload.filename && payload.body?.attachmentId) {
        return { id: payload.body.attachmentId, mime: payload.mimeType };
      }
      if (payload.parts) {
        for (const p of payload.parts) {
          const res = getAttachmentId(p);
          if (res) return res;
        }
      }
      return null;
    };

    const attachmentInfo = getAttachmentId(fullMsg.data.payload);
    
    if (attachmentInfo?.id) {
      try {
        const attachRes = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: email.gmail_message_id,
          id: attachmentInfo.id,
        });
        
        if (attachRes.data.data) {
          const buffer = Buffer.from(attachRes.data.data, 'base64url');
          if (attachmentInfo.mime === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            cvText = pdfData.text;
          } else {
            // If it's a text/csv or doc, just try stringifying
            cvText = buffer.toString('utf-8');
          }
        }
      } catch (e) {
        console.error('Failed to parse attachment', e);
        cvText = 'Error reading attachment: ' + (e as Error).message;
      }
    }

    // 3. Classify the email with AI
    const classifyRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an AI recruiting assistant. Classify incoming emails and extract candidate information from the email body AND attached CV text.
Return a JSON object with:
- classification: one of "job_application" | "follow_up" | "referral" | "inquiry" | "spam" | "other"
- confidence: 0.0 to 1.0
- full_name: string or null
- current_role: string or null
- current_company: string or null
- skills: string[] (top skills mentioned, empty array if none)
- experience_years: number or null
- ai_score: number 0-100 or null (overall candidate quality score based on experience and skills)
- ai_recommendation: "strong_yes" | "yes" | "maybe" | "no" | null
- ai_strengths: string[] (2-3 key strengths, empty if not a job application)
- summary: string (1-2 sentence plain-English summary of this email)`,
        },
        {
          role: 'user',
          content: `From: ${email.sender_name ?? ''} <${email.sender_email}>
Subject: ${email.subject ?? '(no subject)'}
Email Body:
${fullBodyText.substring(0, 3000)}

Attached CV Content:
${cvText ? cvText.substring(0, 15000) : 'No CV Attached'}`,
        },
      ],
      max_tokens: 800,
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
          is_draft:         true, 
        })
        .select('id')
        .single();

      if (candidate) {
        await supabase
          .from('emails')
          .update({ candidate_id: candidate.id })
          .eq('id', emailId);

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
    console.error('Process error:', err);

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
