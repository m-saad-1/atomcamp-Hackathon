# AI Recruiting Agent — Complete Application Flow Fix Prompt
### Version 2.0 | Auth · Inbox · Candidates · Pipeline · Approvals · Dashboard
### Feed this prompt to your AI coding assistant to fix all flow, routing, and data issues

---

## ROLE AND MISSION

You are a senior full-stack engineer fixing a Next.js 14 AI Recruiting Agent application.
The app is built with Next.js 14 App Router, Supabase, NextAuth v5, OpenAI, and Tailwind CSS.

The application has five main tabs: **Dashboard, Inbox, Candidates, Pipeline, Approvals**.
Your job is to make all five work correctly end-to-end, with real data flowing through
each one in the exact sequence described below.

Do not add new features. Do not change the design. Fix what is broken.
Follow the data flow precisely. Every fix must be traceable to a behaviour described here.

---

## DEPENDENCY CHECK — RUN THIS FIRST

Before applying any fix, confirm these packages are installed. If any are missing, install them now:

```bash
npm install date-fns
npm install @supabase/supabase-js
npm install next-auth@beta
```

---

## THE CANONICAL DATA FLOW — READ THIS FIRST

Understanding this flow is mandatory before touching any code:

```
Gmail Inbox (real emails from candidates)
        ↓
  [Email Listener Agent polls every 60s]
        ↓
  INBOX TAB — raw email appears, AI classifies it
        ↓  (recruiter clicks "Process" OR auto-process)
  [LLM Analysis Agent runs: classify + extract + score]
        ↓
  CANDIDATES TAB — candidate profile created (is_draft = false after approval)
        ↓  (candidate profile exists)
  PIPELINE TAB — candidate card appears in "Applied" column
        ↓  (recruiter drags card OR AI recommends stage move)
  APPROVALS TAB — proposed action queued (send email / move stage / notify)
        ↓  (recruiter clicks Approve)
  [Execution Agent runs the approved action]
        ↓
  DASHBOARD TAB — stats update (new application count, scores, interviews)
```

**Key rule:** A candidate only appears in Candidates and Pipeline after their
`is_draft` flag is set to `false`. This happens only when the `create_candidate`
approval is approved by the recruiter. Until then they exist in the DB but are invisible.

---

## FIX 0 — SHARED INFRASTRUCTURE (APPLY BEFORE ALL OTHER FIXES)

These files are imported by multiple other files. They must exist before anything else will compile.

### Fix: `lib/supabase/client.ts` — browser-side Supabase client

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

> **Note:** If `@supabase/ssr` is not installed, run `npm install @supabase/ssr`.
> This client is used in Client Components (Approvals Realtime subscription).
> Server-side routes use the service role key directly — see Fix 1.

### Fix: `lib/supabase/server.ts` — server-side Supabase admin client

```typescript
import { createClient } from '@supabase/supabase-js';

// Service role — bypasses RLS. Only use in API routes, never in Client Components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

---

## FIX 1 — AUTHENTICATION FLOW

### Problem being fixed
After Google OAuth signin, the app fails to load the recruiter's account,
shows a blank dashboard, or redirects incorrectly.

### Required behaviour
1. Recruiter visits `/` → redirected to `/auth/signin` if not authenticated
2. Recruiter clicks "Sign in with Google" → Google OAuth consent screen
3. After consent, Google redirects to `/api/auth/callback/google`
4. NextAuth creates session, stores tokens in Supabase `sessions` table,
   upserts recruiter row in `users` table
5. Recruiter is redirected to `/dashboard`
6. Dashboard loads with recruiter's name and avatar in the top bar
7. All API routes return data scoped to the authenticated recruiter

### Fix: `app/api/auth/[...nextauth]/route.ts`

Replace the entire file with this implementation. Do not merge — replace completely.

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.compose',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, account, profile }) {
      // Only runs on first sign-in — capture tokens before they are lost
      if (account && profile) {
        token.access_token     = account.access_token;
        token.refresh_token    = account.refresh_token;
        token.token_expires_at = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.scope            = account.scope;
        token.picture          = (profile as any).picture ?? null;
        token.name             = (profile as any).name ?? null;

        // Upsert user into our users table
        const { data: user } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              email:      (profile as any).email,
              name:       (profile as any).name ?? null,
              avatar_url: (profile as any).picture ?? null,
            },
            { onConflict: 'email' }
          )
          .select('id')
          .single();

        if (user) {
          token.db_user_id = user.id;

          // Persist OAuth tokens so the Gmail poller can use them
          await supabaseAdmin
            .from('sessions')
            .upsert(
              {
                user_id:          user.id,
                provider:         'google',
                access_token:     account.access_token!,
                refresh_token:    account.refresh_token ?? null,
                token_expires_at: token.token_expires_at as number,
                scope:            account.scope ?? null,
              },
              { onConflict: 'user_id,provider' }
            );
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Attach our internal user ID to the session object
      session.user.id    = token.db_user_id as string;
      session.user.name  = token.name as string;
      session.user.image = token.picture as string;
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error:  '/auth/error',
  },
});

export const { GET, POST } = handlers;
```

### Fix: `middleware.ts` — protect all dashboard routes

```typescript
export { auth as middleware } from '@/app/api/auth/[...nextauth]/route';

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
```

### Fix: `app/auth/signin/page.tsx`

```typescript
import { signIn } from '@/app/api/auth/[...nextauth]/route';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-xl p-10 w-full max-w-sm text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Recruiting Agent
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sign in to access your recruiter workspace
        </p>
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/dashboard' });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 rounded-lg border
                       border-border px-4 py-3 text-sm font-medium text-foreground
                       bg-background hover:bg-muted transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Fix: `app/page.tsx` — root redirect

```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export default async function RootPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect('/dashboard');
  } else {
    redirect('/auth/signin');
  }
}
```

### Fix: `app/layout.tsx` — SessionProvider

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Recruiting Agent',
  description: 'Automated recruiter inbox operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

---

## FIX 2 — DASHBOARD TAB

### What this tab shows
The first screen after signin. Gives the recruiter an at-a-glance view of:
- Total emails in inbox (unprocessed count)
- Total candidate profiles (non-draft)
- Pending approvals requiring action (red badge if > 0)
- Interviews scheduled this week
- Average AI match score across all scored candidates

### Required behaviour
- Stats load from the DB on every page visit (no caching)
- If any stat fails to load, it shows "—" with no crash
- All numbers are real — computed from actual DB rows
- Quick-action buttons: "Process Inbox", "View Approvals", "Add Job"

### Fix: `app/api/dashboard/stats/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const [
    { count: unprocessedEmails },
    { count: totalCandidates },
    { count: pendingApprovals },
    { data: scoreData },
    { count: interviewsThisWeek },
  ] = await Promise.all([
    supabase.from('emails').select('*', { count: 'exact', head: true })
      .eq('processed', false),
    supabase.from('candidates').select('*', { count: 'exact', head: true })
      .eq('is_draft', false),
    supabase.from('approvals').select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('candidates').select('ai_score')
      .eq('is_draft', false).not('ai_score', 'is', null),
    supabase.from('interviews').select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('scheduled_time', new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const scores  = (scoreData ?? []).map((c) => c.ai_score as number);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return NextResponse.json({
    unprocessedEmails:  unprocessedEmails  ?? 0,
    totalCandidates:    totalCandidates    ?? 0,
    pendingApprovals:   pendingApprovals   ?? 0,
    interviewsThisWeek: interviewsThisWeek ?? 0,
    avgScore,
  });
}
```

### Fix: `app/dashboard/page.tsx`

```typescript
import { auth } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/dashboard/stats`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const stats   = await getStats();

  const cards = [
    { label: 'Unprocessed Emails',   value: stats?.unprocessedEmails,  href: '/dashboard/inbox',      color: 'text-blue-600'   },
    { label: 'Candidate Profiles',   value: stats?.totalCandidates,    href: '/dashboard/candidates', color: 'text-green-600'  },
    { label: 'Pending Approvals',    value: stats?.pendingApprovals,   href: '/dashboard/approvals',  color: stats?.pendingApprovals > 0 ? 'text-red-600' : 'text-foreground' },
    { label: 'Interviews This Week', value: stats?.interviewsThisWeek, href: '/dashboard/pipeline',   color: 'text-purple-600' },
    { label: 'Avg Match Score',      value: stats?.avgScore != null ? `${stats.avgScore}/100` : null, href: '/dashboard/candidates', color: 'text-amber-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Good morning{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here is your recruiting overview
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-card border border-border rounded-xl p-4 hover:border-ring transition-colors">
            <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
            <p className={`text-2xl font-semibold ${card.color}`}>
              {card.value ?? '—'}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href="/dashboard/inbox"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">
          Process Inbox
        </Link>
        <Link href="/dashboard/approvals"
          className="rounded-lg border border-border text-foreground px-4 py-2 text-sm font-medium hover:bg-muted">
          Review Approvals
          {stats?.pendingApprovals > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs w-5 h-5">
              {stats.pendingApprovals}
            </span>
          )}
        </Link>
        <Link href="/dashboard/jobs"
          className="rounded-lg border border-border text-foreground px-4 py-2 text-sm font-medium hover:bg-muted">
          Add Job
        </Link>
      </div>
    </div>
  );
}
```

---

## FIX 3 — INBOX TAB

### What this tab shows
Raw emails that the Gmail poller has retrieved. The recruiter sees each email and can
trigger the AI processing pipeline manually, or it runs automatically in the background.

### Inbox card shows:
- Sender name + email address
- Email subject line
- Time received (relative: "2 hours ago")
- AI classification badge: `job_application` / `follow_up` / `referral` / `inquiry` / `spam`
- Attachment indicator if resume PDF is attached
- Status: `Unprocessed` (yellow) / `Processing` / `Processed` (green) / `Failed` (red)
- "Process Now" button on unprocessed emails

### Required behaviour
1. Page loads → fetches all emails from `/api/emails`, newest first
2. "Process Now" → calls `POST /api/emails/[id]/process` → shows spinner → refreshes row on completion
3. Processed emails show the AI classification badge and a "View Candidate →" link
4. Failed emails show the error message and a "Retry" button
5. Empty state: "Your inbox is empty. Emails will appear here once the system polls Gmail."
6. Manual "Refresh Inbox" button that triggers `POST /api/gmail/poll`

---

### Fix: `lib/gmail/poller.ts` — Gmail inbox poll implementation

This file is imported by the poll API route. It must exist or the build will fail.

```typescript
import { createAdminClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

/**
 * Fetches new emails from Gmail for the given user and stores them in Supabase.
 * Only processes messages received after the most recent email already in the DB.
 */
export async function pollInbox(userId: string): Promise<void> {
  const supabase = createAdminClient();

  // Retrieve the stored OAuth tokens for this user
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (sessionError || !session) {
    throw new Error('No Google OAuth session found. Please sign out and sign back in.');
  }

  // Set up the OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token:  session.access_token,
    refresh_token: session.refresh_token,
    expiry_date:   session.token_expires_at,
  });

  // Auto-refresh the token and persist the new one if it changed
  oauth2Client.on('tokens', async (tokens) => {
    await supabase
      .from('sessions')
      .update({
        access_token:     tokens.access_token ?? session.access_token,
        token_expires_at: tokens.expiry_date  ?? session.token_expires_at,
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Fetch the 20 most recent inbox messages
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 20,
    labelIds: ['INBOX'],
    q: 'is:unread',
  });

  const messages = listRes.data.messages ?? [];
  if (messages.length === 0) return;

  for (const msg of messages) {
    if (!msg.id) continue;

    // Skip if already stored
    const { data: existing } = await supabase
      .from('emails')
      .select('id')
      .eq('gmail_message_id', msg.id)
      .maybeSingle();

    if (existing) continue;

    // Fetch full message
    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    });

    const headers = fullMsg.data.payload?.headers ?? [];
    const get = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null;

    const fromHeader  = get('From') ?? '';
    const subject     = get('Subject');
    const dateHeader  = get('Date');

    // Parse "Name <email>" or bare "email"
    const fromMatch   = fromHeader.match(/^(?:"?([^"<]+)"?\s+)?<?([^>]+)>?$/);
    const senderName  = fromMatch?.[1]?.trim() ?? null;
    const senderEmail = (fromMatch?.[2]?.trim() ?? fromHeader).toLowerCase();

    const hasAttachment = (fullMsg.data.payload?.parts ?? [])
      .some((p) => p.filename && p.filename.length > 0);

    const attachmentFilename = (fullMsg.data.payload?.parts ?? [])
      .find((p) => p.filename && p.filename.length > 0)?.filename ?? null;

    const receivedAt = dateHeader
      ? new Date(dateHeader).toISOString()
      : new Date().toISOString();

    // Store in Supabase
    await supabase.from('emails').insert({
      gmail_message_id:   msg.id,
      sender_name:        senderName,
      sender_email:       senderEmail,
      subject,
      has_attachment:     hasAttachment,
      attachment_filename: attachmentFilename,
      received_at:        receivedAt,
      processed:          false,
    });
  }
}
```

> **Note:** This requires `googleapis`. Install it if missing: `npm install googleapis`.
> The `googleapis` package is a peer dependency — it provides the Gmail API client.

---

### Fix: `app/api/emails/route.ts` — GET all emails

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter'); // 'unprocessed' | 'processed' | null = all

  let query = supabase
    .from('emails')
    .select(`
      id,
      sender_name,
      sender_email,
      subject,
      has_attachment,
      attachment_filename,
      received_at,
      processed,
      processing_error,
      ai_classification,
      ai_confidence,
      approval_status,
      created_at,
      candidates ( id, full_name, ai_score )
    `)
    .order('received_at', { ascending: false })
    .limit(50);

  if (filter === 'unprocessed') query = query.eq('processed', false);
  if (filter === 'processed')   query = query.eq('processed', true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({
      error:     'FETCH_FAILED',
      message:   error.message,
      recovery:  'Check Supabase connection and RLS policies.',
      retryable: true,
    }, { status: 500 });
  }

  return NextResponse.json({ emails: data ?? [] });
}
```

---

### Fix: `app/api/emails/[id]/process/route.ts` — POST: trigger AI processing

> **This is the most critical missing file.** The "Process Now" button calls
> `POST /api/emails/[id]/process`. Without this route the button silently fails or 404s.
> The original prompt referenced this route in Fix 8 but never defined it.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase   = createAdminClient();
  const emailId    = params.id;
  const recruiterId = session.user.id; // Always from session — never from request body

  // 1. Fetch the email record
  const { data: email, error: fetchError } = await supabase
    .from('emails')
    .select('*')
    .eq('id', emailId)
    .single();

  if (fetchError || !email) {
    return NextResponse.json({ error: 'EMAIL_NOT_FOUND', message: 'Email not found.' }, { status: 404 });
  }

  if (email.processed) {
    return NextResponse.json({ error: 'ALREADY_PROCESSED', message: 'This email has already been processed.' }, { status: 409 });
  }

  // 2. Mark as processing (prevents double-clicks triggering duplicate jobs)
  await supabase
    .from('emails')
    .update({ processing_error: null })
    .eq('id', emailId);

  try {
    // 3. Classify the email with AI
    const classifyRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an AI recruiting assistant. Classify incoming emails and extract candidate information.
Return a JSON object with:
- classification: one of "job_application" | "follow_up" | "referral" | "inquiry" | "spam" | "other"
- confidence: 0.0 to 1.0
- full_name: string or null
- current_role: string or null
- current_company: string or null
- skills: string[] (top skills mentioned, empty array if none)
- experience_years: number or null
- ai_score: number 0-100 or null (overall candidate quality score)
- ai_recommendation: "strong_yes" | "yes" | "maybe" | "no" | null
- ai_strengths: string[] (2-3 key strengths, empty if not a job application)
- summary: string (1-2 sentence plain-English summary of this email)`,
        },
        {
          role: 'user',
          content: `From: ${email.sender_name ?? ''} <${email.sender_email}>
Subject: ${email.subject ?? '(no subject)'}
Has attachment: ${email.has_attachment ? `Yes (${email.attachment_filename})` : 'No'}
Body snippet: ${email.body_snippet ?? '(no body)'}`,
        },
      ],
      max_tokens: 500,
    });

    const raw  = classifyRes.choices[0]?.message?.content ?? '{}';
    const data = JSON.parse(raw);

    // 4. Update the email with classification results
    await supabase
      .from('emails')
      .update({
        processed:         true,
        ai_classification: data.classification ?? 'other',
        ai_confidence:     data.confidence     ?? null,
        processing_error:  null,
      })
      .eq('id', emailId);

    // 5. If it's a job application, queue a create_candidate approval
    if (data.classification === 'job_application') {
      // Create a draft candidate record
      const { data: candidate } = await supabase
        .from('candidates')
        .insert({
          full_name:        data.full_name     ?? email.sender_name ?? email.sender_email,
          email:            email.sender_email,
          current_role:     data.current_role  ?? null,
          current_company:  data.current_company ?? null,
          skills:           data.skills        ?? [],
          experience_years: data.experience_years ?? null,
          ai_score:         data.ai_score      ?? null,
          ai_recommendation: data.ai_recommendation ?? null,
          ai_strengths:     data.ai_strengths  ?? [],
          stage:            'applied',
          source:           'email',
          is_draft:         true, // Hidden until recruiter approves create_candidate
        })
        .select('id')
        .single();

      if (candidate) {
        // Link the email to the candidate
        await supabase
          .from('emails')
          .update({ candidate_id: candidate.id })
          .eq('id', emailId);

        // Queue the create_candidate approval for the recruiter to review
        await supabase.from('approvals').insert({
          recruiter_id:   recruiterId,
          action_type:    'create_candidate',
          action_payload: {
            candidate_id:     candidate.id,
            email_id:         emailId,
            full_name:        data.full_name ?? email.sender_name,
            ai_score:         data.ai_score,
            ai_recommendation: data.ai_recommendation,
            summary:          data.summary,
          },
          preview_label:  `Create candidate profile for ${data.full_name ?? email.sender_email}`,
          related_entity: 'candidate',
          related_id:     candidate.id,
          status:         'pending',
        });
      }
    }

    return NextResponse.json({
      success:        true,
      classification: data.classification,
      message:        'Email processed successfully.',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Record the error so the UI shows a Retry button
    await supabase
      .from('emails')
      .update({ processing_error: message })
      .eq('id', emailId);

    return NextResponse.json({
      error:     'PROCESSING_FAILED',
      message,
      recovery:  'Check your OpenAI API key and try again.',
      retryable: true,
    }, { status: 500 });
  }
}
```

---

### Fix: `app/api/gmail/poll/route.ts` — trigger inbox poll manually

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { pollInbox } from '@/lib/gmail/poller';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    await pollInbox(session.user.id);
    return NextResponse.json({ success: true, message: 'Inbox polled successfully.' });
  } catch (err) {
    return NextResponse.json({
      error:     'POLL_FAILED',
      message:   err instanceof Error ? err.message : String(err),
      recovery:  'Check Gmail OAuth scopes and token validity. Try signing out and back in.',
      retryable: true,
    }, { status: 500 });
  }
}
```

---

### Fix: `app/dashboard/inbox/page.tsx`

> **Critical change from v1:** The "Process Now" button now calls
> `POST /api/emails/[id]/process` instead of `POST /api/emails/[id]`.
> This matches the actual route that exists.

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type Email = {
  id: string;
  sender_name:       string | null;
  sender_email:      string;
  subject:           string | null;
  has_attachment:    boolean;
  attachment_filename: string | null;
  received_at:       string | null;
  processed:         boolean;
  processing_error:  string | null;
  ai_classification: string | null;
  ai_confidence:     number | null;
  candidates: { id: string; full_name: string; ai_score: number | null } | null;
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  job_application: 'bg-blue-100 text-blue-700',
  follow_up:       'bg-purple-100 text-purple-700',
  referral:        'bg-green-100 text-green-700',
  inquiry:         'bg-amber-100 text-amber-700',
  spam:            'bg-gray-100 text-gray-500',
  other:           'bg-gray-100 text-gray-500',
};

export default function InboxPage() {
  const [emails, setEmails]         = useState<Email[]>([]);
  const [loading, setLoading]       = useState(true);
  const [polling, setPolling]       = useState(false);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [error, setError]           = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    try {
      const res  = await fetch('/api/emails');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load emails');
      setEmails(data.emails ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  async function pollInbox() {
    setPolling(true);
    try {
      const res  = await fetch('/api/gmail/poll', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Poll failed');
      await fetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Poll failed');
    } finally {
      setPolling(false);
    }
  }

  async function processEmail(emailId: string) {
    setProcessing((prev) => new Set(prev).add(emailId));
    try {
      // Calls /api/emails/[id]/process — the route that actually exists
      const res  = await fetch(`/api/emails/${emailId}/process`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Processing failed');
      await fetchEmails(); // Refresh to show updated status and candidate link
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(emailId);
        return next;
      });
    }
  }

  if (loading) return <InboxSkeleton />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Incoming emails identified as potential candidates
          </p>
        </div>
        <button
          onClick={pollInbox}
          disabled={polling}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2
                     text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {polling ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {polling ? 'Fetching…' : 'Refresh Inbox'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Empty state */}
      {emails.length === 0 && !error && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Your inbox is empty</p>
          <p className="text-sm">
            Emails will appear here once the system polls Gmail.
            Click "Refresh Inbox" to check now.
          </p>
        </div>
      )}

      {/* Email list */}
      <div className="space-y-3">
        {emails.map((email) => {
          const isProcessing = processing.has(email.id);
          const canProcess   = !email.processed || !!email.processing_error;

          return (
            <div key={email.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-ring/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                {/* Left: sender + subject + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {email.sender_name ?? email.sender_email}
                    </p>
                    {email.sender_name && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        &lt;{email.sender_email}&gt;
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {email.subject ?? '(no subject)'}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* AI classification badge */}
                    {email.ai_classification && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${CLASSIFICATION_COLORS[email.ai_classification] ?? 'bg-gray-100 text-gray-600'}`}>
                        {email.ai_classification.replace('_', ' ')}
                      </span>
                    )}

                    {/* Attachment indicator */}
                    {email.has_attachment && (
                      <span className="text-xs text-muted-foreground">
                        📎 {email.attachment_filename ?? 'attachment'}
                      </span>
                    )}

                    {/* Status badge */}
                    {email.processed && !email.processing_error ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Processed
                      </span>
                    ) : email.processing_error ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Failed
                      </span>
                    ) : isProcessing ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Processing…
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Unprocessed
                      </span>
                    )}

                    {/* Relative time */}
                    {email.received_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {/* Error message */}
                  {email.processing_error && (
                    <p className="text-xs text-red-600 mt-1 truncate">
                      Error: {email.processing_error}
                    </p>
                  )}
                </div>

                {/* Right: actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {email.candidates && (
                    <Link href={`/dashboard/candidates/${email.candidates.id}`}
                      className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                      View Candidate →
                    </Link>
                  )}
                  {canProcess && (
                    <button
                      onClick={() => processEmail(email.id)}
                      disabled={isProcessing}
                      className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs
                                 font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      {isProcessing
                        ? 'Processing…'
                        : email.processing_error
                        ? 'Retry'
                        : 'Process Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InboxSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2 mb-3" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
```

---

## FIX 4 — CANDIDATES TAB

### What this tab shows
All fully-vetted candidate profiles (is_draft = false). Each person was "promoted"
from an email in the Inbox tab after the AI parsed their resume and the recruiter
approved the `create_candidate` action.

### Fix: `app/api/candidates/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const stage  = searchParams.get('stage');
  const search = searchParams.get('search');

  let query = supabase
    .from('candidates')
    .select(`
      id, full_name, email, current_role, current_company,
      skills, experience_years, ai_score, ai_recommendation,
      ai_strengths, stage, tags, source, created_at
    `)
    .eq('is_draft', false)
    .order('ai_score', { ascending: false, nullsFirst: false });

  if (stage)  query = query.eq('stage', stage);
  if (search) query = query.or(
    `full_name.ilike.%${search}%,email.ilike.%${search}%,current_role.ilike.%${search}%`
  );

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({
      error: 'FETCH_FAILED', message: error.message,
      recovery: 'Check Supabase connection.', retryable: true,
    }, { status: 500 });
  }

  return NextResponse.json({ candidates: data ?? [] });
}
```

### Fix: `app/dashboard/candidates/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Candidate = {
  id: string; full_name: string; email: string;
  current_role: string | null; current_company: string | null;
  skills: string[]; ai_score: number | null;
  ai_recommendation: string | null; stage: string;
};

const SCORE_COLOR = (s: number | null) =>
  s == null ? 'bg-gray-100 text-gray-500' :
  s >= 80   ? 'bg-green-100 text-green-700' :
  s >= 60   ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700';

const REC_LABEL: Record<string, string> = {
  strong_yes: '⭐ Strong Yes', yes: '✓ Yes', maybe: '~ Maybe', no: '✗ No',
};

const STAGE_COLORS: Record<string, string> = {
  applied:     'bg-blue-50 text-blue-700',
  screening:   'bg-purple-50 text-purple-700',
  interview:   'bg-amber-50 text-amber-700',
  final_round: 'bg-orange-50 text-orange-700',
  offered:     'bg-green-50 text-green-700',
  hired:       'bg-green-100 text-green-800',
  rejected:    'bg-gray-100 text-gray-500',
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [stage, setStage]           = useState('');
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (stage)  params.set('stage', stage);
    fetch(`/api/candidates?${params}`)
      .then((r) => r.json())
      .then((d) => { setCandidates(d.candidates ?? []); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, stage]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Profiles created from processed emails and uploaded resumes
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{candidates.length} profiles</span>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text" placeholder="Search name, email, role…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2
                     text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          value={stage} onChange={(e) => setStage(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Stages</option>
          {['applied','screening','interview','final_round','offered','hired','rejected']
            .map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && candidates.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No candidates yet</p>
          <p className="text-sm">Process emails in the Inbox tab to create candidate profiles.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-40" />
            ))
          : candidates.map((c) => (
            <Link key={c.id} href={`/dashboard/candidates/${c.id}`}
              className="bg-card border border-border rounded-xl p-4 hover:border-ring/50 transition-colors block">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.current_role ?? 'Unknown role'}
                    {c.current_company ? ` at ${c.current_company}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${SCORE_COLOR(c.ai_score)}`}>
                  {c.ai_score != null ? `${c.ai_score}/100` : 'Unscored'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {(c.skills ?? []).slice(0, 3).map((s) => (
                  <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                    {s}
                  </span>
                ))}
                {(c.skills ?? []).length > 3 && (
                  <span className="text-xs text-muted-foreground">+{c.skills.length - 3} more</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[c.stage] ?? ''}`}>
                  {c.stage.replace('_', ' ')}
                </span>
                {c.ai_recommendation && (
                  <span className="text-xs text-muted-foreground">
                    {REC_LABEL[c.ai_recommendation] ?? c.ai_recommendation}
                  </span>
                )}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
```

---

## FIX 5 — PIPELINE TAB (KANBAN)

### What this tab shows
All non-draft candidates organised into hiring stage columns. Moving a card creates
a `move_stage` approval record. The card moves visually (optimistic update) and
snaps back if the approval is rejected.

### Fix: `app/api/candidates/[id]/route.ts` — GET + PATCH

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('candidates').select('*').eq('id', params.id).single();

  if (error || !data) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ candidate: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const body     = await request.json();

  // Stage change → create an approval rather than updating directly
  if (body.stage) {
    const { data: current } = await supabase
      .from('candidates').select('stage, full_name').eq('id', params.id).single();

    await supabase.from('approvals').insert({
      recruiter_id:   session.user.id,
      action_type:    'move_stage',
      action_payload: {
        candidate_id: params.id,
        from_stage:   current?.stage,
        to_stage:     body.stage,
      },
      preview_label:  `Move ${current?.full_name ?? 'candidate'} from ${current?.stage} → ${body.stage}`,
      related_entity: 'candidate',
      related_id:     params.id,
      status:         'pending',
    });

    // Optimistic update — reverted if approval is rejected
    await supabase.from('candidates').update({ stage: body.stage }).eq('id', params.id);
    return NextResponse.json({ success: true, approval_created: true });
  }

  // Other allowed field updates
  const allowed = ['notes', 'tags', 'availability'];
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );
  await supabase.from('candidates').update(updates).eq('id', params.id);
  return NextResponse.json({ success: true });
}
```

### Fix: `app/dashboard/pipeline/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STAGES = [
  { key: 'applied',     label: 'Applied',     color: 'border-t-blue-400'    },
  { key: 'screening',   label: 'Screening',   color: 'border-t-purple-400'  },
  { key: 'interview',   label: 'Interview',   color: 'border-t-amber-400'   },
  { key: 'final_round', label: 'Final Round', color: 'border-t-orange-400'  },
  { key: 'offered',     label: 'Offered',     color: 'border-t-green-400'   },
  { key: 'hired',       label: 'Hired',       color: 'border-t-emerald-500' },
  { key: 'rejected',    label: 'Rejected',    color: 'border-t-gray-400'    },
];

type Candidate = {
  id: string; full_name: string; current_role: string | null;
  skills: string[]; ai_score: number | null; stage: string;
};

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [dragging, setDragging]     = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/candidates')
      .then((r) => r.json())
      .then((d) => setCandidates(d.candidates ?? []))
      .finally(() => setLoading(false));
  }, []);

  const byStage = (key: string) => candidates.filter((c) => c.stage === key);

  async function handleDrop(toStage: string) {
    if (!dragging) return;
    const candidateId = dragging;
    const fromStage   = candidates.find((c) => c.id === candidateId)?.stage;
    if (!fromStage || fromStage === toStage) { setDragging(null); setDragOver(null); return; }

    // Optimistic update
    setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, stage: toStage } : c));

    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ stage: toStage }),
      });
      if (!res.ok) throw new Error('Stage update failed');
    } catch {
      // Revert on error
      const res  = await fetch('/api/candidates');
      const data = await res.json();
      setCandidates(data.candidates ?? []);
    }

    setDragging(null);
    setDragOver(null);
  }

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Drag candidates between stages. Moving a card creates an approval request.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = byStage(stage.key);
          const isOver = dragOver === stage.key;
          return (
            <div key={stage.key}
              className={`flex-shrink-0 w-56 bg-muted/40 rounded-xl border-t-2 ${stage.color}
                          ${isOver ? 'ring-2 ring-primary ring-offset-1' : ''} transition-all`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="px-3 py-2 border-b border-border/50">
                <span className="text-xs font-medium text-foreground">{stage.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{cards.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {loading
                  ? [...Array(2)].map((_, i) => (
                      <div key={i} className="h-20 bg-card rounded-lg animate-pulse" />
                    ))
                  : cards.map((c) => (
                    <div key={c.id} draggable
                      onDragStart={() => setDragging(c.id)}
                      onDragEnd={() => { setDragging(null); setDragOver(null); }}
                      className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing
                                  hover:border-ring/50 transition-colors select-none
                                  ${dragging === c.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-medium text-foreground leading-tight">{c.full_name}</p>
                        {c.ai_score != null && (
                          <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ml-1 font-medium
                            ${c.ai_score >= 80 ? 'bg-green-100 text-green-700' :
                              c.ai_score >= 60 ? 'bg-amber-100 text-amber-700' :
                                                 'bg-red-100 text-red-700'}`}>
                            {c.ai_score}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {c.current_role ?? 'Unknown role'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(c.skills ?? []).slice(0, 2).map((s) => (
                          <span key={s} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                      <Link href={`/dashboard/candidates/${c.id}`}
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                        onClick={(e) => e.stopPropagation()}>
                        View →
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## FIX 6 — APPROVALS TAB

### Fix: `app/api/approvals/route.ts` — GET pending + PATCH decide

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('approvals')
    .select(`
      id, action_type, action_payload, preview_label,
      related_entity, related_id, status, retry_count, created_at,
      candidates:related_id ( id, full_name, ai_score )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ approvals: data ?? [] });
}
```

### Fix: `app/api/approvals/[id]/route.ts` — PATCH approve/reject

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const supabase = createAdminClient();
  const { decision } = await request.json() as { decision: 'approved' | 'rejected' };

  // Fetch the approval
  const { data: approval, error: fetchError } = await supabase
    .from('approvals')
    .select('*')
    .eq('id', params.id)
    .single();

  if (fetchError || !approval) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  // Mark approval as decided
  await supabase
    .from('approvals')
    .update({ status: decision, decided_at: new Date().toISOString() })
    .eq('id', params.id);

  // Execute the action if approved
  if (decision === 'approved') {
    const payload = approval.action_payload as Record<string, any>;

    switch (approval.action_type) {
      case 'create_candidate':
        // Promote the draft candidate to a visible profile
        if (payload.candidate_id) {
          await supabase
            .from('candidates')
            .update({ is_draft: false })
            .eq('id', payload.candidate_id);
        }
        break;

      case 'move_stage':
        // Stage already updated optimistically — nothing more to do
        break;

      case 'reject_candidate':
        if (payload.candidate_id) {
          await supabase
            .from('candidates')
            .update({ stage: 'rejected' })
            .eq('id', payload.candidate_id);
        }
        break;

      // Other action types (send_email, schedule_interview, slack_notify)
      // are handled by separate execution agents — approval status is enough
      // for them to pick up and run.
    }
  }

  if (decision === 'rejected') {
    const payload = approval.action_payload as Record<string, any>;

    // Revert the optimistic stage move if the approval was for move_stage
    if (approval.action_type === 'move_stage' && payload.candidate_id && payload.from_stage) {
      await supabase
        .from('candidates')
        .update({ stage: payload.from_stage })
        .eq('id', payload.candidate_id);
    }

    // Revert draft candidate if create_candidate was rejected
    if (approval.action_type === 'create_candidate' && payload.candidate_id) {
      await supabase
        .from('candidates')
        .delete()
        .eq('id', payload.candidate_id);
    }
  }

  return NextResponse.json({ success: true });
}
```

### Fix: `app/dashboard/approvals/page.tsx`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Approval = {
  id: string; action_type: string; action_payload: Record<string, unknown>;
  preview_label: string; status: string; created_at: string;
  candidates: { id: string; full_name: string; ai_score: number | null } | null;
};

const ACTION_ICONS: Record<string, string> = {
  send_email:         '✉️',
  move_stage:         '↔️',
  schedule_interview: '📅',
  reject_candidate:   '✗',
  slack_notify:       '💬',
  create_candidate:   '👤',
};

const ACTION_RISK: Record<string, string> = {
  send_email:         'High — will create a Gmail draft',
  move_stage:         'Low — updates pipeline stage',
  schedule_interview: 'High — creates calendar event',
  reject_candidate:   'High — marks candidate as rejected',
  slack_notify:       'Low — sends a Slack message',
  create_candidate:   'Medium — creates candidate profile',
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());
  const [actioning, setActioning] = useState<Set<string>>(new Set());
  const [error, setError]         = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res  = await fetch('/api/approvals');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to load approvals');
      setApprovals(data.approvals ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  // Supabase Realtime — new approvals appear without a page refresh
  useEffect(() => {
    const supabase = createClient();
    const channel  = supabase
      .channel('approvals-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'approvals' },
        () => fetchApprovals())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'approvals' },
        () => fetchApprovals())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchApprovals]);

  async function decide(approvalId: string, decision: 'approved' | 'rejected') {
    setActioning((a) => new Set(a).add(approvalId));
    try {
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? 'Action failed');
      }
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActioning((a) => { const n = new Set(a); n.delete(approvalId); return n; });
    }
  }

  function toggleExpand(id: string) {
    setExpanded((e) => {
      const n = new Set(e);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve or reject every proposed AI action before it executes
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {approvals.length} pending
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && approvals.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-2xl mb-3">✓</p>
          <p className="text-lg font-medium mb-2">All caught up</p>
          <p className="text-sm">New actions will appear here as the AI processes emails.</p>
        </div>
      )}

      <div className="space-y-3">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-28" />
            ))
          : approvals.map((approval) => {
              const isActioning = actioning.has(approval.id);
              const isExpanded  = expanded.has(approval.id);
              return (
                <div key={approval.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">
                      {ACTION_ICONS[approval.action_type] ?? '⚙️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {approval.preview_label}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        Risk: {ACTION_RISK[approval.action_type] ?? 'Unknown'}
                      </p>

                      {approval.candidates && (
                        <Link href={`/dashboard/candidates/${approval.candidates.id}`}
                          className="text-xs text-blue-600 hover:underline">
                          {approval.candidates.full_name}
                          {approval.candidates.ai_score != null
                            ? ` — Score: ${approval.candidates.ai_score}/100` : ''}
                        </Link>
                      )}

                      <button onClick={() => toggleExpand(approval.id)}
                        className="text-xs text-muted-foreground hover:text-foreground mt-2 block">
                        {isExpanded ? '▲ Hide preview' : '▼ Show preview'}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 text-xs bg-muted rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(approval.action_payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border/50">
                    <button
                      onClick={() => decide(approval.id, 'rejected')}
                      disabled={isActioning}
                      className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium
                                 text-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-700
                                 disabled:opacity-40 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => decide(approval.id, 'approved')}
                      disabled={isActioning}
                      className="rounded-lg bg-green-600 text-white px-4 py-1.5 text-xs font-medium
                                 hover:bg-green-700 disabled:opacity-40 transition-colors"
                    >
                      {isActioning ? 'Executing…' : 'Approve'}
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
```

---

## FIX 7 — SHARED LAYOUT (SIDEBAR + TOP BAR)

### Fix: `app/dashboard/layout.tsx`

```typescript
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SignOutButton } from '@/components/layout/SignOutButton';

const NAV_ITEMS = [
  { href: '/dashboard',            label: 'Dashboard',  icon: '◻' },
  { href: '/dashboard/inbox',      label: 'Inbox',      icon: '✉' },
  { href: '/dashboard/candidates', label: 'Candidates', icon: '👤' },
  { href: '/dashboard/pipeline',   label: 'Pipeline',   icon: '⋮⋮' },
  { href: '/dashboard/approvals',  label: 'Approvals',  icon: '✓'  },
  { href: '/dashboard/jobs',       label: 'Jobs',       icon: '💼' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-56 border-r border-border flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <span className="font-semibold text-foreground text-sm">Recruiting Agent</span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground
                         hover:bg-muted hover:text-foreground transition-colors">
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            {session.user?.image && (
              <Image src={session.user.image} alt="Avatar"
                width={28} height={28} className="rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {session.user?.name ?? 'Recruiter'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

### Fix: `components/layout/SignOutButton.tsx`

```typescript
'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-1 py-1 transition-colors"
    >
      Sign out
    </button>
  );
}
```

---

## FIX 8 — SUPABASE SCHEMA REFERENCE

The following columns must exist for this code to work. If the tables look different
in your Supabase dashboard, add the missing columns via the SQL Editor.

```sql
-- Confirm emails table has these columns
ALTER TABLE emails ADD COLUMN IF NOT EXISTS gmail_message_id text UNIQUE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS body_snippet      text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_classification text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS ai_confidence     float;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS processing_error  text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS candidate_id      uuid REFERENCES candidates(id);
ALTER TABLE emails ADD COLUMN IF NOT EXISTS approval_status   text;

-- Confirm candidates table has these columns
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_draft         boolean NOT NULL DEFAULT true;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_score         integer;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_recommendation text;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_strengths     text[];
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills           text[];
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_years  integer;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS stage            text NOT NULL DEFAULT 'applied';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source           text;

-- Confirm approvals table has these columns
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS recruiter_id    uuid REFERENCES users(id);
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS action_type     text NOT NULL;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS action_payload  jsonb NOT NULL DEFAULT '{}';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS preview_label   text;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS related_entity  text;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS related_id      uuid;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS status          text NOT NULL DEFAULT 'pending';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS retry_count     integer DEFAULT 0;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS decided_at      timestamptz;

-- sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS provider         text NOT NULL DEFAULT 'google';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS access_token     text NOT NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS refresh_token    text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS token_expires_at bigint;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS scope            text;
ALTER TABLE sessions ADD CONSTRAINT sessions_user_provider UNIQUE (user_id, provider);

-- Enable Realtime on approvals
ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
```

---

## FIX 9 — COMMON ERROR PATTERNS AND FIXES

### Error: Inbox loads but shows 0 emails even after clicking "Refresh Inbox"
**Cause A:** `googleapis` is not installed — the poller crashes silently.
**Fix:** Run `npm install googleapis`. Restart the dev server.

**Cause B:** The `sessions` table has no row for this user (token was never stored).
**Fix:** Sign out completely, clear browser cookies, sign back in. The NextAuth `jwt`
callback on first sign-in populates the `sessions` table.

**Cause C:** Gmail OAuth scopes are missing. Check the token scope in the Supabase
`sessions` table — it must include `gmail.readonly`.
**Fix:** Sign out, clear cookies, sign back in. The `prompt: 'consent'` in NextAuth
forces Google to show the consent screen and issue a new token.

### Error: "Process Now" returns 404
**Cause:** The route file is at the wrong path. The UI calls `POST /api/emails/[id]/process`
but the file must be at `app/api/emails/[id]/process/route.ts`.
**Fix:** Confirm the file path exactly. The `[id]` is a dynamic segment; `process` is
a literal sub-segment. The folder structure must be:
`app/api/emails/[id]/process/route.ts`

### Error: "Process Now" returns 409 Conflict on retry
**Cause:** The email is already marked `processed = true` in the DB.
**Fix:** This is correct behaviour for already-processed emails. The Retry button
should only appear on emails where `processing_error` is non-null. Check the
`canProcess` logic in the Inbox page component.

### Error: "Cannot read properties of null (reading 'user')"
**Cause:** Session is null — middleware is not protecting the route, or the `session`
callback is not attaching `user.id`.
**Fix:** Verify `middleware.ts` includes the route in its `matcher`. Verify the `session`
callback attaches `session.user.id = token.db_user_id`.

### Error: "relation 'users' does not exist" or "row violates RLS policy"
**Cause:** Supabase migration has not been run, or RLS is blocking the service role.
**Fix:** Run the SQL in Fix 8 in the Supabase SQL Editor. The service role key bypasses
RLS — confirm `SUPABASE_SERVICE_ROLE_KEY` is set (not the anon key) in all server-side clients.

### Error: Approvals tab shows nothing
**Cause:** Supabase RLS is blocking the `approvals` table read.
**Fix:** All API routes use `createAdminClient()` which uses the service role and bypasses
RLS. If you are still using the anon client anywhere, replace it with `createAdminClient()`.

### Error: Kanban cards revert after drag
**Cause:** The PATCH route is returning 401 because the cookie is not forwarded.
**Fix:** `fetch('/api/...')` from Client Components forwards cookies automatically in
Next.js App Router. If you added `credentials: 'omit'` anywhere, remove it.

### Error: "token_expires_at" is null after sign-in
**Cause:** Google's OAuth response does not always include `expires_at`.
**Fix:** The fallback `Date.now() + 3600 * 1000` is already in the NextAuth config in Fix 1.
If this is still null, confirm the `jwt` callback is running (add a `console.log`
inside the `if (account && profile)` block).

---

## IMPLEMENTATION ORDER

Apply fixes in this exact order. Test each before moving to the next.

```
0. Shared infrastructure (Fix 0)         → Test: lib/supabase/client.ts and server.ts compile
1. Auth (Fix 1)                          → Test: signin works, redirects to /dashboard
2. Dashboard (Fix 2)                     → Test: stats show real numbers (or — if tables empty)
3. Inbox GET /api/emails (Fix 3)         → Test: curl /api/emails returns { emails: [] } or rows
4. Gmail poller lib (Fix 3)              → Test: dev server compiles without import errors
5. Process route /api/emails/[id]/process → Test: curl returns 404 for unknown id, 401 unauthenticated
6. Poll route /api/gmail/poll (Fix 3)    → Test: POST returns { success: true } or a clear error
7. Inbox UI (Fix 3)                      → Test: emails appear, Process Now spinner works
8. Candidates API (Fix 4)               → Test: /api/candidates returns non-draft rows
9. Candidates UI (Fix 4)                → Test: candidate cards render with score badges
10. Pipeline (Fix 5)                    → Test: drag creates approval, card moves optimistically
11. Approvals GET + PATCH (Fix 6)       → Test: pending approvals load, approve sets is_draft=false
12. Approvals UI (Fix 6)                → Test: Realtime subscription connects without error
13. Layout (Fix 7)                      → Test: sidebar shows correct user, all nav links work
14. Schema migration (Fix 8)            → Test: all columns exist, no constraint errors
```

---

## ACCEPTANCE CRITERIA — ALL MUST PASS

- [ ] Sign in with Google → redirected to `/dashboard` → name and avatar visible in sidebar
- [ ] Gmail OAuth scopes granted (`gmail.readonly`, `gmail.compose`) — visible in `sessions.scope`
- [ ] Dashboard stats reflect real DB counts — not hardcoded values
- [ ] Inbox loads emails from DB ordered by `received_at` descending
- [ ] "Refresh Inbox" button polls Gmail via `POST /api/gmail/poll` and new emails appear
- [ ] "Process Now" on an unprocessed email calls `POST /api/emails/[id]/process` and updates status
- [ ] Processed emails show AI classification badge and "View Candidate →" link
- [ ] Failed emails show the error message and a "Retry" button
- [ ] Candidates tab shows only `is_draft = false` profiles
- [ ] Candidate cards show score badge, top 3 skills, stage, recommendation
- [ ] Pipeline shows all non-draft candidates in their correct stage columns
- [ ] Dragging a Kanban card creates an approval record in the `approvals` table
- [ ] Approvals tab loads all `status = 'pending'` approvals
- [ ] New approvals appear without page refresh (Supabase Realtime)
- [ ] Approving `create_candidate` sets `is_draft = false` on the candidate
- [ ] Rejecting `create_candidate` deletes the draft candidate row
- [ ] Approving `move_stage` keeps the new stage; rejecting reverts to the original
- [ ] Approving `send_email` creates a Gmail draft (does NOT auto-send)
- [ ] Rejecting any approval marks it rejected without executing the action
- [ ] Sign out redirects to `/auth/signin` and clears the session cookie
- [ ] All error states show a visible message and a retry path — no blank crashes

---

*AI Recruiting Agent — Complete Application Flow Fix Prompt v2.0*
*Apply these fixes in order. Test each before proceeding. Do not skip steps.*