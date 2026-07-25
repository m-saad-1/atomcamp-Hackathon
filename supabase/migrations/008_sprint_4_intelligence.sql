-- ════════════════════════════════════════════════════════════════════════════
-- PROMPT GOVERNANCE
-- ════════════════════════════════════════════════════════════════════════════
create table prompt_versions (
  id                   uuid primary key default uuid_generate_v4(),
  prompt_name          text not null,
  version_number       int not null,
  model                text not null,
  temperature          numeric(3,2) not null,
  system_prompt        text not null,
  user_prompt_template text not null,
  changes_notes        text,
  created_at           timestamptz not null default now(),
  unique(prompt_name, version_number)
);

-- ════════════════════════════════════════════════════════════════════════════
-- CANDIDATE INTELLIGENCE
-- ════════════════════════════════════════════════════════════════════════════
create table candidate_intelligence (
  id                       uuid primary key default uuid_generate_v4(),
  candidate_id             uuid references candidates(id) on delete cascade,
  job_id                   uuid references jobs(id) on delete set null,
  
  -- Core Analysis
  executive_summary          text not null,
  overall_recommendation     text not null,
  recommendation_evidence    text,
  recommendation_reasoning   text,
  recommendation_limitations text,
  confidence_score           int check (confidence_score between 0 and 100),
  
  -- Structured Evidence Arrays (JSONB)
  strengths                jsonb not null default '[]',
  weaknesses               jsonb not null default '[]',
  missing_information      jsonb not null default '[]',
  interview_topics         jsonb not null default '[]',
  
  -- Assessments
  technical_assessment     jsonb not null default '{}',
  experience_assessment    jsonb not null default '{}',
  leadership_indicators    jsonb not null default '[]',
  communication_indicators jsonb not null default '[]',
  career_progression       text,
  risk_indicators          jsonb not null default '[]',
  
  -- Action
  next_recommended_action  text,
  
  -- Explainability & Governance
  prompt_version_id        uuid references prompt_versions(id),
  processing_latency_ms    int,
  is_latest                boolean default true,
  
  created_at               timestamptz not null default now()
);

-- When a new intelligence record is created for a candidate, old ones should be marked is_latest = false
create or replace function update_latest_intelligence()
returns trigger as $$
begin
  update candidate_intelligence
  set is_latest = false
  where candidate_id = NEW.candidate_id 
    and (job_id = NEW.job_id or (job_id is null and NEW.job_id is null))
    and id != NEW.id;
  return NEW;
end;
$$ language plpgsql;

create trigger trigger_update_latest_intelligence
before insert on candidate_intelligence
for each row execute function update_latest_intelligence();
