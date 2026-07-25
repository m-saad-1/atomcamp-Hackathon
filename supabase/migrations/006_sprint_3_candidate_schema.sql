-- ════════════════════════════════════════════════════════════════════════════
-- SPRINT 3: RESUME PROCESSING & CANDIDATE CREATION SCHEMA
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Alter Candidates Table to support the strict Sprint 3 schema
alter table candidates add column if not exists projects jsonb default '[]';
alter table candidates add column if not exists languages text[] default '{}';
alter table candidates add column if not exists provenance jsonb default '{}';
alter table candidates add column if not exists duplicate_status text default 'clean'
  check (duplicate_status in ('clean', 'pending_review', 'merged'));

create index if not exists idx_candidates_duplicate_status on candidates(duplicate_status);

-- 2. Create Resumes Table to support versioning
create table if not exists resumes (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  email_id uuid references emails(id) on delete set null,
  attachment_id uuid references email_attachments(id) on delete set null,
  version_number int not null default 1,
  resume_text text not null,
  is_latest boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_resumes_candidate on resumes(candidate_id);

-- 3. Create Candidate Timeline Table for event sourcing
create table if not exists candidate_timeline (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  event_type text not null check (event_type in ('received', 'processed', 'created', 'duplicate_review', 'resume_updated', 'merged')),
  payload jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_candidate_timeline_candidate on candidate_timeline(candidate_id);
create index if not exists idx_candidate_timeline_created_at on candidate_timeline(created_at desc);

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════════════════

alter table resumes enable row level security;
alter table candidate_timeline enable row level security;

-- For this milestone, we allow authenticated users to read/write these tables.
-- In a strict production environment, this would verify organization_id matches auth.uid().
create policy "recruiter_read_resumes" on resumes
  for all using (auth.role() = 'authenticated');

create policy "recruiter_read_candidate_timeline" on candidate_timeline
  for all using (auth.role() = 'authenticated');
