import { NextResponse } from 'next/server';
import { getPlatformHealth } from '@/lib/health';

export async function GET() {
  try {
    const statuses = await getPlatformHealth();
    const isDegraded = statuses.some(s => s.status === 'degraded');
    const isDown = statuses.some(s => s.status === 'down');
    
    let overallStatus = 'healthy';
    let httpStatus = 200;
    
    if (isDown) {
      overallStatus = 'down';
      httpStatus = 503;
    } else if (isDegraded) {
      overallStatus = 'degraded';
      httpStatus = 200; // Still returning 200 so load balancers don't completely drop it unless configured otherwise
    }
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      components: statuses
    }, { status: httpStatus });
  } catch (error) {
    return NextResponse.json({ 
      status: 'down', 
      error: 'Failed to retrieve platform health',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
