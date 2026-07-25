-- ════════════════════════════════════════════════════════════════════════════
-- SPRINT 2: EMAIL INGESTION SCHEMA UPDATES
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Update emails table with missing tracking fields
alter table emails add column if not exists thread_id text;
alter table emails add column if not exists labels jsonb default '[]';
alter table emails add column if not exists lifecycle_status text default 'new' 
  check (lifecycle_status in ('new', 'downloaded', 'normalized', 'attachments_ready', 'queued_for_ai', 'failed', 'archived'));

-- We remove the default value constraint temporarily to allow existing rows to gracefully adapt, though we are setting a default above.
-- To ensure duplicate prevention works on threads as well as message ids, we index them
create index if not exists idx_emails_thread on emails(thread_id);

-- 2. Create email_attachments table for multiple files support
create table if not exists email_attachments (
  id uuid primary key default uuid_generate_v4(),
  email_id uuid references emails(id) on delete cascade,
  filename text not null,
  mime_type text not null,
  size_bytes int not null,
  storage_path text not null,
  status text not null default 'downloaded' check (status in ('downloaded', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_email_attachments_email on email_attachments(email_id);

-- 3. Create audit_logs table for observability
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  entity_type text not null check (entity_type in ('email', 'attachment', 'candidate', 'job', 'approval', 'system')),
  entity_id uuid,
  event text not null,
  payload jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_org on audit_logs(organization_id);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════════

alter table email_attachments enable row level security;
alter table audit_logs enable row level security;

-- For this milestone, we allow authenticated users to read/write these tables
-- in a production environment, this would strictly check auth.uid() -> organization_id
create policy "recruiter_read_email_attachments" on email_attachments
  for all using (auth.role() = 'authenticated');

create policy "recruiter_read_audit_logs" on audit_logs
  for all using (auth.role() = 'authenticated');
