export interface IntegrationConfig {
  timeoutMs?: number;
  retries?: number;
}

/**
 * The Integration Layer is the single gateway for all external services.
 * Business logic must never call external APIs directly.
 */
export abstract class BaseIntegration {
  abstract name: string;
  
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    config?: IntegrationConfig
  ): Promise<T> {
    const retries = config?.retries || 3;
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= retries) throw error;
      }
    }
    throw new Error('Integration execution failed');
  }
}

// ─── Current & Future Integration Contracts ─────────────────────────────

export abstract class EmailIntegration extends BaseIntegration {
  name = 'EmailProvider';
  abstract sendEmail(to: string, subject: string, body: string): Promise<void>;
  abstract fetchEmails(query: string): Promise<unknown[]>;
}

export abstract class SlackIntegration extends BaseIntegration {
  name = 'SlackProvider';
  abstract sendMessage(channel: string, message: string): Promise<void>;
}

export abstract class LLMIntegration extends BaseIntegration {
  name = 'LLMProvider';
  // Generates structured outputs from LLM provider (e.g., OpenAI)
  abstract generateStructuredResponse<T>(prompt: string, schema: unknown): Promise<T>;
}

export abstract class CalendarIntegration extends BaseIntegration {
  name = 'CalendarProvider';
  abstract scheduleEvent(title: string, startTime: Date, endTime: Date, attendees: string[]): Promise<Record<string, unknown>>;
}
