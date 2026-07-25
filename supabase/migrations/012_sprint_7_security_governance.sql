-- Sprint 7 Phase 2: Security & Governance Migrations

-- 1. Soft Deletes (Phase I - Platform Governance)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE actions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. AI Usage Logs (Phase H - AI Governance)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    recruiter_id UUID REFERENCES users(id),
    prompt_version VARCHAR(255),
    model_version VARCHAR(255),
    prompt_type VARCHAR(255),
    prompt_hash TEXT,
    tokens_prompt INTEGER DEFAULT 0,
    tokens_completion INTEGER DEFAULT 0,
    total_cost NUMERIC(10, 6) DEFAULT 0,
    confidence_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org AI usage"
    ON ai_usage_logs FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their org AI usage"
    ON ai_usage_logs FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

-- 3. Data Retention Policies (Phase I - Platform Governance)
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    entity_type VARCHAR(50) NOT NULL,
    retention_days INTEGER NOT NULL DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, entity_type)
);

ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org retention policies"
    ON data_retention_policies FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage retention policies"
    ON data_retention_policies FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));
