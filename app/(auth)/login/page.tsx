'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

function validateEmail(v: string) {
  if (!v.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
  return '';
}

function validatePassword(v: string) {
  if (!v) return 'Password is required.';
  return '';
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [fields, setFields] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const errors = {
    email: touched.email ? validateEmail(fields.email) : '',
    password: touched.password ? validatePassword(fields.password) : '',
  };

  const allValid = !validateEmail(fields.email) && !validatePassword(fields.password);

  const handleChange = useCallback((field: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
    setServerError('');
  }, []);

  const handleBlur = useCallback((field: keyof typeof touched) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!allValid) return;

    setIsLoading(true);
    setServerError('');

    const result = await signIn('credentials', {
      redirect: false,
      email: fields.email.trim().toLowerCase(),
      password: fields.password,
      rememberMe: String(rememberMe),
    });

    setIsLoading(false);

    if (result?.error) {
      // Never reveal if email exists; generic message prevents enumeration.
      setServerError('Incorrect email or password. Please try again.');
      return;
    }

    router.push(callbackUrl);
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <div
      className="bg-background-secondary rounded-card p-8 shadow"
      role="main"
      aria-label="Sign in to Recrion"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[24px] font-semibold text-foreground leading-tight">Welcome back</h1>
        <p className="mt-1.5 text-[14px] text-[#6B7280]">
          Sign in to continue to your recruiting workspace.
        </p>
      </div>

      {/* Server / OAuth Error */}
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate aria-label="Sign in form" className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-[13px] font-medium text-foreground mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={fields.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              className={`w-full h-[44px] pl-10 pr-4 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast
                focus:ring-2 focus:ring-brand/20 focus:border-brand
                ${errors.email ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border'}`}
            />
          </div>
          {errors.email && (
            <p id="login-email-error" role="alert" className="mt-1 text-[12px] text-error">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-[13px] font-medium text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-[#6B7280] hover:text-brand hover:underline transition-colors duration-fast"
              tabIndex={0}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter password"
              value={fields.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
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
          {errors.password && (
            <p id="login-password-error" role="alert" className="mt-1 text-[12px] text-error">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2.5">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded-[4px] border-border text-brand accent-brand cursor-pointer"
            aria-label="Keep me signed in for 30 days"
          />
          <label htmlFor="remember-me" className="text-[13px] text-[#6B7280] cursor-pointer select-none">
            Keep me signed in for 30 days.
          </label>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          aria-disabled={isLoading}
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
              Signing in...
            </>
          ) : (
            'Sign In'
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

      {/* Create Account Link */}
      <p className="mt-5 text-center text-[13px] text-[#6B7280]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-brand font-medium hover:text-brand-hover transition-colors duration-fast"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}
