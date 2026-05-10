import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export async function getValidAccessToken(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('sessions')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (error || !data) {
    throw new Error('SESSION_NOT_FOUND: No Gmail session for this user. ' +
      'User must sign in again.');
  }

  const expiresAt = data.token_expires_at as number;
  const isExpiringSoon = Date.now() > expiresAt - FIVE_MINUTES_MS;

  if (!isExpiringSoon) {
    return data.access_token as string;
  }

  // Token is expired or expiring — refresh it
  if (!data.refresh_token) {
    throw new Error('REFRESH_TOKEN_MISSING: Access token expired and no refresh ' +
      'token available. User must sign in again with prompt=consent.');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token as string,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TOKEN_REFRESH_FAILED: ${response.status} ${body}`);
  }

  const refreshed = await response.json();
  const newExpiresAt = Date.now() + (refreshed.expires_in as number) * 1000;

  await supabase
    .from('sessions')
    .update({
      access_token: refreshed.access_token,
      token_expires_at: newExpiresAt,
    })
    .eq('user_id', userId)
    .eq('provider', 'google');

  return refreshed.access_token as string;
}
