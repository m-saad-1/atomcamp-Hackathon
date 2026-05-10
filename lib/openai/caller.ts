import { openai } from './client';
import { z } from 'zod';

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [0, 2000, 5000];

/**
 * Call OpenAI in JSON mode and validate the response against a Zod schema.
 * Retries up to 3 times on failure. Throws ApiError on all retries exhausted.
 */
export async function callOpenAIJson<T>(options: {
  systemPrompt: string;
  userContent: string;
  schema: z.ZodType<T>;
  model?: 'gpt-4o-mini' | 'gpt-4o';
  maxTokens?: number;
}): Promise<T> {
  const { systemPrompt, userContent, schema, model = 'gpt-4o-mini', maxTokens = 1500 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }

    try {
      const response = await openai.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new Error('EMPTY_RESPONSE: OpenAI returned no content.');

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error(`JSON_PARSE_FAILED: Could not parse OpenAI response. Raw: ${raw.slice(0, 200)}`);
      }

      // Zod validation — throws ZodError with field-level details if invalid
      return schema.parse(parsed);

    } catch (err) {
      lastError = err;
      console.error(`OpenAI call attempt ${attempt + 1} failed:`, err);
    }
  }

  throw {
    error: 'AI_CALL_FAILED',
    message: `OpenAI returned invalid output after ${MAX_RETRIES} attempts.`,
    recovery: 'Try again in 30 seconds. If persistent, check OPENAI_API_KEY and account quota.',
    retryable: true,
    context: { lastError: String(lastError) },
  };
}
