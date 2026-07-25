-- Phase A: Security Hardening - Row-Level Security (RLS)

-- 1. Enable RLS on all critical tables
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. Create organization-based isolation policies

-- Candidates
CREATE POLICY "Tenant Isolation: Candidates" ON public.candidates
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- Actions
CREATE POLICY "Tenant Isolation: Actions" ON public.actions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- Emails
CREATE POLICY "Tenant Isolation: Emails" ON public.emails
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- Approvals
CREATE POLICY "Tenant Isolation: Approvals" ON public.approvals
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- Chat Sessions
CREATE POLICY "Tenant Isolation: Chat Sessions" ON public.chat_sessions
  FOR ALL
  USING (
    recruiter_id = auth.uid()
  );
