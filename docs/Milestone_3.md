# Milestone 3 — Resume Processing & Candidate Creation

**Version:** 1.0
**Status:** Ready for Development
**Priority:** Critical
**Dependencies:**

* ✅ Milestone 1 – Core Platform Foundation
* ✅ Milestone 2 – Email Ingestion Engine

---

# Executive Summary

The purpose of this milestone is to transform raw recruiting emails into structured candidate profiles.

The Email Ingestion Engine has already ensured that emails and attachments are securely collected and normalized.

This milestone introduces the first stage of **candidate understanding**, but **not intelligence**.

The responsibility of this milestone is to extract structured information from resumes and candidate communications, validate the extracted data, and establish the canonical candidate record within the platform.

It intentionally stops before interpretation, scoring, or recommendations.

---

# Purpose

The Resume Processing & Candidate Creation Engine serves as the bridge between unstructured candidate documents and structured recruiting data.

Its mission is to ensure that every candidate entering the platform has:

* A unified identity
* A validated profile
* Normalized information
* Traceable source documents
* Complete processing history

No hiring recommendations or AI insights should be generated in this milestone.

---

# Vision

Every candidate should exist as **one trusted source of truth** regardless of how many emails, resumes, or applications they submit.

The system should consolidate information into a single evolving candidate profile while preserving historical records and provenance.

---

# Scope

## Included

* Resume extraction
* Resume normalization
* OCR fallback for scanned documents
* Candidate identity resolution
* Candidate creation
* Candidate deduplication
* Resume version tracking
* Candidate document management
* Contact information extraction
* Education extraction
* Employment history extraction
* Skills extraction
* Certifications extraction
* Projects extraction
* Languages extraction
* Portfolio link extraction
* LinkedIn/GitHub extraction
* Candidate timeline initialization
* Processing validation

---

## Excluded

* AI strengths analysis
* Candidate scoring
* Hiring recommendation
* Recruiter Copilot
* Interview questions
* Candidate ranking
* Decision engine

Those belong to the Candidate Intelligence Engine.

---

# Objectives

At the end of this milestone the platform should:

* Accept resumes from email attachments.
* Parse supported resume formats.
* Recover text from scanned resumes using OCR where necessary.
* Normalize extracted information into a consistent structure.
* Detect duplicate candidates.
* Merge new information into existing candidate records where appropriate.
* Preserve all original documents.
* Create a complete candidate profile.
* Record the provenance of all extracted information.

---

# Candidate Creation Philosophy

A candidate is **not just a resume**.

A candidate is an evolving entity composed of:

* Personal information
* Contact information
* Multiple resumes
* Emails
* Applications
* Recruiter interactions
* Historical versions
* Supporting documents

Every future interaction enriches the same candidate rather than creating duplicates.

---

# Resume Processing Philosophy

Resume processing is a **data extraction problem**, not an evaluation problem.

The goal is to identify explicit information provided by the candidate without adding interpretation.

The system should faithfully capture what is present while clearly distinguishing unknown or missing information.

---

# Supported Input Sources

The engine should conceptually support resumes originating from:

* Email attachments
* Candidate uploads
* Career site submissions
* Recruiter uploads
* Agency imports
* Future ATS integrations

Although implementation begins with email attachments, the design should remain source-agnostic.

---

# Supported Document Types

The engine should support common recruiting documents including:

* PDF resumes
* DOC and DOCX resumes
* Plain text resumes
* Cover letters
* Portfolio documents

Scanned PDFs should be recoverable through OCR where feasible.

Unsupported document types should be retained but flagged for manual review.

---

# Resume Lifecycle

Each resume progresses through a defined lifecycle:

```text
Received
↓
Validated
↓
Text Extraction
↓
OCR (if required)
↓
Structured Extraction
↓
Normalization
↓
Validation
↓
Candidate Matching
↓
Candidate Created / Updated
↓
Archived
```

Every transition should be auditable.

---

# Candidate Identity Resolution

The system should determine whether incoming information belongs to:

* A new candidate
* An existing candidate
* A candidate requiring manual review

Identity resolution should consider multiple identifiers rather than relying solely on email addresses.

When uncertainty exists, the platform should prefer human review over incorrect automatic merging.

---

# Candidate Profile Philosophy

Every candidate profile should represent the most complete, current, and validated understanding of the candidate.

Profiles should evolve over time without losing historical information.

Original resumes and extracted data should remain traceable.

---

# Candidate Data Categories

The platform should extract and organize, where available:

* Personal information
* Contact details
* Professional summary
* Technical skills
* Soft skills (explicitly stated only)
* Employment history
* Education
* Certifications
* Projects
* Publications
* Languages
* Awards
* Portfolio links
* GitHub
* LinkedIn
* Availability
* Work authorization (only if explicitly provided)
* Location preferences
* Salary expectations (if explicitly provided)

Missing fields should remain unknown rather than inferred.

---

# Resume Versioning

Candidates may submit updated resumes over time.

The platform should preserve:

* Original versions
* Upload dates
* Source emails
* Historical changes

The latest validated resume should become the primary profile while preserving earlier submissions.

---

# Candidate Timeline Initialization

Upon successful candidate creation, an initial timeline should be established.

The timeline records:

* First contact
* Resume received
* Profile created
* Source email
* Attached documents
* Future interactions

This becomes the foundation for long-term candidate history.

---

# Validation Philosophy

Extracted information should be validated for:

* Completeness
* Internal consistency
* Format correctness
* Required fields
* Duplicate values

Validation failures should be surfaced clearly without silently discarding data.

---

# Data Provenance

Every extracted field should retain a conceptual link to its originating document.

This enables:

* Explainability
* Traceability
* Future auditing
* Manual verification

---

# Duplicate Handling

Duplicate candidate records should be avoided.

When potential duplicates are detected:

* Automatically merge only when confidence is high.
* Escalate ambiguous cases for recruiter review.

The platform should never silently overwrite candidate information.

---

# Privacy Principles

Candidate information is sensitive personal data.

The platform should:

* Respect organizational boundaries.
* Protect resumes and extracted information.
* Minimize unnecessary retention.
* Support future deletion and export requests.

---

# Reliability Goals

The Resume Processing Engine should:

* Process every supported document reliably.
* Recover gracefully from parsing failures.
* Never lose uploaded documents.
* Preserve original files even when extraction fails.

---

# Performance Goals

Conceptual targets include:

* Efficient processing of typical resume documents.
* Predictable handling of large attachments.
* Scalable throughput for growing recruiter workloads.

---

# Observability

Operational visibility should include:

* Resumes received
* Parsing success rate
* OCR usage
* Validation failures
* Candidate creation rate
* Duplicate detection events
* Processing duration
* Manual review requirements

---

# Risks

Potential risks include:

* Corrupted documents
* Poor OCR quality
* Ambiguous identities
* Missing contact information
* Unsupported formats
* Duplicate candidates
* Parsing inconsistencies

Mitigation strategies should favor correctness over automation.

---

# Deliverables

At the completion of this milestone, the platform should provide:

* Reliable resume extraction
* OCR fallback capability
* Structured candidate profiles
* Candidate deduplication
* Resume version tracking
* Candidate timelines
* Document provenance
* Validation reporting
* Auditability

---

# Success Metrics

Success should be measured by:

* High resume parsing success rate.
* Low duplicate candidate creation.
* Reliable OCR recovery where applicable.
* Accurate candidate profile creation.
* Complete traceability from document to profile.

---

# Acceptance Criteria

Milestone 3 is complete only if:

* Supported resume formats are processed successfully.
* Scanned documents can be handled through OCR or appropriately flagged.
* Every candidate has a unified profile.
* Duplicate candidates are minimized.
* Resume history is preserved.
* Candidate timelines are initialized.
* Validation issues are surfaced.
* Original documents remain available.
* Existing platform functionality remains unaffected.
* No placeholder implementations remain.

---

# Definition of Done

This milestone is considered complete when:

1. All objectives have been satisfied.
2. Every acceptance criterion has been met.
3. Candidate profiles are consistently created from inbound resumes.
4. Resume history and provenance are preserved.
5. The platform is ready for **Milestone 4 – Candidate Intelligence Engine**.
6. The coding agent produces a completion report including:

   * Components implemented
   * Data extraction coverage
   * Validation results
   * Parsing limitations
   * Risks identified
   * Remaining technical debt
   * Readiness assessment for the next milestone

---

## Final Instructions to the Coding Agent

Before implementation:

1. Audit the existing resume processing and candidate management components already present in the codebase.
2. Reuse existing parsers, storage mechanisms, and models where appropriate.
3. Avoid duplicate extraction pipelines.
4. Preserve backward compatibility with Milestones 1 and 2.
5. Focus exclusively on transforming unstructured documents into validated candidate records.
6. Do **not** implement candidate scoring, recommendations, AI insights, or conversational features in this milestone.
7. Treat this specification as the authoritative contract for candidate creation before any intelligence or decision-support capabilities are introduced.

---

### Recommended sequence after this

The remaining roadmap becomes:

1. ✅ Milestone 1 — Core Platform Foundation
2. ✅ Milestone 2 — Email Ingestion Engine
3. ✅ Milestone 3 — Resume Processing & Candidate Creation
4. **Milestone 4 — Candidate Intelligence Engine** (AI summaries, strengths, weaknesses, recommendations, confidence)
5. **Milestone 5 — Recruiter Copilot**
6. **Milestone 6 — Approval & Execution Engine**
7. **Milestone 7 — Production Readiness & Hardening**
8. **Milestone 8 — SaaS Readiness & Enterprise Features**
9. **Milestone 9 — Deployment, Operations & Monitoring**

This order minimizes dependencies and ensures each milestone produces a complete, testable increment of the platform.
