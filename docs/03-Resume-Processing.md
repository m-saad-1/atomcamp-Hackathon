# 03 – Resume Processing & Candidate Creation

Version: 1.0

Status: Approved

Priority: Critical

Dependencies:

- 01-Foundation
- 02-Email-Ingestion

---

# Executive Summary

The Resume Processing & Candidate Creation Engine transforms normalized recruiting emails and their attachments into structured Candidate Profiles.

This milestone bridges the gap between raw recruiting documents and the platform's internal recruiting data model.

The output of this milestone is **structured, validated candidate data**.

It is NOT hiring intelligence.

It does NOT evaluate candidates.

It does NOT rank candidates.

It does NOT generate recommendations.

Those responsibilities belong to the Candidate Intelligence Engine (Milestone 4).

---

# Vision

Every candidate entering the platform should become a structured business entity.

Regardless of:

- resume layout
- formatting
- document type
- writing style

the platform should consistently create a normalized Candidate Profile.

The profile should become the canonical source of truth for all future recruiter interactions.

---

# Scope

Included

- Resume discovery
- Resume validation
- Document extraction
- OCR fallback
- Structured extraction
- Candidate creation
- Candidate deduplication
- Resume versioning
- Candidate timeline
- Document provenance
- Validation
- Processing status
- Manual duplicate review

Excluded

- Candidate scoring
- Candidate ranking
- Strength analysis
- Weakness analysis
- Executive summaries
- Candidate recommendations
- Recruiter Copilot
- Approval Engine

---

# Core Philosophy

A Candidate is NOT a Resume.

A resume is simply one document belonging to a candidate.

A candidate may eventually contain:

- multiple resumes
- emails
- recruiter notes
- interview history
- assessments
- applications
- hiring decisions

Therefore the Candidate entity must exist independently of any individual resume.

---

# Candidate Lifecycle

Every candidate progresses through a predictable lifecycle.

```
Email Received

↓

Attachment Downloaded

↓

Resume Validated

↓

Text Extracted

↓

OCR (if required)

↓

Structured Extraction

↓

Candidate Matching

↓

Candidate Created / Updated

↓

Ready for Candidate Intelligence
```

---

# Resume Processing Pipeline

The processing pipeline consists of four logical stages.

## Stage 1

Document Validation

Responsibilities

- supported file detection
- corruption detection
- file integrity
- metadata collection

---

## Stage 2

Text Extraction

Responsibilities

Extract raw text.

Supported technologies may include

- pdf-parse
- mammoth
- native text readers

No AI reasoning occurs here.

---

## Stage 3

OCR Fallback

Only invoked when the document contains insufficient machine-readable text.

Recommended technology

- tesseract.js

OCR should ONLY return text.

OCR must never generate candidate fields.

---

## Stage 4

Structured Extraction

This stage converts raw text into structured JSON.

AI MAY be used here.

However the AI acts ONLY as a structured extraction engine.

Allowed

- JSON Mode
- Structured Outputs
- Entity Extraction

Forbidden

- Candidate scoring
- Candidate evaluation
- Hiring recommendations
- Executive summaries
- Interview suggestions
- Skill ratings
- Strength analysis
- Weakness analysis

The output must be deterministic structured data.

---

# Candidate Schema

The canonical candidate should support:

## Identity

- Full Name
- Preferred Name
- Email
- Phone

---

## Professional

- Current Role
- Years of Experience
- Professional Summary

---

## Skills

- Technical Skills
- Tools
- Frameworks
- Languages

Only explicit skills.

Never infer.

---

## Employment

Multiple jobs

Each should include

- Company
- Title
- Start Date
- End Date
- Description

---

## Education

Support multiple records

- Institution
- Degree
- Field
- Dates

---

## Certifications

Support multiple certifications.

---

## Projects

Support multiple projects.

Each project may include

- Title
- Description
- Technologies

---

## Links

- LinkedIn
- GitHub
- Portfolio
- Website

---

## Languages

Support multiple spoken languages.

---

## Attachments

Every candidate maintains references to all uploaded documents.

---

# Candidate Deduplication

Duplicate candidates should be minimized.

Identity signals include:

- Email
- Phone
- LinkedIn
- GitHub

High confidence duplicates

Automatically merge.

Medium confidence

Flag for recruiter review.

Low confidence

Create a new candidate.

---

# Manual Review

When duplicate confidence is uncertain

Create a lightweight review interface.

Actions

- Merge
- Create New Candidate
- Review Later

Complex merge workflows are outside the scope of this milestone.

---

# Resume Versioning

Every uploaded resume should be preserved.

The platform must support

- Original upload
- Latest version
- Historical versions
- Source email

Historical resumes must never be overwritten.

---

# Candidate Timeline

Every candidate begins with a timeline.

Events include

- Resume received
- Resume processed
- Candidate created
- Duplicate review
- Resume updated

Future milestones will append interview events.

---

# Provenance

Every extracted field should retain provenance.

Examples

Email

↓

Attachment

↓

Resume

↓

Field

The system should always know where a field originated.

---

# Validation

Validate

- Email format
- Phone format
- Dates
- Duplicate values
- Required fields

Unknown information should remain Unknown.

Never fabricate data.

---

# AI Usage Policy

Permitted

- OCR
- Structured Outputs
- JSON extraction
- Entity extraction
- Normalization

Forbidden

- Candidate Intelligence
- Candidate Score
- Ranking
- Recommendations
- Interview questions
- Recruiter advice
- Executive summaries

---

# Privacy

Candidate data is confidential.

The platform should

- preserve organization isolation
- protect resumes
- support future deletion
- support future export

---

# Platform Health

Expose operational metrics

- Resumes Waiting
- Parsing
- OCR Running
- Failed Parsing
- Candidate Creation Success
- Duplicate Reviews Pending

Represent actual system state only.

---

# UI Requirements

Candidate pages should support

- Resume indicator
- Multiple resumes
- Processing status
- Timeline
- Duplicate review
- Empty state
- Loading state
- Error state

Maintain the existing SaaS design language.

---

# Performance

The processing engine should

- process resumes predictably
- avoid duplicate work
- recover gracefully
- preserve uploaded documents

---

# Deliverables

At completion

The platform should provide

- Resume Processing
- OCR fallback
- Structured Candidate Profiles
- Candidate Deduplication
- Resume Versioning
- Candidate Timeline
- Provenance
- Validation
- Duplicate Review UI

---

# Success Criteria

The milestone is successful when

- supported resumes produce candidate profiles
- duplicate candidates are minimized
- OCR functions correctly
- resumes remain versioned
- provenance exists
- timelines are initialized

Candidate Intelligence has NOT yet been implemented.

---

# Definition of Done

This milestone is complete only when

✓ Candidate Profiles are created successfully

✓ Resume Versioning works

✓ Duplicate Detection works

✓ OCR fallback works

✓ Candidate Timeline works

✓ Provenance is preserved

✓ Validation succeeds

✓ Platform Health updated

✓ Documentation updated

✓ Existing functionality preserved

✓ TypeScript passes

✓ ESLint passes

✓ Production build succeeds

The platform is now ready for

Milestone 4

Candidate Intelligence Engine.