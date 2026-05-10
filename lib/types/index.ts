export type Stage =
  | 'applied' | 'screening' | 'interview'
  | 'final_round' | 'offered' | 'hired' | 'rejected';

export type ActionType =
  | 'send_email' | 'move_stage' | 'schedule_interview'
  | 'reject_candidate' | 'slack_notify' | 'create_candidate';

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  skills: string[];
  experience_years: number | null;
  current_role: string | null;
  current_company: string | null;
  education: Array<{ degree: string; institution: string; year: number | null }>;
  ai_summary: string | null;
  ai_score: number | null;
  ai_score_breakdown: Record<string, number> | null;
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | null;
  ai_interview_qs: string[];
  stage: Stage;
  source: string | null;
  tags: string[];
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  action_type: ActionType;
  action_payload: Record<string, unknown>;
  preview_label: string;
  related_entity: string | null;
  related_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  retry_count: number;
  created_at: string;
}

export interface ApiError {
  error: string;         // SCREAMING_SNAKE_CASE machine code
  message: string;       // Human-readable description
  recovery: string;      // Specific action to take next
  retryable: boolean;
  context?: Record<string, unknown>;
}
