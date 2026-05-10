import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.access_token     = account.access_token;
        token.refresh_token    = account.refresh_token;
        token.token_expires_at = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.scope            = account.scope;
        token.picture          = (profile as any).picture ?? null;
        token.name             = (profile as any).name ?? null;

        const { data: user } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              email:      (profile as any).email,
              name:       (profile as any).name ?? null,
              avatar_url: (profile as any).picture ?? null,
            },
            { onConflict: 'email' }
          )
          .select('id')
          .single();

        if (user) {
          token.db_user_id = user.id;

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
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.db_user_id) {
        session.user.id    = token.db_user_id as string;
      }
      if (token.name) {
        session.user.name  = token.name as string;
      }
      if (token.picture) {
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error:  '/auth/error',
  },
});
