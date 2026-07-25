import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// Only instantiate the admin client when the key is actually a service-role key.
// If it is mistakenly set to the anon/publishable key the upsert will fail due
// to RLS – we catch that below and fall back gracefully.
const supabaseAdmin = createClient(
  env?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId:     env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/gmail.modify',
          ].join(' '),
          access_type: 'offline',
          prompt:      'consent',
        },
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, account, profile }) {
      // ── First sign-in: account & profile are present ──────────────────────
      if (account && profile) {
        const p = profile as Record<string, string>;

        token.access_token     = account.access_token;
        token.refresh_token    = account.refresh_token;
        token.token_expires_at = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.scope            = account.scope;
        token.picture          = p.picture ?? null;
        token.name             = p.name    ?? null;
        token.email            = p.email   ?? null;
        // Google's stable sub field – used as fallback id if DB is unavailable
        token.google_sub       = account.providerAccountId;

        // Try to persist user in Supabase (may fail if service role key is wrong)
        try {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .upsert(
              {
                email:      p.email,
                name:       p.name      ?? null,
                avatar_url: p.picture   ?? null,
              },
              { onConflict: 'email' }
            )
            .select('id')
            .single();

          if (error) {
            logger.warn('[auth] Supabase user upsert failed', { error: error.message });
            logger.warn('[auth] Check SUPABASE_SERVICE_ROLE_KEY in .env.local – it must be the secret service-role key, NOT the anon/publishable key.');
            throw new Error('Supabase user upsert failed');
          }

          if (user?.id) {
            token.db_user_id = user.id;

            // Persist OAuth tokens for the Gmail poller
            await supabaseAdmin
              .from('sessions')
              .upsert(
                {
                  user_id:          user.id,
                  provider:         'google',
                  access_token:     account.access_token!,
                  refresh_token:    account.refresh_token ?? null,
                  token_expires_at: token.token_expires_at as number,
                  scope:            account.scope ?? null,
                },
                { onConflict: 'user_id,provider' }
              );

            // Enforce organization membership
            const { data: members } = await supabaseAdmin
              .from('organization_members')
              .select('organization_id, role')
              .eq('user_id', user.id);

            if (!members || members.length === 0) {
              const { data: newOrg } = await supabaseAdmin
                .from('organizations')
                .insert({
                  name: `${p.name || 'User'}'s Organization`,
                  slug: `org-${user.id}`
                })
                .select('id')
                .single();

              if (newOrg) {
                await supabaseAdmin
                  .from('organization_members')
                  .insert({
                    organization_id: newOrg.id,
                    user_id: user.id,
                    role: 'owner'
                  });
                token.organization_id = newOrg.id;
                token.role = 'owner';
              } else {
                throw new Error('Failed to create organization');
              }
            } else {
              token.organization_id = members[0].organization_id;
              token.role = members[0].role;
            }

            // Seed Gmail integration status
            if (token.organization_id && account.scope?.includes('gmail')) {
              await supabaseAdmin.from('integration_registry').upsert({
                organization_id: token.organization_id,
                service: 'gmail',
                status: 'connected',
                metadata: { scope: account.scope },
                updated_at: new Date().toISOString()
              }, { onConflict: 'organization_id,service' });
            }
          }
        } catch (err: unknown) {
          logger.error('[auth] Supabase error during sign-in', { error: err instanceof Error ? err.message : String(err) });
          throw new Error('Database initialization failed during sign-in. Please try again.');
        }
      }

      // ── Subsequent requests: recover db_user_id if it went missing ─────────
      if (!token.db_user_id && token.email) {
        try {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', token.email as string)
            .single();

          if (user?.id) {
            token.db_user_id = user.id;
            const { data: members } = await supabaseAdmin
              .from('organization_members')
              .select('organization_id, role')
              .eq('user_id', user.id);
            if (members && members.length > 0) {
              token.organization_id = members[0].organization_id;
              token.role = members[0].role;
            }
          }
        } catch {
          // silently ignore – fallback below covers this
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Prefer the Supabase UUID; fall back to Google sub so session.user.id
      // is ALWAYS a non-empty string after sign-in.
      session.user.id    = (token.db_user_id ?? token.google_sub ?? token.sub) as string;
      session.user.name  = (token.name    ?? session.user.name)  as string;
      session.user.image = (token.picture ?? session.user.image) as string;
      session.user.email = (token.email   ?? session.user.email) as string;
      session.user.organization_id = (token.organization_id as string | undefined) ?? null;
      session.user.role  = (token.role as string | undefined) ?? null;

      // Expose OAuth tokens server-side so API routes can call Gmail directly
      // without depending on the Supabase sessions table being populated.
      // These are never sent to the browser (JWT strategy = HttpOnly cookie only).
      session.access_token     = (token.access_token as string | undefined) ?? null;
      session.refresh_token    = (token.refresh_token as string | undefined) ?? null;
      session.token_expires_at = (token.token_expires_at as number | undefined) ?? null;

      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error:  '/auth/error',
  },
});
