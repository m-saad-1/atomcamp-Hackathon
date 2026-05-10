import { createClient } from '@supabase/supabase-js';

// Service role — bypasses RLS. Only use in API routes, never in Client Components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
