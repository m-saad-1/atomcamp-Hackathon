export interface IntegrationMetadata {
  name: string;
  status: 'active' | 'inactive' | 'degraded' | 'offline';
  authentication: 'oauth' | 'api_key' | 'webhook';
  health: 'healthy' | 'unhealthy';
  version: string;
  latencyMs: number;
  rateLimitRemaining: number;
  availability: number; // percentage e.g., 99.9
  supportedCapabilities: string[];
}

export class IntegrationRegistry {
  private static registry: Map<string, IntegrationMetadata> = new Map();

  static register(id: string, meta: IntegrationMetadata) {
    this.registry.set(id, meta);
  }

  static get(id: string): IntegrationMetadata | undefined {
    return this.registry.get(id);
  }

  static getAll(): IntegrationMetadata[] {
    return Array.from(this.registry.values());
  }

  static updateHealth(id: string, latencyMs: number, success: boolean) {
    const integration = this.registry.get(id);
    if (!integration) return;

    integration.latencyMs = Math.round((integration.latencyMs + latencyMs) / 2); // Rolling average
    if (!success) {
      integration.health = 'unhealthy';
      integration.status = 'degraded';
    } else {
      integration.health = 'healthy';
      integration.status = 'active';
    }
  }
}

// Bootstrap default integrations
IntegrationRegistry.register('gmail', {
  name: 'Gmail',
  status: 'active',
  authentication: 'oauth',
  health: 'healthy',
  version: 'v1',
  latencyMs: 150,
  rateLimitRemaining: 10000,
  availability: 99.9,
  supportedCapabilities: ['send_email', 'read_email']
});

IntegrationRegistry.register('slack', {
  name: 'Slack',
  status: 'active',
  authentication: 'api_key',
  health: 'healthy',
  version: 'v2',
  latencyMs: 80,
  rateLimitRemaining: 50,
  availability: 99.99,
  supportedCapabilities: ['send_message', 'read_channel']
});

IntegrationRegistry.register('calendar', {
  name: 'Google Calendar',
  status: 'active',
  authentication: 'oauth',
  health: 'healthy',
  version: 'v3',
  latencyMs: 200,
  rateLimitRemaining: 1000,
  availability: 99.9,
  supportedCapabilities: ['schedule_event', 'read_availability']
});
