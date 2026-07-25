import { Action } from './types';

/**
 * The Action Planner Abstraction.
 * Responsibilities:
 * - Receive Copilot recommendations.
 * - Transform recommendations into structured Action objects.
 * - Determine action type, permissions, integrations, risk level, policy, dependencies.
 * 
 * The Action Planner MUST NEVER execute actions. It is strictly for planning.
 */
export interface CopilotRecommendation {
  intent: string;
  suggestedActionType: string;
  reasoning: string;
  confidence: number;
  evidence: any;
  candidateId: string;
  recruiterId: string;
  organizationId: string;
  jobId?: string;
}

export interface IActionPlanner {
  /**
   * Plans an Action based on a raw recommendation from the AI Copilot.
   * Maps intent to action types, determines risk, and sets approval policy.
   */
  plan(recommendation: CopilotRecommendation): Promise<Action>;
}

export abstract class BaseActionPlanner implements IActionPlanner {
  abstract plan(recommendation: CopilotRecommendation): Promise<Action>;
}

export class ActionPlannerService extends BaseActionPlanner {
  async plan(recommendation: CopilotRecommendation): Promise<Action> {
    // 1. Determine action_type and category based on intent
    const typeMapping: Record<string, { type: string; category: string; risk: 'low' | 'medium' | 'high' }> = {
      'schedule_interview': { type: 'schedule_interview', category: 'scheduling', risk: 'low' },
      'send_email': { type: 'send_email', category: 'communication', risk: 'medium' },
      'reject_candidate': { type: 'reject_candidate', category: 'pipeline', risk: 'high' }
    };

    const mapped = typeMapping[recommendation.suggestedActionType] || {
      type: recommendation.suggestedActionType || 'unknown_action',
      category: 'general',
      risk: 'low'
    };

    // 2. Determine Approval Policy
    // Requirement: "For the current implementation: Every Action requires Recruiter approval."
    const policy = 'manual_recruiter';

    // 3. Generate Execution Plan, Dependencies, and Permissions
    let execution_plan: any = null;
    let dependencies: string[] = [];
    let required_permissions: string[] = [];

    switch (mapped.type) {
      case 'schedule_interview':
        execution_plan = { intent: 'schedule', parameters: recommendation.evidence };
        required_permissions = ['calendar.write', 'email.send'];
        dependencies = ['candidate_consent', 'recruiter_availability'];
        break;
      case 'send_email':
        execution_plan = { intent: 'email', draft: recommendation.evidence };
        required_permissions = ['email.send'];
        dependencies = ['email_draft_approved'];
        break;
      case 'reject_candidate':
        execution_plan = { intent: 'pipeline_update', new_stage: 'rejected' };
        required_permissions = ['pipeline.write'];
        dependencies = ['final_review_completed'];
        break;
      default:
        execution_plan = { intent: mapped.type, data: recommendation.evidence };
        required_permissions = ['general.execute'];
        break;
    }

    // 4. Construct the Action Object
    const action: Action = {
      organization_id: recommendation.organizationId,
      candidate_id: recommendation.candidateId,
      recruiter_id: recommendation.recruiterId,
      job_id: recommendation.jobId,
      source: 'recruiter_copilot',
      
      action_type: mapped.type,
      category: mapped.category,
      priority: 'medium',
      risk_level: mapped.risk,
      
      recommendation: recommendation.intent,
      reasoning: recommendation.reasoning,
      supporting_evidence: recommendation.evidence,
      ai_confidence: recommendation.confidence,
      
      approval_policy: policy,
      approval_status: 'pending',
      
      execution_plan,
      dependencies,
      required_permissions,
      retry_count: 0,
      
      execution_status: 'generated'
    };

    return action;
  }
}

