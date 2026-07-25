import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Base reusables
// ─────────────────────────────────────────────────────────────────────────────
const Urgency = z.enum(['high', 'medium', 'low']);
const Recommendation = z.enum(['strong_yes', 'yes', 'maybe', 'no']);
const EmailType = z.enum([
  'job_application', 'follow_up', 'referral', 'inquiry', 'spam', 'other'
]);
const ReplyTone = z.enum([
  'warm_invite', 'neutral_acknowledgment', 'polite_decline', 'request_more_info'
]);
export const DraftEmailType = z.enum([
  'interview_invite', 'rejection', 'follow_up', 'info_request', 'offer_letter'
]);
const SeniorityLevel = z.enum([
  'intern', 'junior', 'mid', 'senior', 'lead', 'principal'
]).nullable();

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL CLASSIFICATION — output of EMAIL_CLASSIFICATION_PROMPT
// ─────────────────────────────────────────────────────────────────────────────
export const EmailClassificationSchema = z.object({
  classification: EmailType,
  confidence: z.number().min(0).max(1),
  candidate: z.object({
    full_name: z.string().nullable(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    current_role: z.string().nullable(),
    current_company: z.string().nullable(),
    linkedin_url: z.string().url().nullable().or(z.literal(null)),
    github_url: z.string().url().nullable().or(z.literal(null)),
    portfolio_url: z.string().url().nullable().or(z.literal(null)),
    skills: z.array(z.string()),
    experience_years: z.number().int().positive().nullable(),
    availability: z.string().nullable(),
    location: z.string().nullable(),
  }),
  has_resume_attached: z.boolean(),
  urgency: Urgency,
  key_highlights: z.array(z.string()).max(3),
  suggested_reply_tone: ReplyTone,
});
export type EmailClassification = z.infer<typeof EmailClassificationSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESUME PARSING — output of RESUME_PARSING_PROMPT
// ─────────────────────────────────────────────────────────────────────────────
export const EducationEntrySchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.number().int().nullable(),
  field: z.string().nullable(),
});

export const WorkHistoryEntrySchema = z.object({
  role: z.string(),
  company: z.string(),
  duration: z.string(),
  responsibilities: z.array(z.string()).max(3),
});

export const ResumeParseSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  github_url: z.string().nullable(),
  portfolio_url: z.string().nullable(),
  current_role: z.string().nullable(),
  current_company: z.string().nullable(),
  experience_years: z.number().int().nonnegative().nullable(),
  skills: z.array(z.string()),
  education: z.array(EducationEntrySchema),
  work_history: z.array(WorkHistoryEntrySchema),
  certifications: z.array(z.string()),
  languages: z.array(z.string()),
  ai_summary: z.string().min(20).max(400),
});
export type ResumeParse = z.infer<typeof ResumeParseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE SCORING — output of CANDIDATE_SCORING_PROMPT
// ─────────────────────────────────────────────────────────────────────────────
export const ScoreBreakdownSchema = z.object({
  required_skills_match: z.number().int().min(0).max(40),
  experience_match: z.number().int().min(0).max(25),
  role_relevance: z.number().int().min(0).max(20),
  communication_quality: z.number().int().min(0).max(15),
});

export const CandidateScoringSchema = z.object({
  total_score: z.number().int().min(0).max(100),
  score_breakdown: ScoreBreakdownSchema,
  matched_required_skills: z.array(z.string()),
  missing_required_skills: z.array(z.string()),
  matched_nice_to_have: z.array(z.string()),
  strengths: z.array(z.string()).length(3),
  weaknesses: z.array(z.string()).length(2),
  recommendation: Recommendation,
  recommendation_reason: z.string().max(200),
  suggested_interview_questions: z.array(z.string()).length(3),
}).refine(
  (d) => {
    const sum = Object.values(d.score_breakdown).reduce((a, b) => a + b, 0);
    return Math.abs(sum - d.total_score) <= 1; // allow rounding tolerance
  },
  { message: 'score_breakdown components must sum to total_score (±1)' }
);
export type CandidateScoring = z.infer<typeof CandidateScoringSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL DRAFT — output of EMAIL_DRAFTING_PROMPT
// ─────────────────────────────────────────────────────────────────────────────
export const EmailDraftSchema = z.object({
  subject: z.string().min(5).max(150),
  body: z.string().min(30).max(1500),
  tone: z.enum(['warm', 'neutral', 'formal']),
  estimated_read_time_seconds: z.number().int().positive(),
});
export type EmailDraft = z.infer<typeof EmailDraftSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// JOB PARSING — output of JOB_PARSING_PROMPT
// ─────────────────────────────────────────────────────────────────────────────
export const JobParseSchema = z.object({
  title: z.string(),
  required_skills: z.array(z.string()),
  nice_to_have: z.array(z.string()),
  experience_years: z.number().int().nonnegative().nullable(),
  education_required: z.string().nullable(),
  remote_ok: z.boolean(),
  seniority_level: SeniorityLevel,
  key_responsibilities: z.array(z.string()).max(5),
  red_flags: z.array(z.string()),
});
export type JobParse = z.infer<typeof JobParseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// APPROVAL ACTION PAYLOADS — strongly typed per action_type
// ─────────────────────────────────────────────────────────────────────────────
export const SendEmailPayloadSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  candidate_id: z.string().uuid(),
});

export const MoveStagePayloadSchema = z.object({
  candidate_id: z.string().uuid(),
  from_stage: z.string(),
  to_stage: z.string(),
  application_id: z.string().uuid().optional(),
});

export const ScheduleInterviewPayloadSchema = z.object({
  candidate_id: z.string().uuid(),
  job_id: z.string().uuid().optional(),
  proposed_times: z.array(z.string()).optional(),
  duration_minutes: z.number().int().default(60),
  meeting_type: z.enum(['video', 'phone', 'in_person']),
});

export const CreateCandidatePayloadSchema = z.object({
  candidate_id: z.string().uuid(), // draft candidate, awaiting approval
  email_id: z.string().uuid().optional(),
});

export const SlackNotifyPayloadSchema = z.object({
  message: z.string(),
  candidate_id: z.string().uuid().optional(),
  channel_id: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT MESSAGE
// ─────────────────────────────────────────────────────────────────────────────
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  ts: z.string().datetime(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatHistorySchema = z.array(ChatMessageSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;

// Request body sent from the frontend to /api/candidates/[id]/chat
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000).nullable(),
  // null triggers the auto-briefing on first open
  mode: z.enum(['briefing', 'question']),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
