# Sprint 4 — Candidate Intelligence Engine

## Role

You are the Lead AI Software Engineer responsible for implementing Milestone 4 (Candidate Intelligence Engine).

The platform already supports:

✓ Authentication

✓ Organizations

✓ Email Ingestion

✓ Resume Processing

✓ Candidate Creation

✓ Resume Versioning

✓ Duplicate Resolution

Your responsibility is NOT to redesign previous work.

Your responsibility is to transform structured candidate data into recruiter-ready intelligence.

This sprint establishes the platform's primary competitive advantage.

---

# Primary Objective

Build the Candidate Intelligence Engine.

The engine must analyze structured candidate information and generate explainable recruiting intelligence.

It should reduce recruiter review time while maintaining complete transparency.

The system assists recruiters.

It never replaces recruiter judgement.

---

# Mandatory Reading

Read before implementation:

docs/04-Candidate-Intelligence.md

Review Sprint 3 implementation.

Produce a complete Gap Analysis.

For every requirement mark

Complete

Partial

Missing

Implement only Partial and Missing items.

---

# Engineering Principles

Every AI conclusion must be:

Evidence-based

Explainable

Confidence-aware

Deterministic

Auditable

Never hallucinate.

Never fabricate information.

Never infer protected characteristics.

---

# Phase A — Intelligence Pipeline

Create the Candidate Intelligence pipeline.

Conceptually

Candidate Profile

↓

Context Builder

↓

Evidence Collection

↓

OpenAI Structured Analysis

↓

Validation

↓

Candidate Intelligence

↓

Persistence

↓

Recruiter UI

The pipeline should remain modular.

---

# Phase B — Intelligence Model

Candidate Intelligence must exist independently from Candidate Profiles.

Do NOT store AI-generated reasoning directly inside Candidate records.

Introduce a dedicated Intelligence model.

Conceptually include

Executive Summary

Overall Recommendation

Confidence

Strengths

Weaknesses

Evidence

Missing Information

Interview Topics

Technical Assessment

Experience Assessment

Leadership Indicators

Communication Indicators

Career Progression

Risk Indicators

Next Recommended Action

Future intelligence versions should coexist.

---

# Phase C — Evidence Engine

Every conclusion must reference supporting evidence.

Example

Strength

"Built distributed systems"

Evidence

Projects → Inventory Platform

Work History → Senior Backend Engineer

Never produce unsupported conclusions.

---

# Phase D — Confidence Engine

Every generated section should expose confidence.

Confidence must be based on

Available evidence

Completeness

Consistency

Resume quality

Never imply certainty.

---

# Phase E — Missing Information Detection

Identify missing information such as

Portfolio

GitHub

Work Authorization

Recent Employment

Salary Expectations

Availability

Certifications

The engine should explicitly state when information is unavailable.

---

# Phase F — Technical Assessment

Generate structured assessments covering

Technologies

Frameworks

Architecture Exposure

Cloud Experience

Testing

Databases

Backend

Frontend

DevOps

AI/ML (if present)

Only use explicit evidence.

---

# Phase G — Experience Assessment

Evaluate

Career progression

Years of experience

Domain exposure

Role growth

Industry experience

Again

No hallucinations.

---

# Phase H — Strengths & Weaknesses

Generate

Evidence-backed strengths.

Evidence-backed weaknesses.

Unknown information should never become a weakness.

Missing ≠ Weak.

---

# Phase I — Interview Preparation

Generate recruiter-ready interview preparation.

Examples

Suggested technical topics

Behavioral questions

Areas requiring validation

Knowledge gaps

These are recommendations.

Not decisions.

---

# Phase J — Candidate Recommendation

Generate one recommendation.

Examples

Strong Match

Recommended for Screening

Needs More Information

Limited Match

Not Recommended

Every recommendation must include

Evidence

Confidence

Reasoning

Limitations

---

# Phase K — Candidate Intelligence UI

Create a professional Intelligence View.

Display

Executive Summary

Recommendation

Confidence

Strengths

Weaknesses

Evidence

Missing Information

Interview Topics

Timeline

Resume Versions

Processing Status

The UI should feel comparable to

Linear

Vercel

Stripe

Notion

No flashy animations.

Prioritize readability.

---

# Phase L — Explainability

Every AI section should expose

Why

Evidence

Confidence

Limitations

Recruiters must never receive black-box AI.

---

# Phase M — Prompt Governance

Version prompts.

Store

Prompt Version

Model

Temperature

Created Date

Changes

Future prompt improvements should remain traceable.

---

# Phase N — Validation

Validate every OpenAI response using strict schemas.

Reject malformed responses.

Never persist invalid intelligence.

---

# Phase O — Health

Extend Platform Health.

Expose

Profiles analyzed

Analysis failures

Average latency

Confidence distribution

Prompt failures

Validation failures

---

# Phase P — Documentation

Update documentation.

Include

Intelligence Pipeline

Evidence Engine

Confidence Model

Explainability

AI Governance

Prompt Versioning

---

# Deliverables

Generate

Engineering Report

Requirements Traceability Matrix

Candidate Intelligence Readiness Report

---

# Constraints

Do NOT implement

Recruiter Chat

Approval Engine

Email Drafting

Calendar

Slack Actions

Workflow Execution

Autonomous Decisions

Those belong to later sprints.

---

# Validation Checklist

Verify

✓ Candidate Intelligence generated

✓ Evidence attached

✓ Confidence calculated

✓ Strengths generated

✓ Weaknesses generated

✓ Missing Information generated

✓ Recommendation generated

✓ Explainability available

✓ Prompt version stored

✓ Validation succeeds

✓ Platform Health updated

✓ TypeScript passes

✓ ESLint passes

✓ Production build succeeds

---

# Stop Condition

When all validation passes

STOP.

Do NOT begin Recruiter Copilot.

Generate

1. Engineering Report

2. Requirements Traceability Matrix

3. Candidate Intelligence Readiness Report

Wait for Sprint 5.