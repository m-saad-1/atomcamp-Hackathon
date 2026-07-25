export interface CandidateKnowledge {
  candidateId: string;
  profile: Record<string, unknown>; // Only facts
  intelligence: Record<string, unknown> | null; // AI reasoning, versioned
  resumes: Record<string, unknown>[];
  timeline: Record<string, unknown>[];
  vectorContext: Record<string, unknown>[];
  competitors?: Record<string, unknown>[];
}

export interface ConversationMetadata {
  recruiterId: string;
  organizationId: string;
  candidateId: string;
  jobId?: string;
  sessionId: string;
  permissions: string[];
}

export interface ConversationContextPackage {
  metadata: ConversationMetadata;
  knowledge: CandidateKnowledge;
  chatHistory: Record<string, unknown>[];
  jobContext: Record<string, unknown> | null;
  recruiterNotes: Record<string, unknown>[];
}

export interface OrchestratorConfig {
  promptTemplate: string;
  model: string;
  confidenceThreshold: number;
  requireEvidence: boolean;
}

export interface ValidatedResponse {
  answer: string;
  confidence: number;
  evidence: string[];
  reasoning?: string;
  limitations?: string;
  missing_information?: string[];
  suggested_actions?: string[];
  timestamp: string;
  context_snapshot?: {
    intelligence_id?: string;
    resume_version?: number;
  };
}
