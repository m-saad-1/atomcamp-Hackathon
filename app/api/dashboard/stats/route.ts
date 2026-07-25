import { jsonResponse, errorResponse } from '@/lib/api-response';
import { auth } from '@/auth';
import { getDashboardStats } from '@/lib/dashboard-stats';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organization_id) {
    return errorResponse('UNAUTHORIZED', undefined, 401);
  }

  try {
    const stats = await getDashboardStats(session.user.organization_id);
    return jsonResponse({ data: stats });
  } catch (error: unknown) {
    return errorResponse('INTERNAL_SERVER_ERROR', error instanceof Error ? error.message : String(error), 500);
  }
}
