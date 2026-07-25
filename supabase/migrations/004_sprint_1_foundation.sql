-- ════════════════════════════════════════════════════════════════════════════
-- ORGANIZATIONS
-- ════════════════════════════════════════════════════════════════════════════
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- ORGANIZATION MEMBERS
-- ════════════════════════════════════════════════════════════════════════════
create table organization_members (
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null default 'recruiter' check (role in ('owner', 'admin', 'recruiter')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index idx_org_members_user on organization_members(user_id);

-- ════════════════════════════════════════════════════════════════════════════
-- INTEGRATION REGISTRY
-- ════════════════════════════════════════════════════════════════════════════
create table integration_registry (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  service text not null check (service in ('gmail', 'openai', 'slack', 'calendar')),
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'requires_auth', 'expired', 'error')),
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, service)
);

create trigger integration_registry_updated_at
  before update on integration_registry
  for each row execute function set_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- USERS ALTERATION
-- ════════════════════════════════════════════════════════════════════════════
alter table users add column if not exists preferences jsonb default '{}';

-- ════════════════════════════════════════════════════════════════════════════
-- ENTITIES MULTI-TENANCY PREP
-- ════════════════════════════════════════════════════════════════════════════
-- To fully isolate, we should eventually add organization_id to jobs, candidates, emails, etc.
-- For Sprint 1 Phase 3, we add it to the tables so we can isolate.
alter table jobs add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table candidates add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table emails add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table approvals add column if not exists organization_id uuid references organizations(id) on delete cascade;
alter table interviews add column if not exists organization_id uuid references organizations(id) on delete cascade;

create index if not exists idx_jobs_org on jobs(organization_id);
create index if not exists idx_candidates_org on candidates(organization_id);
create index if not exists idx_emails_org on emails(organization_id);
create index if not exists idx_approvals_org on approvals(organization_id);

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- ════════════════════════════════════════════════════════════════════════════
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table integration_registry enable row level security;

-- A user can see organizations they are a member of
create policy "users_see_their_orgs" on organizations
  for select
  using (
    id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- A user can see members of their organizations
create policy "users_see_org_members" on organization_members
  for select
  using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- A user can see integration registry for their organizations
create policy "users_see_org_integrations" on integration_registry
  for select
  using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );
