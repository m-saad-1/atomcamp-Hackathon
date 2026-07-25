import { z } from 'zod';

// Action Lifecycle Enum
export const ActionStatusSchema = z.enum([
  'generated',
  'validated',
  'pending_approval',
  'approved',
  'executing',
  'completed',
  'failed',
  'retry',
  'partial_success',
  'cancelled',
  'rolled_back'
]);
export type ActionStatus = z.infer<typeof ActionStatusSchema>;

export const ApprovalPolicySchema = z.enum([
  'manual_recruiter',
  'manual_admin',
  'auto_approved'
]);
export type ApprovalPolicy = z.infer<typeof ApprovalPolicySchema>;

export const ActionPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type ActionPriority = z.infer<typeof ActionPrioritySchema>;

export const ActionRiskLevelSchema = z.enum(['low', 'medium', 'high']);
export type ActionRiskLevel = z.infer<typeof ActionRiskLevelSchema>;

// The canonical Action object schema
export const ActionSchema = z.object({
  // Identity
  id: z.string().uuid().optional(),
  organization_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  recruiter_id: z.string().uuid().nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  source: z.string(),

  // Metadata
  action_type: z.string(),
  category: z.string(),
  priority: ActionPrioritySchema.default('medium'),
  risk_level: ActionRiskLevelSchema.default('low'),
  confidence: z.number().min(0).max(100).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),

  // AI Context
  recommendation: z.string().nullable().optional(),
  reasoning: z.string().nullable().optional(),
  supporting_evidence: z.any().nullable().optional(), // Expected to be JSON array or object
  ai_confidence: z.number().min(0).max(100).nullable().optional(),
  prompt_version: z.string().nullable().optional(),
  intelligence_version: z.string().nullable().optional(),

  // Approval
  approval_policy: ApprovalPolicySchema.default('manual_recruiter'),
  approval_status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  approver_id: z.string().uuid().nullable().optional(),
  approval_timestamp: z.string().datetime().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),

  // Execution
  execution_plan: z.any().nullable().optional(),
  dependencies: z.array(z.string()).default([]),
  required_permissions: z.array(z.string()).default([]),
  execution_status: ActionStatusSchema.default('generated'),
  started_at: z.string().datetime().nullable().optional(),
  completed_at: z.string().datetime().nullable().optional(),
  retry_count: z.number().int().default(0),
  failure_reason: z.string().nullable().optional(),
  external_references: z.any().nullable().optional(),

  // Audit
  created_by: z.string().uuid().nullable().optional(),
  trigger_source: z.string().nullable().optional(),
  planner_version: z.string().nullable().optional(),
  execution_version: z.string().nullable().optional(),
});

export type Action = z.infer<typeof ActionSchema>;

// Action Transitions (Audit Log)
export const ActionTransitionSchema = z.object({
  id: z.string().uuid().optional(),
  action_id: z.string().uuid(),
  from_status: ActionStatusSchema.nullable().optional(),
  to_status: ActionStatusSchema,
  transitioned_by: z.string().uuid().nullable().optional(),
  transitioned_at: z.string().datetime().optional(),
  metadata: z.any().nullable().optional()
});

export type ActionTransition = z.infer<typeof ActionTransitionSchema>;

// Execution Report
export const ExecutionReportSchema = z.object({
  id: z.string().uuid().optional(),
  action_id: z.string().uuid(),
  action_type: z.string(),
  candidate_id: z.string().uuid(),
  recruiter_id: z.string().uuid().nullable().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  duration_ms: z.number().int(),
  result: z.enum(['success', 'failure', 'partial_success']),
  retry_count: z.number().int().default(0),
  external_systems_used: z.array(z.string()).nullable().optional(),
  external_ids: z.record(z.string(), z.string()).nullable().optional(),
  logs: z.array(z.string()).nullable().optional(),
  errors: z.array(z.string()).nullable().optional(),
  warnings: z.array(z.string()).nullable().optional(),
  final_status: ActionStatusSchema,
  created_at: z.string().datetime().optional()
});

export type ExecutionReport = z.infer<typeof ExecutionReportSchema>;
