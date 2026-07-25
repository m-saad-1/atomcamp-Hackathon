import { SupabaseClient } from '@supabase/supabase-js';
import { ConversationContextPackage, ConversationMetadata, CandidateKnowledge } from './types';

export class ConversationContextBuilder {
  static async build(
    supabase: SupabaseClient, 
    metadata: ConversationMetadata, 
    knowledge: CandidateKnowledge
  ): Promise<ConversationContextPackage> {
    
    // Fetch Job Context
    let jobContext = null;
    if (metadata.jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('title, description, required_skills, nice_to_have, experience_years')
        .eq('id', metadata.jobId)
        .single();
      if (job) {
        jobContext = job;
      }
    }

    // Fetch Recruiter Notes (if any exist in the schema, placeholder for now)
    const recruiterNotes: any[] = [];

    // Fetch Conversation History
    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', metadata.sessionId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    const formattedChat = chatHistory ? chatHistory.reverse() : [];

    // Ensure we only return information relevant to this session to save tokens
    return {
      metadata,
      knowledge,
      jobContext,
      recruiterNotes,
      chatHistory: formattedChat
    };
  }
}
