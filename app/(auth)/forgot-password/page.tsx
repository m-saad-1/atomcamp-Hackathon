'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

function validateEmail(v: string) {
  if (!v.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
  return '';
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const emailError = touched ? validateEmail(email) : '';
  const isValid = !validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Trim whitespace automatically per spec
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      // Per security spec: always show success screen regardless of whether email exists.
      // This prevents account enumeration.
      if (!res.ok) {
        const data = await res.json();
        // Only show server error for truly unexpected errors (500), never for "not found"
        if (res.status === 500) {
          setServerError('Something went wrong. Please try again.');
          return;
        }
      }
      setSubmitted(true);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="bg-background-secondary rounded-card p-8 shadow text-center"
        role="main"
        aria-label="Password reset email sent"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-success-background flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-success" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-[22px] font-semibold text-foreground mb-2">Check your inbox</h1>
        <p className="text-[14px] text-[#6B7280] max-w-[340px] mx-auto leading-relaxed">
          If an account exists for{' '}
          <span className="font-medium text-foreground">{email.trim().toLowerCase()}</span>
          , we&apos;ve sent password reset instructions.
        </p>

        <div className="mt-6 space-y-3">
          {/* Resend — handled via resubmit */}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="w-full h-[44px] rounded-button border border-border bg-background-secondary text-foreground font-medium text-[14px]
              hover:bg-background-tertiary transition-all duration-fast
              focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            Resend Email
          </button>

          <Link
            href="/login"
            className="block w-full h-[44px] rounded-button text-[14px] text-[#6B7280] font-medium
              flex items-center justify-center
              hover:text-foreground transition-colors duration-fast
              focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Request Form ───────────────────────────────────────────────────────────
  return (
    <div
      className="bg-background-secondary rounded-card p-8 shadow"
      role="main"
      aria-label="Forgot password"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-semibold text-foreground leading-tight">Forgot your password?</h1>
        <p className="mt-1.5 text-[14px] text-[#6B7280] max-w-[360px] mx-auto">
          Enter your work email and we&apos;ll send you a secure password reset link.
        </p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 flex items-start gap-3 rounded-[14px] bg-error-background border border-error/20 px-4 py-3"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 text-error shrink-0" aria-hidden="true" />
          <p className="text-[13px] text-error leading-snug">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate aria-label="Password reset request form" className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="forgot-email" className="block text-[13px] font-medium text-foreground mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setServerError(''); }}
              onBlur={() => setTouched(true)}
              aria-required="true"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'forgot-email-error' : undefined}
              className={`w-full h-[44px] pl-10 pr-4 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast
                focus:ring-2 focus:ring-brand/20 focus:border-brand
                ${emailError ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border'}`}
            />
          </div>
          {emailError && (
            <p id="forgot-email-error" role="alert" className="mt-1 text-[12px] text-error">{emailError}</p>
          )}
        </div>

        {/* Send Reset Link Button — disabled until valid email */}
        <button
          type="submit"
          disabled={isLoading || !isValid}
          aria-busy={isLoading}
          aria-disabled={isLoading || !isValid}
          className="w-full h-[44px] rounded-button bg-brand text-white font-medium text-[14px] flex items-center justify-center gap-2
            hover:bg-brand-hover active:bg-brand-pressed
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-fast active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>

        {/* Back to Login */}
        <Link
          href="/login"
          className="block w-full text-center text-[13px] text-[#6B7280] font-medium
            hover:text-foreground transition-colors duration-fast
            focus:outline-none focus:underline"
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
}
