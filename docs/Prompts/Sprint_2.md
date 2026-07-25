# Sprint 2 — Email Ingestion Engine Completion

## Role

You are the Lead Software Engineer responsible for completing the Email Ingestion Engine milestone of the AI Recruiting Operations Platform.

This is NOT a greenfield implementation.

The project already contains:

- Gmail OAuth
- Gmail API integration
- Gmail Poller
- Attachment downloader
- Background worker
- Email APIs
- Database integration

Do NOT rebuild these systems.

Audit them, identify gaps against the Engineering Handbook, and implement ONLY the missing or incomplete requirements.

---

# Primary Objective

Transform the existing Gmail integration into a production-quality Email Ingestion Engine.

The objective is to ensure every inbound recruiting email is:

- reliably discovered
- normalized
- validated
- deduplicated
- persisted
- observable
- auditable
- ready for downstream AI processing

This sprint does NOT include Resume Processing or Candidate Intelligence.

---

# Engineering Process (MANDATORY)

Before modifying any code:

1. Read:
   - docs/01-Foundation.md
   - docs/02-Email-Ingestion.md

2. Audit the existing Gmail implementation.

3. Produce an internal Gap Analysis.

For every requirement mark:

- Complete
- Partial
- Missing

Only implement Partial and Missing requirements.

Never rewrite working functionality.

---

# Phase A — Gmail Pipeline Audit

Review:

- OAuth
- Poller
- Message retrieval
- Incremental sync
- Gmail labels
- Thread handling
- Message IDs
- Attachment download
- Worker lifecycle

Identify architectural weaknesses.

---

# Phase B — Email Lifecycle

Ensure every email has a complete lifecycle.

Conceptually:

Received

↓

Discovered

↓

Validated

↓

Normalized

↓

Stored

↓

Attachments Downloaded

↓

Ready for Resume Processing

↓

Completed

OR

↓

Failed

↓

Retry

Every transition should be represented in the platform state.

---

# Phase C — Email Normalization

Standardize every inbound email.

Every email should expose a consistent internal model regardless of formatting.

Include:

- Sender
- Recipients
- Subject
- Body
- Timestamp
- Message ID
- Thread ID
- Labels
- Attachments
- Source
- Organization

Normalization should become the canonical representation used by downstream systems.

---

# Phase D — Duplicate Prevention

Guarantee idempotent ingestion.

The same Gmail message must never create duplicate platform records.

Audit current duplicate detection.

Strengthen it if necessary.

---

# Phase E — Attachment Management

Audit attachment processing.

Ensure:

- Discovery
- Validation
- Download
- Storage
- Metadata
- File integrity
- Processing readiness

Do NOT parse resumes.

Only prepare attachments.

---

# Phase F — Email State Tracking

Introduce or complete email processing status.

Every email should expose a lifecycle state.

States should accurately reflect reality.

Avoid placeholder values.

---

# Phase G — Retry & Recovery

Audit failure handling.

Ensure recoverable failures:

- retry safely
- preserve state
- never duplicate work
- remain observable

Do NOT introduce unnecessary queue infrastructure.

Use current architecture where appropriate.

---

# Phase H — Audit Trail

Every significant ingestion event should be recorded.

Examples:

- Email discovered
- Email normalized
- Attachment downloaded
- Retry started
- Retry completed
- Failure occurred
- Processing completed

Audit records should be immutable.

---

# Phase I — Platform Health

Extend Platform Health to include Email Ingestion.

Examples:

- Gmail Connected
- Last Successful Poll
- Emails Waiting
- Emails Processing
- Failed Emails
- Worker Status

Do NOT fabricate values.

Represent only actual platform state.

---

# Phase J — UI Improvements

Review Inbox UI.

Improve:

- Loading states
- Empty states
- Error states
- Email status visualization
- Attachment indicators
- Sync status
- Polling status
- Accessibility

Do NOT redesign the interface.

Polish it.

---

# Phase K — Worker Review

Review inbox-poller.

Ensure:

- Clean lifecycle
- Graceful shutdown
- Error recovery
- Retry safety
- Structured logging
- Timeout handling

Do not introduce BullMQ or Inngest.

That belongs to future production hardening.

---

# Phase L — Documentation

Update documentation.

Include:

- Email lifecycle
- Attachment lifecycle
- Polling flow
- Retry philosophy
- Duplicate prevention strategy

---

# Deliverables

Generate:

## Engineering Report

Include:

- Requirements completed
- Files modified
- Files created
- Architecture decisions
- UI improvements
- Reliability improvements
- Remaining technical debt

---

## Requirements Traceability Matrix (RTM)

For every requirement in:

docs/02-Email-Ingestion.md

Provide:

- Requirement
- Status
- Files implementing it
- Evidence

No requirement may be skipped.

---

## Readiness Report

State whether the platform is ready for:

Milestone 3 — Resume Processing & Candidate Creation

Provide justification.

---

# Constraints

Do NOT:

- Parse resumes
- Extract candidate data
- Call OpenAI
- Create candidates
- Score candidates
- Build Candidate Intelligence
- Build Recruiter Copilot
- Build Approval workflows

Only complete the Email Ingestion Engine.

---

# Validation Checklist

Before completion verify:

✓ Gmail OAuth still works

✓ Poller works

✓ Attachments download correctly

✓ Duplicate prevention works

✓ Email lifecycle works

✓ Email normalization works

✓ Worker remains stable

✓ Logging works

✓ Dashboard health reflects Email Ingestion

✓ Inbox UI remains functional

✓ TypeScript passes

✓ ESLint passes

✓ Production build succeeds

---

# Stop Condition

When every validation item passes:

STOP.

Do NOT continue into Resume Processing.

Generate:

1. Engineering Report

2. RTM

3. Email Ingestion Readiness Report

Wait for the next implementation sprint.