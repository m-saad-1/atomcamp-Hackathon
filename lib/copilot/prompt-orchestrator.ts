import { ConversationContextPackage, OrchestratorConfig } from './types';

export class PromptOrchestrator {
  static orchestrate(
    context: ConversationContextPackage,
    question: string,
    config: OrchestratorConfig
  ): string {
    
    // Inject dynamic constraints
    const rules = [];
    if (config.requireEvidence) {
      rules.push("- You MUST provide evidence from the provided context.");
      rules.push("- If the answer is not in the context, explicitly state 'The provided context does not contain information to answer this.'");
    }
    if (config.confidenceThreshold > 0) {
      rules.push(`- Only provide recommendations if your confidence is above ${config.confidenceThreshold}%.`);
    }

    return `
${config.promptTemplate}

### Strict Rules ###
${rules.join('\n')}

### Candidate Knowledge (Facts & AI Reasoning) ###
Profile Facts:
${JSON.stringify(context.knowledge.profile, null, 2)}

AI Intelligence (Versioned):
${JSON.stringify(context.knowledge.intelligence, null, 2)}

Resumes:
${JSON.stringify(context.knowledge.resumes, null, 2)}

Timeline:
${JSON.stringify(context.knowledge.timeline, null, 2)}

Vector Search Chunks:
${JSON.stringify(context.knowledge.vectorContext, null, 2)}

### Job Context & Competitors ###
Job Details:
${JSON.stringify(context.jobContext, null, 2)}

Competitors:
${JSON.stringify(context.knowledge.competitors, null, 2)}

### Conversation History ###
${JSON.stringify(context.chatHistory, null, 2)}

### Recruiter Request ###
${question}
`;
  }
}
