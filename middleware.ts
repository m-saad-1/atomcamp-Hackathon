export { auth as middleware } from '@/auth';

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
