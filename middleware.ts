import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl));
  }

  // Ensure user has an organization (Relaxed for local development if DB sync fails)
  if (!req.auth?.user?.organization_id) {
    // Instead of forcing a hard redirect, we log it. The UI should prompt them to create an org.
    console.warn('User session is missing organization_id. DB sync may have failed.');
  }

  // Enforce secure headers
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Basic CSP
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co;
  `.replace(/\s{2,}/g, ' ').trim();
  response.headers.set('Content-Security-Policy', csp);
  
  // RBAC for organizations is handled by Row-Level Security and API route session checks,
  // not globally here, since users can have different roles in different organizations.
  
  return response;
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/candidates/:path*',
    '/api/emails/:path*',
    '/api/approvals/:path*',
    '/api/jobs/:path*',
    '/api/resumes/:path*',
    '/api/slack/:path*',
    '/api/gmail/:path*',
    '/api/dashboard/:path*',
  ],
};
