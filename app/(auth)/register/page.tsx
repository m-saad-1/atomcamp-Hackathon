'use client';

import { useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';

// ─── Password Strength ────────────────────────────────────────────────────────

type StrengthLevel = 'weak' | 'fair' | 'strong' | 'excellent';

function getPasswordStrength(password: string): { level: StrengthLevel; score: number; label: string; hint: string } {
  if (!password) return { level: 'weak', score: 0, label: 'Weak', hint: 'Enter a password to see strength.' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 'weak', score, label: 'Weak', hint: 'Too short or simple.' };
  if (score === 3) return { level: 'fair', score, label: 'Fair', hint: 'Add symbols or more characters.' };
  if (score === 4 || score === 5) return { level: 'strong', score, label: 'Strong', hint: 'Good password.' };
  return { level: 'excellent', score, label: 'Excellent', hint: 'Great choice. This password is difficult to guess.' };
}

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  weak: '#DC2626',
  fair: '#F59E0B',
  strong: '#5B5CEB',
  excellent: '#16A34A',
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateName(v: string) {
  if (!v.trim()) return 'Full name is required.';
  if (v.trim().length < 2) return 'Name must be at least 2 characters.';
  if (v.trim().length > 100) return 'Name must be at most 100 characters.';
  return '';
}

function validateEmail(v: string) {
  if (!v.trim()) return 'Work email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
  return '';
}

function validatePassword(v: string) {
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(v)) return 'Password must contain an uppercase letter.';
  if (!/[a-z]/.test(v)) return 'Password must contain a lowercase letter.';
  if (!/[0-9]/.test(v)) return 'Password must contain a number.';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must contain a special character.';
  return '';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fields, setFields] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const errors = {
    name: touched.name ? validateName(fields.name) : '',
    email: touched.email ? validateEmail(fields.email) : '',
    password: touched.password ? validatePassword(fields.password) : '',
    confirmPassword: touched.confirmPassword
      ? fields.password !== fields.confirmPassword
        ? 'Passwords do not match.'
        : ''
      : '',
  };

  const strength = getPasswordStrength(fields.password);

  const allValid =
    !validateName(fields.name) &&
    !validateEmail(fields.email) &&
    !validatePassword(fields.password) &&
    fields.password === fields.confirmPassword;

  const handleChange = useCallback((field: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
    setServerError('');
  }, []);

  const handleBlur = useCallback((field: keyof typeof touched) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!allValid) return;

    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim().toLowerCase(),
          password: fields.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data?.error?.message ?? 'Something went wrong. Please try again.');
        return;
      }
      // Redirect to verify-email page
      startTransition(() => router.push('/verify-email'));
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    await signIn('google', { callbackUrl: '/onboarding' });
  };

  return (
    <div
      className="bg-background-secondary rounded-card p-8 shadow"
      role="main"
      aria-label="Create your Recrion account"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-semibold text-foreground leading-tight">Create your account</h1>
        <p className="mt-1.5 text-[14px] text-[#6B7280] max-w-[360px] mx-auto">
          Start using Recrion to automate recruiting operations.
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

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} noValidate aria-label="Registration form" className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-[13px] font-medium text-foreground mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="John Smith"
              value={fields.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`w-full h-[44px] pl-10 pr-4 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast
                focus:ring-2 focus:ring-brand/20 focus:border-brand
                ${errors.name ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border'}`}
            />
          </div>
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1 text-[12px] text-error">{errors.name}</p>
          )}
        </div>

        {/* Work Email */}
        <div>
          <label htmlFor="signup-email" className="block text-[13px] font-medium text-foreground mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={fields.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full h-[44px] pl-10 pr-4 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast
                focus:ring-2 focus:ring-brand/20 focus:border-brand
                ${errors.email ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border'}`}
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-[12px] text-error">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-[13px] font-medium text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter password"
              value={fields.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby="password-strength password-requirements"
              className={`w-full h-[44px] pl-10 pr-11 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast
                focus:ring-2 focus:ring-brand/20 focus:border-brand
                ${errors.password ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-foreground transition-colors duration-fast"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {fields.password && (
            <div id="password-strength" aria-live="polite" className="mt-2">
              <div className="flex gap-1 mb-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-all duration-normal"
                    style={{ backgroundColor: i < strength.score ? STRENGTH_COLORS[strength.level] : '#E6EAF0' }}
                  />
                ))}
              </div>
              <p className="text-[12px] text-[#6B7280]">
                <span className="font-medium" style={{ color: STRENGTH_COLORS[strength.level] }}>
                  {strength.label}
                </span>
                {' — '}{strength.hint}
              </p>
            </div>
          )}

          {/* Password Requirements */}
          {(touched.password && errors.password) ? (
            <p id="password-requirements" role="alert" className="mt-1 text-[12px] text-error">{errors.password}</p>
          ) : (
            <p id="password-requirements" className="mt-1 text-[12px] text-[#9CA3AF]">
              Min 8 characters with uppercase, lowercase, number & symbol.
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm" className="block text-[13px] font-medium text-foreground mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm password"
              value={fields.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              className={`w-full h-[44px] pl-10 pr-11 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast
                focus:ring-2 focus:ring-brand/20 focus:border-brand
                ${errors.confirmPassword ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border'}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-foreground transition-colors duration-fast"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {/* Match indicator */}
            {fields.confirmPassword && !errors.confirmPassword && (
              <svg
                className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-success"
                viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {errors.confirmPassword && (
            <p id="confirm-error" role="alert" className="mt-1 text-[12px] text-error">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={isLoading || isPending}
          aria-busy={isLoading}
          aria-disabled={isLoading || isPending}
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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* OR Divider */}
      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <div className="flex-1 h-px bg-divider" />
        <span className="text-[12px] text-[#9CA3AF] font-medium">OR</span>
        <div className="flex-1 h-px bg-divider" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isGoogleLoading}
        aria-busy={isGoogleLoading}
        className="w-full h-[44px] rounded-button border border-border bg-background-secondary text-foreground font-medium text-[14px]
          flex items-center justify-center gap-3
          hover:bg-background-tertiary
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-fast
          focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        {isGoogleLoading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58Z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </button>

      {/* Sign In Link */}
      <p className="mt-5 text-center text-[13px] text-[#6B7280]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-brand font-medium hover:text-brand-hover transition-colors duration-fast"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
