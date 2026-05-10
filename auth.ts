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

  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.token_expires_at = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.scope = account.scope;
        
        // Upsert user into our users table to get a valid UUID
        const { data: dbUser } = await supabaseAdmin.from('users').upsert({
          email: user.email!,
          name: user.name,
          avatar_url: user.image,
        }, { onConflict: 'email' }).select('id').single();
        
        if (dbUser) {
          token.db_user_id = dbUser.id;
        }
      }

      // Ensure db_user_id is populated on subsequent requests if it was missed
      if (!token.db_user_id && token.email) {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', token.email)
          .single();
        if (dbUser) {
          token.db_user_id = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.db_user_id && token.access_token) {
        if (token.refresh_token) {
          await supabaseAdmin.from('sessions').upsert(
            {
              user_id: token.db_user_id,
              provider: 'google',
              access_token: token.access_token as string,
              refresh_token: (token.refresh_token as string) ?? null,
              token_expires_at: token.token_expires_at as number,
              scope: (token.scope as string) ?? null,
            },
            { onConflict: 'user_id,provider' }
          );
        }
        session.user.id = token.db_user_id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
});
