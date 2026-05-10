import OpenAI from 'openai';

// Singleton — reused across all API route invocations
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
