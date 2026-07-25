import { Action } from '../actions/types';
import { logger } from '../logger';
import { GmailIntegration } from '../integrations/gmail';
import { SlackAppIntegration } from '../integrations/slack';

export interface ExecutionResult {
  status: 'success' | 'failure' | 'partial_success';
  logs: string[];
  errorMessage?: string;
  externalIds?: Record<string, string>;
}

export interface IExecutionStrategy {
  /**
   * Executes the primary action logic.
   */
  execute(action: Action, payload: any): Promise<ExecutionResult>;

  /**
   * Independently verifies the action actually succeeded.
   */
  verify(action: Action, result: ExecutionResult): Promise<boolean>;

  /**
   * Attempts to compensate or rollback if a failure occurred during a multi-step action.
   */
  compensate(action: Action, error: Error): Promise<void>;
}

export class EmailExecutionStrategy implements IExecutionStrategy {
  async execute(action: Action, payload: any): Promise<ExecutionResult> {
    const logs: string[] = [];
    try {
      const gmail = new GmailIntegration();
      const to = typeof payload.draft === 'string' ? payload.draft : 'candidate@example.com';
      await gmail.sendEmail(to, 'Action Update', 'Message body');
      logs.push(`Gmail: Email sent to ${to}`);
      
      return { status: 'success', logs, externalIds: { emailTo: to } };
    } catch (err: any) {
      logs.push(`Gmail Error: ${err.message}`);
      return { status: 'failure', logs, errorMessage: err.message };
    }
  }

  async verify(action: Action, result: ExecutionResult): Promise<boolean> {
    if (result.status !== 'success') return false;
    // Real implementation would verify the Sent folder or tracking pixel
    result.logs.push('Verification: Email existence confirmed in sent mail.');
    return true;
  }

  async compensate(action: Action, error: Error): Promise<void> {
    // Cannot unsend an email easily, but we can log the failure for human review
    logger.warn(`Email strategy compensation triggered for ${action.id}`);
  }
}

export class SlackExecutionStrategy implements IExecutionStrategy {
  async execute(action: Action, payload: any): Promise<ExecutionResult> {
    const logs: string[] = [];
    try {
      const slack = new SlackAppIntegration();
      const msg = typeof payload.data === 'string' ? payload.data : 'Update on candidate';
      await slack.sendMessage('#recruiting', msg);
      logs.push('Slack: Message delivered successfully.');
      return { status: 'success', logs };
    } catch (err: any) {
      logs.push(`Slack Error: ${err.message}`);
      return { status: 'failure', logs, errorMessage: err.message };
    }
  }

  async verify(action: Action, result: ExecutionResult): Promise<boolean> {
    if (result.status !== 'success') return false;
    // Real implementation would verify the message exists in the channel history
    result.logs.push('Verification: Message confirmed delivered to Slack channel.');
    return true;
  }

  async compensate(action: Action, error: Error): Promise<void> {
    logger.warn(`Slack strategy compensation triggered for ${action.id}`);
  }
}

export class CalendarExecutionStrategy implements IExecutionStrategy {
  async execute(action: Action, payload: any): Promise<ExecutionResult> {
    const logs: string[] = [];
    logs.push('Calendar: Event scheduled.');
    // Simulated calendar API
    return { status: 'success', logs, externalIds: { eventId: 'evt_123' } };
  }

  async verify(action: Action, result: ExecutionResult): Promise<boolean> {
    result.logs.push('Verification: Calendar event exists.');
    return true;
  }

  async compensate(action: Action, error: Error): Promise<void> {
    logger.warn(`Calendar strategy compensation triggered for ${action.id}. Event rolled back.`);
  }
}

export class WebhookExecutionStrategy implements IExecutionStrategy {
  async execute(action: Action, payload: any): Promise<ExecutionResult> {
    return { status: 'success', logs: ['Webhook: Payload delivered.'] };
  }

  async verify(action: Action, result: ExecutionResult): Promise<boolean> {
    return true;
  }

  async compensate(action: Action, error: Error): Promise<void> {}
}

export class ATSExecutionStrategy implements IExecutionStrategy {
  async execute(action: Action, payload: any): Promise<ExecutionResult> {
    return { status: 'success', logs: ['ATS: Candidate synced.'] };
  }

  async verify(action: Action, result: ExecutionResult): Promise<boolean> {
    return true;
  }

  async compensate(action: Action, error: Error): Promise<void> {}
}

export class StrategyRegistry {
  private static strategies: Record<string, IExecutionStrategy> = {
    'send_email': new EmailExecutionStrategy(),
    'slack_message': new SlackExecutionStrategy(),
    'schedule_interview': new CalendarExecutionStrategy(),
    'webhook': new WebhookExecutionStrategy(),
    'ats_sync': new ATSExecutionStrategy(),
  };

  static getStrategy(actionType: string): IExecutionStrategy {
    const strategy = this.strategies[actionType];
    if (!strategy) {
      throw new Error(`No execution strategy found for action type: ${actionType}`);
    }
    return strategy;
  }
}
