-- ════════════════════════════════════════════════════════════════════════════
-- RECRUITER COPILOT SESSIONS
-- ════════════════════════════════════════════════════════════════════════════
create table chat_sessions (
  id           uuid primary key default uuid_generate_v4(),
  recruiter_id uuid not null references users(id) on delete cascade,
  candidate_id uuid not null references candidates(id) on delete cascade,
  job_id       uuid references jobs(id) on delete set null,
  title        text default 'New Conversation',
  status       text not null default 'active' check (status in ('active', 'archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- RECRUITER COPILOT MESSAGES
-- ════════════════════════════════════════════════════════════════════════════
create table chat_messages (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid not null references chat_sessions(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant', 'system', 'data')),
  content      text not null,
  
  -- Structured explainability data (populated for 'assistant' roles)
  metadata     jsonb default '{}',
  
  created_at   timestamptz not null default now()
);

-- Index for faster message retrieval by session
create index idx_chat_messages_session on chat_messages(session_id, created_at);

-- Trigger to auto-update session updated_at
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  NEW.updated_at = NOW();
  return NEW;
end;
$$ language plpgsql;

create trigger set_timestamp_chat_sessions
before update on chat_sessions
for each row
execute procedure trigger_set_timestamp();

-- ════════════════════════════════════════════════════════════════════════════
-- PROMPT GOVERNANCE - INITIAL COPILOT PROMPT
-- ════════════════════════════════════════════════════════════════════════════
insert into prompt_versions (
  prompt_name, 
  version_number, 
  model, 
  temperature, 
  system_prompt, 
  user_prompt_template, 
  changes_notes
) values (
  'RECRUITER_COPILOT',
  1,
  'gpt-4o',
  0.2,
  'You are an AI Recruiter Copilot. You assist recruiters by answering questions about candidates. You must strictly use the provided platform knowledge context. Never hallucinate. Always provide evidence, reasoning, and limitations. Never make final hiring decisions.',
  '${chat_history}',
  'Initial Sprint 5 prompt'
) on conflict (prompt_name, version_number) do nothing;
