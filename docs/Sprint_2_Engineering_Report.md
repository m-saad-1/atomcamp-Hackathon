# Sprint 2 Engineering Report: Email Ingestion Engine

## Executive Summary
This report documents the completion of **Milestone 2: Email Ingestion Engine**. The objective of this sprint was to upgrade the rudimentary Gmail poller into a robust, scalable ingestion pipeline that normalizes inbound communications, handles attachments reliably, and prepares data for the future Candidate Intelligence Engine—strictly without executing AI candidate generation logic prematurely.

## Core Achievements

### 1. Database Schema Hardening (`005_sprint_2_email_ingestion.sql`)
- **Lifecycle Tracking:** Expanded the `emails` table with a canonical `lifecycle_status` enum (`new`, `downloaded`, `normalized`, `attachments_ready`, `queued_for_ai`, `failed`, `archived`) to replace the opaque boolean `processed` flag.
- **Thread Context:** Added `thread_id` and `labels` to support future duplicate prevention and conversational thread tracking.
- **Attachment Storage:** Introduced the `email_attachments` table with 1-to-many relationships for emails, paving the way for multi-document candidate parsing.
- **Auditability:** Implemented an `audit_logs` table to guarantee immutable event tracking across the ingestion state machine.

### 2. Attachment Lifecycle Management
- **Deprecation of PDF-Only Logic:** Removed the flawed `downloadFirstPdfAttachment` which violated requirements by ignoring DOCX, RTF, and text resumes.
- **Comprehensive Downloader:** Built `processSupportedAttachments` within `lib/gmail/attachments.ts` to identify, download, and seamlessly upload all supported document types directly into a dedicated Supabase Storage bucket (`attachments`).

### 3. Normalization Pipeline (`lib/gmail/poller.ts`)
- **Body Extraction:** Fixed the previously broken `body_text`/`body_html` extraction logic that was causing silent SQL constraint failures on insert.
- **Idempotent Ingestion & Infinite Loop Fix:** The poller now correctly downloads the message, normalizes its content, downloads associated attachments in sequence, and transitions the state seamlessly. Upon successful processing (whether successful or permanently failed), it now cleanly removes the `UNREAD` label from the Gmail message to prevent infinite polling loops that would otherwise waste API quotas.

### 4. Separation of Concerns & Edge Case Handling
- **Removal of Premature AI Logic:** Completely stripped `app/api/emails/[id]/process/route.ts` of its OpenAI interactions and `candidates` table insertions.
- **Attachment Failure Propagation:** If an attachment fails to download or upload, the email accurately adopts a `failed` lifecycle state (preventing the Candidate Intelligence Engine from tripping over missing resumes).
- **Robust Retry Queueing:** The process route now acts as a dedicated retry mechanism that actively re-fetches the email from Gmail and attempts to re-download missing attachments, rather than blindly assuming a `queued_for_ai` state.

### 5. Platform Observability
- **Health Checks:** Upgraded `lib/health.ts` to actively query the database for pending and failed ingestion queue depths, presenting real-time operational status on the dashboard.
- **Inbox Refactoring:** Refactored `app/dashboard/inbox/page.tsx` to visualize the new `lifecycle_status`, display accurate attachment counts, and provide context-aware "Retry" or "Queue" actions.

## Technical Debt & Blockers
- **Supabase Storage Bucket:** The `attachments` bucket must be manually created in the Supabase Cloud dashboard before attachments can be successfully uploaded. Ensure the bucket is public or has appropriate RLS policies for recruiter read access.
- **Supabase Migrations:** As with Sprint 1, the `005_sprint_2_email_ingestion.sql` migration must be applied manually to the remote database.

## Next Steps
Proceeding to **Milestone 3: Candidate Intelligence Engine** will now involve building the consumer worker that pulls from the `queued_for_ai` pool, analyzes the extracted text and stored attachments using OpenAI, and formally structures the resulting candidate profiles.
