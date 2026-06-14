# AI Recruiting Agent

AI Recruiting Agent is a full-stack recruiting operations application that turns an overloaded hiring inbox into a structured review pipeline. It pulls candidate emails from Gmail, extracts hiring signals from message content and resume attachments, scores candidates against open roles, drafts follow-up actions, and routes every sensitive action through a human approval step before execution.

## What Problem It Solves

Recruiters and hiring teams often lose time on repetitive manual work:

- reading every inbound application email
- extracting candidate details from resumes
- comparing profiles against job requirements
- updating spreadsheets or ATS stages
- drafting acknowledgments, interview invites, and internal notifications

This application reduces that operational drag by combining AI-assisted parsing with a recruiter-controlled workflow. Instead of replacing the recruiter, it speeds up triage and keeps a person in the loop for decisions that matter.

## Core Workflow

1. A recruiter signs in with Google.
2. The system pulls inbox messages from Gmail.
3. Emails are stored and classified as applications, follow-ups, referrals, inquiries, and more.
4. Resume content is parsed into structured candidate data.
5. Candidates are scored against job expectations using typed AI outputs.
6. The app proposes actions such as candidate creation, pipeline movement, interview scheduling, email drafting, or Slack notifications.
7. A human reviewer approves or rejects each proposed action from the approvals queue.

## Current Product Areas

- `Dashboard`: recruiting KPIs such as unprocessed emails, total candidates, pending approvals, interviews, and average match score
- `Inbox`: Gmail sync, stored email review, AI classification, and manual processing triggers
- `Candidates`: structured candidate profiles with AI summaries, strengths, weaknesses, scores, and recruiter chat support
- `Pipeline`: drag-and-drop hiring stages with approval-backed stage changes
- `Approvals`: a mandatory review gate for AI-generated operational actions
- `Jobs`: open role listing backed by Supabase data

## Technology Stack

- `Next.js 14 App Router`: full-stack React framework for UI, routing, and server endpoints
- `TypeScript`: typed application code across frontend and backend
- `Tailwind CSS` and `shadcn/ui`: styling system and reusable UI primitives
- `NextAuth v5 beta`: Google authentication and session handling
- `Supabase`: primary database, realtime subscriptions, and backend data access
- `OpenAI API`: email analysis, resume parsing, scoring, drafting, and candidate chat behavior
- `Google Gmail API`: inbox polling and message retrieval
- `Slack API`: downstream notification hooks for approved actions
- `Zod`: schema validation for structured AI outputs and action payloads
- `TanStack React Query`: client-side data synchronization
- `Zustand`: lightweight local state management
- `Docker` and `Google Cloud Run`: containerized deployment path

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- a Supabase project with the required tables
- Google OAuth credentials with Gmail scopes enabled
- an OpenAI API key

### Install

```bash
npm install
```

### Environment Variables

Create `.env.local` in the project root and provide the values listed in [.env.example](.env.example).

Required keys:

- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional but supported:

- `SLACK_BOT_TOKEN`
- `SLACK_CHANNEL_ID`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_SIGNING_SECRET`
- `SLACK_VERIFICATION_TOKEN`
- `SLACK_APP_ID`
- `INBOX_POLL_INTERVAL_SECONDS`

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database

Supabase SQL migrations live in [supabase/migrations](/d:/WEB%20DEVELOPMENT/Ai_Recruiting_Agent/supabase/migrations). They define the initial schema and a follow-up migration for missing columns.

## Deployment

The repository includes:

- [Dockerfile](/d:/WEB%20DEVELOPMENT/Ai_Recruiting_Agent/Dockerfile) for container builds
- [cloudbuild.yaml](/d:/WEB%20DEVELOPMENT/Ai_Recruiting_Agent/cloudbuild.yaml) for Google Cloud Build and Cloud Run
- [Deploy.sh](/d:/WEB%20DEVELOPMENT/Ai_Recruiting_Agent/Deploy.sh) as a template deployment helper

## Project Notes

Supplementary implementation notes now live under [docs](/d:/WEB%20DEVELOPMENT/Ai_Recruiting_Agent/docs):

- `AI_Recruiting_Agent_Master_Prompt_v3.md`
- `Critical_fix.md`
- `Flow.md`

## Future Work

- add direct job creation and editing from the UI instead of database-only job management
- support Outlook and IMAP providers alongside Gmail
- add calendar integrations for approved interview scheduling
- introduce richer audit logs for every AI suggestion and approval decision
- improve background processing so inbox polling and email processing can run more reliably as workers
- add automated tests for API routes, schema validation, and recruiting workflows
- support configurable scoring rubrics per role or department
- add recruiter collaboration features such as notes, mentions, and shared review queues

## Status

This repository is an application scaffold with working recruiting surfaces and integrations, but it still has product-hardening gaps such as limited test coverage, build settings that currently ignore TypeScript and ESLint errors during production builds, and some operational behavior that is still evolving.
