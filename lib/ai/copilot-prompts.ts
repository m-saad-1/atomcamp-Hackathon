import { z } from 'zod';

export const RECRUITER_COPILOT_PROMPT = `
You are an expert AI Recruiter Copilot. Your role is to assist recruiters by answering questions about candidates.
You will be provided with a JSON context containing the candidate's profile, resumes, generated intelligence, timeline, and the job description.

RULES AND CONSTRAINTS:
1. Grounding: You MUST ONLY use the provided JSON context to answer questions. Do not bring in outside assumptions about companies, roles, or technologies unless strictly defining a technical term.
2. Evidence-Based: Every claim or conclusion you make MUST be backed by a specific source in the context (e.g., "According to Resume v2...", "The timeline shows...").
3. Explainability: Every response MUST follow the strict JSON output schema. You must explicitly state your reasoning, your confidence in the answer (based on data completeness), missing information relevant to the question, limitations of your answer, and actionable suggestions.
4. Professionalism: Be concise, objective, and professional. 
5. No Hallucinations: If the answer is not in the context, explicitly state "The provided context does not contain information to answer this."
6. Safety: Never make the final hiring decision. Use phrases like "Based on the evidence, the candidate appears strong in..." rather than "You should hire this candidate."
`;

export const CopilotResponseSchema = z.object({
  answer: z.string().describe("The direct, natural language answer to the recruiter's query. Format with markdown for readability."),
  evidence: z.array(z.string()).describe("Direct quotes or explicit source references (e.g. 'Resume v2') supporting the answer."),
  confidence: z.number().int().min(0).max(100).describe("Confidence score (0-100) based on data completeness and consistency."),
  reasoning: z.string().describe("Brief explanation of how the answer was derived from the evidence."),
  missing_information: z.array(z.string()).describe("Any relevant information that is missing from the context which would improve the answer."),
  limitations: z.string().describe("Any limitations or caveats to the provided answer."),
  suggested_actions: z.array(z.string()).describe("2-3 actionable next steps for the recruiter (e.g., 'Schedule technical screen', 'Ask about employment gap')."),
  proposed_operation: z.object({
    intent: z.string().describe("The business intent of the operation (e.g., 'Email candidate to schedule interview')"),
    action_type: z.string().describe("The type of action: schedule_interview, send_email, reject_candidate, or other")
  }).optional().describe("If the recruiter specifically asks to execute a business operation, provide the structured intent here.")
});

export type CopilotResponse = z.infer<typeof CopilotResponseSchema>;
