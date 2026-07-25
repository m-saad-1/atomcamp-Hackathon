# Sprint 3 — Resume Processing & Candidate Creation

## Role

You are the Lead Software Engineer responsible for completing Milestone 3 (Resume Processing & Candidate Creation) of the AI Recruiting Operations Platform.

The previous sprint completed the Email Ingestion Engine.

Emails now enter the platform in a normalized form with attachments downloaded, lifecycle tracking, duplicate prevention, and audit logging.

Your responsibility is NOT to build Candidate Intelligence.

Your responsibility is to transform inbound resumes into structured Candidate Profiles that become the canonical source of truth for the rest of the platform.

---

# Primary Objective

Convert incoming recruiting documents into structured candidate records.

This sprint ends when every supported resume can be transformed into a validated Candidate Profile.

No AI reasoning, scoring, recommendations, or summaries should exist after this sprint.

---

# Mandatory Reading

Before implementation:

Read:

docs/03-Resume-Processing.md

Review Sprint 2 implementation.

Perform a Gap Analysis.

Mark every requirement:

- Complete
- Partial
- Missing

Implement ONLY Partial and Missing requirements.

---

# Phase A — Resume Processing Pipeline

Audit the current attachment pipeline.

Implement or complete:

- Resume discovery
- Resume validation
- Resume extraction
- OCR fallback
- Text normalization
- Metadata extraction
- Processing status

The pipeline should support future extensibility.

---

# Phase B — Supported Document Types

Support:

- PDF
- DOC
- DOCX
- TXT
- RTF

Unsupported files should be retained and flagged rather than discarded.

Scanned PDFs should invoke OCR where appropriate.

---

# Phase C — Candidate Identity

Create the canonical Candidate entity.

A candidate is NOT a resume.

The candidate should conceptually represent:

- Identity
- Contact information
- Resumes
- Applications
- Emails
- Timeline
- Documents
- Future interviews
- Recruiter notes

Prepare for long-term evolution.

---

# Phase D — Candidate Deduplication

Prevent duplicate candidates.

Evaluate identity using:

- Email
- Phone
- LinkedIn
- GitHub
- Candidate identifiers

Never create duplicates when confidence is high.

When uncertain, prefer manual review over incorrect merging.

---

# Phase E — Resume Extraction

Extract structured information only.

Examples include:

- Name
- Email
- Phone
- Address
- Skills
- Education
- Employment history
- Projects
- Certifications
- Languages
- Portfolio links
- LinkedIn
- GitHub

Do NOT infer information.

Only capture explicit evidence.

---

# Phase F — Candidate Timeline

Initialize candidate history.

Record:

- Resume received
- Email source
- Resume uploaded
- Candidate created
- Documents attached

Future milestones will extend this timeline.

---

# Phase G — Resume Versioning

Candidates may upload multiple resumes.

Support:

- Resume history
- Latest version
- Previous versions
- Source tracking

Never overwrite historical resumes.

---

# Phase H — Validation

Validate extracted information.

Check:

- Required fields
- Contact formatting
- Duplicate values
- Invalid dates
- Missing information

Do not silently discard invalid data.

---

# Phase I — Provenance

Every extracted field should retain provenance.

The system should always know:

- Which document produced the field.
- Which email produced the document.
- When it was extracted.

Future AI should never lose explainability.

---

# Phase J — UI Improvements

Improve Candidate pages.

Review:

- Candidate cards
- Empty states
- Resume indicators
- Multiple resumes
- Candidate timeline
- Processing status
- Accessibility
- Loading states
- Error states

Maintain the existing design language.

---

# Phase K — Resume Processing Health

Extend Platform Health.

Expose:

- Resumes waiting
- Processing
- Failed parsing
- OCR usage
- Candidate creation success
- Duplicate detection events

Represent actual state only.

---

# Phase L — Documentation

Update documentation.

Include:

- Resume lifecycle
- Candidate lifecycle
- Candidate entity model
- Resume versioning
- Deduplication strategy
- Provenance model

---

# Deliverables

Generate:

## Engineering Report

Include:

- Features implemented
- Files modified
- Files created
- Architecture decisions
- UI improvements
- Remaining technical debt

---

## Requirements Traceability Matrix

Compare implementation against:

docs/03-Resume-Processing.md

For every requirement provide:

- Requirement
- Status
- Files
- Evidence

---

## Candidate Readiness Report

Determine whether the platform is ready for:

Milestone 4 — Candidate Intelligence Engine

Provide justification.

---

# Constraints

Do NOT implement:

- Candidate scoring
- Candidate summaries
- OpenAI recommendations
- Interview questions
- Recruiter Copilot
- Approval Engine

No AI reasoning belongs in this sprint.

---

# Validation Checklist

Verify:

✓ Resume extraction works

✓ OCR fallback works

✓ Candidate creation works

✓ Duplicate detection works

✓ Resume versioning works

✓ Timeline works

✓ Provenance exists

✓ Platform health updated

✓ Candidate UI updated

✓ TypeScript passes

✓ ESLint passes

✓ Production build succeeds

---

# Stop Condition

When all validation passes:

STOP.

Do NOT begin Candidate Intelligence.

Generate:

1. Engineering Report

2. RTM

3. Candidate Readiness Report

Wait for the next sprint.