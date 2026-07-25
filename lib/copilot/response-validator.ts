import { z } from 'zod';
import { ValidatedResponse } from './types';

export class ResponseValidator {
  static validate(
    rawResponse: any, 
    schema: z.ZodType<any>, 
    minConfidence: number = 0
  ): ValidatedResponse {
    
    // 1. Schema Validation
    const parsed = schema.safeParse(rawResponse);
    if (!parsed.success) {
      throw new Error(`Schema validation failed: ${parsed.error.message}`);
    }

    const data = parsed.data;

    // 2. Confidence Validation
    if (data.confidence !== undefined && data.confidence < minConfidence) {
      throw new Error(`Confidence too low (${data.confidence} < ${minConfidence})`);
    }

    // 3. Evidence Validation (Detect empty citations if evidence is required)
    if (data.evidence && Array.isArray(data.evidence)) {
      if (data.evidence.length === 0 && minConfidence > 50) {
         // High confidence without evidence is a potential hallucination
         throw new Error('Response lacks evidence but claims high confidence.');
      }
    }

    // 4. Missing Information Formatting
    // Normalize missing info arrays to prevent weird UI artifacts
    if (data.missing_information && data.missing_information.length === 0) {
      data.missing_information = undefined;
    }

    return {
      answer: data.answer,
      confidence: data.confidence || 0,
      evidence: data.evidence || [],
      reasoning: data.reasoning,
      limitations: data.limitations,
      missing_information: data.missing_information,
      suggested_actions: data.suggested_actions,
      timestamp: new Date().toISOString()
    };
  }
}
