import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const pdfParse = require('pdf-parse');
import { callOpenAIJson } from '@/lib/openai/caller';
import { auth } from '@/auth';
import { getValidAccessToken } from '@/lib/gmail/auth';
import { downloadFirstPdfAttachment } from '@/lib/gmail/attachments';
import {
  EMAIL_CLASSIFICATION_PROMPT,
  RESUME_PARSING_PROMPT,
  CANDIDATE_SCORING_PROMPT,
  EMAIL_DRAFTING_PROMPT,
} from '@/lib/ai/prompts';
import {
  EmailClassificationSchema,
  ResumeParseSchema,
  CandidateScoringSchema,
  EmailDraftSchema,
} from '@/lib/types/schemas';
import { notifySlack } from '@/lib/slack/notify';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const emailId = params.id;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const recruiter_id = session.user.id;

  try {
    // ── Step 1: Fetch raw email ──────────────────────────────────────────────
    const { data: email, error: emailError } = await supabase
      .from('emails')
      .select('*')
      .eq('id', emailId)
      .single();

    if (emailError || !email) {
      return NextResponse.json({
        error: 'EMAIL_NOT_FOUND',
        message: 'Email record not found.',
        recovery: 'Verify the email ID.',
        retryable: false,
      }, { status: 404 });
    }

    let attachment_buffer: Buffer | null = null;
    let attachment_filename: string | null = null;

    if (email.has_attachment && email.gmail_message_id) {
      try {
        const token = await getValidAccessToken(recruiter_id);
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.gmail_message_id}?format=full`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (msgRes.ok) {
          const msg = await msgRes.json();
          const attachment = await downloadFirstPdfAttachment(
            recruiter_id, email.gmail_message_id, msg.payload?.parts ?? []
          );
          if (attachment) {
            attachment_buffer = attachment.buffer;
            attachment_filename = attachment.filename;
          }
        }
      } catch (e) {
        console.error('Failed to download attachment during processing:', e);
      }
    }

    // ── Step 2: Classify email ───────────────────────────────────────────────
    const classification = await callOpenAIJson({
      systemPrompt: EMAIL_CLASSIFICATION_PROMPT,
      userContent: `From: ${email.sender_name} <${email.sender_email}>\n` +
                   `Subject: ${email.subject}\n\n${email.body_text}`,
      schema: EmailClassificationSchema,
    });

    // Skip spam immediately
    if (classification.classification === 'spam') {
      await supabase.from('emails').update({
        processed: true,
        ai_classification: 'spam',
        ai_confidence: classification.confidence,
      }).eq('id', emailId);
      return NextResponse.json({ skipped: true, reason: 'spam' });
    }

    // ── Step 3: Parse resume attachment (if present) ─────────────────────────
    let resumeParse = null;
    let resumeText = '';

    if (attachment_buffer && attachment_filename?.endsWith('.pdf')) {
      const buffer = attachment_buffer;

      try {
        const pdfResult = await pdfParse(buffer);
        resumeText = pdfResult.text;

        if (resumeText.length < 100) {
          // Gap 3 Fix: Image-based PDF — use OCR as fallback
          try {
            const Tesseract = require('tesseract.js');
            const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
            resumeText = text;
          } catch (ocrErr) {
            console.error('OCR failed:', ocrErr);
          }
        }
        
        if (resumeText.length < 100) {
          await supabase.from('emails').update({
            processing_error: 'PDF_IMAGE_BASED: Could not extract text from resume PDF even with OCR.',
          }).eq('id', emailId);
        } else {
          resumeParse = await callOpenAIJson({
            systemPrompt: RESUME_PARSING_PROMPT,
            userContent: resumeText,
            schema: ResumeParseSchema,
            model: 'gpt-4o', // Use more capable model for resume parsing
            maxTokens: 2000,
          });
        }
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr);
        // Non-fatal — continue with email data only
      }
    }

    // ── Step 4: Create or update candidate ──────────────────────────────────
    const candidateEmail =
      resumeParse?.email ?? classification.candidate.email ?? email.sender_email;

    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', candidateEmail)
      .maybeSingle();

    let candidateId: string;

    if (existingCandidate) {
      // Update existing candidate with new data
      candidateId = existingCandidate.id;
      await supabase.from('candidates').update({
        ...(resumeParse && {
          full_name: resumeParse.full_name,
          phone: resumeParse.phone,
          location: resumeParse.location,
          skills: resumeParse.skills,
          experience_years: resumeParse.experience_years,
          current_role: resumeParse.current_role,
          current_company: resumeParse.current_company,
          education: resumeParse.education,
          work_history: resumeParse.work_history,
          ai_summary: resumeParse.ai_summary,
          resume_text: resumeText,
        }),
      }).eq('id', candidateId);
    } else {
      // Create draft candidate — awaits create_candidate approval
      const { data: newCandidate } = await supabase
        .from('candidates')
        .insert({
          full_name: resumeParse?.full_name ??
            classification.candidate.full_name ?? 'Unknown',
          email: candidateEmail,
          phone: resumeParse?.phone ?? classification.candidate.phone,
          location: resumeParse?.location ?? classification.candidate.location,
          skills: resumeParse?.skills ?? classification.candidate.skills,
          experience_years:
            resumeParse?.experience_years ?? classification.candidate.experience_years,
          current_role:
            resumeParse?.current_role ?? classification.candidate.current_role,
          ai_summary: resumeParse?.ai_summary ?? null,
          resume_text: resumeText || null,
          source: 'email',
          is_draft: true, // draft until approved
        })
        .select()
        .single();

      candidateId = newCandidate!.id;
    }

    // ── Step 5: Score candidate if a matching open job exists ────────────────
    const { data: openJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .limit(1);

    let scoring = null;
    if (openJobs && openJobs.length > 0) {
      const job = openJobs[0];
      const { data: candidate } = await supabase
        .from('candidates').select('*').eq('id', candidateId).single();

      scoring = await callOpenAIJson({
        systemPrompt: CANDIDATE_SCORING_PROMPT,
        userContent: JSON.stringify({ candidate, job }),
        schema: CandidateScoringSchema,
      });

      await supabase.from('candidates').update({
        ai_score: scoring.total_score,
        ai_score_breakdown: scoring.score_breakdown,
        ai_strengths: scoring.strengths,
        ai_weaknesses: scoring.weaknesses,
        ai_recommendation: scoring.recommendation,
        ai_interview_qs: scoring.suggested_interview_questions,
      }).eq('id', candidateId);

      // Create application link
      await supabase.from('applications').upsert({
        candidate_id: candidateId,
        job_id: job.id,
        ai_match_score: scoring.total_score,
        match_breakdown: scoring.score_breakdown,
      }, { onConflict: 'candidate_id,job_id' });
    }

    // ── Step 6: Draft reply email ────────────────────────────────────────────
    const { data: candidate } = await supabase
      .from('candidates').select('*').eq('id', candidateId).single();
    const job = openJobs?.[0] ?? { title: 'our open position' };

    const emailType = scoring && scoring.total_score >= 65
      ? 'interview_invite' : 'neutral_acknowledgment';

    let draftEmail = null;
    if (emailType === 'interview_invite') {
      draftEmail = await callOpenAIJson({
        systemPrompt: EMAIL_DRAFTING_PROMPT,
        userContent: JSON.stringify({
          email_type: 'interview_invite',
          candidate,
          job,
        }),
        schema: EmailDraftSchema,
      });
    }

    // ── Step 7: Update email record ──────────────────────────────────────────
    await supabase.from('emails').update({
      processed: true,
      candidate_id: candidateId,
      ai_classification: classification.classification,
      ai_confidence: classification.confidence,
      ai_reply_draft: draftEmail?.body ?? null,
    }).eq('id', emailId);

    // ── Step 8: Create approval actions ─────────────────────────────────────
    const approvals = [];

    if (!existingCandidate) {
      approvals.push({
        recruiter_id,
        action_type: 'create_candidate',
        action_payload: { candidate_id: candidateId, email_id: emailId },
        preview_label: `Create candidate profile for ${candidate?.full_name}`,
        related_entity: 'candidate',
        related_id: candidateId,
      });
    }

    if (draftEmail) {
      approvals.push({
        recruiter_id,
        action_type: 'send_email',
        action_payload: {
          to: candidateEmail,
          subject: draftEmail.subject,
          body: draftEmail.body,
          candidate_id: candidateId,
        },
        preview_label: `Send interview invite to ${candidate?.full_name}`,
        related_entity: 'candidate',
        related_id: candidateId,
      });
    }

    // Always add Slack notification for new candidates with score >= 65
    if (scoring && scoring.total_score >= 65) {
      approvals.push({
        recruiter_id,
        action_type: 'slack_notify',
        action_payload: {
          message: `🟢 Strong candidate: ${candidate?.full_name} — ` +
            `Score ${scoring.total_score}/100 (${scoring.recommendation.replace('_',' ')}) ` +
            `for ${job.title}`,
          candidate_id: candidateId,
        },
        preview_label: `Notify Slack: ${candidate?.full_name} scored ${scoring.total_score}/100`,
        related_entity: 'candidate',
        related_id: candidateId,
      });
    }

    if (approvals.length > 0) {
      await supabase.from('approvals').insert(approvals);
    }

    return NextResponse.json({
      success: true,
      candidate_id: candidateId,
      score: scoring?.total_score ?? null,
      approvals_created: approvals.length,
    });

  } catch (err) {
    console.error('Email processing pipeline error:', err);
    await supabase.from('emails').update({
      processing_error: err instanceof Error ? err.message : String(err),
    }).eq('id', emailId);

    return NextResponse.json({
      error: 'PIPELINE_ERROR',
      message: 'Email processing failed.',
      recovery: 'Check processing_error field on the email record.',
      retryable: true,
    }, { status: 500 });
  }
}
