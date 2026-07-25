# Sprint 5.5 — Operational Architecture Refactoring

## Role

You are the Principal Software Architect responsible for refactoring the platform architecture before implementing the Approval & Execution Engine.

The platform currently supports:

- Authentication
- Organizations
- Email Ingestion
- Resume Processing
- Candidate Profiles
- Candidate Intelligence
- Recruiter Copilot

The Recruiter Copilot is currently capable of understanding candidates and generating recommendations.

Before any execution capabilities are introduced, the platform architecture must be upgraded to support safe, explainable, enterprise-grade AI operations.

This sprint is purely architectural.

Do NOT build new business features.

Do NOT implement workflow execution.

Do NOT implement approval logic.

Your objective is to introduce the operational abstractions that every future AI action will rely on.

---

# Primary Objective

Refactor the platform into an Action-Oriented Architecture.

The Copilot should never directly trigger business operations.

Instead, every recommendation must become a structured Action object that flows through a standardized operational pipeline.

---

# Target Architecture

Candidate

↓

Candidate Intelligence

↓

Recruiter Copilot

↓

Action Planner

↓

Approval Engine

↓

Execution Engine

↓

Integration Layer

↓

Audit Trail

---

# Architecture Principles

Every layer must have one responsibility.

No layer should perform another layer's responsibility.

The platform must remain:

- Explainable
- Auditable
- Modular
- Extensible
- Human Controlled

---

# Phase A — Introduce the Action Object

Create a reusable Action domain model.

The Action object represents every business operation proposed by AI.

It becomes the canonical operational unit across the platform.

Every future workflow should use this model.

The Action model should support:

## Identity

- Action ID
- Organization
- Candidate
- Recruiter
- Job
- Source

---

## Metadata

- Action Type
- Category
- Priority
- Risk Level
- Confidence
- Created At
- Updated At

---

## AI Context

- Recommendation
- Reasoning
- Supporting Evidence
- Confidence
- Prompt Version
- Intelligence Version

---

## Approval

- Approval Policy
- Approval Status
- Approver
- Approval Timestamp
- Rejection Reason

---

## Execution

- Execution Status
- Started At
- Completed At
- Retry Count
- Failure Reason
- External References

---

## Audit

- Created By
- Trigger Source
- Planner Version
- Execution Version

The Action object must be reusable for every future automation.

---

# Phase B — Action Planner

Introduce a dedicated Action Planner.

Responsibilities:

Receive Copilot recommendations.

Transform recommendations into structured Action objects.

Determine:

- Action type
- Required permissions
- Required integrations
- Risk level
- Approval policy
- Execution dependencies

The Action Planner must never execute actions.

It is responsible only for planning.

---

# Phase C — Execution Engine

Introduce a dedicated Execution Engine abstraction.

The Execution Engine must remain completely independent from AI.

Responsibilities:

Receive approved Actions.

Validate Actions.

Resolve dependencies.

Execute integrations.

Monitor execution.

Record outcomes.

Handle retries.

Generate execution reports.

The Execution Engine must never generate recommendations.

The Execution Engine must never call OpenAI.

---

# Phase D — Integration Layer

Create a reusable Integration Layer.

Every external system must be accessed through this layer.

Current integrations:

- Gmail
- Slack
- OpenAI
- Google Calendar (future)

Future integrations:

- Greenhouse
- Lever
- Ashby
- Workday
- BambooHR
- Microsoft Outlook
- Microsoft Teams
- Zoom
- Google Meet

Business logic must never call external APIs directly.

The Integration Layer becomes the single gateway for all external services.

---

# Phase E — Human in the Loop

Formalize Human-in-the-Loop architecture.

Every AI-generated Action must follow a governed approval process.

Approval architecture should support:

Recruiter

↓

Admin

↓

Future Auto Approval Policies

For the current implementation:

Every Action requires Recruiter approval.

Auto approval is architecture only.

No automatic execution should exist.

---

# Phase F — Action Lifecycle

Every Action must follow the same lifecycle.

Generated

↓

Validated

↓

Pending Approval

↓

Approved

↓

Executing

↓

Completed

OR

↓

Failed

↓

Retry

↓

Completed

Every transition must be recorded.

The lifecycle must be reusable across every Action type.

---

# Phase G — Execution Reports

Every completed Action must generate an immutable Execution Report.

Execution Reports should include:

- Action ID
- Action Type
- Candidate
- Recruiter
- Start Time
- End Time
- Duration
- Result
- Retry Count
- External Systems Used
- External IDs
- Logs
- Errors
- Warnings
- Final Status

Execution Reports must support future operational analytics.

---

# Phase H — Architectural Refactoring

Refactor the Recruiter Copilot to comply with the new architecture.

The Copilot must no longer create executable business operations.

Instead:

Recruiter Question

↓

Copilot Analysis

↓

Recommendation

↓

Action Planner

↓

Action Object

Stop here.

Execution belongs to Sprint 6.

---

# Phase I — Platform Health

Extend Platform Health to expose operational readiness.

Display:

- Actions Generated
- Pending Approval
- Executing
- Failed
- Completed
- Average Planning Time
- Average Execution Time (future)
- Integration Availability

Only represent actual platform state.

Do not fabricate metrics.

---

# Phase J — Documentation

Update project documentation.

Document:

- Action Architecture
- Action Object
- Action Planner
- Execution Engine
- Integration Layer
- Human Approval Model
- Action Lifecycle
- Execution Reports

Include architecture diagrams where appropriate.

---

# Constraints

Do NOT implement:

- Approval UI
- Email sending
- Calendar scheduling
- Slack execution
- Pipeline updates
- Autonomous execution
- Automatic approvals

This sprint establishes architecture only.

Business execution belongs to Sprint 6.

---

# Deliverables

Generate:

## Engineering Report

Include:

- Files Created
- Files Modified
- Architecture Decisions
- Refactoring Summary
- Design Improvements
- Future Compatibility

---

## Operational Architecture Report

Explain:

- Action Object
- Planner
- Execution Engine
- Integration Layer
- Human Approval
- Lifecycle

---

## Requirements Traceability Matrix

Provide implementation mapping for every requirement in this sprint.

---

## Sprint Readiness Report

State whether the platform is now architecturally ready for Sprint 6 (Approval & Execution Engine).

Include any remaining architectural risks.

---

# Validation Checklist

Verify:

✓ Action Object implemented

✓ Action Planner implemented

✓ Execution Engine abstraction implemented

✓ Integration Layer implemented

✓ Human Approval architecture defined

✓ Action Lifecycle implemented

✓ Execution Reports implemented

✓ Platform Health updated

✓ Existing Copilot functionality preserved

✓ TypeScript passes

✓ ESLint passes

✓ Production build succeeds

---

# Stop Condition

When all validation passes:

STOP.

Do NOT begin Sprint 6.

Generate:

1. Engineering Report

2. Operational Architecture Report

3. Requirements Traceability Matrix

4. Sprint 6 Readiness Report

Wait for the next implementation prompt.