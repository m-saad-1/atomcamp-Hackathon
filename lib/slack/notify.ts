export async function notifySlack(
  message: string,
  candidateId?: string
): Promise<void> {
  const webhookUrl = process.env.SLACK_BOT_TOKEN
    ? `https://slack.com/api/chat.postMessage`
    : null;

  if (!webhookUrl || !process.env.SLACK_CHANNEL_ID) {
    console.warn('Slack not configured — skipping notification');
    return;
  }

  const blocks = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: message },
    },
    ...(candidateId ? [{
      type: 'actions',
      elements: [{
        type: 'button',
        text: { type: 'plain_text', text: 'View Candidate' },
        url: `${process.env.NEXTAUTH_URL}/dashboard/candidates/${candidateId}`,
      }, {
        type: 'button',
        text: { type: 'plain_text', text: 'Review Actions' },
        url: `${process.env.NEXTAUTH_URL}/dashboard/approvals`,
      }],
    }] : []),
  ];

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel: process.env.SLACK_CHANNEL_ID,
        text: message,
        blocks,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Slack notify failed:', res.status, body);
      // Non-fatal: Slack failure never blocks main pipeline
    }
  } catch (err) {
    console.error('Slack notify threw:', err);
    // Non-fatal
  }
}
