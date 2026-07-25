import { createAdminClient } from '@/lib/supabase/server';


type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'not_implemented';

export interface HealthStatus {
  service: string;
  status: ServiceStatus;
  message: string;
}

/**
 * Checks the health and synchronization status of all critical platform components.
 * This is used by the Platform Health UI to ensure operational readiness.
 */
export async function getPlatformHealth(): Promise<HealthStatus[]> {
  const supabase = createAdminClient();
  const statuses: HealthStatus[] = [];

  // 1. Database Connection
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    statuses.push({ service: 'Database (Supabase)', status: 'healthy', message: 'Connected' });
  } catch {
    statuses.push({ service: 'Database (Supabase)', status: 'down', message: 'Connection failed' });
  }

  // 2. Gmail Integration
  try {
    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('provider', 'google')
      .not('refresh_token', 'is', null);
      
    if (error) throw error;
    
    if (count && count > 0) {
      statuses.push({ service: 'Gmail Integration', status: 'healthy', message: `${count} active token(s)` });
    } else {
      statuses.push({ service: 'Gmail Integration', status: 'degraded', message: 'No active OAuth tokens found' });
    }
  } catch {
    statuses.push({ service: 'Gmail Integration', status: 'down', message: 'Unable to verify tokens' });
  }

  // 3. Email Ingestion Queue
  try {
    const { count, error } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);
      
    if (error) throw error;
    
    statuses.push({ 
      service: 'Ingestion Queue', 
      status: 'healthy', 
      message: `${count || 0} messages pending` 
    });
  } catch {
    statuses.push({ service: 'Ingestion Queue', status: 'down', message: 'Unable to query queue' });
  }

  // 4. OpenAI API
  if (process.env.OPENAI_API_KEY) {
    statuses.push({ service: 'OpenAI API', status: 'healthy', message: 'API Key configured' });
  } else {
    statuses.push({ service: 'OpenAI API', status: 'down', message: 'Missing OPENAI_API_KEY' });
  }

  // 5. Candidate Engine (Sprint 3 Expansion)
  try {
    const { count: pendingDuplicates } = await supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('duplicate_status', 'pending_review');

    if (pendingDuplicates && pendingDuplicates > 0) {
      statuses.push({ service: 'Candidate Engine', status: 'degraded', message: `${pendingDuplicates} duplicates pending review` });
    } else {
      statuses.push({ service: 'Candidate Engine', status: 'healthy', message: 'All clear' });
    }
  } catch {
    statuses.push({ service: 'Candidate Engine', status: 'down', message: 'Unable to query duplicates' });
  }

  // 6. Resume Processing Pipeline
  try {
    const { count: ocrCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'OCR Invoked');

    const { count: creationCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'Resume Extracted and Processed');
      
    const { count: parsingFailures } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('lifecycle_status', 'failed');

    statuses.push({ 
      service: 'Extraction Pipeline', 
      status: parsingFailures && parsingFailures > 0 ? 'degraded' : 'healthy', 
      message: `${creationCount || 0} created, ${ocrCount || 0} OCR, ${parsingFailures || 0} failures` 
    });
  } catch {
    statuses.push({ service: 'Extraction Pipeline', status: 'down', message: 'Unable to query metrics' });
  }

  // 7. AI Engine Queue (Sprint 4)
  try {
    const { data: intelligenceData } = await supabase
      .from('candidate_intelligence')
      .select('processing_latency_ms, confidence_score');

    const intelligenceCount = intelligenceData?.length || 0;
    
    let avgLatency = 0;
    let avgConfidence = 0;
    if (intelligenceCount > 0) {
      avgLatency = Math.round(intelligenceData!.reduce((acc, curr) => acc + (curr.processing_latency_ms || 0), 0) / intelligenceCount);
      avgConfidence = Math.round(intelligenceData!.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / intelligenceCount);
    }

    const { count: failureCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'Candidate Intelligence Generation Failed');

    statuses.push({ 
      service: 'AI Intelligence', 
      status: failureCount && failureCount > 0 ? 'degraded' : 'healthy', 
      message: `${intelligenceCount} profiles analyzed, ${failureCount || 0} failures, ~${avgLatency}ms avg latency, ~${avgConfidence}% avg confidence` 
    });
  } catch {
    statuses.push({ service: 'AI Intelligence', status: 'down', message: 'Unable to query AI metrics' });
  }

  // 8. Copilot / Chat Queue (Sprint 5)
  try {
    const { count: sessionCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('metadata')
      .eq('role', 'assistant');

    const messageCount = messagesData?.length || 0;
    
    let totalLatency = 0;
    let totalTokens = 0;
    let totalConfidence = 0;
    
    messagesData?.forEach(msg => {
      const meta = (msg.metadata as Record<string, number>) || {};
      totalLatency += (meta.latency_ms || 0);
      totalTokens += (meta.token_usage || 0);
      totalConfidence += (meta.confidence || 0);
    });

    const avgLatency = messageCount > 0 ? Math.round(totalLatency / messageCount) : 0;
    const avgConfidence = messageCount > 0 ? Math.round(totalConfidence / messageCount) : 0;
    
    const { count: failedGenerations } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('event', 'Copilot Chat Failed');

    statuses.push({ 
      service: 'Recruiter Copilot', 
      status: failedGenerations && failedGenerations > 0 ? 'degraded' : 'healthy', 
      message: `${sessionCount || 0} active sessions, ${messageCount} messages, ~${avgLatency}ms latency, ~${avgConfidence}% confidence, ${totalTokens} tokens, ${failedGenerations || 0} failures` 
    });
  } catch {
    statuses.push({ service: 'Recruiter Copilot', status: 'down', message: 'Unable to query Copilot metrics' });
  }

  // 9. Approval & Execution Engine (Sprint 6)
  try {
    const { data: actionsData } = await supabase
      .from('actions')
      .select('execution_status, approval_timestamp, created_at');
      
    const { data: reportsData } = await supabase
      .from('execution_reports')
      .select('result, duration_ms, retry_count');
      
    if (actionsData) {
      let pending = 0, executing = 0, failed = 0, completed = 0;
      let totalApprovalMs = 0;
      let approvedCount = 0;
      
      actionsData.forEach(action => {
        if (action.execution_status === 'pending_approval') pending++;
        if (action.execution_status === 'executing') executing++;
        if (action.execution_status === 'failed') failed++;
        if (action.execution_status === 'completed') completed++;
        
        if (action.approval_timestamp) {
           totalApprovalMs += (new Date(action.approval_timestamp).getTime() - new Date(action.created_at).getTime());
           approvedCount++;
        }
      });
      
      const avgApprovalTime = approvedCount > 0 ? Math.round(totalApprovalMs / approvedCount) : 0;
      
      let successCount = 0;
      let totalExecutionMs = 0;
      let totalRetries = 0;
      
      if (reportsData && reportsData.length > 0) {
         reportsData.forEach(r => {
           if (r.result === 'success') successCount++;
           totalExecutionMs += (r.duration_ms || 0);
           totalRetries += (r.retry_count || 0);
         });
      }
      
      const totalExecutions = reportsData?.length || 0;
      const successRate = totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 100) : 100;
      const avgExecutionTime = totalExecutions > 0 ? Math.round(totalExecutionMs / totalExecutions) : 0;
      const retryRate = totalExecutions > 0 ? (totalRetries / totalExecutions).toFixed(2) : '0';
      
      statuses.push({
        service: 'Execution Engine',
        status: failed > 0 || successRate < 90 ? 'degraded' : 'healthy',
        message: `${pending} pending, ${executing} executing, ${completed} completed. Success Rate: ${successRate}%. Avg Approval: ${avgApprovalTime}ms. Avg Execution: ${avgExecutionTime}ms. Retries: ${retryRate}/act.`
      });
    } else {
      statuses.push({ service: 'Execution Engine', status: 'healthy', message: '0 actions tracked' });
    }
  } catch {
    statuses.push({ service: 'Execution Engine', status: 'down', message: 'Unable to query Action metrics' });
  }

  return statuses;
}
