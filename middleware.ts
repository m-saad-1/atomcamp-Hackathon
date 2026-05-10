import { auth } from '@/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  
  if (nextUrl.pathname.startsWith('/dashboard') && !isAuthenticated) {
    return Response.redirect(new URL('/api/auth/signin', nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
