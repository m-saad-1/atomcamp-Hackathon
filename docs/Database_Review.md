# Database Review & Recommendations (Phase C / Sprint 0 Phase 14)

## Overview
The application relies on a Supabase PostgreSQL instance. A structural review of the queries in `dashboard-stats.ts`, `auth.ts`, and `inbox-poller.ts` reveals the following tables in active use:
- `users`
- `sessions`
- `emails`
- `candidates`
- `approvals`
- `interviews`

## Findings
1. **Relations:** The tables appear relationally bound by standard Supabase UUIDs (e.g., `user_id` mapping to auth users). 
2. **Missing Indexes:** Based on the query patterns, the following columns frequently appear in `eq()` or `gte()` filters and require indexing if not already present:
   - `emails.processed`
   - `candidates.is_draft`
   - `approvals.status`
   - `interviews.status` and `interviews.scheduled_time`
   - `sessions.provider`
3. **Duplicate Data Risks:** `auth.ts` handles upserts correctly utilizing `onConflict: 'email'` for users and `onConflict: 'user_id,provider'` for sessions. This correctly mitigates duplicate data risks.
4. **Data Integrity constraints:** Ensure foreign keys between `candidates`, `approvals`, and `interviews` specify `ON DELETE CASCADE` where appropriate so candidate deletion cleans up their pipeline history.

## Recommendations for Sprint 1
- **Migration Scripts:** Maintain all database migrations in a centralized `/supabase/migrations` folder and execute them via the Supabase CLI to ensure schema immutability.
- **Index Creation:** Add partial indexes to boolean/status columns (e.g., `CREATE INDEX idx_emails_processed ON emails(processed) WHERE processed = false;`) to optimize dashboard and polling queries.
