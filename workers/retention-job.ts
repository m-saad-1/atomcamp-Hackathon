import { createAdminClient } from '../lib/supabase/server';
import { sysLogger } from '../lib/observability';

/**
 * Data Retention Policy Job
 * Runs nightly to hard-delete soft-deleted records or records beyond retention period (e.g., GDPR 3 years).
 */
export async function runRetentionJob() {
  const supabase = createAdminClient();
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() - 3); // 3 Years retention

  sysLogger.info('Starting Data Retention Job', { retentionDate: retentionDate.toISOString() });

  try {
    // Hard delete soft-deleted candidates older than 30 days
    const softDeleteThreshold = new Date();
    softDeleteThreshold.setDate(softDeleteThreshold.getDate() - 30);

    const { error: candidateError } = await supabase
      .from('candidates')
      .delete()
      .eq('is_deleted', true)
      .lt('updated_at', softDeleteThreshold.toISOString());

    if (candidateError) throw candidateError;

    // Hard delete audit logs older than 3 years (Compliance)
    const { error: auditError } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', retentionDate.toISOString());

    if (auditError) throw auditError;

    sysLogger.info('Data Retention Job Completed Successfully');
  } catch (error) {
    sysLogger.error('Data Retention Job Failed', { error });
  }
}

// In a real environment, this would be triggered by a Cron scheduler like BullMQ or Vercel Cron.
if (require.main === module) {
  runRetentionJob().then(() => process.exit(0));
}
