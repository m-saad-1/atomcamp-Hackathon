-- Drop existing constraint
alter table candidate_timeline drop constraint if exists candidate_timeline_event_type_check;

-- Add new constraint
alter table candidate_timeline add constraint candidate_timeline_event_type_check 
  check (event_type in ('received', 'email_received', 'resume_uploaded', 'processed', 'created', 'duplicate_review', 'resume_updated', 'merged', 'document_attached'));
