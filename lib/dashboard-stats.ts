import { createAdminClient } from '@/lib/supabase/server';

export async function getDashboardStats(organizationId: string) {
  const supabase = createAdminClient();

  const [
    { count: unprocessedEmails },
    { count: totalCandidates },
    { count: pendingApprovals },
    { data: scoreData },
    { count: interviewsThisWeek },
  ] = await Promise.all([
    supabase.from('emails').select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('processed', false),
    supabase.from('candidates').select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_draft', false),
    supabase.from('approvals').select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'pending'),
    supabase.from('candidates').select('ai_score')
      .eq('organization_id', organizationId)
      .eq('is_draft', false).not('ai_score', 'is', null),
    supabase.from('interviews').select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'scheduled')
      .gte('scheduled_time', new Date().toISOString())
      .lte('scheduled_time', new Date(Date.now() + 7 * 86400000).toISOString()),
  ]);

  const scores  = (scoreData ?? []).map((c) => c.ai_score as number);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return {
    unprocessedEmails:  unprocessedEmails  ?? 0,
    totalCandidates:    totalCandidates    ?? 0,
    pendingApprovals:   pendingApprovals   ?? 0,
    interviewsThisWeek: interviewsThisWeek ?? 0,
    avgScore,
  };
}
