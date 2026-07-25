import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export type EntityType = 'email' | 'attachment' | 'candidate' | 'job' | 'approval' | 'system';

export async function logAuditEvent(
  organizationId: string | null,
  entityType: EntityType,
  entityId: string | null,
  event: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      entity_type: entityType,
      entity_id: entityId,
      event,
      payload,
    });

    if (error) {
      logger.error('Failed to write audit log', { error: error.message, event });
    }
  } catch (err: unknown) {
    logger.error('Audit log exception', { error: err instanceof Error ? err.message : String(err) });
  }
}
