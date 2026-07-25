-- Migration 011: Sprint 6 Phase 1 - Action Enhancements

-- Add new JSONB columns for Action Planning & Execution
ALTER TABLE actions
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS required_permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS execution_plan JSONB;
