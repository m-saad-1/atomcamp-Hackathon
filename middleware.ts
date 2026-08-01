import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Route classification per 05-onboarding-engineering.md §41 and
 * 01-authentication-foundation.md Part 2B.1 §7.
 *
 * PUBLIC:         /login, /register, /forgot-password, /reset-password, /auth/*
 * SEMI-PROTECTED: /verify-email, /onboarding
 * PROTECTED:      everything else (dashboard, api, settings, etc.)
 */
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/auth'];
const SEMI_PROTECTED_PATHS = ['/verify-email', '/onboarding'];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isSemiProtected(pathname: string) {
  return SEMI_PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  // ── Security headers (applied to all responses) ──────────────────────────
  const response = NextResponse.next();
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' blob: data: https:",
      "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://accounts.google.com",
      "frame-src https://accounts.google.com",
    ].join('; ')
  );

  // ── 1. Public routes — redirect logged-in users away from auth pages ──────
  if (isPublic(pathname)) {
    if (isLoggedIn) {
      // Already authenticated — send to the right place
      if (!user?.email_verified) return NextResponse.redirect(new URL('/verify-email', nextUrl));
      if (!user?.organization_id) return NextResponse.redirect(new URL('/onboarding', nextUrl));
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return response; // unauthenticated → allow
  }

  // ── 2. Unauthenticated access to protected/semi-protected routes ──────────
  if (!isLoggedIn) {
    const redirectUrl = new URL('/login', nextUrl);
    // Preserve intended destination so login can redirect back (spec §9)
    redirectUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ── 3. Semi-protected: must be logged in, org may not exist yet ───────────
  if (isSemiProtected(pathname)) {
    return response;
  }

  // ── 4. Protected routes: require verified email + org membership ──────────
  // Redirect to email verification if not yet verified
  if (user && (user as { email_verified?: boolean }).email_verified === false) {
    return NextResponse.redirect(new URL('/verify-email', nextUrl));
  }

  // Redirect to onboarding if no organization (new users)
  if (!user?.organization_id) {
    return NextResponse.redirect(new URL('/onboarding', nextUrl));
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js\\.map)).*)',
  ],
};
