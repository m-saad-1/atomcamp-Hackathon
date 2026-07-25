-- Phase J: Performance Optimization Indexes
-- These indexes resolve full table scans identified during the N+1 and performance audit.

-- 1. Accelerate Dashboard Queries (filtering by organization and draft status)
CREATE INDEX IF NOT EXISTS idx_candidates_org_draft ON public.candidates(organization_id, is_draft);

-- 2. Accelerate Email Polling (filtering by unprocessed status)
CREATE INDEX IF NOT EXISTS idx_emails_org_lifecycle ON public.emails(organization_id, lifecycle_status, processed);

-- 3. Accelerate Approvals feed (filtering by recruiter and pending status)
CREATE INDEX IF NOT EXISTS idx_actions_recruiter_status ON public.actions(recruiter_id, execution_status);
CREATE INDEX IF NOT EXISTS idx_actions_org_status ON public.actions(organization_id, execution_status);

-- 4. Accelerate Chat Session lookups (used heavily by Copilot)
CREATE INDEX IF NOT EXISTS idx_chat_sessions_candidate ON public.chat_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at DESC);

-- 5. Foreign Key indexing for joins
CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON public.email_attachments(email_id);
CREATE INDEX IF NOT EXISTS idx_resumes_candidate_id ON public.resumes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews(candidate_id);
