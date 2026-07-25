import { createAdminClient } from '../supabase/server';
import { extractText, isLikelyScanned } from '../parsers/extraction';
import { performOCR } from '../parsers/ocr';
import { callOpenAIJson } from '../openai/caller';
import { RESUME_PARSING_PROMPT } from '../ai/prompts';
import { CandidateProfileSchema, CandidateProfile } from './schema';
import { logger } from '../logger';
import { logAuditEvent } from '../audit';

/**
 * Processes an email attachment, extracts text, calls AI to structure the data,
 * performs deduplication, and inserts the candidate.
 */
export async function processResumeAttachment(emailId: string, attachmentId: string, organizationId: string) {
  const supabase = createAdminClient();

  try {
    // 1. Fetch attachment record
    const { data: attachment, error: attachError } = await supabase
      .from('email_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (attachError || !attachment) {
      throw new Error(`Attachment ${attachmentId} not found.`);
    }

    // 2. Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('attachments')
      .download(attachment.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download attachment from storage: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // 3. Extract text
    let text = await extractText(buffer, attachment.mime_type);

    // 4. Fallback to OCR if scanned
    if (isLikelyScanned(text, buffer.byteLength)) {
      logger.info('Document is likely scanned. Falling back to OCR.', { attachmentId });
      await logAuditEvent(organizationId, 'attachment', attachmentId, 'OCR Invoked');
      try {
        text = await performOCR(buffer, attachment.mime_type);
      } catch (ocrErr: any) {
        logger.warn('OCR failed or not supported, proceeding with existing text', { error: ocrErr.message });
      }
    }

    if (text.trim().length < 50) {
      throw new Error('Insufficient text extracted from document.');
    }

    // 5. Structured AI Extraction
    const profile = await callOpenAIJson<CandidateProfile>({
      systemPrompt: RESUME_PARSING_PROMPT,
      userContent: text,
      schema: CandidateProfileSchema,
      model: 'gpt-4o'
    });

    // 6. Deduplication Matching Engine
    let matchConfidence = 'LOW';
    let matchedCandidateId: string | null = null;
    let duplicateStatus = 'clean';

    // Search existing candidates in the org
    // Build query using email, linkedin, github, or name
    let query = supabase.from('candidates').select('id, email, full_name, duplicate_status').eq('organization_id', organizationId);
    
    // Check by email (Highest confidence)
    if (profile.email) {
      const { data: byEmail } = await supabase.from('candidates')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('email', profile.email);
        
      if (byEmail && byEmail.length > 0) {
        matchConfidence = 'HIGH';
        matchedCandidateId = byEmail[0].id;
      }
    }

    // Check by links (High confidence)
    if (matchConfidence === 'LOW' && (profile.linkedin_url || profile.github_url)) {
      const orQuery = [];
      if (profile.linkedin_url) orQuery.push(`linkedin_url.eq."${profile.linkedin_url}"`);
      if (profile.github_url) orQuery.push(`github_url.eq."${profile.github_url}"`);
      
      const { data: byLinks } = await supabase.from('candidates')
        .select('id')
        .eq('organization_id', organizationId)
        .or(orQuery.join(','));
        
      if (byLinks && byLinks.length > 0) {
        matchConfidence = 'HIGH';
        matchedCandidateId = byLinks[0].id;
      }
    }

    // Check by Phone (High confidence)
    if (matchConfidence === 'LOW' && profile.phone) {
      const { data: byPhone } = await supabase.from('candidates')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('phone', profile.phone);
        
      if (byPhone && byPhone.length > 0) {
        matchConfidence = 'HIGH';
        matchedCandidateId = byPhone[0].id;
      }
    }

    // Check by exact name match (Medium confidence)
    if (matchConfidence === 'LOW') {
      const { data: byName } = await supabase.from('candidates')
        .select('id')
        .eq('organization_id', organizationId)
        .ilike('full_name', profile.full_name);
        
      if (byName && byName.length > 0) {
        matchConfidence = 'MEDIUM';
        matchedCandidateId = byName[0].id;
      }
    }

    // 7. Apply matching logic
    let finalCandidateId = matchedCandidateId;

    if (matchConfidence === 'HIGH' && matchedCandidateId) {
      // Auto Merge
      const { error: updateErr } = await supabase.from('candidates').update({
        phone: profile.phone,
        location: profile.location,
        current_role: profile.current_role,
        current_company: profile.current_company,
        experience_years: profile.experience_years,
        skills: profile.skills,
        education: profile.education,
        work_history: profile.work_history,
        certifications: profile.certifications,
        languages: profile.languages,
        projects: profile.projects,
        updated_at: new Date().toISOString()
      }).eq('id', matchedCandidateId);
      
      if (updateErr) throw updateErr;

      await insertTimelineEvent(supabase, matchedCandidateId, 'merged', { matchConfidence });
    } else {
      // Create new (if LOW, status = clean; if MEDIUM, status = pending_review)
      duplicateStatus = matchConfidence === 'MEDIUM' ? 'pending_review' : 'clean';
      
      // Calculate provenance
      const provenance = {
        source_attachment_id: attachmentId,
        source_email_id: emailId
      };

      const { data: newCandidate, error: createErr } = await supabase.from('candidates').insert({
        organization_id: organizationId,
        full_name: profile.full_name,
        email: profile.email || `unknown-${Date.now()}@temp.local`,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        current_role: profile.current_role,
        current_company: profile.current_company,
        experience_years: profile.experience_years,
        skills: profile.skills,
        education: profile.education,
        work_history: profile.work_history,
        certifications: profile.certifications,
        languages: profile.languages,
        projects: profile.projects,
        duplicate_status: duplicateStatus,
        provenance,
        source: 'email'
      }).select('id').single();

      if (createErr || !newCandidate) throw createErr;
      finalCandidateId = newCandidate.id;
      
      await insertTimelineEvent(supabase, finalCandidateId as string, 'created', { matchConfidence });
      await insertTimelineEvent(supabase, finalCandidateId as string, 'email_received', { emailId });
      
      if (duplicateStatus === 'pending_review') {
        await insertTimelineEvent(supabase, finalCandidateId as string, 'duplicate_review', { matchedCandidateId });
      }
    }

    // 8. Insert Resume Version
    // Count existing resumes to get version number
    const { count } = await supabase.from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('candidate_id', finalCandidateId);
      
    const newVersion = (count || 0) + 1;

    // Set old resumes is_latest = false
    await supabase.from('resumes').update({ is_latest: false }).eq('candidate_id', finalCandidateId);

    const { error: resumeErr } = await supabase.from('resumes').insert({
      candidate_id: finalCandidateId,
      email_id: emailId,
      attachment_id: attachmentId,
      version_number: newVersion,
      resume_text: text,
      is_latest: true
    });

    if (resumeErr) throw resumeErr;

    // Timeline event for document/resume attached
    await insertTimelineEvent(supabase, finalCandidateId as string, 'document_attached', { attachmentId, version: newVersion });

    // 9. Update email to processed
    await supabase.from('emails').update({ 
      lifecycle_status: 'normalized',
      candidate_id: finalCandidateId
    }).eq('id', emailId);

    await logAuditEvent(organizationId, 'candidate', finalCandidateId!, 'Resume Extracted and Processed');

    return { success: true, candidateId: finalCandidateId, matchConfidence };

  } catch (error: any) {
    logger.error('Failed to process resume attachment', { emailId, attachmentId, error: error.message });
    throw error;
  }
}

async function insertTimelineEvent(supabase: any, candidateId: string, eventType: string, payload: any = {}) {
  await supabase.from('candidate_timeline').insert({
    candidate_id: candidateId,
    event_type: eventType,
    payload
  });
}
