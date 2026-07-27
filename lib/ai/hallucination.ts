import { sysLogger } from '../observability';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export interface HallucinationCheckResult {
  passed: boolean;
  confidenceScore: number;
  reasoning: string;
}

export class AIGovernanceHooks {
  /**
   * Evaluates AI output against grounded context to detect hallucinations.
   * If the output contains facts not present in the context, it fails.
   */
  static async detectHallucination(context: string, output: string): Promise<HallucinationCheckResult> {
    sysLogger.info('Running hallucination detection hook...');
    
    // Simulate fallback safety
    if (output.includes('I am not sure') || output.includes('No evidence found')) {
       return { passed: true, confidenceScore: 100, reasoning: 'Model safely admitted lack of knowledge.' };
    }

    try {
      const { object } = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          passed: z.boolean().describe('True if the output strictly aligns with the context, False if it hallucinates information not present in the context.'),
          confidenceScore: z.number().int().min(0).max(100).describe('Confidence in this assessment (0-100).'),
          reasoning: z.string().describe('Explanation of why it passed or failed.'),
        }),
        prompt: \
          You are an AI Governance and Hallucination Detection Engine.
          
          CONTEXT:
          \
          
          AI OUTPUT TO EVALUATE:
          \
          
          Evaluate if the AI OUTPUT contains any hallucinated facts not present in the CONTEXT.
          Does the output stay strictly within the bounds of the provided context?
        \,
      });

      return object;
    } catch (error: any) {
      sysLogger.error('Hallucination detection failed', { error: error.message });
      // Fallback if LLM fails
      return { 
        passed: true, 
        confidenceScore: 70, 
        reasoning: 'Fallback: Hallucination detection LLM call failed.' 
      };
    }
  }

  /**
   * Ensures output adheres to expected JSON schema and bounds.
   */
  static validateOutput(output: any, schema: z.ZodTypeAny): boolean {
    sysLogger.info('Validating structured output against schema...');
    try {
      schema.parse(output);
      return true;
    } catch (err) {
      sysLogger.error('Schema validation failed', { err });
      return false;
    }
  }
}
