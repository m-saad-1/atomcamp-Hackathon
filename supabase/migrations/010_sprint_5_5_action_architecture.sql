-- Migration 010: Action Architecture

-- Action Lifecycle Enum
CREATE TYPE action_status AS ENUM (
  'generated',
  'validated',
  'pending_approval',
  'approved',
  'executing',
  'completed',
  'failed',
  'retry'
);

CREATE TYPE approval_policy AS ENUM (
  'manual_recruiter',
  'manual_admin',
  'auto_approved'
);

CREATE TYPE action_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE action_risk_level AS ENUM (
  'low',
  'medium',
  'high'
);

-- Actions Table
CREATE TABLE actions (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    source VARCHAR(255) NOT NULL,

    -- Metadata
    action_type VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    priority action_priority DEFAULT 'medium',
    risk_level action_risk_level DEFAULT 'low',
    confidence NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- AI Context
    recommendation TEXT,
    reasoning TEXT,
    supporting_evidence JSONB,
    ai_confidence NUMERIC(5,2),
    prompt_version VARCHAR(255),
    intelligence_version VARCHAR(255),

    -- Approval
    approval_policy approval_policy DEFAULT 'manual_recruiter',
    approval_status VARCHAR(50) DEFAULT 'pending',
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_timestamp TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Execution
    execution_status action_status DEFAULT 'generated',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    retry_count INT DEFAULT 0,
    failure_reason TEXT,
    external_references JSONB,

    -- Audit
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    trigger_source VARCHAR(255),
    planner_version VARCHAR(255),
    execution_version VARCHAR(255)
);

-- Action Transitions Table (Audit logging for lifecycle state transitions)
CREATE TABLE action_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    from_status action_status,
    to_status action_status NOT NULL,
    transitioned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    transitioned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Execution Reports Table
CREATE TABLE execution_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    action_type VARCHAR(255) NOT NULL,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_ms INT NOT NULL,
    result VARCHAR(50) NOT NULL,
    retry_count INT DEFAULT 0,
    external_systems_used JSONB,
    external_ids JSONB,
    logs JSONB,
    errors JSONB,
    warnings JSONB,
    final_status action_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger for actions
CREATE TRIGGER trigger_update_actions_modtime
    BEFORE UPDATE ON actions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Function to log action state transitions
CREATE OR REPLACE FUNCTION log_action_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.execution_status IS DISTINCT FROM NEW.execution_status THEN
        INSERT INTO action_transitions (
            action_id,
            from_status,
            to_status,
            transitioned_by,
            metadata
        ) VALUES (
            NEW.id,
            OLD.execution_status,
            NEW.execution_status,
            COALESCE(auth.uid(), NEW.created_by),
            jsonb_build_object('reason', 'Status changed via update')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_action_transition
    AFTER UPDATE ON actions
    FOR EACH ROW
    EXECUTE FUNCTION log_action_transition();

