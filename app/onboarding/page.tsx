'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Globe, Briefcase, Users, MapPin, Clock, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';

// ─── Types & Constants ────────────────────────────────────────────────────────

type Step = 'welcome' | 'organization' | 'details' | 'review' | 'provisioning' | 'done';

const STEPS: { id: Step; label: string }[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'organization', label: 'Organization' },
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
];

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Media', 'Government', 'Non-profit', 'Other'];
const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+'];
const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai',
  'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney',
];

type FormData = {
  orgName: string;
  workspaceUrl: string;
  industry: string;
  companySize: string;
  country: string;
  timezone: string;
};

// ─── Slug generation ──────────────────────────────────────────────────────────

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateOrg(form: FormData) {
  const errs: Partial<Record<keyof FormData, string>> = {};
  if (!form.orgName.trim()) errs.orgName = 'Organization name is required.';
  else if (form.orgName.trim().length < 2) errs.orgName = 'Organization name is too short.';
  else if (form.orgName.trim().length > 100) errs.orgName = 'Organization name is too long.';
  else if (!/^[\w\s\-&'.]+$/.test(form.orgName.trim())) errs.orgName = 'Name contains invalid characters.';
  if (!form.workspaceUrl.trim()) errs.workspaceUrl = 'Workspace URL is required.';
  else if (!/^[a-z0-9-]{2,48}$/.test(form.workspaceUrl)) errs.workspaceUrl = 'URL must be 2–48 lowercase letters, numbers or hyphens.';
  return errs;
}

function validateDetails(form: FormData) {
  const errs: Partial<Record<keyof FormData, string>> = {};
  if (!form.industry) errs.industry = 'Select an industry.';
  if (!form.companySize) errs.companySize = 'Select a company size.';
  if (!form.country.trim()) errs.country = 'Country is required.';
  if (!form.timezone) errs.timezone = 'Select a timezone.';
  return errs;
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-normal text-[13px] font-semibold
                    ${done ? 'bg-brand text-white' : active ? 'bg-brand text-white ring-4 ring-brand/20' : 'bg-background-tertiary text-[#9CA3AF]'}`}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${done ? 'Completed: ' : active ? 'Current: ' : ''}${step.label}`}
                >
                  {done ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : idx + 1}
                </div>
                <span className={`mt-1.5 text-[11px] font-medium ${active ? 'text-brand' : done ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-5 transition-colors duration-normal ${done ? 'bg-brand' : 'bg-border'}`} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Main Wizard ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [form, setForm] = useState<FormData>({
    orgName: '', workspaceUrl: '', industry: '', companySize: '', country: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  });
  const [urlChecking, setUrlChecking] = useState(false);
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
  const [orgErrors, setOrgErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [detailErrors, setDetailErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [provisionError, setProvisionError] = useState('');
  const [savedIndicator, setSavedIndicator] = useState('');

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  // Auto-save indicator
  const showSaved = useCallback(() => {
    setSavedIndicator('✓ Saved');
    setTimeout(() => setSavedIndicator(''), 2000);
  }, []);

  // URL availability check (debounced via slug change)
  const checkUrl = useCallback(async (slug: string) => {
    if (slug.length < 2) { setUrlAvailable(null); return; }
    setUrlChecking(true);
    try {
      const res = await fetch(`/api/v1/organizations/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setUrlAvailable(data.available ?? false);
    } catch {
      setUrlAvailable(null);
    } finally {
      setUrlChecking(false);
    }
  }, []);

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = toSlug(name);
    setForm((f) => ({ ...f, orgName: name, workspaceUrl: slug }));
    setOrgErrors({});
    setUrlAvailable(null);
    if (slug.length >= 2) {
      const timer = setTimeout(() => checkUrl(slug), 500);
      return () => clearTimeout(timer);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, workspaceUrl: slug }));
    setUrlAvailable(null);
    setOrgErrors((p) => ({ ...p, workspaceUrl: '' }));
    if (slug.length >= 2) {
      const timer = setTimeout(() => checkUrl(slug), 500);
      return () => clearTimeout(timer);
    }
  };

  const handleDetailChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setDetailErrors((p) => ({ ...p, [field]: '' }));
    showSaved();
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goToStep = (step: Step) => setCurrentStep(step);

  const handleOrgContinue = () => {
    const errs = validateOrg(form);
    if (Object.keys(errs).length > 0) { setOrgErrors(errs); return; }
    if (urlAvailable === false) { setOrgErrors((p) => ({ ...p, workspaceUrl: 'This URL is already taken.' })); return; }
    showSaved();
    goToStep('details');
  };

  const handleDetailsContinue = () => {
    const errs = validateDetails(form);
    if (Object.keys(errs).length > 0) { setDetailErrors(errs); return; }
    showSaved();
    goToStep('review');
  };

  const handleCreate = async () => {
    setProvisionError('');
    goToStep('provisioning');

    try {
      const res = await fetch('/api/v1/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.orgName.trim(),
          slug: form.workspaceUrl,
          industry: form.industry,
          company_size: form.companySize,
          country: form.country.trim(),
          timezone: form.timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProvisionError(data?.error?.message ?? 'Failed to create organization. Please try again.');
        goToStep('review');
        return;
      }
      goToStep('done');
      setTimeout(() => startTransition(() => router.push('/dashboard')), 2000);
    } catch {
      setProvisionError('Network error. Please try again.');
      goToStep('review');
    }
  };

  const inputClass = (err?: string) =>
    `w-full h-[44px] px-4 rounded-input border text-[14px] bg-background-secondary text-foreground placeholder:text-[#9CA3AF] outline-none transition-all duration-fast focus:ring-2 focus:ring-brand/20 focus:border-brand ${err ? 'border-error' : 'border-border'}`;

  const selectClass = (err?: string) =>
    `w-full h-[44px] px-4 rounded-input border text-[14px] bg-background-secondary text-foreground outline-none transition-all duration-fast focus:ring-2 focus:ring-brand/20 focus:border-brand ${err ? 'border-error' : 'border-border'}`;

  // ── Render Steps ────────────────────────────────────────────────────────────

  if (currentStep === 'welcome') {
    return (
      <div role="main" aria-label="Welcome to Recrion onboarding">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-[20px] bg-[#EEF0FF] flex items-center justify-center">
              <Building2 className="w-8 h-8 text-brand" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-[28px] font-semibold text-foreground">Welcome to Recrion</h1>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Let&apos;s create your recruiting workspace.<br />This only takes about 2 minutes.
          </p>
        </div>

        {/* What you'll set up */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Building2, label: 'Organization', desc: 'Create your recruiting organization.' },
            { icon: Briefcase, label: 'Workspace', desc: 'Configure your hiring workspace.' },
            { icon: Users, label: 'Team', desc: 'Invite teammates later.' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-background-secondary rounded-card p-4 text-center shadow-sm">
              <Icon className="w-6 h-6 text-brand mx-auto mb-2" aria-hidden="true" />
              <p className="text-[13px] font-medium text-foreground">{label}</p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-background-tertiary rounded-[14px] px-4 py-3 flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-[#6B7280] shrink-0" aria-hidden="true" />
          <span className="text-[13px] text-[#6B7280]">⏱ Estimated Setup Time — <strong className="text-foreground">2 Minutes</strong></span>
        </div>

        <button
          type="button"
          onClick={() => goToStep('organization')}
          className="w-full h-[44px] rounded-button bg-brand text-white font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-brand-hover transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          Get Started
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (currentStep === 'organization') {
    return (
      <div role="main" aria-label="Organization setup">
        <Stepper current={1} />
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-foreground">Create your organization</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">Give your recruiting workspace a name and URL.</p>
        </div>
        {savedIndicator && <p aria-live="polite" className="text-[12px] text-success mb-3">{savedIndicator}</p>}
        <div className="space-y-4">
          {/* Organization Name */}
          <div>
            <label htmlFor="org-name" className="block text-[13px] font-medium text-foreground mb-1.5">Organization Name</label>
            <input id="org-name" type="text" placeholder="Acme Corporation" value={form.orgName} onChange={handleOrgNameChange}
              aria-required="true" aria-invalid={!!orgErrors.orgName} aria-describedby={orgErrors.orgName ? 'org-name-err' : undefined}
              className={inputClass(orgErrors.orgName)} />
            {orgErrors.orgName && <p id="org-name-err" role="alert" className="mt-1 text-[12px] text-error">{orgErrors.orgName}</p>}
          </div>
          {/* Workspace URL */}
          <div>
            <label htmlFor="workspace-url" className="block text-[13px] font-medium text-foreground mb-1.5">Workspace URL</label>
            <div className="flex items-center rounded-input border border-border overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand">
              <span className="px-3 text-[13px] text-[#9CA3AF] bg-background-tertiary h-[44px] flex items-center border-r border-border shrink-0">recrion.app/</span>
              <input id="workspace-url" type="text" placeholder="acme" value={form.workspaceUrl} onChange={handleSlugChange}
                aria-required="true" aria-invalid={!!orgErrors.workspaceUrl}
                className="flex-1 h-[44px] px-3 text-[14px] bg-background-secondary text-foreground outline-none" />
              {urlChecking && (
                <svg className="w-4 h-4 animate-spin text-[#9CA3AF] mr-3" viewBox="0 0 24 24" fill="none" aria-label="Checking availability">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {!urlChecking && urlAvailable === true && <CheckCircle className="w-4 h-4 text-success mr-3" aria-label="URL available" />}
              {!urlChecking && urlAvailable === false && <AlertCircle className="w-4 h-4 text-error mr-3" aria-label="URL taken" />}
            </div>
            {orgErrors.workspaceUrl && <p role="alert" className="mt-1 text-[12px] text-error">{orgErrors.workspaceUrl}</p>}
            {!orgErrors.workspaceUrl && urlAvailable === true && <p className="mt-1 text-[12px] text-success">This URL is available.</p>}
            {!orgErrors.workspaceUrl && urlAvailable === false && <p className="mt-1 text-[12px] text-error">This URL is already taken.</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button type="button" onClick={() => goToStep('welcome')} className="h-[44px] px-5 rounded-button border border-border text-foreground text-[14px] font-medium flex items-center gap-1.5 hover:bg-background-tertiary transition-all duration-fast">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={handleOrgContinue} className="flex-1 h-[44px] rounded-button bg-brand text-white font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-brand-hover transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-brand/40">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'details') {
    return (
      <div role="main" aria-label="Company details">
        <Stepper current={2} />
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-foreground">Company details</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">Help us personalize your recruiting environment.</p>
        </div>
        {savedIndicator && <p aria-live="polite" className="text-[12px] text-success mb-3">{savedIndicator}</p>}
        <div className="space-y-4">
          <div>
            <label htmlFor="industry" className="block text-[13px] font-medium text-foreground mb-1.5">Industry</label>
            <select id="industry" value={form.industry} onChange={handleDetailChange('industry')} className={selectClass(detailErrors.industry)}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            {detailErrors.industry && <p role="alert" className="mt-1 text-[12px] text-error">{detailErrors.industry}</p>}
          </div>
          <div>
            <label htmlFor="company-size" className="block text-[13px] font-medium text-foreground mb-1.5">Company Size</label>
            <select id="company-size" value={form.companySize} onChange={handleDetailChange('companySize')} className={selectClass(detailErrors.companySize)}>
              <option value="">Select size</option>
              {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
            </select>
            {detailErrors.companySize && <p role="alert" className="mt-1 text-[12px] text-error">{detailErrors.companySize}</p>}
          </div>
          <div>
            <label htmlFor="country" className="block text-[13px] font-medium text-foreground mb-1.5">Country</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" aria-hidden="true" />
              <input id="country" type="text" placeholder="United States" value={form.country} onChange={handleDetailChange('country')}
                className={`${inputClass(detailErrors.country)} pl-10`} />
            </div>
            {detailErrors.country && <p role="alert" className="mt-1 text-[12px] text-error">{detailErrors.country}</p>}
          </div>
          <div>
            <label htmlFor="timezone" className="block text-[13px] font-medium text-foreground mb-1.5">Timezone</label>
            <select id="timezone" value={form.timezone} onChange={handleDetailChange('timezone')} className={selectClass(detailErrors.timezone)}>
              <option value="">Select timezone</option>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
            {detailErrors.timezone && <p role="alert" className="mt-1 text-[12px] text-error">{detailErrors.timezone}</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button type="button" onClick={() => goToStep('organization')} className="h-[44px] px-5 rounded-button border border-border text-foreground text-[14px] font-medium flex items-center gap-1.5 hover:bg-background-tertiary transition-all duration-fast">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={handleDetailsContinue} className="flex-1 h-[44px] rounded-button bg-brand text-white font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-brand-hover transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-brand/40">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div role="main" aria-label="Review organization details">
        <Stepper current={3} />
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-foreground">Review your organization</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">Everything look good? Create your workspace.</p>
        </div>
        {provisionError && (
          <div role="alert" className="mb-4 flex items-start gap-3 rounded-[14px] bg-error-background border border-error/20 px-4 py-3">
            <AlertCircle className="w-4 h-4 mt-0.5 text-error shrink-0" />
            <p className="text-[13px] text-error">{provisionError}</p>
          </div>
        )}
        <div className="bg-background-secondary rounded-card p-6 shadow space-y-4 mb-8">
          {[
            { label: 'Organization Name', value: form.orgName },
            { label: 'Workspace URL', value: `recrion.app/${form.workspaceUrl}` },
            { label: 'Industry', value: form.industry },
            { label: 'Company Size', value: `${form.companySize} employees` },
            { label: 'Country', value: form.country },
            { label: 'Timezone', value: form.timezone },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[13px] text-[#6B7280]">{label}</span>
              <span className="text-[13px] font-medium text-foreground">{value || '—'}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => goToStep('details')} className="h-[44px] px-5 rounded-button border border-border text-foreground text-[14px] font-medium flex items-center gap-1.5 hover:bg-background-tertiary transition-all duration-fast">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="button" onClick={handleCreate} disabled={isPending} className="flex-1 h-[44px] rounded-button bg-brand text-white font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-brand-hover disabled:opacity-50 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-brand/40">
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'provisioning') {
    return (
      <div className="text-center py-8" role="status" aria-live="polite" aria-label="Creating your organization">
        <svg className="w-12 h-12 animate-spin text-brand mx-auto mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <h2 className="text-[20px] font-semibold text-foreground">Creating your workspace...</h2>
        <p className="mt-2 text-[14px] text-[#6B7280]">Setting up your organization and recruiting environment.</p>
      </div>
    );
  }

  if (currentStep === 'done') {
    return (
      <div className="text-center py-8" role="status" aria-live="polite" aria-label="Organization created">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-success-background flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-[22px] font-semibold text-foreground">Organization created!</h2>
        <p className="mt-2 text-[14px] text-[#6B7280]">Redirecting you to your dashboard...</p>
        <div className="mt-4 flex justify-center">
          <svg className="w-4 h-4 animate-spin text-brand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  return null;
}
