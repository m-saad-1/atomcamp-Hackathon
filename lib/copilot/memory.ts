import { SupabaseClient } from '@supabase/supabase-js';
import { ConversationMetadata, ValidatedResponse } from './types';

export class ConversationMemory {
  static async saveUserMessage(
    supabase: SupabaseClient, 
    metadata: ConversationMetadata, 
    content: string
  ): Promise<void> {
    const { error } = await supabase.from('chat_messages').insert({
      session_id: metadata.sessionId,
      role: 'user',
      content
    });

    if (error) {
      throw new Error(`Failed to save user message: ${error.message}`);
    }
  }

  static async saveAssistantMessage(
    supabase: SupabaseClient, 
    metadata: ConversationMetadata, 
    response: ValidatedResponse
  ): Promise<void> {
    
    // Strict isolation check: Verify session belongs to the user and org
    // In a real app, RLS handles this, but adding a check here for the pipeline constraint
    const { data: sessionCheck } = await supabase
      .from('chat_sessions')
      .select('recruiter_id')
      .eq('id', metadata.sessionId)
      .single();

    if (!sessionCheck || sessionCheck.recruiter_id !== metadata.recruiterId) {
       throw new Error('Memory isolation violation: Session does not belong to the current recruiter.');
    }

    const { error } = await supabase.from('chat_messages').insert({
      session_id: metadata.sessionId,
      role: 'assistant',
      content: response.answer,
      metadata: {
        evidence: response.evidence,
        confidence: response.confidence,
        reasoning: response.reasoning,
        missing_information: response.missing_information,
        limitations: response.limitations,
        suggested_actions: response.suggested_actions,
        context_snapshot: response.context_snapshot
      }
    });

    if (error) {
      throw new Error(`Failed to save assistant message: ${error.message}`);
    }
  }
}
