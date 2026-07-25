import { NextRequest, NextResponse } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { pollInbox } from '@/lib/gmail/poller';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Gap 6: Gmail Pub/Sub webhook implementation
  // Google sends the message via Pub/Sub to this webhook.
  
  const payloadSchema = z.object({
    message: z.object({
      data: z.string()
    })
  });

  const parseResult = payloadSchema.safeParse(await request.json());
  if (!parseResult.success) {
    return errorResponse('INVALID_PAYLOAD', 'Message data string missing', 400);
  }

  const message = parseResult.data.message;

  try {
    const dataString = Buffer.from(message.data, 'base64').toString('utf-8');
    const { emailAddress, historyId } = JSON.parse(dataString);

    if (emailAddress) {
      // Find the user with this email address
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailAddress)
        .single();

      if (user) {
        // Trigger the poller for this specific user
        // We don't await so the webhook can return 200 immediately
        pollInbox(user.id).catch((err: unknown) => {
          logger.error(`Webhook poll failed for ${emailAddress}`, { error: err instanceof Error ? err.message : String(err) });
        });
      }
    }

    return jsonResponse({ data: { success: true  } });
  } catch (err: unknown) {
    logger.error('Webhook processing failed', { error: err instanceof Error ? err.message : String(err) });
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
