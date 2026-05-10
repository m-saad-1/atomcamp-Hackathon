-- Add body_snippet to emails to fix OpenAI context length
ALTER TABLE emails ADD COLUMN IF NOT EXISTS body_snippet text;

-- Change candidates is_draft default to true so they must be approved
ALTER TABLE candidates ALTER COLUMN is_draft SET DEFAULT true;
