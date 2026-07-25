# Architecture Report: Recruiter Copilot Context Pipeline

## 1. Components Added & Modified

The Recruiter Copilot's architecture has been completely refactored to enforce a strict, 7-layer context pipeline. 
We migrated away from the monolithic `context-builder.ts` and in-route LLM execution in favor of highly modular components located in `lib/copilot/`.

### Added Components:
- **`types.ts`**: Defines strict DTOs (`CandidateKnowledge`, `ConversationContextPackage`, `ValidatedResponse`) that flow between layers.
- **`knowledge-context.ts` (`KnowledgeContextBuilder`)**: Merges verified Candidate Profile facts with versioned Candidate Intelligence. Handles deduplication and fallback vector search chunk fetching.
- **`conversation-context.ts` (`ConversationContextBuilder`)**: Assembles the LLM payload by applying current session context (job, recruiter notes, history) to the Candidate Knowledge graph.
- **`prompt-orchestrator.ts` (`PromptOrchestrator`)**: Wraps the context package and injects dynamic validation rules based on `OrchestratorConfig`.
- **`response-validator.ts` (`ResponseValidator`)**: Enforces Zod schemas, confidence thresholds, and missing-evidence hallucination detection on raw LLM outputs.
- **`memory.ts` (`ConversationMemory`)**: Handles saving user inputs and validated AI responses while strictly enforcing session and organization isolation.
- **`pipeline.ts` (`CopilotPipeline`)**: The main facade that executes the 7 layers sequentially.

### Modified Components:
- **`/api/candidates/[id]/chat/route.ts`**: Refactored to instantiate `CopilotPipeline` and call `executeStream`, offloading all prompt generation, DB interaction, and memory logic.

---

## 2. Data Flow Between Layers

1. **Request Received**: The recruiter sends a question via the Next.js API route.
2. **Knowledge Retrieval (Layer 1 & 2)**: `KnowledgeContextBuilder` fetches the `Candidate Profile` (facts) and `Candidate Intelligence` (AI reasoning).
3. **Knowledge Construction (Layer 3)**: It normalizes these into a single `CandidateKnowledge` object.
4. **Context Construction (Layer 4)**: `ConversationContextBuilder` merges the `CandidateKnowledge` with session data to create the `ConversationContextPackage`.
5. **Prompt Orchestration (Layer 5)**: `PromptOrchestrator` converts the package and the recruiter's question into a strict system prompt string.
6. **LLM Execution (Layer 6)**: The Prompt is sent to OpenAI via Vercel AI SDK (`streamObject`). The LLM does NOT touch the database.
7. **Validation (Layer 7)**: As the stream completes, `ResponseValidator` parses the output. If it fails confidence or evidence checks, it throws an error.
8. **Memory & Output (Layer 8 & 9)**: Validated responses are passed to `ConversationMemory` for isolated persistence and returned to the frontend.

---

## 3. Responsibilities of Each Layer

- **Candidate Profile / Intelligence:** Act as read-only data sources. They do not leak into one another.
- **Knowledge Context Builder:** Create an LLM-agnostic data representation of a candidate.
- **Conversation Context Builder:** Tailor the knowledge graph for a specific conversation (optimizing token usage).
- **Prompt Orchestrator:** Format the prompt and inject dynamic boundaries (e.g., "confidence > 60%").
- **LLM:** Pure function. Input string -> Output JSON stream.
- **Response Validator:** Ensure the output is safe, grounded, and structurally sound.
- **Conversation Memory:** Persist interactions without cross-tenant leakage.

---

## 4. Benefits of the New Architecture

- **Security & Isolation:** The LLM is sandboxed. It can no longer be inadvertently given direct DB access. Organization data cannot bleed into other sessions due to strict checks in `ConversationMemory`.
- **Explainability:** `ResponseValidator` strictly enforces that every claim has an attached citation from the `KnowledgeContextBuilder`, drastically reducing hallucinations.
- **Testability:** Because the LLM step is a pure function and context generation is decoupled, we can now unit-test `KnowledgeContextBuilder` and `PromptOrchestrator` without invoking expensive OpenAI API calls.

---

## 5. Future Extensibility Considerations

This layered pipeline is designed specifically to support future integrations without requiring an architectural rewrite:
- **RAG & Vector Search:** The `KnowledgeContextBuilder` already contains a placeholder fallback for `match_candidate_embeddings`. We can swap this with advanced chunk retrieval without touching the Prompt Orchestrator.
- **ATS & External Data:** Integrating GitHub analysis or external ATS notes simply requires adding a new fetcher in the `KnowledgeContextBuilder` and mapping it to the `CandidateKnowledge` interface.
- **Different Models:** The `OrchestratorConfig` allows the `CopilotPipeline` to switch between `gpt-4o`, `claude-3-opus`, or local models on a per-request basis.

---

## 6. Migration Steps

The migration from the legacy monolithic design has been completed.
- The old `lib/copilot/context-builder.ts` can be safely deprecated and deleted once the new `/api/copilot/action`, `/api/copilot/draft`, and `/api/copilot/compare` routes are refactored to use `CopilotPipeline`.
- The frontend (`CopilotPanel.tsx`) required **no changes**, as the REST API contract and Zod schemas remain identical. The refactoring was entirely isolated to the backend architecture.
