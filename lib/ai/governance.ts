import { SupabaseClient } from '@supabase/supabase-js';

export interface AIUsagePayload {
  organizationId: string;
  recruiterId: string;
  promptVersion: string;
  modelVersion: string;
  promptType: string;
  tokensPrompt: number;
  tokensCompletion: number;
  confidenceScore?: number;
}

/**
 * Calculates approximate cost based on OpenAI models
 */
function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  let promptCostPer1k = 0;
  let completionCostPer1k = 0;

  if (model.includes('gpt-4o')) {
    promptCostPer1k = 0.005;
    completionCostPer1k = 0.015;
  } else if (model.includes('gpt-3.5') || model.includes('gpt-4-mini')) {
    promptCostPer1k = 0.0005;
    completionCostPer1k = 0.0015;
  } else if (model.includes('gpt-4')) {
    promptCostPer1k = 0.03;
    completionCostPer1k = 0.06;
  }

  return (promptTokens * promptCostPer1k / 1000) + (completionTokens * completionCostPer1k / 1000);
}

export async function logAIUsage(supabase: SupabaseClient, payload: AIUsagePayload) {
  try {
    const cost = calculateCost(payload.modelVersion, payload.tokensPrompt, payload.tokensCompletion);

    await supabase.from('ai_usage_logs').insert({
      organization_id: payload.organizationId,
      recruiter_id: payload.recruiterId,
      prompt_version: payload.promptVersion,
      model_version: payload.modelVersion,
      prompt_type: payload.promptType,
      tokens_prompt: payload.tokensPrompt,
      tokens_completion: payload.tokensCompletion,
      total_cost: cost,
      confidence_score: payload.confidenceScore || null,
    });
  } catch (error) {
    console.error('Failed to log AI usage:', error);
    // Non-blocking, so we don't throw
  }
}

/**
 * Sanitizes input text to prevent basic prompt injection attacks
 * This is a foundational defense.
 */
export function sanitizePromptInput(input: string): string {
  if (!input) return input;
  // Remove control characters and system instruction override attempts
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Advanced regex to detect spaced-out or encoded injections
  const injectionPatterns = [
    /(i\s*g\s*n\s*o\s*r\s*e\s*p\s*r\s*e\s*v\s*i\s*o\s*u\s*s)/ig,
    /(s\s*y\s*s\s*t\s*e\s*m\s*:)/ig,
    /(d\s*i\s*s\s*r\s*e\s*g\s*a\s*r\s*d\s*i\s*n\s*s\s*t\s*r\s*u\s*c\s*t\s*i\s*o\s*n\s*s)/ig,
    /(y\s*o\s*u\s*a\s*r\s*e\s*n\s*o\s*w)/ig,
    /(f\s*o\s*r\s*g\s*e\s*t\s*a\s*l\s*l)/ig
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  
  return sanitized;
}
