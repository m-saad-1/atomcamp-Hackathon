'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [verified, setVerified] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const userEmail = session?.user?.email ?? '';

  // ── Countdown Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Automatic Verification Polling ────────────────────────────────────────
  // Detects verification in another tab without page refresh (spec §28).
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await fetch('/api/v1/auth/verify-email/status');
        if (res.ok) {
          const data = await res.json();
          if (data?.verified) {
            setVerified(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
            // Auto-navigate after brief moment
            setTimeout(() => router.push('/onboarding'), 2000);
          }
        }
      } catch {
        // silently ignore transient polling errors
      }
    };

    // Poll every 3 seconds
    pollingRef.current = setInterval(checkVerification, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [router]);

  // ── Manual Check ──────────────────────────────────────────────────────────
  const handleManualCheck = async () => {
    setCheckLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/v1/auth/verify-email/status');
      const data = await res.json();
      if (data?.verified) {
        setVerified(true);
        setTimeout(() => router.push('/onboarding'), 1500);
      } else {
        setMessage("We haven't detected your verification yet. Please click the link in your email.");
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setCheckLoading(false);
    }
  };

  // ── Resend Email ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setMessage('');
    try {
      await fetch('/api/v1/auth/resend-verification', { method: 'POST' });
      setCanResend(false);
      setResendCooldown(RESEND_COOLDOWN);
      setMessage('Verification email sent.');
    } catch {
      setMessage('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Success Screen (auto after verify) ───────────────────────────────────
  if (verified) {
    return (
      <div
        className="bg-background-secondary rounded-card p-8 shadow text-center"
        role="main"
        aria-label="Email verified"
        aria-live="polite"
      >
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-success-background flex items-center justify-center animate-[scaleIn_240ms_ease-out]">
            <CheckCircle className="w-8 h-8 text-success" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-[22px] font-semibold text-foreground mb-2">Your email has been verified.</h1>
        <p className="text-[14px] text-[#6B7280]">
          Your account is ready. Let&apos;s set up your organization.
        </p>
        <div className="mt-2 flex justify-center">
          <svg className="w-4 h-4 animate-spin text-brand" viewBox="0 0 24 24" fill="none" aria-label="Navigating to onboarding">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  // ── Waiting Screen ────────────────────────────────────────────────────────
  return (
    <div
      className="bg-background-secondary rounded-card p-8 shadow text-center"
      role="main"
      aria-label="Verify your email"
    >
      {/* Illustration */}
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-full bg-[#EEF0FF] flex items-center justify-center">
          <Mail className="w-8 h-8 text-brand" aria-hidden="true" />
        </div>
      </div>

      <h1 className="text-[22px] font-semibold text-foreground mb-2">Verify your email</h1>
      <p className="text-[14px] text-[#6B7280] max-w-[340px] mx-auto leading-relaxed">
        We&apos;ve sent a verification email to your inbox.{' '}
        <br />Click the link to activate your account.
      </p>

      {/* Displayed Email */}
      {userEmail && (
        <div className="mt-4 inline-flex items-center gap-2 bg-background-tertiary rounded-[12px] px-4 py-2.5">
          <Mail className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
          <span
            className="text-[13px] font-medium text-foreground"
            aria-label={`Verification sent to ${userEmail}`}
          >
            {userEmail}
          </span>
        </div>
      )}

      {/* Feedback message */}
      {message && (
        <p
          aria-live="polite"
          className={`mt-4 text-[13px] ${message.includes('sent') ? 'text-success' : 'text-[#6B7280]'}`}
        >
          {message}
        </p>
      )}

      {/* Waiting indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#9CA3AF]" aria-live="polite">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Waiting for verification...
      </div>

      <div className="mt-6 space-y-3">
        {/* Manual Check Button */}
        <button
          type="button"
          onClick={handleManualCheck}
          disabled={checkLoading}
          aria-busy={checkLoading}
          className="w-full h-[44px] rounded-button bg-brand text-white font-medium text-[14px] flex items-center justify-center gap-2
            hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          {checkLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              I&apos;ve Verified My Email
            </>
          )}
        </button>

        {/* Resend Button — with countdown */}
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || resendLoading}
          aria-disabled={!canResend || resendLoading}
          aria-live="polite"
          className="w-full h-[44px] rounded-button border border-border text-[14px] text-foreground font-medium
            flex items-center justify-center
            hover:bg-background-tertiary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          {resendLoading
            ? 'Sending...'
            : canResend
              ? 'Resend Verification Email'
              : `Resend in ${resendCooldown}s`}
        </button>

        {/* Change Email */}
        <p className="text-[13px] text-[#6B7280]">
          Not your email?{' '}
          <Link href="/register" className="text-brand font-medium hover:text-brand-hover transition-colors duration-fast">
            Change Email
          </Link>
        </p>
      </div>
    </div>
  );
}
