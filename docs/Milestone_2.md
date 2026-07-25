# Milestone 2 — Email Ingestion Engine

**Version:** 1.0
**Status:** Ready for Development
**Priority:** Critical
**Dependencies:** Milestone 1 – Core Platform Foundation (Completed)

---

# Purpose

The purpose of this milestone is to establish a reliable, secure, and fault-tolerant email ingestion pipeline.

This milestone transforms the platform from an authenticated SaaS application into an active recruiting operations system by continuously monitoring recruiter inboxes and converting inbound recruiting emails into structured platform events.

**No AI analysis or candidate intelligence should occur in this milestone.**

The responsibility of this milestone is to **receive, normalize, validate, store, and track emails**.

---

# Vision

The Email Ingestion Engine is the platform's first operational component.

It should function as a reliable intake system that never loses emails, prevents duplicates, safely downloads attachments, and prepares data for downstream AI processing.

Every email should move through a predictable lifecycle and remain fully traceable.

---

# Scope

### Included

* Gmail inbox polling
* Email synchronization
* Duplicate detection
* Email normalization
* Attachment discovery
* Attachment download
* Metadata extraction
* Email lifecycle management
* Processing status tracking
* Retry handling
* Audit logging
* Error recovery

### Excluded

* Resume parsing
* OCR
* OpenAI analysis
* Candidate creation
* Candidate scoring
* Copilot
* Approval workflow
* Slack notifications
* Calendar integration

---

# Objectives

By the end of this milestone, the system should:

* Connect to recruiter inboxes.
* Detect new recruiting emails.
* Download email metadata.
* Download all supported attachments.
* Store raw email data.
* Prevent duplicate processing.
* Maintain processing history.
* Track email status.
* Recover from temporary failures.
* Provide operational visibility.

---

# Core Responsibilities

The Email Ingestion Engine is responsible for:

* Inbox monitoring
* Email synchronization
* Email normalization
* Attachment management
* Storage
* Queue preparation
* Status management
* Error recovery

It is **not responsible** for interpreting or analyzing content.

---

# Email Lifecycle

Every email should move through a clearly defined lifecycle.

```text
Received

↓

Discovered

↓

Validated

↓

Stored

↓

Attachments Downloaded

↓

Ready for AI Processing

↓

Processed (Future Milestone)

or

Failed

↓

Retry

↓

Completed
```

Every transition should be recorded.

---

# Email Discovery Philosophy

The platform should continuously monitor connected recruiter inboxes.

The system should:

* discover newly received recruiting emails
* avoid unnecessary polling
* never miss incoming messages
* tolerate temporary Gmail outages
* recover automatically

---

# Email Normalization

Before any downstream processing, every email should be normalized into a consistent internal representation.

Regardless of formatting differences, the platform should consistently identify:

* sender
* recipients
* subject
* body
* timestamp
* attachments
* thread
* message identifier

---

# Duplicate Prevention

Duplicate processing is unacceptable.

Every email must have a unique platform identity.

Duplicate detection should consider:

* Gmail Message ID
* Thread ID
* Internal processing state

The system should guarantee that a single email cannot create multiple processing records.

---

# Email Classification (Routing Only)

At this stage, the system should perform **routing**, not AI interpretation.

Conceptually identify whether the email belongs to categories such as:

* Candidate Application
* Recruiter Communication
* Internal Discussion
* Interview Scheduling
* Unknown

This routing exists only to determine future processing paths.

No AI-generated conclusions should be made.

---

# Attachment Management

The Email Ingestion Engine is responsible for discovering and downloading attachments.

Supported attachment categories include:

* PDF resumes
* DOC/DOCX resumes
* Cover letters
* Portfolios
* Other recruiter documents

Attachments should be linked to the originating email and prepared for later processing.

---

# Attachment Lifecycle

Each attachment should progress through its own lifecycle:

```text
Discovered

↓

Validated

↓

Downloaded

↓

Stored

↓

Ready for Processing

↓

Processed (Future)

or

Failed
```

---

# Email Status Model

Every email should expose a clear processing status.

Example conceptual states:

* New
* Downloaded
* Normalized
* Attachments Ready
* Waiting for AI
* Processing
* Completed
* Failed
* Archived

Status changes should be visible for monitoring and troubleshooting.

---

# Retry Philosophy

Transient failures should not result in permanent data loss.

The system should:

* retry recoverable failures
* distinguish temporary vs permanent failures
* avoid infinite retry loops
* preserve processing history

Retries should be observable and auditable.

---

# Idempotency Principles

Every ingestion action must be safe to repeat.

Re-running the ingestion process should never:

* duplicate emails
* duplicate attachments
* create inconsistent state
* lose metadata

---

# Queue Preparation

This milestone prepares downstream work.

Instead of immediately invoking AI, the system should place validated emails into a conceptual processing queue for the Candidate Intelligence Engine.

---

# Auditability

Every significant event should be recorded.

Examples include:

* Email discovered
* Email stored
* Attachment downloaded
* Retry initiated
* Processing completed
* Failure encountered

Audit records should support operational troubleshooting.

---

# Security Principles

The Email Ingestion Engine must:

* respect Gmail authorization scopes
* protect email content
* secure attachment storage
* prevent unauthorized access
* isolate organization data

Sensitive candidate information must be treated as confidential.

---

# Privacy Principles

Emails and attachments may contain personally identifiable information (PII).

The system should:

* minimize unnecessary data exposure
* enforce organization isolation
* retain only required information
* support future deletion policies

---

# Reliability Goals

The engine should prioritize:

* no lost emails
* deterministic processing
* graceful failure handling
* automatic recovery
* predictable state transitions

---

# Performance Goals

Target operational expectations:

* New email detection within defined polling interval.
* Attachment retrieval without blocking other inbox operations.
* Efficient synchronization for growing inbox sizes.
* Stable performance under concurrent recruiter activity.

---

# Observability

Operational visibility should include:

* Last successful sync
* Emails processed
* Failed ingestions
* Pending emails
* Retry counts
* Attachment download success
* Queue depth
* Processing latency

---

# Integration Boundaries

This milestone interacts conceptually with:

### Gmail

Source of inbound emails.

### Database

Persistent storage for email records.

### Candidate Intelligence Engine

Consumer of normalized emails.

### Approval Engine

Not used in this milestone.

### Recruiter Copilot

Not used in this milestone.

---

# Risks

Potential risks include:

* Gmail API downtime
* OAuth expiration
* Duplicate processing
* Large attachments
* Corrupted attachments
* Network interruptions
* Incomplete synchronization
* Rate limiting

Mitigation strategies should be documented before implementation.

---

# Deliverables

At the completion of this milestone, the platform should provide:

* Reliable inbox synchronization
* Email normalization
* Attachment management
* Duplicate prevention
* Processing status tracking
* Retry capability
* Audit logging
* Queue-ready email records
* Operational visibility

---

# Success Metrics

Success should be measured by:

* No lost emails.
* No duplicate processing.
* Reliable attachment retrieval.
* Consistent processing state.
* Successful recovery from transient failures.
* Clear operational monitoring.

---

# Acceptance Criteria

Milestone 2 is complete only if:

* New recruiter emails are consistently detected.
* Duplicate emails are never created.
* Supported attachments are downloaded successfully.
* Every email has a traceable lifecycle.
* Processing status is visible.
* Failures are logged and recoverable.
* Retry behavior is documented.
* Queue-ready records are created for downstream AI processing.
* Existing platform functionality remains unaffected.
* No placeholder implementations remain.

---

# Definition of Done

This milestone is considered complete when:

1. All objectives have been satisfied.
2. Every acceptance criterion has been met.
3. Email ingestion is reliable and auditable.
4. The platform is ready for **Milestone 3 – Resume Processing & Candidate Creation**.
5. The coding agent produces a completion report including:

   * Features implemented
   * Components reused
   * Files added or modified
   * Operational risks
   * Validation performed
   * Remaining technical debt
   * Readiness assessment for the next milestone

---

## Final Instructions to the Coding Agent

Before implementation:

1. Audit the current email ingestion functionality already present in the codebase.
2. Reuse existing Gmail integration wherever possible.
3. Avoid introducing duplicate ingestion logic.
4. Maintain backward compatibility with Milestone 1.
5. Implement only the responsibilities defined in this document.
6. Do **not** begin resume parsing, AI extraction, or candidate creation—those belong to the next milestone.
7. Consider this specification the authoritative contract for Email Ingestion before any intelligence or automation layers are introduced.
