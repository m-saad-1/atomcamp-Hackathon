import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set Up Your Organization — Recrion',
  description: 'Create your recruiting organization on Recrion.',
};

/**
 * Onboarding layout — no sidebar, focused single-task experience.
 * Full-screen centered layout with logo, per spec §5.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header — logo only */}
      <header className="flex items-center justify-center h-[72px] px-8 border-b border-divider bg-background-secondary">
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-[10px] bg-brand flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path
                d="M11 3C6.58 3 3 6.58 3 11s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8Zm0 3.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Zm0 11.2a5.6 5.6 0 0 1-4.48-2.24C6.54 14.62 8.66 14 11 14s4.46.62 4.48 1.56A5.6 5.6 0 0 1 11 17.8Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-[16px] font-semibold text-foreground tracking-tight">Recrion</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px]">
          {children}
        </div>
      </main>
    </div>
  );
}
