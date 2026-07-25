import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export function jsonResponse<T>(
  payload: ApiResponse<T>,
  status: number = 200
): NextResponse {
  return NextResponse.json(payload, { status });
}

export function errorResponse(
  error: string,
  message?: string,
  status: number = 500
): NextResponse {
  return NextResponse.json({ error, message }, { status });
}
