# Architectural Improvement — Recruiter Copilot Context Pipeline

## Objective

Before implementing the Recruiter Copilot, refactor the conversational architecture to introduce a dedicated Context Layer.

The Recruiter Copilot must never communicate directly with the database or raw candidate records.

Instead, all responses must be generated from a structured context assembled by dedicated services.

This architecture improves modularity, explainability, scalability, and future RAG integration.

---

# Target Architecture

Candidate Profile

↓

Candidate Intelligence

↓

Knowledge Context Builder

↓

Conversation Context Builder

↓

Prompt Orchestrator

↓

LLM

↓

Response Validator

↓

Conversation Memory

↓

Recruiter Response

---

# Responsibilities

## Candidate Profile

Contains verified structured information.

Examples:

- Personal information
- Skills
- Employment history
- Education
- Certifications
- Projects
- Resume versions
- Timeline
- Documents

This layer contains facts only.

No AI reasoning.

---

## Candidate Intelligence

Contains AI-generated analysis.

Examples:

- Executive Summary
- Technical Assessment
- Experience Assessment
- Confidence
- Recommendation
- Strengths
- Weaknesses
- Missing Information
- Risk Indicators
- Interview Topics

This layer must remain versioned.

The Candidate Profile must never be modified by AI reasoning.

---

## Knowledge Context Builder

This service converts Candidate Profile and Candidate Intelligence into a normalized knowledge model.

Responsibilities:

- Merge structured candidate facts
- Merge latest intelligence
- Remove duplicate information
- Normalize terminology
- Preserve evidence references
- Build reusable knowledge context

The output should be independent of any LLM.

Future knowledge sources may include:

- Recruiter Notes
- Interview Feedback
- ATS Activity
- GitHub Analysis
- Portfolio Analysis
- Coding Assessments

The architecture must support these without redesign.

---

## Conversation Context Builder

The Conversation Context Builder prepares only the information relevant to the current recruiter question.

Responsibilities:

Determine:

- Current recruiter
- Current organization
- Current candidate
- Current job
- Current conversation
- Current permissions

Assemble:

- Relevant candidate knowledge
- Relevant intelligence
- Previous conversation turns
- Related recruiter notes
- Current job description (if available)

Return a compact, optimized context package.

Avoid sending unnecessary information to the LLM.

---

## Prompt Orchestrator

The Prompt Orchestrator is responsible for constructing the final system prompt.

Responsibilities:

- Apply prompt template
- Inject context
- Inject recruiter question
- Inject confidence requirements
- Inject evidence requirements
- Select prompt version
- Select model configuration

The Prompt Orchestrator must be reusable across future AI agents.

---

## LLM

The language model should have only one responsibility:

Generate an answer.

The LLM must never:

- Access the database
- Perform retrieval
- Read candidate records directly
- Access external APIs
- Store memory

The LLM receives only the context package produced by the Context Builder.

---

## Response Validator

Every AI response must be validated before reaching recruiters.

Validation includes:

- Schema validation
- Confidence validation
- Evidence validation
- Missing citation detection
- Empty section detection
- Hallucination prevention
- Required field validation

Invalid responses should never be persisted or displayed.

---

## Conversation Memory

Conversation Memory stores recruiter interactions.

Memory should include:

- Recruiter
- Organization
- Candidate
- Job
- Conversation history
- Previous AI responses

Memory should remain isolated by organization.

Conversation Memory should not become part of Candidate Intelligence.

---

## Recruiter Response

Only validated responses should reach the recruiter.

Each response should include:

- Answer
- Confidence
- Evidence
- Sources
- Suggested follow-up questions
- Suggested next actions
- Timestamp

---

# Design Principles

The Copilot must remain:

- Context-aware
- Stateless
- Explainable
- Evidence-based
- Modular
- Extensible

No layer should perform the responsibilities of another layer.

---

# Future Extensibility

The architecture must allow future integration of:

- RAG
- Vector Search
- Recruiter Notes
- ATS Integrations
- GitHub Analysis
- Portfolio Analysis
- Coding Assessments
- Interview Feedback
- Email History
- Slack Conversations

without requiring architectural redesign.

---

# Constraints

Do NOT:

- Allow the LLM to access the database directly.
- Mix Candidate Profile with Candidate Intelligence.
- Store AI reasoning inside the Candidate entity.
- Skip response validation.
- Bypass the Context Builder.
- Couple Conversation Memory to Candidate Intelligence.

Every layer must have a single responsibility.

---

# Deliverable

Refactor the Recruiter Copilot architecture to follow this layered pipeline.

Produce an Architecture Report explaining:

1. Components added or modified.
2. Data flow between layers.
3. Responsibilities of each layer.
4. Benefits of the new architecture.
5. Future extensibility considerations.
6. Any migration required from the previous design.

Do not implement Approval Engine or workflow execution as part of this task.