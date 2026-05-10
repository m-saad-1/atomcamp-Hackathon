const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.expiresAt < now) {
    rateLimitMap.set(identifier, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
}
