# Part 1 — Foundation

> **Related Documents**
>
> - system_design.md
> - 01-authentication-foundation.md
> - 02-organization-onboarding.md
> - 03-team-workspace.md
>
> This section defines the foundation of the Integrations & Final Onboarding experience. It establishes how users connect external services, complete the final onboarding steps, and transition into the Recrion dashboard.

---

# 1. Feature Overview

Integrations & Final Onboarding is the final stage before a user enters the Recrion platform.

This stage allows organizations to:

- Connect essential third-party services.
- Complete optional integrations.
- Verify workspace readiness.
- Finalize onboarding.
- Prepare the dashboard environment.

The initial release focuses on Gmail integration, while the architecture supports future integrations.

Examples include:

- Gmail
- Google Calendar
- Microsoft Outlook
- Microsoft 365
- Slack
- Zoom
- Microsoft Teams
- ATS Integrations
- HRIS Platforms

Users should be able to begin recruiting immediately after completing—or intentionally skipping—this step.

---

# 2. Goals

The Integrations & Final Onboarding experience should:

- Connect external services securely.
- Simplify authentication with OAuth.
- Verify workspace readiness.
- Enable email communication from day one.
- Allow optional integrations to be skipped.
- Prepare all required platform services.
- Transition users seamlessly into the dashboard.
- Establish a scalable integration framework for future services.

---

# 3. User Journey

The typical onboarding journey is:

```
Workspace Provisioned

↓

Workspace Configured

↓

Team Ready

↓

Connect Gmail (Optional)

↓

Verify Integration

↓

Workspace Verification

↓

Final Setup Complete

↓

Dashboard Bootstrap

↓

Enter Dashboard
```

Users who choose not to connect Gmail should continue through the remaining onboarding steps without interruption.

---

# 4. Information Architecture

```
Final Onboarding

├── Gmail Integration

│   ├── OAuth
│   ├── Permissions
│   ├── Connection Status
│   ├── Email Sync
│   └── Retry

├── Optional Integrations

├── Workspace Verification

├── Final Setup

├── Dashboard Bootstrap

└── Dashboard Redirect
```

Every integration should remain independent, allowing new providers to be added without redesigning the onboarding flow.

---

# 5. Integration Flow

The integration workflow follows a consistent lifecycle.

```
User Selects Integration

↓

Authentication

↓

Permission Consent

↓

Authorization

↓

Token Exchange

↓

Connection Verification

↓

Initial Synchronization

↓

Ready
```

Each stage should:

- Validate successfully before continuing.
- Be recoverable after failures.
- Support retries.
- Be fully auditable.

Optional integrations should never block onboarding completion.

---

# 6. Design Principles

The Integrations & Final Onboarding experience should follow these principles.

---

## Optional by Default

Third-party integrations should enhance the platform but should not be mandatory for accessing Recrion.

Users should always have the option to skip integrations unless an organization administrator enforces a policy.

---

## Security First

Every external connection must use secure authentication mechanisms.

Requirements include:

- OAuth 2.0
- Encrypted credential storage
- Least-privilege permissions
- Secure token handling
- Backend verification

Sensitive credentials must never be exposed to the frontend.

---

## Simplicity

Connecting an external service should require as few steps as possible.

The interface should clearly explain:

- Why the integration is useful.
- What permissions are requested.
- What functionality becomes available.

---

## Transparency

Users should always know:

- Which services are connected.
- What permissions have been granted.
- Whether synchronization is in progress.
- Whether the connection is healthy.

System status should never be ambiguous.

---

## Recoverability

Integration failures should never require restarting onboarding.

The system should support:

- Retry
- Reconnect
- Skip
- Resume

Completed onboarding progress should always be preserved.

---

## Scalability

The integration architecture should support future providers without requiring changes to the onboarding experience.

Future integrations may include:

- Calendar Providers
- Video Interview Platforms
- Messaging Platforms
- HR Systems
- Assessment Platforms
- AI Services
- CRM Systems

Every provider should follow a standardized integration lifecycle.

---

## Consistency

Every integration should provide a consistent experience.

Examples include:

- Authentication
- Permission Requests
- Status Indicators
- Error Handling
- Success Messages
- Synchronization Progress

Users should not need to learn different interaction patterns for different providers.

---

## Reliability

Temporary failures such as:

- Network interruptions
- OAuth timeouts
- Provider outages

should be handled gracefully through retries and recovery mechanisms.

The platform should remain usable even when optional integrations are unavailable.

---

## Engineering Considerations

The integration framework should be:

- Provider-agnostic
- Event-driven
- Configuration-driven
- Extensible
- Secure
- Observable

Business logic should remain independent of specific third-party providers, allowing new integrations to be introduced with minimal changes to the core onboarding workflow.

---

# 7. Success Criteria

The foundation of Integrations & Final Onboarding is complete when:

- External integrations follow a consistent architecture.
- Users can securely connect third-party services.
- Optional integrations never block onboarding completion.
- Workspace readiness is verified before dashboard access.
- The onboarding experience remains simple, transparent, and recoverable.
- Integration workflows are secure, scalable, and extensible.
- The platform is prepared for future integration providers without architectural changes.
- Users transition seamlessly from onboarding into the Recrion dashboard with a production-ready workspace.



# Part 2 — Gmail Integration

> **Related Documents**
>
> - system_design.md
> - 01-authentication-foundation.md
> - 02-organization-onboarding.md
> - 03-team-workspace.md
> - Part 1 — Foundation
>
> This section defines how organizations securely connect Gmail to Recrion. Gmail integration enables recruiters to send emails, receive replies, synchronize conversations, and manage recruiting communications directly within the platform.

---

# 7. Gmail Integration Overview

## Purpose

Gmail Integration allows recruiters to securely connect their Google account using OAuth 2.0.

Once connected, Recrion can:

- Send candidate emails
- Receive email replies
- Sync conversation history
- Track email delivery
- Associate conversations with candidates
- Enable AI-powered email features

The integration should require no manual configuration beyond authentication.

---

## Features

Connected Gmail accounts enable:

- One-click email sending
- Email thread synchronization
- Candidate communication history
- AI email drafting
- Email templates
- Delivery tracking
- Future calendar integration

---

## Scope

Each recruiter connects their own Gmail account.

Connections are user-specific, not organization-wide.

---

# 8. Why Connect Gmail

Connecting Gmail improves recruiting efficiency.

Benefits include:

- Send emails without leaving Recrion.
- Keep candidate communication centralized.
- Automatically synchronize replies.
- Maintain complete communication history.
- Enable AI-assisted email generation.
- Reduce manual copy-paste workflows.

---

## Optional Integration

Gmail connection is optional.

Users may select:

```
Connect Gmail
```

or

```
Skip for Now
```

Skipping Gmail should never prevent access to the dashboard.

---

## Future Benefits

Future platform capabilities may include:

- Google Calendar Scheduling
- Meeting Invitations
- Automated Follow-ups
- Email Analytics
- AI Conversation Insights

---

# 9. Gmail Connection Screen

## Purpose

Guide users through securely connecting their Gmail account.

---

## Layout

```
+----------------------------------------------+

Connect Gmail

Communicate with candidates directly from
Recrion.

Benefits

✓ Send Emails

✓ Sync Conversations

✓ AI Email Assistant

✓ Future Calendar Support

[ Connect Gmail ]

Skip for Now

+----------------------------------------------+
```

---

## Primary Action

```
Connect Gmail
```

---

## Secondary Action

```
Skip for Now
```

---

## Information Notice

Display:

- Google OAuth will be used.
- Credentials are never stored.
- Access can be revoked later.

---

# 10. OAuth Authentication Flow

Recrion uses OAuth 2.0 Authorization Code Flow.

---

## Flow

```
Connect Gmail

↓

Google OAuth

↓

User Login

↓

Permission Consent

↓

Authorization Code

↓

Backend Token Exchange

↓

Secure Token Storage

↓

Connection Verified
```

The frontend should never receive refresh tokens.

---

## Authentication Rules

- Use Google's official OAuth flow.
- Validate state parameters.
- Protect against CSRF.
- Exchange tokens only on the backend.
- Verify Google identity before activation.

---

# 11. Required Google Permissions

Only request the minimum permissions required.

Recommended scopes:

```
openid

email

profile

gmail.send

gmail.readonly
```

Additional scopes should only be requested when corresponding features are enabled.

---

## Permission Explanation

The interface should explain each permission.

Example

**Send Email**

Allows Recrion to send emails on your behalf.

---

**Read Email**

Allows Recrion to synchronize candidate conversations.

---

**Profile**

Used to identify your Google account.

---

Users should understand why each permission is required.

---

# 12. Connection Status

Each Gmail connection has one status.

```
Not Connected

↓

Connecting

↓

Connected

↓

Syncing

↓

Disconnected

↓

Error
```

---

## Connected State

Display:

- Google Account
- Email Address
- Connected Date
- Last Sync
- Sync Status

---

## Status Indicator

Example

```
● Connected
```

Status should update in real time.

---

# 13. Reconnect Flow

Users may reconnect Gmail if:

- Tokens expire.
- Permissions change.
- Account becomes disconnected.

---

## Flow

```
Reconnect

↓

OAuth

↓

Verify

↓

Replace Tokens

↓

Resume Sync
```

Existing data should remain intact.

---

## Reconnection Notice

Display:

```
Your Gmail connection has expired.

Reconnect to continue sending and syncing emails.
```

---

# 14. Disconnect Flow

Users may disconnect Gmail at any time.

---

## Confirmation

```
Disconnect Gmail?

You will no longer be able to send or sync emails from this account.
```

---

## Disconnect Process

```
Disconnect

↓

Revoke Tokens

↓

Stop Background Sync

↓

Mark Disconnected

↓

Notify User
```

Previously synchronized email history should remain available unless deleted by organizational policy.

---

## After Disconnect

Users may reconnect later without repeating onboarding.

---

# 15. Gmail Sync Status

The platform should clearly display synchronization status.

---

## States

```
Not Started

↓

Initializing

↓

Syncing

↓

Up to Date

↓

Delayed

↓

Failed
```

---

## Display Information

Show:

- Last Sync Time
- Current Status
- Number of Conversations
- Active Synchronization

Example

```
Last Synced

2 minutes ago
```

---

## Sync Behavior

Synchronization should occur in the background.

Users should continue using Recrion while synchronization completes.

---

# 16. Initial Email Synchronization

After successful authentication, Recrion performs an initial synchronization.

---

## Process

```
OAuth Success

↓

Create Connection

↓

Register Mailbox

↓

Fetch Initial Metadata

↓

Index Conversations

↓

Associate Candidates

↓

Ready
```

---

## Synchronization Scope

Initial synchronization should:

- Retrieve recent conversation metadata.
- Associate emails with existing candidates where possible.
- Avoid unnecessary historical downloads.
- Respect provider rate limits.

Large mailboxes should synchronize incrementally.

---

## Background Processing

Initial synchronization should execute asynchronously.

The user should not wait for synchronization to complete before entering the dashboard.

Display

```
Syncing your Gmail in the background...
```

---

## Failure Recovery

Recoverable failures include:

- Network interruption
- Google API timeout
- Temporary provider outage
- Rate limiting

The synchronization service should:

- Retry automatically.
- Resume from the last successful checkpoint.
- Prevent duplicate synchronization.

---

## Security Considerations

Email synchronization must:

- Respect granted OAuth scopes.
- Encrypt stored tokens.
- Never store user passwords.
- Protect sensitive email metadata.
- Log synchronization events for auditing.
- Support token revocation.

---

## Engineering Considerations

The Gmail integration should be provider-agnostic.

Recommended architecture

```
Integration Service

↓

OAuth Provider

↓

Connection Manager

↓

Sync Service

↓

Background Workers

↓

Email Index

↓

Candidate Timeline
```

This architecture should support additional providers such as Microsoft Outlook and Microsoft 365 with minimal changes.

---

# 17. Acceptance Criteria

Gmail Integration is complete when:

- Users can securely connect Gmail using OAuth 2.0.
- Only the minimum required Google permissions are requested.
- Gmail connection status is accurately displayed.
- Users can reconnect and disconnect their account at any time.
- Initial email synchronization runs automatically in the background.
- Synchronization status is visible and continuously updated.
- Temporary failures are recoverable through automatic retries.
- OAuth credentials are securely managed on the backend.
- The integration architecture is extensible for future email providers.
- Gmail integration is secure, scalable, reliable, and production-ready.


# Part 3 — Final Onboarding

> **Related Documents**
>
> - system_design.md
> - 01-authentication-foundation.md
> - 02-organization-onboarding.md
> - 03-team-workspace.md
> - Part 1 — Foundation
> - Part 2 — Gmail Integration
>
> This section defines the final onboarding experience after workspace provisioning and Gmail integration. Its purpose is to verify that the workspace is fully operational, communicate setup progress, and transition users seamlessly into the Recrion dashboard.

---

# 17. Optional Integrations

## Purpose

Not every organization requires every integration during onboarding.

Recrion should encourage integrations without making them mandatory.

Users should be able to enter the platform immediately and connect additional services later.

---

## Supported During Initial Release

Available:

- Gmail

Coming Soon:

- Google Calendar
- Microsoft Outlook
- Microsoft 365
- Slack
- Microsoft Teams
- Zoom

Future integrations should appear disabled with a "Coming Soon" label.

---

## UI Layout

```
Available Integrations

✓ Gmail

Coming Soon

○ Google Calendar

○ Outlook

○ Slack

○ Microsoft Teams
```

---

## User Experience

The interface should clearly distinguish between:

- Connected
- Available
- Coming Soon

Users should understand that onboarding is not blocked by unavailable integrations.

---

# 18. Skip Integration

## Purpose

Allow users to complete onboarding without connecting Gmail.

---

## Primary Action

```
Skip for Now
```

---

## Confirmation

Selecting Skip displays:

```
You can connect Gmail later from

Settings → Integrations.

Continue?
```

Actions

```
Continue

Cancel
```

---

## Skip Flow

```
Skip Gmail

↓

Confirm

↓

Mark Integration Skipped

↓

Continue Final Setup
```

---

## Future Reminder

After entering the dashboard, users should receive a subtle reminder.

Example

```
Connect Gmail to start communicating with candidates.
```

This reminder may be dismissed permanently.

---

# 19. Final Setup Checklist

## Purpose

Provide confidence that Recrion is preparing the workspace correctly.

Instead of displaying a generic loading screen, present a checklist.

---

## Layout

```
Preparing Your Workspace

✓ Organization

✓ Workspace

✓ Team

✓ Security

✓ Permissions

✓ Dashboard

✓ AI Services

✓ Integrations

Almost Ready...
```

---

## Checklist Behavior

Each completed item displays:

```
✓
```

Current task

```
●
```

Pending task

```
○
```

---

## Completion Rules

The checklist updates automatically based on backend progress.

Progress should reflect actual initialization—not simulated timers.

---

# 20. Workspace Verification

## Purpose

Before entering the dashboard, Recrion performs a final health verification.

---

## Verification Checks

Confirm:

- Organization Exists
- Workspace Exists
- Recruiter Profile Exists
- Permissions Loaded
- Dashboard Configuration Ready
- Security Initialized
- AI Services Initialized
- Gmail Status Verified
- Notification Services Ready

---

## Verification Flow

```
Provisioning Complete

↓

Run Verification

↓

All Checks Pass?

↓

Yes

↓

Finalize Setup

↓

Dashboard
```

---

## Failure Handling

If verification fails:

```
Verification Failed

↓

Identify Failed Component

↓

Retry Automatically

↓

Resume Verification
```

Only unrecoverable failures require user intervention.

---

# 21. Completion Screen

## Purpose

Celebrate completion while preparing users for their first experience.

This screen should be brief and optimistic.

---

## Layout

```
🎉

Your Workspace is Ready

Everything has been prepared.

You're ready to start recruiting.

[ Enter Recrion ]
```

---

## Information

Display:

- Organization Name
- Workspace URL
- Connected Integrations
- Team Members
- Workspace Status

---

## Primary Action

```
Enter Recrion
```

---

## Secondary Actions

Optional

```
Invite Team

Connect Gmail

View Documentation
```

---

## Animation

Use a subtle success animation.

Recommended

- Fade
- Scale
- Checkmark

Avoid excessive celebration effects.

---

# 22. Dashboard Bootstrap

## Purpose

Before rendering the dashboard, Recrion prepares all required application state.

This prevents empty or inconsistent dashboard experiences.

---

## Bootstrap Responsibilities

Load:

- Authenticated User
- Organization Context
- Active Workspace
- Recruiter Profile
- Permissions
- Roles
- Dashboard Preferences
- Notifications
- Integrations
- Feature Flags
- Platform Health
- AI Configuration

---

## Bootstrap Flow

```
Enter Dashboard

↓

Load Session

↓

Load Organization

↓

Load Workspace

↓

Load Permissions

↓

Load Dashboard

↓

Render UI
```

---

## Loading Strategy

Critical resources should load first.

Examples

Critical

- Session
- Organization
- Permissions

Deferred

- Notifications
- Activity Feed
- Analytics
- AI Suggestions

The dashboard should progressively hydrate as data becomes available.

---

# 23. Dashboard Redirect

## Purpose

Provide a seamless transition into Recrion.

---

## Redirect Rules

Successful onboarding should automatically redirect users to:

```
/dashboard
```

---

## Organization Context

Before redirecting:

- Save active organization.
- Save active workspace.
- Persist onboarding completion.
- Initialize session.

---

## First Dashboard Experience

The dashboard should immediately display:

- Welcome Message
- Organization Overview
- Team Summary
- Hiring Pipeline
- AI Copilot
- Quick Actions
- Recent Activity

Empty modules should display meaningful onboarding guidance.

---

## First-Time Experience

Only during the first dashboard visit:

Display optional onboarding tips.

Examples

```
Create your first job

Invite teammates

Connect Gmail

Explore AI Copilot
```

These hints should be dismissible and never shown again once completed.

---

## Redirect Recovery

If dashboard initialization fails:

```
Retry Bootstrap

↓

Resume

↓

Dashboard
```

If recovery fails:

```
Unable to load your dashboard.

Please refresh or try again.
```

The onboarding process should not restart.

---

## Security Considerations

Before dashboard access, verify:

- Valid Session
- Organization Membership
- Workspace Context
- Active Permissions
- Successful Workspace Initialization

Unauthorized users must never bypass onboarding.

---

## Engineering Considerations

Dashboard bootstrap should execute through a centralized initialization service.

Recommended architecture

```
Authentication

↓

Organization Context

↓

Workspace Context

↓

Bootstrap Service

↓

Feature Initialization

↓

Dashboard Rendering
```

The frontend should remain responsible only for rendering state.

Business logic belongs entirely to backend services and bootstrap orchestration.

---

# 24. Acceptance Criteria

Final Onboarding is complete when:

- Optional integrations can be connected or skipped without blocking onboarding.
- Workspace readiness is communicated through a real-time setup checklist.
- Workspace verification validates all required platform services.
- A completion screen confirms successful onboarding.
- Dashboard bootstrap initializes all critical application state before rendering.
- Users are redirected seamlessly into the dashboard.
- First-time guidance is displayed only during the initial dashboard visit.
- Initialization failures are recoverable without restarting onboarding.
- Organization context and permissions are correctly established before dashboard access.
- The transition from onboarding to dashboard is secure, responsive, scalable, and production-ready.



# Part 4 — UX & States

> **Related Documents**
>
> - system_design.md
> - 01-authentication-foundation.md
> - 02-organization-onboarding.md
> - 03-team-workspace.md
> - Part 1 — Foundation
> - Part 2 — Gmail Integration
> - Part 3 — Final Onboarding
>
> This section defines the user experience standards, validation rules, application states, responsiveness, and accessibility requirements for the Integrations & Final Onboarding experience.

---

# 24. Progress Indicator

## Purpose

The Progress Indicator communicates where users are within the final onboarding experience.

It reassures users that onboarding is nearly complete and prevents uncertainty during integrations and workspace initialization.

---

## Progress Flow

```
Workspace Setup

↓

Team Setup

↓

Connect Gmail

↓

Final Verification

↓

Ready

↓

Dashboard
```

---

## Visual States

Each step supports four states.

### Completed

```
✓
```

---

### Current

```
●
```

---

### Upcoming

```
○
```

---

### Failed

```
⚠
```

Only displayed if user intervention is required.

---

## Mobile Layout

On smaller screens display

```
Step 4 of 5

Final Setup
```

instead of the full horizontal stepper.

---

## Behavior

The progress indicator updates automatically based on backend status.

Users should never manually change progress.

---

# 25. Validation Rules

## Purpose

Validation ensures integrations and workspace initialization complete successfully before dashboard access.

---

## Client Validation

Validate:

- Required selections
- Button availability
- OAuth callback state
- Accepted permissions

Provide immediate feedback.

---

## Server Validation

Validate:

- Authenticated user
- Organization membership
- Active workspace
- OAuth tokens
- Google identity
- Integration status
- Workspace provisioning
- Platform readiness

Server validation is always authoritative.

---

## Validation Messages

Messages should be:

- Clear
- Actionable
- Human-readable

Example

```
Your Gmail account couldn't be verified.

Please reconnect.
```

---

## Validation Recovery

Whenever possible:

```
Retry

↓

Resume

↓

Continue
```

Users should not restart onboarding because of temporary failures.

---

# 26. Loading States

Every asynchronous operation should communicate progress.

---

## Gmail Connection

Display

```
Connecting Gmail...
```

---

## OAuth Callback

Display

```
Verifying Google Account...
```

---

## Token Exchange

Display

```
Securing your connection...
```

---

## Initial Synchronization

Display

```
Syncing recent emails...
```

Users may continue onboarding while synchronization runs in the background.

---

## Workspace Verification

Display

```
Checking your workspace...
```

---

## Dashboard Bootstrap

Display

```
Preparing your dashboard...
```

---

## Skeleton Loading

Use skeleton placeholders for:

- Progress Checklist
- Connected Integrations
- Workspace Summary

Avoid blank pages.

---

# 27. Empty States

Empty states should educate users.

---

## No Connected Integrations

```
No integrations connected.

Connect Gmail to communicate with candidates directly from Recrion.
```

Primary Action

```
Connect Gmail
```

---

## No Optional Integrations

```
Additional integrations will become available soon.
```

---

## No Email Activity

```
Email history will appear after your first synchronization.
```

---

## No Notifications

```
Notifications will appear here once your workspace becomes active.
```

---

# 28. Error States

Errors should explain the problem and guide recovery.

---

## Gmail Authentication Failed

```
Unable to connect your Google account.

Please try again.
```

---

## OAuth Expired

```
Authentication expired.

Reconnect Gmail to continue.
```

---

## Permission Denied

```
Required Google permissions were not granted.
```

Provide

```
Reconnect
```

---

## Network Error

```
Connection lost.

Please check your internet connection.
```

---

## Synchronization Error

```
Unable to synchronize your Gmail.

We'll retry automatically.
```

---

## Workspace Verification Failed

```
We couldn't verify your workspace.

Please wait a moment while we retry.
```

---

## Unknown Error

```
Something went wrong.

Please try again later.
```

---

# 29. Success States

Success confirms completed operations.

Examples

```
Gmail Connected

Workspace Verified

Synchronization Started

Setup Complete

Ready to Recruit
```

---

## Success Flow

```
Authentication

↓

Verification

↓

Synchronization

↓

Success

↓

Continue
```

Users should transition automatically whenever possible.

---

## Success Feedback

Display subtle success indicators.

Examples

- Checkmark
- Success Badge
- Toast Notification

Avoid interrupting workflow.

---

# 30. Responsive Behavior

The experience must function consistently across:

- Desktop
- Laptop
- Tablet
- Mobile

---

## Desktop

Display:

- Two-column layout
- Progress checklist
- Integration cards
- Workspace summary

---

## Tablet

Reduce spacing while preserving layout hierarchy.

---

## Mobile

Use vertically stacked cards.

Example

```
Progress

↓

Integration Card

↓

Workspace Summary

↓

Primary Action
```

---

## Responsive Cards

Integration cards should automatically resize.

Buttons should span full width on smaller devices.

---

## Responsive Checklist

Checklist items should wrap gracefully without truncating text.

---

# 31. Accessibility

The Integrations & Final Onboarding experience must comply with

```
WCAG 2.2 AA
```

---

## Keyboard Navigation

Users should complete onboarding using only the keyboard.

Requirements

- Logical tab order
- Visible focus indicators
- Keyboard-accessible dialogs
- Enter activates primary actions
- Escape closes dialogs

---

## Screen Reader Support

Support:

- ARIA labels
- Live region announcements
- Progress updates
- Status changes
- Dialog announcements

Progress updates should automatically announce completed setup steps.

---

## Color Accessibility

Status should never rely solely on color.

Example

Instead of

```
Green Dot
```

Use

```
✓ Connected

Green Indicator
```

---

## Touch Targets

Minimum

```
44 × 44 px
```

Recommended

```
48 × 48 px
```

---

## Reduced Motion

Respect operating system preferences.

When enabled:

- Remove unnecessary transitions.
- Replace movement with subtle opacity changes.
- Preserve usability.

---

## High Contrast

All UI elements should remain readable in high-contrast mode.

Icons should include accessible labels.

---

# 32. Engineering Considerations

System states should be centralized.

Recommended state model

```
Idle

↓

Connecting

↓

Authenticating

↓

Synchronizing

↓

Verifying

↓

Ready

↓

Error
```

State transitions should be deterministic and observable.

Business logic should remain independent of presentation components.

---

# 33. Acceptance Criteria

The UX & States implementation is complete when:

- Progress indicators accurately reflect onboarding progress.
- Validation occurs consistently on both client and server.
- Loading states communicate meaningful progress.
- Empty states educate users and encourage the next action.
- Error states provide clear explanations and recovery options.
- Success states confirm completed actions without interrupting workflow.
- Responsive layouts support desktop, tablet, and mobile devices.
- The experience complies with WCAG 2.2 AA accessibility guidelines.
- State management is centralized, predictable, and resilient.
- The entire final onboarding experience is polished, intuitive, accessible, and production-ready.




# Part 5 — Engineering

> **Related Documents**
>
> - system_design.md
> - 01-authentication-foundation.md
> - 02-organization-onboarding.md
> - 03-team-workspace.md
> - Part 1 — Foundation
> - Part 2 — Gmail Integration
> - Part 3 — Final Onboarding
> - Part 4 — UX & States
>
> This section defines the engineering architecture for Gmail Integration and Final Onboarding. It covers backend services, OAuth security, database design, synchronization, APIs, state management, performance, and security requirements.

---

# 32. Backend Requirements

## Overview

The backend is responsible for securely connecting external providers, managing OAuth credentials, synchronizing mailbox data, validating workspace readiness, and preparing the dashboard.

The frontend should never directly communicate with third-party providers using sensitive credentials.

---

## Responsibilities

The backend owns:

- OAuth Authentication
- Token Exchange
- Refresh Token Management
- Gmail Connection
- Connection Verification
- Email Synchronization
- Background Jobs
- Workspace Verification
- Dashboard Bootstrap
- Audit Logging

---

## Integration Architecture

```
Frontend

↓

API Gateway

↓

Authentication

↓

Integration Service

↓

OAuth Provider

↓

Connection Manager

↓

Synchronization Service

↓

Background Workers

↓

Database
```

The architecture should remain provider-agnostic.

---

## Service Responsibilities

### Integration Service

Responsible for:

- Integration lifecycle
- Connection status
- OAuth initiation
- Disconnect handling

---

### OAuth Service

Responsible for:

- Authorization URLs
- State generation
- Token exchange
- Refresh tokens
- Revocation

---

### Synchronization Service

Responsible for:

- Initial mailbox synchronization
- Incremental synchronization
- Duplicate prevention
- Retry management

---

### Bootstrap Service

Responsible for:

- Workspace verification
- Dashboard initialization
- Session preparation
- Feature loading

---

# 33. Database Models

The following models support integrations.

---

## Integration

Represents an external provider connection.

Fields

- id
- organization_id
- user_id
- provider
- provider_account_id
- status
- created_at
- updated_at

---

## OAuthCredential

Stores OAuth credentials securely.

Fields

- id
- integration_id
- encrypted_access_token
- encrypted_refresh_token
- expires_at
- scopes
- created_at

Tokens must always be encrypted.

---

## SyncJob

Tracks synchronization operations.

Fields

- id
- integration_id
- job_type
- status
- started_at
- completed_at
- retry_count

---

## SyncCheckpoint

Tracks synchronization progress.

Fields

- id
- integration_id
- provider_cursor
- last_sync
- checkpoint_data

Allows synchronization to resume after interruptions.

---

## IntegrationEvent

Stores provider lifecycle events.

Examples

- Connected
- Disconnected
- Sync Started
- Sync Completed
- Token Refreshed

---

## WorkspaceVerification

Tracks workspace readiness.

Fields

- organization_id
- verification_status
- verified_at
- verification_result

---

## DashboardBootstrap

Tracks initialization progress.

Fields

- organization_id
- bootstrap_status
- completed_at

---

# 34. API Endpoints

All APIs should be versioned and authenticated.

---

## Gmail

```
POST   /integrations/gmail/connect

GET    /integrations/gmail/status

POST   /integrations/gmail/disconnect

POST   /integrations/gmail/reconnect
```

---

## OAuth

```
GET  /oauth/google

GET  /oauth/google/callback
```

---

## Synchronization

```
GET  /integrations/gmail/sync-status

POST /integrations/gmail/sync

POST /integrations/gmail/retry
```

---

## Workspace Verification

```
GET /workspace/verification
```

---

## Dashboard Bootstrap

```
POST /dashboard/bootstrap

GET  /dashboard/bootstrap/status
```

---

## Integrations

```
GET /integrations

PATCH /integrations/preferences
```

---

## Standard Response

Success

```json
{
  "success": true,
  "data": {}
}
```

---

Failure

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Reconnect your Gmail account."
  }
}
```

---

# 35. OAuth Security

## OAuth Version

Use

```
OAuth 2.0 Authorization Code Flow + PKCE
```

for all supported providers.

---

## Authentication Flow

```
Generate State

↓

Generate PKCE Challenge

↓

Redirect User

↓

Consent

↓

Authorization Code

↓

Backend Token Exchange

↓

Encrypt Tokens

↓

Create Integration
```

---

## Security Requirements

Every OAuth request must include:

- State Parameter
- PKCE Challenge
- Redirect URI Validation
- Nonce (where applicable)

---

## Token Storage

Store:

- Access Token
- Refresh Token
- Expiration
- Scopes

Never store tokens in plaintext.

---

## Encryption

Tokens must be encrypted using server-side encryption.

Secrets must never be exposed to:

- Browser
- Client Storage
- Local Storage
- Cookies

---

## Token Refresh

Automatically refresh expired access tokens.

Flow

```
Expired

↓

Refresh Token

↓

New Access Token

↓

Continue
```

Users should not notice refresh operations.

---

## Revocation

Disconnecting Gmail should:

- Revoke tokens
- Delete provider session
- Stop synchronization
- Remove cached credentials

---

## CSRF Protection

OAuth callbacks must validate:

- State
- Session
- Redirect URI

Invalid requests should be rejected.

---

# 36. State Management

The frontend should maintain centralized integration state.

Recommended structure

```
Integrations

↓

OAuth

↓

Synchronization

↓

Workspace Verification

↓

Bootstrap

↓

Ready
```

---

## State Lifecycle

```
Disconnected

↓

Connecting

↓

Connected

↓

Synchronizing

↓

Ready

↓

Disconnected
```

---

## Cached Data

Cache:

- Connected Integrations
- Connection Status
- Last Sync
- Workspace Verification
- Bootstrap Progress

Invalidate after mutations.

---

# 37. Background Synchronization

Synchronization should never block the user interface.

---

## Initial Sync

Immediately after connection:

```
Register Mailbox

↓

Fetch Metadata

↓

Store Checkpoint

↓

Index Emails

↓

Complete
```

---

## Incremental Sync

Subsequent synchronizations should fetch only new changes.

Use provider checkpoints whenever possible.

---

## Retry Strategy

Recoverable failures:

- API Timeout
- Network Failure
- Rate Limiting

Retry using:

- Exponential Backoff
- Maximum Retry Count
- Checkpoint Recovery

---

## Scheduling

Background workers should schedule:

- Email Sync
- Token Refresh
- Health Checks
- Cleanup Jobs

---

## Duplicate Prevention

Synchronization should be idempotent.

Emails should never be imported twice.

---

# 38. Performance Requirements

Target performance

OAuth Redirect

```
<1 second
```

---

Token Exchange

```
<500ms
```

---

Connection Verification

```
<500ms
```

---

Dashboard Bootstrap

```
<2 seconds
```

---

Workspace Verification

```
<500ms
```

---

Background Sync

Should not affect dashboard responsiveness.

---

The system should comfortably support:

- Thousands of organizations
- Millions of synchronized emails
- Concurrent synchronization workers

---

# 39. Security Considerations

## Authentication

Every endpoint requires authentication.

---

## Authorization

Every integration belongs to:

- User
- Organization

Both must be validated.

---

## Tenant Isolation

Integrations are organization-scoped.

No organization may access another organization's integrations.

---

## Token Security

Requirements

- Encrypt Tokens
- Rotate Encryption Keys
- Secure Secret Storage
- Automatic Revocation
- Audit Access

---

## Least Privilege

Only request permissions required for enabled functionality.

Never request unnecessary Google scopes.

---

## Audit Logging

Log:

- OAuth Started
- OAuth Completed
- Integration Connected
- Integration Disconnected
- Token Refreshed
- Sync Started
- Sync Completed
- Sync Failed

Audit records must be immutable.

---

## Rate Limiting

Protect:

- OAuth Endpoints
- Synchronization APIs
- Bootstrap APIs

Rate limits should be configurable.

---

## Secrets Management

Store:

- OAuth Secrets
- Encryption Keys
- Client Credentials

inside secure secret management systems.

Never expose secrets to frontend code.

---

# 40. Acceptance Criteria

The engineering implementation is complete when:

- OAuth authentication follows OAuth 2.0 Authorization Code Flow with PKCE.
- Backend services securely manage integrations and synchronization.
- Database models support providers, credentials, synchronization, and verification.
- APIs are authenticated, authorized, versioned, and idempotent.
- OAuth tokens are encrypted and securely managed.
- Background synchronization is asynchronous, checkpoint-based, and recoverable.
- Dashboard bootstrap initializes the application efficiently.
- Workspace verification validates platform readiness before dashboard access.
- Security controls enforce tenant isolation, least privilege, audit logging, and secret management.
- The integration architecture is provider-agnostic, scalable, observable, maintainable, and production-ready.




