import { z } from 'zod';

export const CandidateIntelligenceSchema = z.object({
  executive_summary: z.string().describe("A 2-3 sentence narrative of the candidate's profile and fit, citing evidence."),
  recommendation: z.object({
    status: z.enum([
      "Strong Match",
      "Recommended for Screening",
      "Needs More Information",
      "Limited Match",
      "Not Recommended"
    ]),
    evidence: z.string(),
    confidence_score: z.number().int().min(0).max(100),
    reasoning: z.string(),
    limitations: z.string()
  }).describe("Overall recommendation with explicit reasoning and limitations."),
  strengths: z.array(z.object({
    trait: z.string(),
    evidence: z.string().describe("Direct quote or explicit reference to the data.")
  })),
  weaknesses: z.array(z.object({
    trait: z.string(),
    evidence: z.string().describe("Reason for weakness (e.g. lack of X in resume).")
  })),
  missing_information: z.array(z.string()).describe("List of explicitly missing items (e.g. No GitHub, No Work Auth)."),
  interview_topics: z.array(z.object({
    topic: z.string(),
    reason: z.string(),
    suggested_questions: z.array(z.string())
  })),
  technical_assessment: z.object({
    technologies: z.array(z.string()),
    frameworks: z.array(z.string()),
    architecture_exposure: z.array(z.string()),
    cloud_experience: z.array(z.string()),
    testing: z.array(z.string()),
    databases: z.array(z.string()),
    backend: z.array(z.string()),
    frontend: z.array(z.string()),
    devops: z.array(z.string()),
    ai_ml: z.array(z.string())
  }),
  experience_assessment: z.object({
    career_progression: z.string(),
    years_of_experience: z.number().nullable(),
    domain_exposure: z.array(z.string()),
    role_growth: z.string()
  }),
  leadership_indicators: z.array(z.object({
    indicator: z.string(),
    evidence: z.string()
  })),
  communication_indicators: z.array(z.object({
    indicator: z.string(),
    evidence: z.string()
  })),
  career_progression: z.string().describe("Observations on tenure, stability, and growth."),
  risk_indicators: z.array(z.object({
    risk: z.string(),
    evidence: z.string()
  })),
  next_recommended_action: z.string().describe("A single actionable next step phrased as a suggestion.")
});

export type CandidateIntelligence = z.infer<typeof CandidateIntelligenceSchema>;

export const CANDIDATE_INTELLIGENCE_PROMPT = `
You are the Candidate Intelligence Engine for an AI-native recruiting platform.
Analyze the provided candidate profile data (resumes, emails, timeline) and generate a structured intelligence report.

RULES AND CONSTRAINTS:
1. Evidence-based: Every conclusion MUST reference supporting evidence from the candidate data. For all evidence fields, you MUST explicitly name the source document and context (e.g., "Resume v2 under Experience", "Email subject X", "Timeline event Y"). Never just output an isolated quote.
2. Confidence-aware: Your confidence score must reflect data completeness and consistency. Never imply certainty if data is sparse.
3. No Hallucinations: If information is missing, explicitly list it in 'missing_information'. Do not guess or fabricate. Unknowns are not weaknesses.
4. Ethical AI: NEVER infer protected characteristics (race, gender, age, health, etc.). Do not invent background checks.
5. Explainable: Provide 'evidence' fields for strengths, weaknesses, leadership, communication, and risks. The 'limitations' field in the recommendation MUST highlight potential gaps in the analysis (e.g., "Relies only on one older resume").

INPUT CONTEXT:
The user will provide a JSON object containing the candidate's canonical data (Profile, Work History, Education, Skills, Resumes, Emails, etc.) and optionally Job Requirements if evaluated against a specific role.

Respond ONLY with a valid JSON object matching the required schema exactly.
`;
