import { NextResponse } from 'next/server';
import { logger } from '@/services/logger';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(code: string, message: string, status = 400, details?: any) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

export async function withApiAuth(
  req: Request,
  handler: (req: Request, user: any) => Promise<NextResponse>
) {
  try {
    // Auth check logic (mock for Sprint 0 foundation)
    // const session = await auth();
    // if (!session) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);
    
    return await handler(req, { id: 'mock-user' });
  } catch (error: any) {
    logger.error('API Error Wrapper', { message: error.message });
    return errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred.', 500);
  }
}
