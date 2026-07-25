# Sprint 5 — Recruiter Copilot

## Role

You are the Lead AI Engineer responsible for implementing Milestone 5 (Recruiter Copilot).

The platform already supports:

✓ Authentication

✓ Organizations

✓ Email Ingestion

✓ Resume Processing

✓ Candidate Creation

✓ Candidate Intelligence

Your responsibility is NOT to build a generic chatbot.

Your responsibility is to build a context-aware AI Recruiting Copilot that helps recruiters understand candidates, prepare interviews, compare applicants, and make informed decisions using ONLY verified platform data.

---

# Primary Objective

Build an AI Recruiter Copilot.

The Copilot must answer recruiter questions using platform knowledge.

Every response must be:

- Context-aware
- Evidence-based
- Explainable
- Confidence-aware
- Grounded
- Auditable

The Copilot must never hallucinate.

---

# Mandatory Reading

Read:

docs/05-Recruiter-Copilot.md

Review Sprint 4 implementation.

Generate a Gap Analysis.

Mark each requirement:

- Complete
- Partial
- Missing

Implement ONLY missing requirements.

---

# Core Architecture

Implement the following logical architecture.

Recruiter

↓

Conversation

↓

Conversation Context Builder

↓

Candidate Knowledge Context

↓

Candidate Intelligence

↓

Retriever

↓

OpenAI

↓

Grounded Response

↓

Conversation Memory

↓

UI

The LLM must never query raw database records directly.

Always construct a clean recruiter context first.

---

# Phase A — Conversation Context Builder

Create a reusable Context Builder.

The Context Builder should assemble:

- Candidate Profile
- Resume Versions
- Candidate Intelligence
- Timeline
- Recruiter Notes
- Job Description (if available)
- Previous Conversation

This Context becomes the only input to the LLM.

---

# Phase B — Recruiter Chat

Create a professional recruiter chat experience.

Support conversations such as:

- Summarize this candidate
- Explain this recommendation
- What are the risks?
- What strengths stand out?
- What should I ask?
- Why is confidence low?
- Compare resume history
- Explain employment gaps

The Copilot should answer naturally.

---

# Phase C — Candidate Comparison

Support comparing two or more candidates.

Compare:

- Skills
- Experience
- Technologies
- Projects
- Career progression
- Missing information

The comparison must remain evidence-based.

Never rank candidates without explanation.

---

# Phase D — Interview Preparation

Generate recruiter-ready interview preparation.

Include:

- Technical questions
- Behavioral questions
- Follow-up questions
- Clarification questions

Every suggestion should reference supporting evidence.

---

# Phase E — Conversation Memory

Maintain conversation history.

Conversation memory should include:

- Previous recruiter questions
- Previous AI answers
- Current candidate
- Current job
- Current recruiter

Memory is scoped to the recruiter session.

---

# Phase F — Explainability

Every answer should include:

- Evidence
- Confidence
- Reasoning
- Missing information
- Limitations

The recruiter should always understand why the answer was produced.

---

# Phase G — Suggested Actions

After every response suggest useful recruiter actions.

Examples:

- Review portfolio
- Schedule phone screen
- Verify employment gap
- Request work authorization
- Conduct system design interview

These are suggestions only.

No execution.

---

# Phase H — Knowledge Governance

Ensure the Copilot only answers using verified platform knowledge.

Sources include:

- Candidate Profile
- Resume
- Candidate Intelligence
- Timeline
- Recruiter Notes
- Job Description

Do not answer using external assumptions.

---

# Phase I — UI

Build a professional Copilot panel.

Include:

- Chat history
- Suggested prompts
- Source references
- Confidence indicators
- Loading states
- Streaming responses
- Retry handling
- Empty states
- Error states

Design inspiration:

- Linear
- Cursor
- Vercel
- Notion AI

Avoid gimmicky UI.

Prioritize clarity.

---

# Phase J — Safety

The Copilot must never:

- Make hiring decisions
- Reveal protected characteristics
- Hallucinate evidence
- Access another organization's data
- Leak recruiter conversations

Always state when information is unavailable.

---

# Phase K — Observability

Extend Platform Health.

Track:

- Chat sessions
- Average latency
- Failed generations
- Confidence distribution
- Token usage
- Prompt version
- Retrieval failures

---

# Phase L — Documentation

Update documentation.

Include:

- Conversation Architecture
- Context Builder
- Memory Model
- Prompt Governance
- Explainability
- Knowledge Sources

---

# Deliverables

Generate:

1. Engineering Report

2. Requirements Traceability Matrix

3. Recruiter Copilot Readiness Report

---

# Constraints

Do NOT implement:

- Email sending
- Calendar scheduling
- Slack actions
- Pipeline updates
- Approval workflows
- Autonomous execution

The Copilot is advisory only.

---

# Validation Checklist

Verify:

✓ Recruiter chat works

✓ Context Builder works

✓ Memory works

✓ Candidate comparison works

✓ Interview preparation works

✓ Explainability works

✓ Confidence displayed

✓ Streaming responses work

✓ Source references shown

✓ Platform Health updated

✓ TypeScript passes

✓ ESLint passes

✓ Production build succeeds

---

# Stop Condition

When validation passes:

STOP.

Do NOT begin Approval & Execution.

Generate:

- Engineering Report

- RTM

- Recruiter Copilot Readiness Report

Wait for Sprint 6.