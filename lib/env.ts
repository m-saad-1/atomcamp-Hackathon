import { z } from 'zod';
import { sysLogger } from './observability';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // Required only for backend tasks

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // Slack
  SLACK_BOT_TOKEN: z.string().min(1).optional(),
  SLACK_SIGNING_SECRET: z.string().min(1).optional(),

  // Redis (Vercel KV or Upstash)
  KV_URL: z.string().url().optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1).optional(),
});

export function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env);
    
    if (!parsed.success) {
      sysLogger.error('Environment variables validation failed', { 
        errors: parsed.error.flatten().fieldErrors 
      });
      // Fallback to process.env so we don't crash
      return process.env as any;
    } else {
      sysLogger.info('Environment variables validated successfully.');
    }
    
    return parsed.data;
  } catch (err) {
    console.error(err);
    return process.env as any;
  }
}

export const env = (validateEnv() || process.env) as z.infer<typeof envSchema>;
