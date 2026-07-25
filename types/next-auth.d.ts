import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      organization_id?: string | null;
      role?: string | null;
    } & DefaultSession['user'];
    access_token?: string | null;
    refresh_token?: string | null;
    token_expires_at?: number | null;
  }

  interface Profile {
    picture?: string | null;
    name?: string | null;
    email?: string | null;
  }
}
