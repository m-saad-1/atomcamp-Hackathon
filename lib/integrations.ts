import { createAdminClient } from './supabase/server';

export interface IntegrationStatus {
  service: 'gmail' | 'openai' | 'slack' | 'calendar';
  status: 'connected' | 'disconnected' | 'requires_auth' | 'expired' | 'error';
  metadata: Record<string, unknown>;
  updated_at: string;
}

export async function getIntegrations(organizationId: string): Promise<IntegrationStatus[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('integration_registry')
    .select('*')
    .eq('organization_id', organizationId);
    
  if (error) {
    console.error('Failed to fetch integrations', error);
    return [];
  }
  
  return data as IntegrationStatus[];
}

export async function upsertIntegration(
  organizationId: string, 
  service: IntegrationStatus['service'], 
  status: IntegrationStatus['status'], 
  metadata: Record<string, unknown> = {}
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('integration_registry')
    .upsert(
      {
        organization_id: organizationId,
        service,
        status,
        metadata,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'organization_id,service' }
    );
    
  if (error) {
    console.error(`Failed to upsert integration ${service}`, error);
  }
}
