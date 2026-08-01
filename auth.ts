import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { env } from '@/lib/env';

const supabaseAdmin = createClient(
  env?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
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
          prompt: 'consent',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const email = (credentials.email as string).toLowerCase().trim();
        
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, name, email, password_hash, email_verified, account_status')
          .eq('email', email)
          .single();

        if (!user || !user.password_hash) return null; // User not found or signed up via OAuth
        if (user.account_status !== 'active') throw new Error('Account suspended');

        const isValid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, account, profile, user }) {
      // 1. Initial sign-in (user object is only passed on first sign in)
      if (user) {
        token.db_user_id = user.id;
        token.email_verified = (user as any).email_verified; // From Credentials

        // If Google OAuth Sign-in
        if (account?.provider === 'google') {
          token.access_token = account.access_token;
          token.refresh_token = account.refresh_token;
          token.token_expires_at = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
          
          const p = profile as Record<string, string>;
          const email = p.email.toLowerCase().trim();

          // Sync user to DB
          const { data: dbUser } = await supabaseAdmin
            .from('users')
            .upsert({ email, name: p.name, avatar_url: p.picture, email_verified: true, account_status: 'active' }, { onConflict: 'email' })
            .select('id, email_verified')
            .single();

          if (dbUser) {
            token.db_user_id = dbUser.id;
            token.email_verified = dbUser.email_verified;

            // Persist OAuth tokens
            await supabaseAdmin.from('sessions').upsert({
              user_id: dbUser.id,
              provider: 'google',
              access_token: account.access_token!,
              refresh_token: account.refresh_token ?? null,
              token_expires_at: token.token_expires_at as number,
              scope: account.scope ?? null,
            }, { onConflict: 'user_id,provider' });
          }
        }
      }

      // 2. Refresh DB user data (org membership, verification status) on subsequent checks
      // We do this every time the token is evaluated to ensure middleware route guards work immediately.
      // E.g., when they finish onboarding or verify email, the next request will pick it up.
      if (token.db_user_id) {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('email_verified, account_status')
          .eq('id', token.db_user_id)
          .single();

        if (dbUser) {
          token.email_verified = dbUser.email_verified;
        }

        const { data: members } = await supabaseAdmin
          .from('organization_members')
          .select('organization_id, role')
          .eq('user_id', token.db_user_id)
          .eq('status', 'active');
          
        if (members && members.length > 0) {
          token.organization_id = members[0].organization_id;
          token.role = members[0].role;
        } else {
          token.organization_id = null;
          token.role = null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = (token.db_user_id ?? token.sub) as string;
      session.user.organization_id = (token.organization_id as string) ?? null;
      session.user.role = (token.role as string) ?? null;
      (session.user as any).email_verified = token.email_verified ?? false;

      session.access_token = (token.access_token as string) ?? null;
      session.refresh_token = (token.refresh_token as string) ?? null;
      session.token_expires_at = (token.token_expires_at as number) ?? null;

      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
});
