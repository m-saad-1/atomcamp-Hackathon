import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recrion — AI Recruiting Operations Platform',
  description: 'Sign in to Recrion to automate your recruiting operations.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      {/* Recrion Branding — top of every auth screen */}
      <div className="mb-8 flex flex-col items-center gap-1 select-none">
        {/* Logo mark */}
        <div className="w-10 h-10 rounded-[12px] bg-brand flex items-center justify-center shadow">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d="M11 3C6.58 3 3 6.58 3 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8Zm0 3.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Zm0 11.2a5.6 5.6 0 0 1-4.48-2.24C6.54 14.62 8.66 14 11 14s4.46.62 4.48 1.56A5.6 5.6 0 0 1 11 17.8Z"
              fill="white"
            />
          </svg>
        </div>
        <span className="text-[18px] font-semibold text-foreground tracking-tight">Recrion</span>
        <span className="text-[12px] text-[#6B7280] font-normal">AI Recruiting Operations Platform</span>
      </div>

      {/* Authentication Card — max-w-[480px], centered */}
      <div className="w-full max-w-[480px]">
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-8 flex items-center gap-6 text-[12px] text-[#9CA3AF]">
        <a href="/privacy" className="hover:text-foreground transition-colors duration-fast">Privacy</a>
        <a href="/terms" className="hover:text-foreground transition-colors duration-fast">Terms</a>
        <a href="/security" className="hover:text-foreground transition-colors duration-fast">Security</a>
        <a href="mailto:support@recrion.com" className="hover:text-foreground transition-colors duration-fast">Support</a>
      </footer>
    </div>
  );
}
