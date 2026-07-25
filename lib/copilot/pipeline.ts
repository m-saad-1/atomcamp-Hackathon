import { SupabaseClient } from '@supabase/supabase-js';
import { KnowledgeContextBuilder } from './knowledge-context';
import { ConversationContextBuilder } from './conversation-context';
import { PromptOrchestrator } from './prompt-orchestrator';
import { ConversationMemory } from './memory';
import { ResponseValidator } from './response-validator';
import { ConversationMetadata, OrchestratorConfig, ValidatedResponse } from './types';
import { z } from 'zod';
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';

export class CopilotPipeline {
  constructor(
    private supabase: SupabaseClient,
    private metadata: ConversationMetadata
  ) {}

  /**
   * Executes the full pipeline for a stream-based response (e.g., chat)
   */
  async executeStream(
    userMessage: string,
    schema: z.ZodType<any>,
    config: OrchestratorConfig,
    onFinish: (response: ValidatedResponse) => Promise<void>
  ) {
    // 1 & 2. Knowledge Context (Candidate Profile & Intelligence)
    const knowledge = await KnowledgeContextBuilder.build(
      this.supabase, 
      this.metadata.candidateId, 
      this.metadata.jobId
    );

    // 3. Conversation Context
    const contextPackage = await ConversationContextBuilder.build(
      this.supabase, 
      this.metadata, 
      knowledge
    );

    // 4. Prompt Orchestration
    const finalPrompt = PromptOrchestrator.orchestrate(
      contextPackage, 
      userMessage, 
      config
    );

    // 5. Memory (Save User Question)
    await ConversationMemory.saveUserMessage(this.supabase, this.metadata, userMessage);

    // 6. LLM Execution (Streaming)
    const result = await streamObject({
      model: openai(config.model),
      schema,
      prompt: finalPrompt,
      onFinish: async ({ object }) => {
        if (object) {
          // 7. Validation
          try {
            const validated = ResponseValidator.validate(object, schema, config.confidenceThreshold);
            
            // Attach snapshot
            validated.context_snapshot = {
              intelligence_id: knowledge.intelligence?.id as string | undefined,
              resume_version: knowledge.resumes[0]?.version_number as number | undefined
            };

            // 8. Memory (Save AI Response)
            await ConversationMemory.saveAssistantMessage(this.supabase, this.metadata, validated);
            
            // 9. Refactored Architecture: Action Planner
            if (validated.proposed_operation) {
              const { ActionPlannerService } = await import('../actions/planner');
              const planner = new ActionPlannerService();
              
              const actionToInsert = await planner.plan({
                intent: validated.proposed_operation.intent,
                suggestedActionType: validated.proposed_operation.action_type,
                reasoning: validated.reasoning,
                confidence: validated.confidence,
                evidence: validated.evidence,
                candidateId: this.metadata.candidateId,
                recruiterId: this.metadata.recruiterId,
                organizationId: this.metadata.organizationId,
                jobId: this.metadata.jobId
              });

              // Save the Action object to DB
              await this.supabase.from('actions').insert(actionToInsert);
            }

            // Trigger callback
            await onFinish(validated);
          } catch (validationError) {
             console.error("AI Response Validation Failed:", validationError);
             // Invalid responses are dropped, per requirements
          }
        }
      }
    });

    return result;
  }
}
