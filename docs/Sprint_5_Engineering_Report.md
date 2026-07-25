# Sprint 5 Engineering Report: Recruiter Copilot

## Architectural Overview
The Recruiter Copilot represents a fundamental shift from static data presentation to dynamic, AI-assisted candidate evaluation. The architecture is built on a strict Retrieval-Augmented Generation (RAG) pattern, ensuring the LLM acts purely as an advisory intelligence layer over verified platform data.

### 1. Conversation Context Builder
The Copilot operates strictly within a bounded context. Before any LLM invocation, the `buildConversationContext` function aggregates:
- **Canonical Candidate Profile**: Basic info and structured data.
- **Resume Corpus**: Historical and active resumes.
- **Candidate Intelligence**: Sprint 4's structured insights.
- **Event Timeline**: End-to-end lifecycle history.
- **Recruiter Chat History**: Temporal memory of the ongoing session.
This deterministic context completely isolates the LLM from arbitrary database queries, enforcing the **Knowledge Governance** constraint.

### 2. Structured Streaming & UI
We migrated to the Vercel AI SDK's `streamObject` capability to guarantee structured explainability. Every single assistant message is validated against the `CopilotResponseSchema` (Zod), ensuring:
- **Evidence Lineage**: Explicit citations back to source documents.
- **Confidence Scoring**: Dynamic assessment of data completeness.
- **Explainable Reasoning**: Opaque AI recommendations are eliminated.
- **Suggested Actions**: Contextually relevant next steps (e.g., "Schedule Technical Screen").

The `CopilotPanel.tsx` UI parses this structured stream in real-time, rendering distinct visual components (Confidence Badges, Source References, Expandable Limitations) rather than unstructured markdown blocks.

### 3. Session Persistence & Observability
Chat sessions and messages are persisted in dedicated Supabase tables (`chat_sessions`, `chat_messages`). This serves two functions:
1. **Recruiter Memory**: Allowing recruiters to resume evaluations.
2. **Platform Health Observability**: Providing telemetry on session volume and AI engagement directly into the Platform Health dashboard via `lib/health.ts`.

## Security & Safety Guardrails
- **No Autonomous Execution**: The Copilot can suggest actions but cannot execute them (no email sending, no pipeline mutation).
- **Anti-Hallucination Measures**: The prompt stringently instructs the model to state "The provided context does not contain information to answer this" rather than guessing.

## Summary
The Copilot successfully transforms raw candidate data into interactive, recruiter-ready intelligence while strictly maintaining explainability and safety boundaries.
