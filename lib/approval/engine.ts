import { Action } from '../actions/types';

/**
 * Formalized Human-in-the-Loop Architecture.
 * Every AI-generated Action must follow a governed approval process.
 */
export interface IApprovalEngine {
  /**
   * Evaluates a newly generated Action.
   * If the Approval Policy allows, it might auto-approve (future architecture only).
   * For the current implementation, every Action defaults to requiring Recruiter approval
   * and transitions to 'pending_approval'.
   */
  evaluate(action: Action): Promise<Action>;

  /**
   * Processes a manual approval decision from a Recruiter or Admin.
   * Transitions the Action from 'pending_approval' to 'approved' or 'failed' (rejected).
   */
  processDecision(
    actionId: string, 
    approverId: string, 
    decision: 'approve' | 'reject' | 'modify', 
    reason?: string,
    modifiedPlan?: any,
    organizationId?: string
  ): Promise<Action>;
}

export abstract class BaseApprovalEngine implements IApprovalEngine {
  abstract evaluate(action: Action): Promise<Action>;
  abstract processDecision(
    actionId: string, 
    approverId: string, 
    decision: 'approve' | 'reject' | 'modify', 
    reason?: string,
    modifiedPlan?: any,
    organizationId?: string
  ): Promise<Action>;
}

export class ApprovalEngineService extends BaseApprovalEngine {
  constructor(private supabase: import('@supabase/supabase-js').SupabaseClient) {
    super();
  }

  async evaluate(action: Action): Promise<Action> {
    // Determine if it requires manual approval
    if (action.approval_policy === 'auto_approved') {
       // Future implementation
       action.execution_status = 'approved';
       action.approval_status = 'approved';
    } else {
       action.execution_status = 'pending_approval';
       action.approval_status = 'pending';
    }
    
    // Update action status in DB
    if (action.id) {
       await this.supabase.from('actions').update({
         execution_status: action.execution_status,
         approval_status: action.approval_status
       }).eq('id', action.id);
    }
    
    return action;
  }

  async processDecision(
    actionId: string, 
    approverId: string, 
    decision: 'approve' | 'reject' | 'modify', 
    reason?: string,
    modifiedPlan?: any,
    organizationId?: string
  ): Promise<Action> {
    
    // 1. Fetch current action
    let query = this.supabase
      .from('actions')
      .select('*')
      .eq('id', actionId);
      
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    
    const { data: action, error } = await query.single();
      
    if (error || !action) {
      throw new Error(`Action not found: ${actionId}`);
    }

    // 2. Validate current status
    if (action.execution_status !== 'pending_approval') {
      throw new Error(`Cannot process decision for action in status: ${action.execution_status}`);
    }

    // 3. Apply Decision
    const newApprovalStatus = decision === 'reject' ? 'rejected' : 'approved';
    const newExecutionStatus = decision === 'reject' ? 'failed' : 'approved';
    
    const updatePayload: any = {
      approval_status: newApprovalStatus,
      execution_status: newExecutionStatus,
      approver_id: approverId,
      approval_timestamp: new Date().toISOString(),
      rejection_reason: reason || null
    };

    if (decision === 'modify' && modifiedPlan !== undefined) {
      updatePayload.execution_plan = modifiedPlan;
    }

    // 4. Update DB
    let updateQuery = this.supabase
      .from('actions')
      .update(updatePayload)
      .eq('id', actionId);
      
    if (organizationId) {
      updateQuery = updateQuery.eq('organization_id', organizationId);
    }
    
    const { data: updatedAction, error: updateError } = await updateQuery
      .select('*')
      .single();
      
    if (updateError) {
      throw updateError;
    }

    return updatedAction as Action;
  }
}

