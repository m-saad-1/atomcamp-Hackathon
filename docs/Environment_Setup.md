# Environment Setup

This document outlines the required environment variables for the AI Recruiting Agent to run successfully.
These variables are rigorously checked at startup by `lib/env.ts`.

## Core Configuration
- `NEXTAUTH_URL`: The canonical URL of the application (e.g., `http://localhost:3000`).
- `NEXTAUTH_SECRET`: Used to encrypt session tokens. Must be a random 32+ char string.

## Google OAuth (Gmail Integration)
- `GOOGLE_CLIENT_ID`: Google Cloud Console OAuth Client ID. Must include Gmail API scopes.
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret.

## Supabase (Database)
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key. **Critical:** Do NOT expose this to the client.

## OpenAI (Candidate Analysis)
- `OPENAI_API_KEY`: Key with access to `gpt-4o-mini` or `gpt-4o`.

## Slack (Notifications)
- `SLACK_BOT_TOKEN`: `xoxb-...` token for sending alerts.
- `SLACK_SIGNING_SECRET`: For verifying webhook payloads.

## System Settings
- `INBOX_POLL_INTERVAL_SECONDS`: Frequency of background polling.
