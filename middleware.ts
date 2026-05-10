import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const session = await auth();

  // User is authenticated if they have an email (Google always provides this).
  // We do NOT require session.user.id here because the DB upsert may have
  // failed temporarily – the user is still signed-in via Google OAuth.
  const isAuthenticated = !!(session?.user?.email);

  if (!isAuthenticated) {
    const signInUrl = new URL('/auth/signin', request.url);
    // Preserve where they were trying to go so we can redirect back after sign-in
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
