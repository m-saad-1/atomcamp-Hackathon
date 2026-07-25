# Platform Architecture

The AI Recruiting Agent operates on a standard Next.js 14 App Router architecture, backed by a Supabase PostgreSQL instance.

## Core Pillars
1. **Frontend**: Next.js Server Components, TailwindCSS, Shadcn UI.
2. **Backend**: Next.js API Routes, NextAuth.js.
3. **Database**: Supabase PostgreSQL with strict Row-Level Security (RLS).
4. **Workers**: Independent background processes (e.g., `inbox-poller.ts`) executing isolated AI tasks.

## Folder Structure
- `/app` - Next.js routing, pages, and API endpoints.
- `/components` - Shared UI components (strictly presentational).
- `/lib` - Core business logic, singletons, and shared services (health, integrations, auth).
- `/types` - Shared TypeScript interfaces.
- `/supabase/migrations` - Canonical database schema definitions.

## Authentication Flow
1. User logs in via Google OAuth.
2. `auth.ts` intercepts the JWT callback.
3. It fetches the user's Supabase UUID.
4. It checks the `organization_members` table.
5. If the user has no organization, an isolated workspace is auto-provisioned.
6. The `organization_id` and RBAC `role` are permanently bound to the encrypted session cookie.

## Organization Model
Multi-tenancy is enforced natively via PostgreSQL Row-Level Security (RLS).
- **Organizations**: The root logical boundary (`organizations` table).
- **Members**: Recruiter mappings (`organization_members` table) determining `owner`, `admin`, or `recruiter` permissions.
- **Entities**: All business logic tables (Jobs, Candidates, Emails) contain an `organization_id` foreign key.

## Integration Registry
Integrations (Gmail, Slack, OpenAI, Calendar) are managed globally per-organization via the `integration_registry` table. This acts as the single source of truth for platform health before any AI ingestion workflow executes.
