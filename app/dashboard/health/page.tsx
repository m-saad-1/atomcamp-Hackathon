'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function PlatformHealthDashboard() {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealthData(data);
      } catch (err) {
        console.error('Failed to fetch health', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
    
    // Poll every 15 seconds
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthData) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500';
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Health</h1>
          <p className="text-muted-foreground">Real-time status of all platform services and integrations.</p>
        </div>
        <Badge variant="outline" className={`text-lg px-4 py-1 ${getStatusColor(healthData?.status)}`}>
          {healthData?.status?.toUpperCase() || 'UNKNOWN'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Core Services */}
        {Object.entries(healthData?.components || {}).map(([key, component]: [string, any]) => (
          <Card key={key} className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</CardTitle>
              <Badge variant="secondary" className={getStatusColor(component.status)}>
                {component.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{component.latencyMs ? `${component.latencyMs}ms` : '---'}</div>
              {component.error && <p className="text-xs text-red-500 mt-1">{component.error}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
