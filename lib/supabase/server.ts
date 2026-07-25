import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Service role — bypasses RLS. Only use in API routes, never in Client Components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Tenant-safe client utilizing RLS
export function createTenantClient(cookieStore: import('next/headers').ReadonlyRequestCookies) {
  const { createServerClient } = require('@supabase/ssr');
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
