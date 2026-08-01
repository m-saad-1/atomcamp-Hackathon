'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

type StrengthLevel = 'weak' | 'fair' | 'strong' | 'excellent';

function getPasswordStrength(p: string): { level: StrengthLevel; score: number; label: string; hint: string } {
  if (!p) return { level: 'weak', score: 0, label: 'Weak', hint: '' };
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 2) return { level: 'weak', score, label: 'Weak', hint: 'Too short or simple.' };
  if (score === 3) return { level: 'fair', score, label: 'Fair', hint: 'Add symbols or more characters.' };
  if (score <= 5) return { level: 'strong', score, label: 'Strong', hint: 'Good password.' };
  return { level: 'excellent', score, label: 'Excellent', hint: 'Great choice. This password is difficult to guess.' };
}

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  weak: '#DC2626', fair: '#F59E0B', strong: '#5B5CEB', excellent: '#16A34A',
};

const CHECKLIST = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function validatePassword(v: string) {
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(v)) return 'Password must contain an uppercase letter.';
  if (!/[a-z]/.test(v)) return 'Password must contain a lowercase letter.';
  if (!/[0-9]/.test(v)) return 'Password must contain a number.';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must contain a special character.';
  return '';
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [fields, setFields] = useState({ password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(!token);

  const errors = {
    password: touched.password ? validatePassword(fields.password) : '',
    confirmPassword: touched.confirmPassword
      ? fields.password !== fields.confirmPassword ? 'Passwords do not match.' : ''
      : '',
  };

  const strength = getPasswordStrength(fields.password);

  const allValid =
    !validatePassword(fields.password) &&
    fields.password === fields.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    if (!allValid || !token) return;

    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: fields.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 || res.status === 410) {
          setLinkInvalid(true);
          return;
        }
        setServerError(data?.error?.message ?? 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Invalid / Expired Link Screen ─────────────────────────────────────────
  if (linkInvalid) {
    return (
      <div
        className="bg-background-secondary rounded-card p-8 shadow text-center"
        role="main"
        aria-label="Reset link expired"
      >
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-warning-background flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-warning" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-[22px] font-semibold text-foreground mb-2">This reset link has expired.</h1>
        <p className="text-[14px] text-[#6B7280] mb-6">
          Request a new password reset email to continue.
        </p>
        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="block w-full h-[44px] rounded-button bg-brand text-white font-medium text-[14px]
              flex items-center justify-center
              hover:bg-brand-hover transition-all duration-fast
              focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            Request New Link
          </Link>
          <Link
            href="/login"
            className="block text-center text-[13px] text-[#6B7280] hover:text-foreground transition-colors duration-fast"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div
        className="bg-background-secondary rounded-card p-8 shadow text-center"
        role="main"
        aria-label="Password updated successfully"
      >
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-success-background flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-success" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-[22px] font-semibold text-foreground mb-2">Password updated successfully</h1>
        <p className="text-[14px] text-[#6B7280] mb-6">
          Your password has been changed. You can now sign in using your new password.
        </p>
        <Link
          href="/login"
          className="block w-full h-[44px] rounded-button bg-brand text-white font-medium text-[14px]
            flex items-center justify-center
            hover:bg-brand-hover transition-all duration-fast
            focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          Continue to Login
        </Link>
      </div>
    );
  }

  // ── Reset Form ─────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-background-secondary rounded-card p-8 shadow"
      role="main"
      aria-label="Create new password"
    >
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-semibold text-foreground">Create a new password</h1>
        <p className="mt-1.5 text-[14px] text-[#6B7280]">
          Choose a strong password to keep your account secure.
        </p>
      </div>

      {serverError && (
        <div role="alert" aria-live="assertive"
          className="mb-5 flex items-start gap-3 rounded-[14px] bg-error-background border border-error/20 px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-error shrink-0" aria-hidden="true" />
          <p className="text-[13px] text-error">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* New Password */}
        <div>
          <label htmlFor="reset-password" className="block text-[13px] font-medium text-foreground mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter new password"
              value={fields.password}
              onChange={(e) => { setFields((p) => ({ ...p, password: e.target.value })); setServerError(''); }}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby="reset-password-strength reset-password-checklist"
              className={`w-full h-[44px] pl-10 pr-11 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast focus:ring-2 focus:ring-brand/20 focus:border-brand ${errors.password ? 'border-error' : 'border-border'}`}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-foreground transition-colors duration-fast">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength meter */}
          {fields.password && (
            <div id="reset-password-strength" aria-live="polite" className="mt-2">
              <div className="flex gap-1 mb-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-normal"
                    style={{ backgroundColor: i < strength.score ? STRENGTH_COLORS[strength.level] : '#E6EAF0' }} />
                ))}
              </div>
              <p className="text-[12px] text-[#6B7280]">
                <span className="font-medium" style={{ color: STRENGTH_COLORS[strength.level] }}>{strength.label}</span>
                {strength.hint && ` — ${strength.hint}`}
              </p>
            </div>
          )}

          {/* Checklist */}
          <ul id="reset-password-checklist" aria-live="polite" className="mt-2 space-y-1">
            {CHECKLIST.map(({ label, test }) => {
              const passed = test(fields.password);
              return (
                <li key={label} className={`flex items-center gap-1.5 text-[12px] ${passed ? 'text-success' : 'text-[#9CA3AF]'}`}>
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    {passed ? (
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                    )}
                  </svg>
                  {label}
                </li>
              );
            })}
          </ul>

          {errors.password && (
            <p role="alert" className="mt-1 text-[12px] text-error">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reset-confirm" className="block text-[13px] font-medium text-foreground mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="reset-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={fields.confirmPassword}
              onChange={(e) => { setFields((p) => ({ ...p, confirmPassword: e.target.value })); }}
              onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              className={`w-full h-[44px] pl-10 pr-11 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast focus:ring-2 focus:ring-brand/20 focus:border-brand ${errors.confirmPassword ? 'border-error' : 'border-border'}`}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-foreground transition-colors duration-fast">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {fields.confirmPassword && !errors.confirmPassword && (
              <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-success" aria-hidden="true" />
            )}
          </div>
          {errors.confirmPassword && (
            <p role="alert" className="mt-1 text-[12px] text-error">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Update Password Button */}
        <button
          type="submit"
          disabled={isLoading || !allValid}
          aria-busy={isLoading}
          aria-disabled={isLoading || !allValid}
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
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
        </button>

        <Link
          href="/login"
          className="block text-center text-[13px] text-[#6B7280] hover:text-foreground transition-colors duration-fast"
        >
          Back to Login
        </Link>
      </form>
    </div>
  );
}
