create extension if not exists "uuid-ossp";

-- ════════════════════════════════════════════════════════════════════════════
-- SESSIONS — stores OAuth tokens for Gmail API access
-- This is the fix for token expiry. NextAuth alone does not persist
-- refresh_tokens reliably across restarts. This table is the source of truth.
-- ════════════════════════════════════════════════════════════════════════════
create table sessions (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null,
  provider           text not null default 'google',
  access_token       text not null,
  refresh_token      text,           -- nullable: only present on first consent
  token_expires_at   bigint not null, -- unix ms timestamp
  scope              text,
  updated_at         timestamptz not null default now()
);
create unique index idx_sessions_user_provider on sessions(user_id, provider);

-- ════════════════════════════════════════════════════════════════════════════
-- USERS
-- ════════════════════════════════════════════════════════════════════════════
create table users (
  id           uuid primary key default uuid_generate_v4(),
  email        text unique not null,
  name         text,
  avatar_url   text,
  role         text not null default 'recruiter'
                 check (role in ('recruiter', 'admin')),
  created_at   timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- JOBS
-- ════════════════════════════════════════════════════════════════════════════
create table jobs (
  id                uuid primary key default uuid_generate_v4(),
  recruiter_id      uuid references users(id) on delete cascade,
  title             text not null,
  description       text,
  required_skills   text[] not null default '{}',
  nice_to_have      text[] default '{}',
  experience_years  int,
  location          text,
  remote_ok         boolean default true,
  salary_min        int,
  salary_max        int,
  status            text not null default 'open'
                      check (status in ('open','paused','closed')),
  created_at        timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- CANDIDATES
-- ════════════════════════════════════════════════════════════════════════════
create table candidates (
  id                   uuid primary key default uuid_generate_v4(),
  full_name            text not null,
  email                text unique not null,
  phone                text,
  location             text,
  linkedin_url         text,
  portfolio_url        text,
  github_url           text,
  resume_url           text,           -- Supabase Storage path
  resume_text          text,           -- Plain text extracted from PDF
  skills               text[] default '{}',
  experience_years     int,
  current_role         text,
  current_company      text,
  education            jsonb default '[]',
  work_history         jsonb default '[]',
  certifications       text[] default '{}',
  ai_summary           text,
  ai_score             int check (ai_score between 0 and 100),
  ai_score_breakdown   jsonb,
  ai_strengths         text[] default '{}',
  ai_weaknesses        text[] default '{}',
  ai_recommendation    text
                         check (ai_recommendation in
                           ('strong_yes','yes','maybe','no')),
  ai_interview_qs      text[] default '{}',
  stage                text not null default 'applied'
                         check (stage in ('applied','screening','interview',
                           'final_round','offered','hired','rejected')),
  source               text check (source in
                         ('email','upload','linkedin','referral','manual')),
  tags                 text[] default '{}',
  notes                text,
  availability         text,
  is_draft             boolean default false, -- true until create_candidate approved
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- APPLICATIONS (candidate ↔ job link)
-- ════════════════════════════════════════════════════════════════════════════
create table applications (
  id               uuid primary key default uuid_generate_v4(),
  candidate_id     uuid references candidates(id) on delete cascade,
  job_id           uuid references jobs(id) on delete cascade,
  status           text not null default 'active'
                     check (status in ('active','archived')),
  stage            text not null default 'applied'
                     check (stage in ('applied','screening','interview',
                       'final_round','offered','hired','rejected')),
  ai_match_score   int check (ai_match_score between 0 and 100),
  match_breakdown  jsonb,
  notes            text,
  created_at       timestamptz not null default now(),
  unique(candidate_id, job_id)
);

-- ════════════════════════════════════════════════════════════════════════════
-- EMAILS
-- ════════════════════════════════════════════════════════════════════════════
create table emails (
  id                  uuid primary key default uuid_generate_v4(),
  gmail_message_id    text unique,     -- deduplication key
  sender_name         text,
  sender_email        text not null,
  subject             text,
  body_text           text not null,
  body_html           text,
  has_attachment      boolean default false,
  attachment_filename text,
  attachment_size_kb  int,
  received_at         timestamptz,
  processed           boolean default false,
  processing_error    text,
  candidate_id        uuid references candidates(id),
  ai_classification   text check (
    ai_classification in (
      'job_application','follow_up','referral','inquiry','spam','other'
    )
  ),
  ai_confidence       numeric(3,2),
  ai_reply_draft      text,
  approval_status     text default 'pending'
                        check (approval_status in
                          ('pending','approved','rejected','skipped')),
  created_at          timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- APPROVALS
-- ════════════════════════════════════════════════════════════════════════════
create table approvals (
  id               uuid primary key default uuid_generate_v4(),
  recruiter_id     uuid references users(id),
  action_type      text not null check (
    action_type in (
      'send_email','move_stage','schedule_interview',
      'reject_candidate','slack_notify','create_candidate'
    )
  ),
  action_payload   jsonb not null,
  preview_label    text not null,
  related_entity   text check (related_entity in ('candidate','email','application')),
  related_id       uuid,
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  reviewed_by      uuid references users(id),
  reviewed_at      timestamptz,
  executed_at      timestamptz,
  execution_error  text,
  retry_count      int default 0,
  created_at       timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- INTERVIEWS
-- ════════════════════════════════════════════════════════════════════════════
create table interviews (
  id                     uuid primary key default uuid_generate_v4(),
  candidate_id           uuid references candidates(id) on delete cascade,
  job_id                 uuid references jobs(id),
  recruiter_id           uuid references users(id),
  scheduled_time         timestamptz,
  duration_minutes       int default 60,
  meeting_link           text,
  meeting_type           text check (meeting_type in ('video','phone','in_person')),
  status                 text default 'scheduled'
                           check (status in ('scheduled','completed','cancelled','no_show')),
  ai_interview_questions jsonb default '[]',
  notes                  text,
  created_at             timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════
create index idx_candidates_stage      on candidates(stage);
create index idx_candidates_score      on candidates(ai_score desc nulls last);
create index idx_candidates_draft      on candidates(is_draft) where is_draft = true;
create index idx_applications_job      on applications(job_id);
create index idx_emails_processed      on emails(processed) where processed = false;
create index idx_approvals_status      on approvals(status) where status = 'pending';
create index idx_approvals_created     on approvals(created_at desc);

-- ════════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ════════════════════════════════════════════════════════════════════════════
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger candidates_updated_at
  before update on candidates
  for each row execute function set_updated_at();

create or replace function set_sessions_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger sessions_updated_at
  before update on sessions
  for each row execute function set_sessions_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════════
alter table users        enable row level security;
alter table sessions     enable row level security;
alter table jobs         enable row level security;
alter table candidates   enable row level security;
alter table applications enable row level security;
alter table emails       enable row level security;
alter table approvals    enable row level security;
alter table interviews   enable row level security;

-- Users can read/write their own row
create policy "users_self" on users
  using (id = auth.uid())
  with check (id = auth.uid());

-- Sessions: user owns their own tokens
create policy "sessions_owner" on sessions
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- All authenticated recruiters can read/write operational tables
-- (For multi-tenant, scope these to recruiter_id = auth.uid())
create policy "recruiter_read_candidates" on candidates
  for all using (auth.role() = 'authenticated');

create policy "recruiter_read_jobs" on jobs
  for all using (auth.role() = 'authenticated');

create policy "recruiter_read_emails" on emails
  for all using (auth.role() = 'authenticated');

create policy "recruiter_read_approvals" on approvals
  for all using (auth.role() = 'authenticated');

create policy "recruiter_read_applications" on applications
  for all using (auth.role() = 'authenticated');

create policy "recruiter_read_interviews" on interviews
  for all using (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════════════════
-- CHAT SESSIONS — AI recruiter chat history per candidate
-- ════════════════════════════════════════════════════════════════════════════
create table chat_sessions (
  id            uuid primary key default uuid_generate_v4(),
  candidate_id  uuid references candidates(id) on delete cascade,
  recruiter_id  uuid references users(id) on delete cascade,
  messages      jsonb not null default '[]',
  -- messages is an array of: { role: "user"|"assistant", content: string, ts: ISO string }
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(candidate_id, recruiter_id)   -- one chat session per recruiter-candidate pair
);

create index idx_chat_sessions_candidate on chat_sessions(candidate_id);

alter table chat_sessions enable row level security;
create policy "chat_sessions_owner" on chat_sessions
  for all using (recruiter_id = auth.uid());

create trigger chat_sessions_updated_at
  before update on chat_sessions
  for each row execute function set_updated_at();
