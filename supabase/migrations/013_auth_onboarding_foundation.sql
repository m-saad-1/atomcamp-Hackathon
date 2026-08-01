-- Migration: 013_auth_onboarding_foundation.sql
-- Sprint: Authentication & Organization Onboarding
-- Adds all tables and columns required by 05-onboarding-engineering.md Part 2

-- ─── Authentication Domain ────────────────────────────────────────────────────

-- Add password_hash and email_verified to users if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
    ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='account_status') THEN
    ALTER TABLE users ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active','suspended','deleted'));
  END IF;
END $$;

-- password_reset_tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       UUID NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);

-- email_verifications
CREATE TABLE IF NOT EXISTS email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       UUID NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ev_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_ev_user_id ON email_verifications(user_id);

-- ─── Organization Domain ──────────────────────────────────────────────────────

-- Add missing columns to organizations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='onboarding_status') THEN
    ALTER TABLE organizations ADD COLUMN onboarding_status TEXT NOT NULL DEFAULT 'pending' CHECK (onboarding_status IN ('pending','provisioning','completed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='industry') THEN
    ALTER TABLE organizations ADD COLUMN industry TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='company_size') THEN
    ALTER TABLE organizations ADD COLUMN company_size TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='country') THEN
    ALTER TABLE organizations ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='timezone') THEN
    ALTER TABLE organizations ADD COLUMN timezone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='deleted_at') THEN
    ALTER TABLE organizations ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','suspended')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slug)
);
CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(organization_id);

-- organization_settings
CREATE TABLE IF NOT EXISTS organization_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  timezone        TEXT,
  country         TEXT,
  industry        TEXT,
  company_size    TEXT,
  date_format     TEXT DEFAULT 'MM/DD/YYYY',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Membership Domain ────────────────────────────────────────────────────────

-- recruiter_profiles
CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member',
  title           TEXT,
  department      TEXT,
  phone           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);
CREATE INDEX IF NOT EXISTS idx_rp_user ON recruiter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_rp_org ON recruiter_profiles(organization_id);

-- Add status column to organization_members if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organization_members' AND column_name='status') THEN
    ALTER TABLE organization_members ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','removed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organization_members' AND column_name='joined_at') THEN
    ALTER TABLE organization_members ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ─── Authorization Domain ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  is_system       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roles_org ON roles(organization_id);

CREATE TABLE IF NOT EXISTS permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  resource    TEXT NOT NULL,
  action      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- invitations
CREATE TABLE IF NOT EXISTS invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'member',
  token           UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','cancelled')),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  invited_by      UUID REFERENCES users(id),
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inv_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_inv_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_inv_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_inv_status ON invitations(organization_id, status);

-- ─── Platform Domain ──────────────────────────────────────────────────────────

-- audit_logs — ensure columns exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  session_id      UUID,
  action          TEXT NOT NULL,
  resource        TEXT NOT NULL,
  resource_id     UUID,
  result          TEXT NOT NULL DEFAULT 'success',
  ip_address      TEXT,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  correlation_id  UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_al_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_al_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_al_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_al_created ON audit_logs(created_at DESC);

-- background_jobs
CREATE TABLE IF NOT EXISTS background_jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','dead')),
  payload      JSONB DEFAULT '{}'::jsonb,
  attempts     INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  error        TEXT,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bj_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bj_type ON background_jobs(type, status);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS for all tables
-- (applied via SUPABASE_SERVICE_ROLE_KEY in API routes)

COMMENT ON TABLE password_reset_tokens IS 'Stores one-time password reset tokens (1h TTL). Hard deleted after use.';
COMMENT ON TABLE email_verifications IS 'Stores email verification tokens (24h TTL).';
COMMENT ON TABLE workspaces IS 'Recruiting workspaces within an organization.';
COMMENT ON TABLE organization_settings IS 'Per-organization configuration (locale, branding, etc.).';
COMMENT ON TABLE recruiter_profiles IS 'Recruiter-specific profile data linked to a user and organization.';
COMMENT ON TABLE audit_logs IS 'Immutable, append-only record of all security-sensitive operations.';
COMMENT ON TABLE background_jobs IS 'Asynchronous job queue for long-running operations.';
