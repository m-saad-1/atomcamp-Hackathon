import { Action, ExecutionReport } from '../actions/types';

/**
 * The Execution Engine abstraction.
 * It is completely independent from AI and OpenAI.
 * It is responsible for validating, resolving dependencies, and executing approved Actions.
 */
export interface IExecutionEngine {
  /**
   * Main entry point for the Execution Engine. 
   * Receives an APPROVED action and begins the execution lifecycle.
   */
  execute(action: Action): Promise<ExecutionReport>;

  /**
   * Validates if the action is ready and permitted to execute.
   */
  validate(action: Action): Promise<boolean>;

  /**
   * Resolves required integrations and dependencies for the action.
   */
  resolveDependencies(action: Action): Promise<any>;

  /**
   * Handles retry logic for failed executions based on Action metadata.
   */
  handleRetry(action: Action, error: Error): Promise<ExecutionReport>;

  /**
   * Generates the immutable execution report upon completion or failure.
   */
  generateReport(
    action: Action, 
    result: 'success' | 'failure', 
    durationMs: number, 
    logs: any
  ): Promise<ExecutionReport>;
}

export abstract class BaseExecutionEngine implements IExecutionEngine {
  abstract execute(action: Action): Promise<ExecutionReport>;
  abstract validate(action: Action): Promise<boolean>;
  abstract resolveDependencies(action: Action): Promise<any>;
  abstract handleRetry(action: Action, error: Error): Promise<ExecutionReport>;
  abstract generateReport(
    action: Action, 
    result: 'success' | 'failure', 
    durationMs: number, 
    logs: any
  ): Promise<ExecutionReport>;
}

import { StrategyRegistry, ExecutionResult } from './strategies';

import { KVStore } from '../kv';

export class ExecutionEngineService extends BaseExecutionEngine {
  private static readonly MAX_FAILURES = 5;

  constructor(private supabase: import('@supabase/supabase-js').SupabaseClient) {
    super();
  }
  
  async execute(action: Action): Promise<ExecutionReport> {
    const startTime = Date.now();
    const logs: string[] = [];
    
    try {
      logs.push('Validating action...');
      const isValid = await this.validate(action);
      if (!isValid) throw new Error('Action validation failed');
      
      // Circuit Breaker check using KV
      const circuitKey = `circuit:${action.action_type}`;
      const failures = (await KVStore.get<number>(circuitKey)) || 0;
      if (failures >= ExecutionEngineService.MAX_FAILURES) {
         logs.push(`CIRCUIT BREAKER OPEN for ${action.action_type}`);
         throw new Error(`Circuit breaker is open for ${action.action_type}. Too many recent failures.`);
      }

      await this.supabase.from('actions').update({ execution_status: 'executing' }).eq('id', action.id);
      
      logs.push('Resolving dependencies...');
      await this.resolveDependencies(action);
      
      logs.push(`Executing integration strategy: ${action.action_type}...`);
      const payload = action.execution_plan || {};
      
      const strategy = StrategyRegistry.getStrategy(action.action_type);
      
      // 1. Execute
      const result: ExecutionResult = await strategy.execute(action, payload);
      logs.push(...result.logs);

      if (result.status === 'failure') {
        throw new Error(result.errorMessage || 'Execution returned failure status');
      }

      // 2. Verify
      logs.push('Verifying execution result independently...');
      const isVerified = await strategy.verify(action, result);
      
      if (!isVerified) {
        // Handle partial failure / verification failure
        logs.push('Verification failed. Attempting compensation...');
        await strategy.compensate(action, new Error('Verification failed'));
        
        // Reset circuit breaker on partial success
        await KVStore.del(circuitKey);
        
        const duration = Date.now() - startTime;
        return this.generateReport(action, 'partial_success', duration, logs);
      }

      // Reset circuit breaker on full success
      await KVStore.del(circuitKey);

      const duration = Date.now() - startTime;
      return this.generateReport(action, 'success', duration, logs);
      
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logs.push(`Error executing action: ${msg}`);
      
      // Increment circuit breaker
      const circuitKey = `circuit:${action.action_type}`;
      await KVStore.incr(circuitKey);

      // Attempt compensation
      try {
         const strategy = StrategyRegistry.getStrategy(action.action_type);
         await strategy.compensate(action, error instanceof Error ? error : new Error(msg));
         logs.push('Compensation completed successfully.');
      } catch (compErr) {
         logs.push(`Compensation failed: ${compErr}`);
      }

      return this.handleRetry(action, error instanceof Error ? error : new Error(msg));
    }
  }

  async validate(action: Action): Promise<boolean> {
    if (action.execution_status !== 'approved' && action.execution_status !== 'retry') {
       throw new Error(`Cannot execute action in status: ${action.execution_status}`);
    }
    return true;
  }

  async resolveDependencies(action: Action): Promise<Record<string, unknown>> {
    if (action.dependencies && action.dependencies.length > 0) {
       for (const dep of action.dependencies) {
          if (dep === 'missing_prerequisite') {
             throw new Error('Hard dependency not met: ' + dep);
          }
       }
    }
    return {};
  }

  async handleRetry(action: Action, error: Error): Promise<ExecutionReport> {
    const MAX_RETRIES = 3;
    const currentRetries = action.retry_count || 0;
    
    if (currentRetries < MAX_RETRIES) {
      const newRetries = currentRetries + 1;
      
      // Exponential backoff logic: delay in MS
      const delayMs = Math.min(1000 * Math.pow(2, newRetries), 60000); // Max 60 seconds
      logs.push(`Retrying in ${delayMs}ms (Attempt ${newRetries}/${MAX_RETRIES})`);
      
      const report: ExecutionReport = {
        action_id: action.id || '',
        action_type: action.action_type,
        candidate_id: action.candidate_id,
        recruiter_id: action.recruiter_id,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: delayMs, // storing delay logic
        result: 'failure',
        retry_count: newRetries,
        logs: [error.message, ...logs],
        final_status: 'retry'
      };
      
      await this.supabase.from('execution_reports').insert(report);
      await this.supabase.from('actions').update({ execution_status: 'retry', retry_count: newRetries }).eq('id', action.id);
      
      return report;
    } else {
      return this.generateReport(action, 'failure', 0, [error.message]);
    }
  }

  async generateReport(
    action: Action, 
    result: 'success' | 'failure' | 'partial_success', 
    durationMs: number, 
    logs: string[]
  ): Promise<ExecutionReport> {
    
    let finalStatus: 'completed' | 'failed' | 'partial_success';
    if (result === 'success') finalStatus = 'completed';
    else if (result === 'partial_success') finalStatus = 'partial_success';
    else finalStatus = 'failed';
    
    const report: ExecutionReport = {
      action_id: action.id || '',
      action_type: action.action_type,
      candidate_id: action.candidate_id,
      recruiter_id: action.recruiter_id,
      start_time: new Date(Date.now() - durationMs).toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: durationMs,
      result: result,
      retry_count: action.retry_count || 0,
      external_systems_used: [action.action_type],
      logs: logs,
      final_status: finalStatus
    };
    
    // Save to execution_reports
    await this.supabase.from('execution_reports').insert(report);
    
    // Update Action status
    await this.supabase.from('actions').update({ execution_status: finalStatus }).eq('id', action.id);
    
    return report;
  }
}

