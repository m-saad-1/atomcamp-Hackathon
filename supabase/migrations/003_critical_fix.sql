-- Confirm emails table has these columns
ALTER TABLE emails ADD COLUMN IF NOT EXISTS gmail_message_id text UNIQUE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS body_snippet      text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_classification text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_confidence     float;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS processing_error  text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS candidate_id      uuid REFERENCES candidates(id);
ALTER TABLE emails ADD COLUMN IF NOT EXISTS approval_status   text;

-- Confirm candidates table has these columns
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_draft         boolean NOT NULL DEFAULT true;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_score         integer;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_recommendation text;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_strengths     text[];
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills           text[];
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_years  integer;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS stage            text NOT NULL DEFAULT 'applied';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source           text;

-- Confirm approvals table has these columns
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS recruiter_id    uuid REFERENCES users(id);
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS action_type     text NOT NULL;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS action_payload  jsonb NOT NULL DEFAULT '{}';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS preview_label   text;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS related_entity  text;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS related_id      uuid;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS status          text NOT NULL DEFAULT 'pending';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS retry_count     integer DEFAULT 0;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS decided_at      timestamptz;

-- sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS provider         text NOT NULL DEFAULT 'google';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS access_token     text NOT NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS refresh_token    text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS token_expires_at bigint;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS scope            text;
ALTER TABLE sessions ADD CONSTRAINT sessions_user_provider UNIQUE (user_id, provider);

-- Enable Realtime on approvals
ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
