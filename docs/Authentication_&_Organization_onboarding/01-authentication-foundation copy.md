# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Part 1 — Authentication Foundation

> **Document Version:** 1.0
>
> **Related Documents**
>
> - `system_design.md`
> - `02-organization-onboarding.md`
>
> This document defines the complete Authentication Foundation for Recrion.
>
> It focuses on the user experience, UI/UX, layouts, component hierarchy, interactions, and frontend behavior.
>
> Global styling, typography, colors, spacing, animations, shadows, border radius, and reusable components are inherited from **Recrion System Design v1.0** and are **not repeated** here.

---

# 1. Overview

Authentication is the user's first experience with Recrion.

It should immediately communicate that this is an enterprise-grade AI recruiting platform.

The authentication flow should feel:

- Fast
- Secure
- Premium
- Calm
- Professional
- Minimal
- Trustworthy

Users should never feel overwhelmed.

Every screen should contain only the information necessary to complete the current task.

---

# 2. Design Goals

The authentication experience should achieve the following goals.

## Goal 1

Minimize cognitive load.

Only ask for information that is required.

---

## Goal 2

Provide instant feedback.

Validation should happen while typing.

Never after submission.

---

## Goal 3

Reduce friction.

Every screen should guide the user.

No confusing wording.

---

## Goal 4

Maintain consistency.

Every screen follows the same layout.

The user should immediately understand where to look.

---

## Goal 5

Build trust.

Show:

- secure authentication
- enterprise branding
- clean UI
- professional copy

Avoid marketing language.

---

# 3. Authentication User Journey

```
Landing

↓

Create Account

↓

Verify Email

↓

Login

↓

Organization Setup

↓

Dashboard
```

Existing users

```
Landing

↓

Login

↓

Dashboard
```

Forgot password

```
Login

↓

Forgot Password

↓

Email

↓

Reset Password

↓

Login
```

---

# 4. Information Architecture

```
Authentication

├── Landing
│
├── Sign Up
│
├── Login
│
├── Forgot Password
│
├── Reset Password
│
├── Email Verification
│
└── Authentication Success
```

All authentication pages are completely independent from the application dashboard.

The sidebar is never displayed.

---

# 5. Shared Authentication Layout

Every authentication page shares exactly the same layout.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                     Recrion Logo                            │
│                                                             │
│     ┌───────────────────────────────────────────────┐       │
│     │                                               │       │
│     │                                               │       │
│     │         Authentication Card                   │       │
│     │                                               │       │
│     │                                               │       │
│     └───────────────────────────────────────────────┘       │
│                                                             │
│          Footer Links                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

No split-screen illustrations.

No decorative graphics.

The interface should feel similar to:

- Linear
- Notion
- Stripe
- Vercel

Simple.

Centered.

Professional.

---

# 6. Authentication Container

Maximum Width

```
480px
```

Centered vertically.

Centered horizontally.

---

Structure

```
Logo

↓

Title

↓

Subtitle

↓

Form

↓

Primary Button

↓

Divider

↓

Secondary Action

↓

Footer
```

---

# 7. Branding

Top of every screen.

Contains

Logo

↓

Product Name

```
Recrion
```

↓

Small tagline

```
AI Recruiting Operations Platform
```

No animation.

---

# 8. Sign Up Screen

Purpose

Create a new recruiter account.

---

## Layout

```
Logo

↓

Create your account

↓

Short description

↓

Full Name

↓

Work Email

↓

Password

↓

Confirm Password

↓

Create Account Button

↓

OR

↓

Google

↓

Already have an account?

↓

Sign In
```

---

# 9. Screen Header

Title

```
Create your account
```

Subtitle

```
Start using Recrion to automate recruiting operations.
```

Maximum width

```
360px
```

Centered.

---

# 10. Form Fields

Order

```
Full Name

↓

Work Email

↓

Password

↓

Confirm Password
```

Every field

Height

```
44px
```

Inherited from

System Design.

---

# 11. Full Name

Placeholder

```
John Smith
```

Leading Icon

User

Validation

- Required
- Minimum 2 characters
- Maximum 100 characters

---

# 12. Work Email

Placeholder

```
name@company.com
```

Leading Icon

Mail

Validation

- Required
- Valid email
- Business email preferred
- Duplicate detection

---

# 13. Password

Placeholder

```
Enter password
```

Leading Icon

Lock

Trailing Icon

Show / Hide

Password Strength Indicator

Displayed underneath.

Strength Levels

- Weak
- Fair
- Strong
- Excellent

---

Requirements

Minimum

- 8 characters

Contains

- uppercase
- lowercase
- number
- symbol

---

# 14. Confirm Password

Placeholder

```
Confirm password
```

Real-time comparison.

Display

Green checkmark

or

Error.

---

# 15. Password Strength

Displayed below password field.

```
□□□□□□□□□□
Weak
```

↓

```
■■□□□□□□□□
Fair
```

↓

```
■■■■■■□□□□
Strong
```

↓

```
■■■■■■■■■■
Excellent
```

Color transitions

Gray

↓

Yellow

↓

Blue

↓

Green

Smooth animation.

---

# 16. Primary Button

Text

```
Create Account
```

Full Width

44px height

Disabled until

All fields valid.

Loading state

```
Creating account...
```

Spinner

Left aligned.

---

# 17. Divider

```
──────── OR ────────
```

Very subtle.

---

# 18. Google Authentication

Single button.

Contains

Google Logo

↓

Continue with Google

Same height

As primary button.

---

# 19. Secondary Navigation

Text

```
Already have an account?
```

↓

```
Sign In
```

Only "Sign In"

Uses brand color.

---

# 20. Login Screen

Structure

```
Logo

↓

Welcome back

↓

Subtitle

↓

Email

↓

Password

↓

Remember Me

Forgot Password

↓

Sign In

↓

Divider

↓

Google Login

↓

Create Account
```

---

# 21. Login Header

Title

```
Welcome back
```

Subtitle

```
Sign in to continue to your recruiting workspace.
```

---

# 22. Login Form

Contains

Email

↓

Password

↓

Remember Me

↓

Forgot Password

↓

Sign In

---

# 23. Remember Me

Checkbox

Default

Unchecked.

Small helper text

```
Keep me signed in for 30 days.
```

---

# 24. Forgot Password

Right aligned.

Small text button.

Hover

Underline only.

---

# 25. Login Button

Text

```
Sign In
```

Disabled until

Email

Password

Both valid.

Loading

```
Signing in...
```

---

# 26. Footer

Every page shares the same footer.

Contains

```
Terms

Privacy

Security

Contact
```

Small font.

Neutral color.

---

# 27. Authentication Navigation Rules

Users may navigate

Sign Up

⇄

Login

Without losing entered data.

Browser Back

Must function correctly.

---

# 28. Empty States

Authentication pages never display empty states.

Instead,

every screen always contains

the required form.

---

# 29. Initial Loading State

While checking authentication

Display

Centered logo

↓

Small spinner

↓

Text

```
Checking your session...
```

Maximum

2 seconds.

---

# 30. Screen Transitions

Between authentication pages

Use

Crossfade

Duration

```
180ms
```

No page sliding.

---

# 31. Component Hierarchy

```
Authentication Layout

├── Logo
├── Header
├── Form
│   ├── Input
│   ├── Input
│   ├── Password
│   ├── Password
│   └── Validation
│
├── Primary Button
├── Divider
├── Google Button
├── Secondary Link
└── Footer
```

---

# 32. Accessibility

Authentication must support

- Keyboard navigation
- Tab order
- Screen readers
- Autofill
- Password managers
- Visible focus states

All inputs must include

- labels
- aria-describedby
- error association

---

# 33. Responsive Behavior

## Desktop

Authentication card

Centered

480px width

---

## Tablet

Maximum width

```
440px
```

Centered

---

## Mobile

Padding

```
24px
```

Card width

```
100%
```

Buttons

Full width.

No horizontal scrolling.

---

# 34. Acceptance Criteria

Part 1 is complete when:

- All authentication screens share a consistent layout.
- Branding follows the Recrion Design System.
- Sign Up and Login screens are fully specified.
- Form hierarchy is clear and intuitive.
- Validation is designed for real-time feedback.
- Navigation between Sign Up and Login is seamless.
- Components are reusable and aligned with `system_design.md`.
- The experience is responsive, accessible, and ready for frontend implementation.


# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Part 2A — Password Recovery & Email Verification

> **Document Version:** 1.0
>
> **Related Documents**
>
> - `system_design.md`
> - `01-authentication-foundation.md`
>
> This document specifies the complete password recovery and email verification experience for Recrion. It defines the UI/UX, layouts, interactions, validation, navigation, and user experience while inheriting all visual styling from `system_design.md`.

---

# 1. Overview

Password recovery and email verification are security-critical flows.

These screens should reassure users that their account is protected while making the process effortless.

The experience should be:

- Clear
- Fast
- Secure
- Frictionless
- Consistent
- Minimal

Every screen should communicate progress and next steps without overwhelming the user.

---

# 2. Password Recovery Flow

```
Login

↓

Forgot Password

↓

Enter Email

↓

Recovery Email Sent

↓

Open Email

↓

Click Reset Link

↓

Reset Password

↓

Password Updated

↓

Login
```

---

# 3. Email Verification Flow

```
Sign Up

↓

Verification Email Sent

↓

Open Email

↓

Click Verification Link

↓

Email Verified

↓

Continue to Organization Setup
```

---

# 4. Forgot Password Screen

## Purpose

Allow users to request a password reset securely.

---

## Layout

```
Logo

↓

Forgot Password

↓

Description

↓

Email Input

↓

Send Reset Link

↓

Back to Login
```

The layout matches all authentication pages.

---

# 5. Header

Title

```
Forgot your password?
```

Subtitle

```
Enter your work email and we'll send you a secure password reset link.
```

Maximum Width

```
360px
```

Centered.

---

# 6. Email Field

Label

```
Work Email
```

Placeholder

```
name@company.com
```

Leading Icon

Mail

Autocomplete

```
email
```

Validation

- Required
- Valid email format
- Trim whitespace automatically

Do **not** reveal whether the email exists.

---

# 7. Send Reset Link Button

Text

```
Send Reset Link
```

Properties

- Full Width
- Primary Button
- Disabled until valid email

Loading Text

```
Sending...
```

---

# 8. Security Principle

Never expose account existence.

Regardless of whether the email is registered, display the same success screen.

Example

❌ Incorrect

```
Email not found.
```

✅ Correct

```
If an account exists for this email,
you'll receive a password reset link shortly.
```

---

# 9. Success Screen

Displayed immediately after submission.

---

## Layout

```
Success Icon

↓

Check your inbox

↓

Description

↓

Open Email App

↓

Resend Email

↓

Back to Login
```

---

# 10. Header

Title

```
Check your inbox
```

Subtitle

```
If an account exists for this email,
we've sent password reset instructions.
```

---

# 11. Success Illustration

Use a simple outlined illustration.

Examples

- Mail
- Shield
- Envelope

Avoid colorful graphics.

---

# 12. Open Email Button

Optional.

Only shown when the device supports it.

Examples

Desktop

```
Open Gmail
```

Mobile

```
Open Mail App
```

Secondary Button.

---

# 13. Resend Email

Initially disabled.

Countdown

```
Resend in 60 seconds
```

After countdown

```
Resend Email
```

Prevent spam.

---

# 14. Back to Login

Simple text button.

Returns without losing navigation history.

---

# 15. Reset Password Screen

## Purpose

Allow users to securely create a new password.

---

## Layout

```
Logo

↓

Create New Password

↓

Description

↓

New Password

↓

Confirm Password

↓

Password Strength

↓

Update Password

↓

Back to Login
```

---

# 16. Header

Title

```
Create a new password
```

Subtitle

```
Choose a strong password to keep your account secure.
```

---

# 17. New Password

Placeholder

```
Enter new password
```

Leading Icon

Lock

Trailing Icon

Show / Hide

Validation

- Minimum 8 characters
- Uppercase
- Lowercase
- Number
- Symbol

Live validation.

---

# 18. Password Checklist

Display underneath.

Example

```
✓ 8+ characters

✓ Uppercase letter

✓ Lowercase letter

✓ Number

✓ Special character
```

Update instantly while typing.

---

# 19. Confirm Password

Placeholder

```
Confirm new password
```

Real-time comparison.

Show green check icon when matched.

---

# 20. Password Strength Meter

Levels

```
Weak

Fair

Strong

Excellent
```

Display

Progress Bar

↓

Strength Label

↓

Helper Text

Example

```
Strong

Great choice.
This password is difficult to guess.
```

---

# 21. Update Password Button

Primary Button.

Text

```
Update Password
```

Disabled until

- Password valid
- Passwords match

Loading

```
Updating Password...
```

---

# 22. Password Updated Screen

Displayed after successful reset.

---

## Layout

```
Success Icon

↓

Password Updated

↓

Description

↓

Continue to Login
```

---

Header

```
Password updated successfully
```

Subtitle

```
Your password has been changed.

You can now sign in using your new password.
```

Primary Button

```
Continue to Login
```

---

# 23. Invalid Reset Link

Possible reasons

- Expired
- Already used
- Invalid
- Modified

---

## Layout

```
Warning Icon

↓

Reset Link Expired

↓

Explanation

↓

Request New Link

↓

Back to Login
```

---

Title

```
This reset link has expired.
```

Subtitle

```
Request a new password reset email to continue.
```

Primary Button

```
Request New Link
```

---

# 24. Email Verification Screen

Displayed immediately after registration.

---

## Purpose

Confirm ownership of the user's email before accessing the platform.

---

## Layout

```
Success Illustration

↓

Verify your email

↓

Description

↓

Email Address

↓

Resend Email

↓

Change Email

↓

Sign Out
```

---

# 25. Header

Title

```
Verify your email
```

Subtitle

```
We've sent a verification email to your inbox.

Click the link to activate your account.
```

---

# 26. Displayed Email

Example

```
john@company.com
```

Display as read-only.

Include

```
Not your email?

Change Email
```

---

# 27. Waiting State

The verification page remains open while waiting.

Display

```
Waiting for verification...
```

Include a subtle loading indicator.

Do not block interaction.

---

# 28. Automatic Verification

If verification occurs in another tab,

Recrion should automatically detect it.

No page refresh required.

Within a few seconds,

display

```
Email verified successfully.
```

Automatically continue.

---

# 29. Manual Refresh

Secondary Button

```
I've Verified My Email
```

Triggers verification check.

---

# 30. Resend Verification

Initially disabled.

Countdown

```
Resend in 60 seconds
```

After countdown

```
Resend Verification Email
```

---

# 31. Change Email

Allows user to return to Sign Up.

Only the email field becomes editable.

Previously entered

- Name
- Password

remain preserved.

---

# 32. Email Verified Screen

Shown immediately after verification.

---

## Layout

```
Success Icon

↓

Email Verified

↓

Description

↓

Continue

```

---

Header

```
Your email has been verified.
```

Subtitle

```
Your account is ready.

Let's set up your organization.
```

Primary Button

```
Continue
```

Navigates to

```
Organization Onboarding
```

---

# 33. Micro-interactions

Every successful action provides immediate visual feedback.

Examples

- Button ripple
- Success icon animation
- Checkmark scale animation
- Smooth fade transitions
- Progress updates

Animation Duration

```
180ms–240ms
```

Avoid excessive motion.

---

# 34. Responsive Behavior

## Desktop

Authentication Card

```
480px
```

Centered.

---

## Tablet

Authentication Card

```
440px
```

Reduced spacing.

---

## Mobile

- Full width card
- 24px horizontal padding
- Large tap targets
- Sticky primary button if keyboard is open
- Inputs remain visible above the keyboard

---

# 35. Accessibility

All screens must support

- Keyboard navigation
- Screen readers
- Autofill
- Password managers
- Focus indicators
- High contrast mode

Buttons and inputs must include

- Labels
- ARIA descriptions
- Error associations
- Semantic HTML

---

# 36. Acceptance Criteria

Part 2A is complete when:

- Forgot Password flow is fully specified.
- Password Reset flow is complete.
- Email Verification flow is defined.
- Invalid and expired link scenarios are handled.
- Success screens communicate the next step clearly.
- All forms support real-time validation.
- Responsive behavior is defined.
- Micro-interactions are documented.
- Accessibility requirements are included.
- The flow transitions naturally into Organization Onboarding.


# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Part 2B.1 — Authentication Flow, Session Management & Route Protection

> **Document Version:** 1.0
>
> **Related Documents**
>
> - `system_design.md`
> - `01-authentication-foundation.md`
> - `Part 2A`
>
> This document defines how authentication behaves throughout the application after the user interacts with the authentication screens. It focuses on navigation logic, session lifecycle, route protection, loading states, and error handling rather than UI design.

---

# 1. Overview

Authentication is not just a login screen.

It is the mechanism responsible for ensuring that every user:

- accesses only authorized resources,
- maintains a secure session,
- experiences seamless navigation,
- never loses work due to unexpected authentication issues.

Authentication should feel invisible.

Users should rarely think about it.

---

# 2. Authentication State Machine

Every authenticated user exists in one of several predefined states.

```
Unauthenticated

↓

Authenticating

↓

Authenticated

↓

Email Verification Required

↓

Organization Setup Required

↓

Organization Ready

↓

Dashboard
```

Additional states

```
Session Expired

↓

Reauthentication Required
```

or

```
Account Disabled

↓

Access Denied
```

No state should ever leave the application in an undefined condition.

---

# 3. Authentication Lifecycle

The complete lifecycle follows this sequence.

```
Application Opens

↓

Initialize Authentication

↓

Check Existing Session

↓

Session Exists?

├── No
│
│   Login Screen
│
└── Yes
    │
    Validate Token
    │
    ├── Invalid
    │      Login
    │
    └── Valid
           │
           Email Verified?
           │
           ├── No
           │      Email Verification
           │
           └── Yes
                  │
                  Organization Exists?
                  │
                  ├── No
                  │      Organization Setup
                  │
                  └── Yes
                         Dashboard
```

---

# 4. Application Startup

Whenever Recrion starts,

authentication initializes before rendering any protected content.

Sequence

```
Initialize App

↓

Load Environment

↓

Read Session

↓

Validate Authentication

↓

Determine User State

↓

Navigate
```

Users should never briefly see protected pages before being redirected.

---

# 5. Authentication Bootstrap Screen

During initialization,

display a lightweight loading screen.

Layout

```
Logo

↓

Spinner

↓

Checking your session...
```

Purpose

- Prevent layout flickering.
- Prevent unauthorized content flashes.
- Allow silent token validation.

Maximum visible duration

```
2 seconds
```

If validation takes longer,

show

```
Still connecting...
```

---

# 6. Authentication Decision Matrix

| Condition | Destination |
|-----------|-------------|
| No session | Login |
| Invalid token | Login |
| Email not verified | Email Verification |
| Organization missing | Organization Setup |
| User invited to organization | Invitation Acceptance |
| Valid session | Dashboard |
| Account disabled | Access Denied |

---

# 7. Route Classification

All application routes belong to one of three categories.

## Public Routes

Examples

```
/login

/signup

/forgot-password

/reset-password
```

Anyone may access them.

---

## Semi-Protected Routes

Require partial authentication.

Examples

```
/verify-email

/onboarding

/invitation
```

User must be logged in.

Organization may not exist yet.

---

## Protected Routes

Require complete authentication.

Examples

```
/dashboard

/candidates

/jobs

/pipeline

/settings

/analytics
```

Require

- valid session
- verified email
- organization membership

---

# 8. Route Guards

Every protected route passes through a Route Guard.

Pseudo Flow

```
User Requests Route

↓

Authenticated?

↓

No

↓

Redirect Login

↓

Yes

↓

Email Verified?

↓

No

↓

Verification Screen

↓

Yes

↓

Organization Exists?

↓

No

↓

Onboarding

↓

Yes

↓

Allow Access
```

---

# 9. Redirect Rules

If authentication fails,

users should always return to their intended page after login.

Example

```
User opens

/dashboard/jobs

↓

Session Expired

↓

Login

↓

Successful Login

↓

Return

/dashboard/jobs
```

Never redirect to Dashboard unless no previous destination exists.

---

# 10. Navigation Rules

### Login

```
Login

↓

Dashboard
```

---

### New User

```
Signup

↓

Verify Email

↓

Organization Setup

↓

Dashboard
```

---

### Password Reset

```
Reset Password

↓

Login

↓

Dashboard
```

---

### Session Expiration

```
Dashboard

↓

Session Expired

↓

Login

↓

Return Previous Page
```

---

# 11. Browser Refresh

Refreshing the page must never log the user out.

Behavior

```
Refresh

↓

Validate Session

↓

Restore User

↓

Restore Current Route
```

No visible loading after initialization.

---

# 12. Browser Back Button

Back navigation should behave naturally.

Example

```
Dashboard

↓

Back

↓

Login
```

If authenticated,

automatically redirect back.

Users should never see Login while already authenticated.

---

# 13. Deep Linking

Direct navigation to any protected URL must work.

Example

```
https://recrion.app/candidates
```

Behavior

```
Check Session

↓

Authenticated

↓

Candidates Page
```

Otherwise

```
Login

↓

Candidates
```

---

# 14. Authentication Loading States

Loading should be predictable.

Examples

### Login

```
Signing in...
```

---

### Signup

```
Creating account...
```

---

### Verify Email

```
Checking verification...
```

---

### Session Validation

```
Checking your session...
```

---

### Organization Lookup

```
Loading workspace...
```

Buttons remain disabled during loading.

Prevent duplicate submissions.

---

# 15. Global Authentication Overlay

During critical authentication operations,

prevent interaction.

Display

```
Semi-transparent overlay

↓

Spinner

↓

Status Message
```

Examples

```
Authenticating...

Restoring session...

Preparing workspace...
```

Avoid full-screen white flashes.

---

# 16. Error Classification

Authentication errors fall into four categories.

## Validation Errors

Example

```
Invalid email format.
```

Displayed inline.

---

## Authentication Errors

Examples

```
Incorrect email or password.

Invalid credentials.
```

Displayed inside alert component.

---

## Authorization Errors

Examples

```
You don't have permission to access this page.
```

Displayed on dedicated page.

---

## System Errors

Examples

```
Something went wrong.

Please try again.
```

Retry available.

---

# 17. Inline Validation

Validation occurs immediately.

Examples

```
✖ Password too short

✔ Password accepted

✖ Invalid email
```

Never wait until form submission.

---

# 18. Authentication Error Cards

Errors should use a reusable alert component.

Structure

```
Warning Icon

↓

Title

↓

Description

↓

Retry
```

Example

```
Unable to sign in

Please check your credentials.
```

---

# 19. Network Failure

If connection is lost,

display

```
No Internet Connection

Reconnect to continue.
```

Retry button

↓

Automatic retry when online.

Never discard entered form data.

---

# 20. Session Validation Failure

If token validation fails,

clear session securely.

Sequence

```
Remove Tokens

↓

Clear User Cache

↓

Clear Queries

↓

Redirect Login
```

Do not leave stale user information visible.

---

# 21. Unauthorized API Response (401)

When the backend returns **401 Unauthorized**:

```
Pause current request

↓

Attempt silent session validation

↓

Successful?

├── Yes
│     Retry Request
│
└── No
      Redirect Login
```

The user should experience minimal interruption.

---

# 22. Forbidden Access (403)

A valid user without sufficient permissions should see an access-denied page.

Layout

```
Shield Icon

↓

Access Restricted

↓

Explanation

↓

Return to Dashboard
```

Never redirect silently.

Explain why access is unavailable.

---

# 23. Expired Invitation

If a user opens an expired invitation link,

display

```
Invitation Expired

↓

Request a new invitation

↓

Contact administrator
```

Do not show generic 404 pages.

---

# 24. Logging & Diagnostics

Authentication events should be recorded for auditing and troubleshooting.

Events include:

- Successful sign in
- Failed sign in
- Sign out
- Password reset request
- Password reset success
- Email verification
- Session expiration
- Unauthorized access attempt

Sensitive data (passwords, tokens, verification codes) must never be logged.

---

# 25. Acceptance Criteria

Part 2B.1 is complete when:

- Authentication state transitions are fully defined.
- Application startup behavior is deterministic.
- Route guards protect all restricted resources.
- Public, semi-protected, and protected routes are clearly separated.
- Redirect logic preserves the user's intended destination.
- Loading states prevent UI flickering and duplicate actions.
- Authentication errors are categorized and consistently presented.
- Unauthorized and forbidden access scenarios are handled gracefully.
- Browser refresh, deep linking, and navigation behave predictably.
- Authentication flow is ready for frontend implementation and backend integration.

# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Part 2B.2 — Security UX, Session Persistence & Engineering Guidelines

> **Document Version:** 1.0
>
> **Related Documents**
>
> - `system_design.md`
> - `01-authentication-foundation.md`
> - `Part 2A`
> - `Part 2B.1`
>
> This document defines the security experience, session persistence, logout behavior, token lifecycle, browser synchronization, accessibility, engineering guidelines, and production readiness requirements for Recrion Authentication.

---

# 1. Overview

Security should never make the product feel difficult to use.

The authentication experience should balance:

- Security
- Performance
- Simplicity
- Reliability
- Transparency

Users should always understand:

- Why something happened
- What action is required
- What will happen next

Authentication should feel invisible during normal usage.

---

# 2. Security UX Principles

Every authentication-related interaction should follow these principles.

## Predictable

Users should always know what happens after an action.

Example

```
Login

↓

Loading

↓

Dashboard
```

Never leave users wondering if a request succeeded.

---

## Informative

Explain problems clearly.

❌

```
Unknown Error
```

✅

```
Your session has expired.

Please sign in again.
```

---

## Secure

Never reveal sensitive information.

Never expose:

- password requirements in API responses
- account existence
- tokens
- server implementation details

---

## Non-blocking

Recover automatically whenever possible.

Avoid unnecessary interruptions.

---

# 3. Remember Me Behavior

Users may optionally remain signed in.

Checkbox

```
☐ Keep me signed in for 30 days
```

Behavior

Unchecked

```
Session expires after browser session.
```

Checked

```
Persistent authentication.
```

Users can revoke all remembered devices from Account Settings.

---

# 4. Session Persistence

Session should survive:

- Browser refresh
- Browser restart (when Remember Me is enabled)
- Network reconnect
- Temporary internet outage

Session should **not** survive:

- Logout
- Password change (optional organization policy)
- Administrator forced logout
- Account suspension

---

# 5. Silent Session Validation

Whenever the application starts,

authentication should validate the current session in the background.

Flow

```
Load Application

↓

Read Session

↓

Validate Session

↓

Continue

or

Redirect Login
```

No unnecessary loading screens after the initial bootstrap.

---

# 6. Session Expiration

When a session expires during usage:

```
User Working

↓

Session Expires

↓

Current Action Completes (if possible)

↓

Session Expired Dialog

↓

Sign In Again
```

Avoid instantly redirecting users without explanation.

---

# 7. Session Expired Dialog

Layout

```
Warning Icon

↓

Session Expired

↓

Description

↓

Sign In Again
```

Title

```
Your session has expired.
```

Description

```
For your security, please sign in again.
```

Primary Button

```
Sign In Again
```

---

# 8. Token Refresh Strategy

The application should automatically maintain authenticated sessions.

Flow

```
Access Token Near Expiration

↓

Request New Token

↓

Successful

↓

Continue Working
```

Users should never notice this process.

---

# 9. Failed Token Refresh

If refresh fails:

```
Refresh Failed

↓

Clear Session

↓

Login Screen

↓

Restore Previous Destination
```

Never continue using expired credentials.

---

# 10. Multi-Tab Synchronization

If a user has multiple browser tabs open:

### Logout

One tab logs out

↓

All tabs immediately become logged out.

---

### Login

One tab logs in

↓

Other tabs automatically update.

---

### Password Changed

All tabs require fresh authentication.

---

# 11. Concurrent Sessions

Users may sign in from multiple devices unless restricted by organization policy.

Examples

- Desktop
- Laptop
- Mobile
- Tablet

Every active device should appear in:

```
Settings

↓

Security

↓

Active Sessions
```

---

# 12. Logout Flow

Sequence

```
User Clicks Logout

↓

Confirmation (optional)

↓

Invalidate Session

↓

Clear Local Storage

↓

Clear Memory

↓

Clear Cache

↓

Redirect Login
```

---

# 13. Logout Confirmation

If unsaved changes exist:

Display

```
You have unsaved changes.

Logging out now may discard your work.
```

Buttons

```
Cancel

Logout
```

---

# 14. Forced Logout

Administrators may revoke access.

Examples

- Account disabled
- Security policy
- Organization removal

Display

```
Your access has been revoked.

Please contact your administrator.
```

---

# 15. Browser Storage

Only store minimal authentication data.

Allowed

- Session identifier
- Refresh token (secure storage)
- Remember Me preference

Never store

- Password
- Verification code
- User permissions cache
- Sensitive organization data

---

# 16. Browser Offline Behavior

If internet disconnects:

Display

```
Offline Mode

You're currently offline.

Some actions are temporarily unavailable.
```

Authentication state remains unchanged until validation is required.

---

# 17. Authentication Notifications

Examples

Successful Login

```
Welcome back!
```

Password Updated

```
Your password has been updated.
```

Verification Email Sent

```
Verification email sent.
```

Organization Invitation Accepted

```
You've joined the organization.
```

Notifications should be subtle and dismiss automatically.

---

# 18. Accessibility Requirements

Authentication must satisfy WCAG 2.2 AA standards.

Requirements

- Full keyboard navigation
- Screen reader compatibility
- Logical focus order
- Minimum touch targets
- Visible focus indicators
- Sufficient color contrast
- Accessible error announcements

---

# 19. Keyboard Navigation

Tab Order

```
Logo

↓

Title

↓

Input 1

↓

Input 2

↓

Primary Button

↓

Secondary Button

↓

Footer Links
```

Never trap keyboard focus.

---

# 20. Screen Reader Support

Every interactive element requires:

- Accessible label
- Role
- Description
- Validation announcement

Example

```
Password field

Required

8 characters minimum
```

Errors should be announced immediately.

---

# 21. Performance Requirements

Authentication pages should:

- Load in under 2 seconds on broadband
- Minimize JavaScript execution
- Avoid layout shifts
- Lazy load non-essential assets
- Use optimized fonts and icons

Target Lighthouse scores:

- Performance ≥ 95
- Accessibility ≥ 100
- Best Practices ≥ 95
- SEO ≥ 90

---

# 22. Engineering Guidelines

Authentication should be modular.

Suggested frontend structure

```
Authentication

├── Layout
├── Pages
├── Components
├── Hooks
├── Services
├── Validation
├── API
├── State
└── Types
```

Separate UI from business logic.

---

# 23. State Management

Authentication state should include:

```
User

Session

Authentication Status

Loading

Error

Email Verified

Organization

Remember Me
```

Avoid storing derived state.

Always derive permissions from the authenticated user.

---

# 24. API Communication

All authentication requests should:

- Use HTTPS
- Include CSRF protection where applicable
- Handle retries appropriately
- Return consistent error formats
- Timeout gracefully

Never expose stack traces or internal errors to the client.

---

# 25. Security Recommendations

Implement:

- Secure HTTP-only cookies (preferred)
- SameSite protection
- Rate limiting
- Brute-force protection
- Email verification
- Password hashing
- Secure password reset tokens
- Audit logging
- Device/session management

---

# 26. Logging & Audit Events

Log authentication events such as:

- User registered
- Login succeeded
- Login failed
- Logout
- Password reset requested
- Password reset completed
- Email verified
- Invitation accepted
- Session revoked

Exclude sensitive information from logs.

---

# 27. Production Checklist

Authentication is production-ready when:

- All routes are protected appropriately.
- Sessions persist correctly.
- Refresh logic works automatically.
- Multi-tab synchronization functions correctly.
- Logout clears all authentication data.
- Offline behavior is handled gracefully.
- Security best practices are implemented.
- Accessibility meets WCAG 2.2 AA.
- Performance targets are achieved.
- Authentication events are audited.

---

# 28. Acceptance Criteria

This specification is complete when:

- Security UX is consistent across all authentication flows.
- Session persistence behaves predictably.
- Token refresh is transparent to users.
- Logout and forced logout scenarios are fully defined.
- Browser synchronization across multiple tabs works correctly.
- Offline and reconnect behavior are documented.
- Accessibility requirements are implementation-ready.
- Engineering guidelines support a scalable authentication architecture.
- Authentication meets enterprise security and usability expectations.


# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Part 3A — Organization Creation & Onboarding Wizard

> **Document Version:** 1.0
>
> **Related Documents**
>
> - `system_design.md`
> - `01-authentication-foundation.md`
> - `Part 2A`
> - `Part 2B`
>
> This document defines the first-time onboarding experience after authentication. It specifies how a newly verified user creates their organization, configures their workspace, and progresses toward entering Recrion for the first time.

---

# 1. Overview

After a user successfully verifies their email, they should never be dropped directly into the dashboard.

Instead, Recrion guides them through a short onboarding process that creates their recruiting workspace.

The onboarding experience should:

- Feel welcoming
- Require minimal effort
- Build confidence
- Be fast to complete
- Avoid unnecessary questions
- Clearly communicate progress

Average completion time should be less than **2 minutes**.

---

# 2. Objectives

The onboarding wizard has five primary objectives:

1. Create the user's organization.
2. Configure the recruiting workspace.
3. Collect only essential company information.
4. Personalize the experience.
5. Prepare the account for integrations and team collaboration.

---

# 3. User Journey

```
Email Verified

↓

Welcome

↓

Create Organization

↓

Company Details

↓

Workspace Preferences

↓

Review

↓

Organization Created

↓

Continue to Team Setup
```

Returning users should never see this flow again.

---

# 4. Information Architecture

```
Organization Onboarding

├── Welcome
│
├── Organization Information
│
├── Company Details
│
├── Workspace Preferences
│
├── Review
│
└── Organization Created
```

Each step represents a dedicated page within the onboarding wizard.

---

# 5. Onboarding Layout

Every onboarding screen uses the same layout.

```
┌─────────────────────────────────────────────┐
│                                             │
│                Recrion Logo                 │
│                                             │
│     Progress Indicator (Top)                │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │        Current Step Content          │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  Back                     Continue          │
│                                             │
└─────────────────────────────────────────────┘
```

No sidebar should be displayed.

The user should remain focused on one task at a time.

---

# 6. Progress Stepper

The onboarding wizard includes a horizontal progress stepper.

Example:

```
●────────○────────○────────○────────○

Welcome
Organization
Company
Preferences
Finish
```

Completed steps:

✓ Blue checkmark

Current step:

Filled primary color

Upcoming steps:

Outlined circle

Users can navigate back to completed steps.

Future steps remain inaccessible.

---

# 7. Navigation Rules

Each page contains:

Primary Button

```
Continue
```

Secondary Button

```
Back
```

The first page hides the Back button.

The final page replaces Continue with:

```
Create Organization
```

---

# 8. Auto Save

Every completed field should automatically save.

Users should never lose progress if:

- Browser refreshes
- Internet reconnects
- Browser accidentally closes

Auto-save delay:

```
500ms
```

Display status:

```
✓ Saved
```

or

```
Saving...
```

---

# 9. Welcome Screen

Purpose:

Introduce the onboarding process.

No forms appear on this screen.

---

## Layout

```
Logo

↓

Welcome to Recrion

↓

Description

↓

Estimated Time

↓

What You'll Set Up

↓

Get Started
```

---

# 10. Header

Title

```
Welcome to Recrion
```

Subtitle

```
Let's create your recruiting workspace.

This only takes about 2 minutes.
```

---

# 11. Estimated Time Card

Small informational card.

```
⏱ Estimated Setup Time

2 Minutes
```

Neutral styling.

No interaction.

---

# 12. What You'll Set Up

Display three informational cards.

---

### Organization

```
🏢

Create your recruiting organization.
```

---

### Workspace

```
💼

Configure your hiring workspace.
```

---

### Team

```
👥

Invite teammates later.
```

Simple illustrations only.

---

# 13. Primary CTA

Button

```
Get Started
```

Navigates to:

Organization Information

---

# 14. Organization Information

Purpose:

Collect the minimum required information to create the organization.

---

## Layout

```
Organization Name

↓

Organization URL

↓

Continue
```

---

# 15. Organization Name

Label

```
Organization Name
```

Placeholder

```
Acme Recruiting
```

Validation

- Required
- 2–100 characters
- Unicode supported
- Trim whitespace
- Prevent duplicate spaces

Examples

✔ Acme Recruiting

✔ TechNova

✔ Silicon Labs

---

# 16. Organization URL

Automatically generated.

Example

```
acme
```

Workspace URL

```
recrion.app/acme
```

Editable.

Validation

- Lowercase
- Numbers allowed
- Hyphens allowed
- No spaces
- Minimum 3 characters
- Maximum 40 characters

Live availability check.

---

# 17. URL Availability

While typing:

```
Checking availability...
```

Available

```
✓ Available
```

Unavailable

```
Already taken
```

Suggestions

```
acme-inc

acme-team

acme-hr
```

---

# 18. Company Details

Purpose:

Personalize the workspace.

---

## Fields

```
Industry

↓

Company Size

↓

Country

↓

Timezone
```

---

# 19. Industry

Dropdown.

Searchable.

Examples

- Technology
- Healthcare
- Finance
- Education
- Retail
- Manufacturing
- Consulting
- Government
- Hospitality
- Recruitment Agency
- Other

Search updates results instantly.

---

# 20. Company Size

Radio Cards.

```
1–10

11–50

51–200

201–500

500+
```

Single selection.

---

# 21. Country

Searchable dropdown.

Display:

```
🇺🇸 United States
🇬🇧 United Kingdom
🇵🇰 Pakistan
🇨🇦 Canada
```

Selected country automatically updates:

- Timezone suggestions
- Regional defaults

---

# 22. Timezone

Auto-selected.

User may change manually.

Example

```
UTC+05:00

Asia/Karachi
```

---

# 23. Workspace Preferences

Purpose:

Configure the initial recruiting environment.

---

## Fields

```
Default Hiring Language

↓

Date Format

↓

Time Format

↓

Weekly Start Day
```

---

# 24. Language

Default

```
English
```

Future versions may support additional languages.

---

# 25. Date Format

Options

```
MM/DD/YYYY

DD/MM/YYYY

YYYY-MM-DD
```

Preview updates immediately.

---

# 26. Time Format

Options

```
12 Hour

24 Hour
```

Preview

```
3:45 PM

15:45
```

---

# 27. Week Start

Options

```
Sunday

Monday
```

Used for:

- Calendar
- Analytics
- Reports

---

# 28. Review Screen

Before creating the organization, present a summary.

```
Organization

Acme Recruiting

Workspace URL

recrion.app/acme

Industry

Technology

Company Size

11–50

Country

United States

Timezone

UTC−05:00
```

Users can edit previous steps.

---

# 29. Create Organization Button

Primary CTA

```
Create Organization
```

Loading State

```
Creating Workspace...
```

Disable navigation while processing.

---

# 30. Success Animation

After successful creation:

Display

```
✓

Organization Created
```

Animation duration:

```
250ms
```

Avoid excessive motion.

---

# 31. Validation Rules

Every required field validates in real time.

Errors appear directly below inputs.

Examples

```
Organization name is required.

Workspace URL is unavailable.

Please choose a company size.
```

Do not display validation only after submission.

---

# 32. Error Recovery

If organization creation fails:

Display inline error.

Example

```
We couldn't create your organization.

Please try again.
```

Preserve all entered information.

---

# 33. Responsive Behavior

## Desktop

Wizard width

```
640px
```

Centered.

---

## Tablet

Maximum width

```
560px
```

Reduced spacing.

---

## Mobile

- Full-width layout
- 24px padding
- Full-width buttons
- Sticky primary action
- Dropdowns open full-screen

---

# 34. Accessibility

The onboarding wizard must support:

- Keyboard navigation
- Screen readers
- Logical tab order
- Visible focus states
- Accessible dropdowns
- High contrast mode

Every input requires:

- Label
- Description
- Error association
- ARIA attributes

---

# 35. Acceptance Criteria

Part 3A is complete when:

- The onboarding wizard has a consistent multi-step experience.
- Organization creation requires only essential information.
- Workspace URL validation is performed in real time.
- Progress is automatically saved.
- Users can navigate backward without losing data.
- Validation is immediate and user-friendly.
- Review and confirmation screens summarize entered information clearly.
- The experience is fully responsive and accessible.
- The wizard is ready for backend integration and implementation.



# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Part 3B — Workspace Initialization & First-Time Experience

> **Document Version:** 1.0
>
> **Related Documents**
>
> - `system_design.md`
> - `01-authentication-foundation.md`
> - `Part 2A`
> - `Part 2B`
> - `Part 3A`
>
> This document defines everything that happens immediately after an organization is successfully created. It covers workspace initialization, default configuration, first-time user experience, account personalization, system provisioning, and the transition into the Recrion dashboard.

---

# 1. Overview

Once an organization has been created, Recrion should automatically prepare a production-ready recruiting workspace.

Users should never be required to manually configure technical settings before they can begin recruiting.

Everything required for the initial experience should be created automatically.

The objective is to make the platform feel ready from the very first login.

---

# 2. Objectives

Workspace initialization should:

- Provision the organization
- Configure the default recruiting workspace
- Assign organization ownership
- Create recruiter profile
- Generate default settings
- Prepare future integrations
- Transition users directly into productivity

Target completion time:

```
< 5 seconds
```

---

# 3. Initialization Flow

```
Organization Created

↓

Initialize Workspace

↓

Create Organization Owner

↓

Generate Default Workspace

↓

Apply Default Settings

↓

Create Default Pipelines

↓

Create Recruiter Profile

↓

Prepare Integrations

↓

Workspace Ready

↓

Continue to Team Setup
```

All initialization should happen automatically.

---

# 4. Processing Screen

While initialization is running, users should see a dedicated progress screen.

Layout

```
Recrion Logo

↓

Preparing your workspace...

↓

Progress Indicator

↓

Current Step
```

The user cannot interact with the application during this stage.

---

# 5. Progress Timeline

Display a live checklist showing completed tasks.

Example

```
✓ Creating organization

✓ Setting up workspace

✓ Configuring recruiting pipeline

✓ Creating administrator profile

○ Finalizing setup
```

Each completed step animates smoothly.

---

# 6. Estimated Time

Display a subtle informational message.

```
This usually takes less than 10 seconds.
```

Avoid displaying percentages unless real progress is available.

---

# 7. Organization Provisioning

Automatically create:

- Organization
- Organization Owner
- Default Workspace
- Workspace Identifier
- Default Permissions
- Default Settings

The user should never configure these manually.

---

# 8. Default Recruiter Profile

Automatically generate the owner's recruiter profile.

Profile Information

```
Full Name

↓

Email

↓

Role

↓

Avatar Placeholder
```

Role

```
Organization Owner
```

The avatar uses the user's initials until an image is uploaded.

---

# 9. Default Workspace

Every organization begins with one workspace.

Example

```
Main Workspace
```

Future versions may support multiple workspaces.

The primary workspace becomes the active workspace.

---

# 10. Default Recruiting Pipeline

Automatically create a standard recruiting pipeline.

Stages

```
Applied

↓

Screening

↓

Interview

↓

Assessment

↓

Offer

↓

Hired
```

These stages are editable later.

---

# 11. Default Dashboard

Initialize an empty but fully functional dashboard.

Sections include:

- Hiring Overview
- Candidate Pipeline
- AI Insights
- Recent Activity
- Upcoming Interviews
- Pending Approvals

Widgets display onboarding-friendly empty states until data is available.

---

# 12. Default Organization Settings

Automatically configure:

- Language
- Timezone
- Date Format
- Time Format
- Week Start Day
- Notification Preferences

These values inherit selections from onboarding.

---

# 13. Notification Preferences

Default settings:

```
Email Notifications

Enabled

↓

Desktop Notifications

Enabled

↓

Weekly Summary

Enabled

↓

Marketing Emails

Disabled
```

Users can modify these later.

---

# 14. AI Workspace Initialization

Provision the AI services required by Recrion.

Examples

- Recruiter Copilot
- Candidate Analysis
- Email Drafting
- AI Recommendations

No user configuration is required during onboarding.

---

# 15. Security Initialization

Automatically configure:

- Organization Owner permissions
- Default access policies
- Session configuration
- Audit logging
- Security preferences

Organization owners receive full administrative access.

---

# 16. Default Roles

Create the built-in organization roles.

```
Owner

Administrator

Recruiter

Hiring Manager

Viewer
```

Permissions inherit predefined templates.

---

# 17. Empty State Preparation

The platform should prepare friendly empty states for first-time users.

Examples

Candidates

```
No candidates yet.

Import applicants or connect Gmail to begin recruiting.
```

Jobs

```
Create your first job posting.
```

Interviews

```
No interviews scheduled.
```

These empty states should educate users about the next action.

---

# 18. Success Screen

After initialization completes, display a completion screen.

Layout

```
Success Icon

↓

Workspace Ready

↓

Description

↓

What's Next

↓

Continue
```

---

# 19. Header

Title

```
Your workspace is ready.
```

Subtitle

```
Everything has been configured successfully.

You're ready to start recruiting.
```

---

# 20. What's Next

Display three informational cards.

### Invite Your Team

```
Collaborate with recruiters and hiring managers.
```

---

### Connect Gmail

```
Sync recruiting emails automatically.
```

---

### Create Your First Job

```
Start building your hiring pipeline.
```

These cards are informational and introduce the next onboarding phases.

---

# 21. Continue Button

Primary CTA

```
Continue
```

Navigates to:

```
Team & Workspace Setup
```

No dashboard is shown until the onboarding sequence progresses to the next milestone.

---

# 22. Failure Recovery

If initialization fails:

Display an inline recovery screen.

Layout

```
Warning Icon

↓

Workspace Setup Failed

↓

Explanation

↓

Retry Setup

↓

Contact Support
```

Users should never lose their previously entered organization data.

---

# 23. Retry Logic

Retry should only rerun failed provisioning tasks.

Successfully completed tasks should not execute again.

Example

```
✓ Organization Created

✓ Owner Created

✖ Pipeline Creation Failed

Retry

↓

Continue from Pipeline Creation
```

---

# 24. Loading States

Each provisioning step displays contextual feedback.

Examples

```
Creating organization...

Generating workspace...

Configuring AI services...

Preparing dashboard...

Almost done...
```

Avoid generic loading messages.

---

# 25. Error Messages

Errors should be descriptive but secure.

Example

```
We couldn't complete your workspace setup.

Please try again in a few moments.
```

Avoid exposing internal server errors.

---

# 26. Navigation Rules

During initialization:

- Browser Back is disabled.
- Navigation links are hidden.
- Closing the browser is safe because provisioning is resumable.

After successful completion:

```
Continue

↓

Team Setup
```

---

# 27. Accessibility

The initialization experience must support:

- Screen readers
- Keyboard navigation
- Live progress announcements
- High contrast mode
- Reduced motion preferences

Progress updates should use ARIA live regions.

---

# 28. Responsive Behavior

## Desktop

Content Width

```
640px
```

Centered vertically.

---

## Tablet

Content Width

```
560px
```

Reduced spacing.

---

## Mobile

- Full-width layout
- 24px padding
- Vertical progress timeline
- Large touch targets
- Full-width action buttons

---

# 29. Backend Requirements

Workspace initialization should be idempotent.

If provisioning is interrupted, the backend should resume from the last successful step rather than restarting.

Provisioning tasks should execute in sequence:

1. Create organization
2. Create owner
3. Create workspace
4. Create default roles
5. Create recruiting pipeline
6. Apply organization settings
7. Configure AI services
8. Initialize dashboard
9. Mark onboarding complete

---

# 30. API Requirements

Example endpoints

```
POST   /organizations

POST   /organizations/{id}/initialize

GET    /organizations/{id}/status

POST   /organizations/{id}/retry

GET    /organizations/{id}/workspace
```

Initialization status should be queryable so the frontend can display real-time progress.

---

# 31. State Management

The frontend should maintain:

```
Organization

Initialization Status

Current Provisioning Step

Workspace

Owner Profile

Progress

Error

Completed
```

Progress should persist across browser refreshes.

---

# 32. Completion Criteria

Initialization is considered complete only when:

- Organization exists
- Owner account assigned
- Workspace created
- Default recruiting pipeline available
- Roles generated
- Settings applied
- AI services initialized
- Dashboard provisioned
- Onboarding marked complete

---

# 33. Acceptance Criteria

Part 3B is complete when:

- Workspace provisioning is fully automated.
- The user is never required to perform technical setup.
- Progress is clearly communicated throughout initialization.
- Provisioning is resumable and fault tolerant.
- Default roles, pipelines, and settings are created automatically.
- Friendly empty states prepare users for their first recruiting tasks.
- The success screen introduces the next onboarding phase.
- Backend initialization is idempotent and production-ready.
- The experience is fully responsive, accessible, and aligned with the Recrion Design System.


# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Part 4 — Backend Requirements, API Design & Security

> **Document Version:** 1.0
>
> **Related Documents**
>
> - system_design.md
> - 01-authentication-foundation.md
> - Part 2A
> - Part 2B
> - Part 3A
> - Part 3B
>
> This document defines the backend architecture, authentication APIs, security requirements, state management, and production acceptance criteria for Recrion Authentication.

---

# 1. Overview

The Authentication Service is responsible for:

- User registration
- User authentication
- Email verification
- Password recovery
- Organization ownership
- Session lifecycle
- Authorization
- Workspace initialization
- Secure API access

Authentication should be designed as an independent service that can scale separately from recruiting services.

---

# 2. High-Level Architecture

```
                    Client Application
                           │
                           ▼
                  Authentication API
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    User Service     Session Service   Email Service
          │                │                │
          └──────────┬─────┴───────────────┘
                     ▼
                 PostgreSQL
```

Future integrations

- Google OAuth
- Microsoft OAuth
- SAML SSO
- Enterprise Identity Providers

---

# 3. Authentication Modules

Authentication consists of independent modules.

```
Authentication

├── Registration
├── Login
├── Session
├── Email Verification
├── Password Reset
├── Organization
├── Invitation
├── Authorization
├── Audit Logs
└── Security
```

Each module should remain isolated.

---

# 4. Core Database Models

## User

Fields

```
id

organizationId

fullName

email

passwordHash

avatar

emailVerified

role

status

createdAt

updatedAt
```

---

## Organization

```
id

name

slug

industry

companySize

country

timezone

ownerId

createdAt
```

---

## Session

```
id

userId

refreshToken

device

browser

ipAddress

expiresAt

lastActivity
```

---

## Email Verification

```
id

userId

token

expiresAt

verifiedAt
```

---

## Password Reset

```
id

userId

token

expiresAt

usedAt
```

---

## Organization Invitation

```
id

organizationId

email

role

token

expiresAt

acceptedAt
```

---

# 5. Authentication Flow

```
Register

↓

Verify Email

↓

Login

↓

Create Organization

↓

Initialize Workspace

↓

Dashboard
```

Existing users

```
Login

↓

Dashboard
```

---

# 6. Authentication API

## Registration

```
POST /api/auth/register
```

Purpose

Create new account.

Body

```
{
  fullName,
  email,
  password
}
```

Returns

```
201 Created
```

---

## Login

```
POST /api/auth/login
```

Body

```
{
 email,
 password
}
```

Returns

```
Access Token

Refresh Token

User

Organization Status
```

---

## Logout

```
POST /api/auth/logout
```

Purpose

Invalidate current session.

---

## Logout All Devices

```
POST /api/auth/logout-all
```

Purpose

Invalidate every active session.

---

## Refresh Session

```
POST /api/auth/refresh
```

Purpose

Issue new access token.

---

## Verify Email

```
POST /api/auth/verify-email
```

Body

```
{
 token
}
```

---

## Resend Verification

```
POST /api/auth/resend-verification
```

---

## Forgot Password

```
POST /api/auth/forgot-password
```

Body

```
{
 email
}
```

---

## Reset Password

```
POST /api/auth/reset-password
```

Body

```
{
 token,
 password
}
```

---

# 7. Organization APIs

## Create Organization

```
POST /api/organizations
```

---

## Check Workspace URL

```
GET /api/organizations/check-slug
```

Query

```
slug=acme
```

---

## Initialize Workspace

```
POST /api/organizations/{id}/initialize
```

---

## Workspace Status

```
GET /api/organizations/{id}/status
```

---

# 8. Invitation APIs

Invite User

```
POST /api/invitations
```

Accept Invitation

```
POST /api/invitations/accept
```

Decline Invitation

```
POST /api/invitations/reject
```

Validate Invitation

```
GET /api/invitations/{token}
```

---

# 9. Authentication Responses

Success

```
{
 success: true,
 data: {}
}
```

Failure

```
{
 success: false,
 error: {
   code,
   message
 }
}
```

Every API should return a consistent response format.

---

# 10. Error Codes

Examples

```
INVALID_CREDENTIALS

EMAIL_ALREADY_EXISTS

EMAIL_NOT_VERIFIED

TOKEN_EXPIRED

INVALID_TOKEN

SESSION_EXPIRED

FORBIDDEN

UNAUTHORIZED

RATE_LIMITED

VALIDATION_ERROR
```

Never expose database errors.

---

# 11. Security Requirements

Passwords

- Never stored in plain text
- Hash using Argon2id (preferred) or bcrypt
- Unique salt per password

---

Tokens

- Cryptographically secure
- Short-lived access token
- Rotating refresh token

---

Transport

- HTTPS only
- TLS 1.2+
- HSTS enabled

---

Cookies

- HTTP Only
- Secure
- SameSite=Lax (or Strict where applicable)

---

# 12. Authentication Security

Implement

- Email verification
- Password reset expiration
- Session expiration
- Device tracking
- Session revocation
- Login attempt monitoring

---

# 13. Rate Limiting

Protect against brute-force attacks.

Examples

Login

```
5 attempts / minute
```

Password Reset

```
3 requests / hour
```

Email Verification

```
5 emails / hour
```

Invitation

```
20 invites / hour
```

---

# 14. Authorization

Role-based access control.

Built-in roles

```
Owner

Administrator

Recruiter

Hiring Manager

Viewer
```

Permissions should be checked on every protected endpoint.

---

# 15. Audit Logging

Record

- Registration
- Login
- Logout
- Password changes
- Email verification
- Organization creation
- Invitations
- Permission changes

Audit logs are immutable.

---

# 16. State Management

Authentication state

```
Auth State

├── User
├── Organization
├── Session
├── Loading
├── Error
├── Access Token
├── Refresh Status
├── Email Verified
├── Permissions
└── Authentication Status
```

---

# 17. Frontend State Flow

```
App Loads

↓

Restore Session

↓

Validate Token

↓

Load User

↓

Load Organization

↓

Ready
```

No protected UI should render before state is initialized.

---

# 18. Session Lifecycle

```
Login

↓

Create Session

↓

Issue Access Token

↓

Issue Refresh Token

↓

Authenticated

↓

Refresh Token Rotation

↓

Logout

↓

Destroy Session
```

---

# 19. Caching Strategy

Cache

- User profile
- Organization
- Permissions

Never cache

- Password
- Tokens
- Verification tokens
- Reset tokens

---

# 20. Monitoring

Track

- Login success rate
- Failed logins
- Password reset requests
- Verification completion
- Active sessions
- Authentication latency

---

# 21. Production Readiness Checklist

Authentication is production ready when:

- Email verification works
- Password reset works
- Sessions rotate securely
- Route protection implemented
- Organization onboarding works
- Workspace initialization completes successfully
- Invitations function correctly
- Rate limiting enabled
- HTTPS enforced
- Audit logs enabled
- Security headers configured
- Authentication tests pass

---

# 22. Acceptance Criteria

Milestone 1 Authentication is complete when:

✓ Users can securely register.

✓ Email verification is mandatory before accessing protected resources.

✓ Users can sign in and maintain persistent sessions.

✓ Password recovery is fully functional.

✓ Organization creation is completed through the onboarding wizard.

✓ Workspace initialization is automatic and fault tolerant.

✓ Role-based authorization is enforced across all protected APIs.

✓ Authentication tokens are securely generated, rotated, and revoked.

✓ Every authentication event is logged for auditing.

✓ All APIs return consistent response structures.

✓ Rate limiting protects against brute-force attacks.

✓ Authentication meets enterprise-grade security standards.

✓ Frontend state remains synchronized with backend session state.

✓ The complete authentication flow is ready for production deployment.



# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Global Validation Rules

> **Document Version:** 1.0
>
> **Related Documents**
>
> - system_design.md
> - 01-authentication-foundation.md
> - Part 2A
> - Part 2B
> - Part 3A
> - Part 3B
>
> This document defines the global validation system used across every Authentication and Organization Onboarding screen. All forms, inputs, API responses, and frontend validation must follow these rules to ensure a consistent, secure, and accessible user experience.

---

# 1. Validation Philosophy

Validation exists to help users complete tasks successfully—not to punish mistakes.

Every validation should be:

- Immediate
- Helpful
- Consistent
- Accessible
- Non-intrusive
- Secure

The system should prevent invalid data while minimizing user frustration.

---

# 2. Validation Principles

## Real-Time Validation

Validation begins while the user is typing.

Never wait until the user presses **Submit**.

Example

```
Email

john@gma

↓

Invalid email address
```

As soon as the value becomes valid, the error disappears automatically.

---

## Progressive Validation

Do not show errors immediately when an input receives focus.

Instead:

```
Focus

↓

Typing

↓

Blur or sufficient input

↓

Validate
```

Users should never see an error on an untouched field.

---

## Positive Feedback

Show success when appropriate.

Example

```
✓ Available

✓ Strong password

✓ Passwords match
```

Positive feedback builds confidence.

---

## Never Block Typing

Users should always be allowed to finish entering data.

Avoid aggressive validation that interrupts typing.

---

## Preserve User Input

If validation fails:

- Never clear the field
- Never reset the form
- Never remove previous values

---

# 3. Validation Lifecycle

Every input follows the same lifecycle.

```
Empty

↓

Focused

↓

Typing

↓

Validating

↓

Valid

or

Invalid

↓

Submitted
```

State transitions should be smooth and predictable.

---

# 4. Validation States

Each form control supports the following states.

## Default

No validation shown.

---

## Focus

Input highlighted.

No errors displayed.

---

## Typing

Validation delayed until sufficient input exists.

---

## Validating

Display subtle loading indicator.

Example

```
Checking...
```

Used for asynchronous validation.

---

## Success

Green success icon.

Example

```
✓ Looks good
```

---

## Warning

Used for recommendations.

Example

```
Consider using a stronger password.
```

Submission remains allowed.

---

## Error

Display inline error.

Example

```
Password must contain at least one number.
```

Submission disabled.

---

## Disabled

Input unavailable.

No validation shown.

---

# 5. Required Fields

Required fields display a visual indicator.

Example

```
Full Name *
```

Required fields include:

- Full Name
- Work Email
- Password
- Confirm Password
- Organization Name
- Workspace URL
- Industry
- Company Size
- Country
- Timezone

Optional fields should never display an asterisk.

---

# 6. Input Validation Priority

Validation executes in this order.

```
Required

↓

Format

↓

Length

↓

Character Rules

↓

Business Rules

↓

Server Validation
```

Stop validation after the first blocking error.

Example

Incorrect:

```
Email required

Invalid email

Already exists
```

Correct:

```
Email is required.
```

---

# 7. Full Name Validation

Requirements

- Required
- Minimum 2 characters
- Maximum 100 characters

Allowed

- Letters
- Spaces
- Hyphens
- Apostrophes

Examples

✓

```
John Smith
```

✓

```
Anne-Marie
```

✓

```
O'Connor
```

Invalid

```
A
```

Error

```
Please enter your full name.
```

---

# 8. Email Validation

Requirements

- Required
- Valid email format
- Maximum 254 characters

Trim leading and trailing spaces automatically.

Convert to lowercase before submission.

Examples

✓

```
john@company.com
```

Invalid

```
john@

john@gmail

company
```

---

Duplicate account

```
An account already exists with this email.
```

Never reveal whether an account exists during password recovery.

---

# 9. Password Validation

Requirements

Minimum

```
8 characters
```

Maximum

```
128 characters
```

Must include

- Uppercase
- Lowercase
- Number
- Special Character

---

Invalid examples

```
password

PASSWORD

12345678

Password
```

Valid

```
Recruit@2026
```

---

# 10. Password Strength Rules

Strength is calculated dynamically.

Weak

```
Short

Simple

Dictionary words
```

Fair

```
Longer

Basic complexity
```

Strong

```
Mixed characters

Long
```

Excellent

```
Unique

Complex

16+ characters
```

Strength should not block submission if minimum requirements are met.

---

# 11. Confirm Password Validation

Validation begins only after:

- Password entered
- Confirm Password touched

Error

```
Passwords do not match.
```

Success

```
✓ Passwords match
```

---

# 12. Organization Name Validation

Requirements

- Required
- 2–100 characters

Allowed

- Letters
- Numbers
- Spaces
- Hyphens
- Ampersands

Automatically remove duplicate spaces.

---

Invalid

```
"     "
```

Error

```
Organization name is required.
```

---

# 13. Workspace URL Validation

Requirements

- Lowercase
- Numbers
- Hyphens

Not allowed

- Spaces
- Special characters
- Consecutive hyphens
- Leading hyphen
- Trailing hyphen

Length

```
3–40 characters
```

---

Examples

Valid

```
acme

acme-inc

tech2026
```

Invalid

```
Acme

my company

acme!

-company
```

---

# 14. URL Availability Validation

Performed asynchronously.

States

```
Checking...
```

↓

```
✓ Available
```

↓

```
Already taken
```

Timeout

```
5 seconds
```

If timeout occurs

```
Unable to verify availability.

Please try again.
```

---

# 15. Industry Validation

Required

Dropdown selection only.

Users cannot enter arbitrary values unless "Other" is selected.

---

# 16. Company Size Validation

Exactly one option required.

No multiple selections.

---

# 17. Country Validation

Must match supported country list.

Search supports partial matches.

Example

Typing

```
Pak
```

↓

```
Pakistan
```

---

# 18. Timezone Validation

Automatically populated.

User may override.

Must match supported timezone database.

---

# 19. Checkbox Validation

Required checkboxes

Example

```
I agree to the Terms of Service
```

Submission disabled until checked.

---

# 20. Asynchronous Validation

Some validations require server communication.

Examples

- Workspace URL
- Email uniqueness
- Invitation token
- Password reset token
- Email verification token

Display loading state while waiting.

Never freeze the UI.

---

# 21. Validation Timing

Real-time

- Password
- Email format
- Confirm Password

Blur

- Full Name

Server

- Workspace URL

Submit

- Final form validation

---

# 22. Error Message Guidelines

Every error message must:

- Explain the problem
- Explain how to fix it
- Be concise
- Avoid technical language

Good

```
Please enter a valid email address.
```

Bad

```
Validation Exception 204.
```

---

# 23. Inline Validation

Errors appear immediately below the relevant input.

Never display unrelated errors elsewhere.

Example

```
Email

john@

Please enter a valid email address.
```

---

# 24. Form-Level Validation

Display a form alert only for errors affecting the entire submission.

Examples

```
Unable to create account.

Please try again.
```

Avoid showing multiple banners simultaneously.

---

# 25. Server Validation

Server validation always takes precedence over client validation.

Examples

```
Email already registered

Workspace URL unavailable

Invitation expired
```

Frontend must gracefully display backend validation responses.

---

# 26. Validation Recovery

As soon as the user corrects an invalid value:

- Remove the error automatically.
- Restore normal styling.
- Re-enable submission when all fields are valid.

No manual reset should be required.

---

# 27. Validation Animations

Transitions should be subtle.

Recommended duration

```
150–200ms
```

Animations include:

- Border color transition
- Helper text fade
- Success icon appearance
- Error icon appearance

Avoid shaking inputs excessively.

---

# 28. Accessibility

Validation must comply with WCAG 2.2 AA.

Requirements

- Screen readers announce errors.
- Error messages linked using `aria-describedby`.
- Invalid inputs use `aria-invalid="true"`.
- Success states should not rely on color alone.
- Focus moves to the first invalid field after submission.

---

# 29. Security Considerations

Validation must never expose sensitive information.

Never reveal:

- Whether an email exists during password recovery.
- Internal validation logic.
- Database constraints.
- Authentication tokens.
- Stack traces.

All validation must also be performed on the server.

Client-side validation improves UX but is **not** a security mechanism.

---

# 30. Acceptance Criteria

The validation system is complete when:

- Every form uses a consistent validation lifecycle.
- Required and optional fields are clearly distinguished.
- Validation occurs at appropriate times (real-time, blur, async, submit).
- Inline and form-level errors follow a consistent pattern.
- Password strength and confirmation are validated dynamically.
- Workspace URLs and email uniqueness support asynchronous validation.
- Error messages are clear, actionable, and accessible.
- All client validation is backed by server-side validation.
- Validation is fully responsive, accessible, and aligned with the Recrion Design System.


# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Authentication UI Components — Part A

> **Document Version:** 1.0
>
> **Related Documents**
>
> - system_design.md
> - Authentication Foundation
> - Global Validation Rules
>
> This document defines the reusable UI components used throughout the Authentication and Organization Onboarding experience. These components inherit all visual styling from `system_design.md`. This specification focuses on structure, behavior, interactions, accessibility, and usage rather than colors or typography.

---

# 1. Component Philosophy

Authentication components should be:

- Minimal
- Consistent
- Accessible
- Reusable
- Predictable
- Responsive
- Enterprise-grade

Every authentication screen should be built entirely from these reusable components.

---

# 2. Component Hierarchy

```
Authentication Layout

├── Logo
├── Authentication Card
├── Page Header
├── Form
│   ├── Input
│   ├── Password Input
│   ├── Checkbox
│   └── Validation Messages
│
├── Password Strength
│
├── Primary Button
├── Secondary Button
├── Social Login Button
│
└── Footer
```

---

# 3. Authentication Layout

## Purpose

Provides the outer container for every authentication-related screen.

Used by

- Login
- Sign Up
- Forgot Password
- Reset Password
- Email Verification
- Organization Setup

---

## Layout Structure

```
Viewport

↓

Centered Container

↓

Authentication Card

↓

Footer
```

---

## Behavior

- Horizontally centered
- Vertically centered
- Uses responsive spacing
- Maintains consistent width
- Never stretches to full desktop width

---

## Responsive

Desktop

Centered

Tablet

Centered

Mobile

Full width with page padding

---

# 4. Authentication Card

## Purpose

Acts as the primary content container.

Contains

- Header
- Form
- Actions
- Footer Links

---

## Anatomy

```
Authentication Card

├── Header
├── Description
├── Form
├── Actions
└── Secondary Links
```

---

## States

Default

Loading

Disabled

Error

Success

---

## Behavior

Card height adapts automatically.

No fixed height.

Content determines height.

---

# 5. Logo Component

## Purpose

Represents the Recrion brand.

Appears at the top of every authentication screen.

---

## Structure

```
Logo

↓

Product Name

↓

Tagline
```

---

## Behavior

Always centered.

Clickable.

Clicking navigates to:

Landing Page

---

## States

Default

Hover

Focus

---

# 6. Page Header

## Purpose

Introduces the current screen.

Examples

```
Create your account

Welcome back

Forgot password

Verify your email
```

---

## Anatomy

```
Title

↓

Subtitle
```

---

## Behavior

Always centered.

Maximum width constrained.

Automatically wraps long text.

---

# 7. Form Component

## Purpose

Groups related form fields.

---

## Anatomy

```
Form

↓

Input

↓

Input

↓

Password

↓

Button
```

---

## Rules

Maintain equal spacing.

Validation appears below individual fields.

Form never displays unnecessary separators.

---

# 8. Input Field

## Purpose

Collect user information.

Used for

- Name
- Email
- Organization
- URL

---

## Anatomy

```
Label

↓

Input Container

├── Leading Icon
├── Input
└── Optional Trailing Icon

↓

Helper Text

↓

Validation Message
```

---

## States

Default

Focused

Typing

Disabled

Read Only

Loading

Success

Warning

Error

---

## Behavior

Placeholder disappears while typing.

Focus moves naturally with keyboard.

Supports browser autofill.

---

## Input Types

Text

Email

Search

URL

Number

Hidden

Password

---

## Validation

Real-time validation.

Errors displayed beneath field.

Success icon appears only when useful.

---

## Accessibility

Supports

- Label
- aria-label
- aria-describedby
- aria-invalid

---

# 9. Password Input

## Purpose

Secure password entry.

---

## Anatomy

```
Lock Icon

↓

Password Field

↓

Show / Hide Button

↓

Strength Meter

↓

Validation
```

---

## Behavior

Password hidden by default.

Toggle visibility without losing cursor position.

Visibility resets after refresh.

---

## States

Hidden

Visible

Focused

Error

Disabled

Loading

---

## Validation

Minimum length

Uppercase

Lowercase

Number

Special Character

---

# 10. Password Visibility Toggle

## Purpose

Improve usability.

---

## Icons

Hidden

```
Eye
```

Visible

```
Eye Off
```

---

## Rules

Never changes actual password value.

Only changes presentation.

---

# 11. Password Strength Component

## Purpose

Provides immediate feedback.

---

## Anatomy

```
Progress Bar

↓

Strength Label

↓

Description
```

---

## Levels

Weak

Fair

Strong

Excellent

---

## Behavior

Updates while typing.

Animated transition.

Never blocks typing.

---

## Example

```
████████□□

Strong

Great password.
```

---

# 12. Checkbox Component

## Purpose

Boolean selection.

Examples

```
Remember Me

Accept Terms
```

---

## Anatomy

```
Checkbox

↓

Label
```

---

## States

Unchecked

Checked

Focused

Disabled

Error

---

## Behavior

Entire row clickable.

Keyboard accessible.

Space toggles state.

---

# 13. Primary Button

## Purpose

Primary action.

Examples

```
Create Account

Login

Continue

Reset Password
```

---

## Anatomy

```
Icon (optional)

↓

Label

↓

Loading Spinner (optional)
```

---

## States

Default

Hover

Focus

Pressed

Loading

Disabled

Success

---

## Behavior

Full width.

Disabled while submitting.

Loading replaces icon.

---

## Loading Example

```
Spinner

Creating Account...
```

---

# 14. Secondary Button

## Purpose

Alternative action.

Examples

```
Back

Cancel

Skip
```

---

## Behavior

Lower emphasis.

Never competes visually with Primary Button.

---

## States

Default

Hover

Focus

Disabled

---

# 15. Social Login Button

## Purpose

Authenticate using third-party providers.

Currently

Google

Future

Microsoft

LinkedIn

GitHub

---

## Anatomy

```
Provider Icon

↓

Continue with Google
```

---

## States

Default

Hover

Pressed

Loading

Disabled

Unavailable

---

## Behavior

Loading shown while OAuth begins.

Prevent duplicate clicks.

---

## Failure

Display inline authentication error.

Do not redirect unexpectedly.

---

# 16. Component Spacing Rules

Between Header and Form

```
24px
```

Between Inputs

```
16px
```

Between Form and Button

```
24px
```

Between Buttons

```
12px
```

Spacing values inherit from the Design System.

---

# 17. Component Animation Rules

Animations should communicate state changes.

Allowed

- Fade
- Scale
- Opacity
- Color transition

Avoid

- Bounce
- Shake (except subtle validation)
- Oversized motion

Duration

```
150–200ms
```

---

# 18. Component Interaction Rules

Every interactive component must support:

- Mouse
- Keyboard
- Touch

Click areas should extend beyond visible content where appropriate.

Focus indicators must always remain visible.

---

# 19. Accessibility Requirements

All components must:

- Support keyboard navigation
- Have semantic HTML
- Include accessible labels
- Announce validation messages
- Meet WCAG 2.2 AA

Interactive components must maintain logical tab order.

---

# 20. Responsive Behavior

Desktop

- Standard spacing
- Fixed authentication width

Tablet

- Reduced margins
- Same component sizes

Mobile

- Full-width inputs
- Full-width buttons
- Larger touch targets
- Comfortable thumb reach

No component should overflow horizontally.

---

# 21. Component Usage Guidelines

### Do

✓ Reuse existing components.

✓ Keep interactions predictable.

✓ Validate consistently.

✓ Use the same spacing everywhere.

✓ Maintain hierarchy.

---

### Don't

✗ Create custom input styles.

✗ Change button sizes arbitrarily.

✗ Mix validation patterns.

✗ Introduce inconsistent spacing.

✗ Override accessibility behavior.

---

# 22. Acceptance Criteria

Authentication UI Components — Part A is complete when:

- Every authentication screen is composed entirely of reusable components.
- Component anatomy and behavior are standardized.
- Buttons, inputs, checkboxes, and password fields behave consistently.
- Password visibility and strength indicators function predictably.
- Components are responsive across all supported devices.
- Accessibility requirements are satisfied.
- Components align with the Recrion Design System and are ready for implementation as reusable design-system primitives.



# Recrion Product Specification
# Milestone 1 — Authentication & Organization Onboarding

# Authentication UI Components — Part B

> **Document Version:** 1.0
>
> **Related Documents**
>
> - system_design.md
> - Authentication Foundation
> - Authentication UI Components — Part A
> - Global Validation Rules
>
> This document defines the supporting UI components used throughout Authentication and Organization Onboarding. These components ensure every authentication screen follows a consistent, scalable, and enterprise-grade design language.

---

# 1. Supporting Component Philosophy

Supporting components should never distract from the primary task.

They exist to:

- Guide
- Inform
- Confirm
- Warn
- Recover
- Communicate Progress

These components should remain visually lightweight while maintaining strong usability.

---

# 2. Component Hierarchy

```
Authentication

├── Divider
├── Alert
├── Toast
├── Success Card
├── Warning Card
├── Error Card
├── Loading Spinner
├── Authentication Overlay
├── Progress Stepper
├── Progress Indicator
├── Status Badge
├── Footer
├── Empty State
└── Confirmation Dialog
```

---

# 3. Divider Component

## Purpose

Separates two related sections.

Most commonly used between:

- Authentication Form
- Social Login

---

## Anatomy

```
──────── OR ────────
```

---

## Variants

### Default

```
──────────────
```

---

### With Label

```
──── OR ────
```

---

### Decorative

Used inside onboarding sections.

---

## Rules

- Always centered
- Never interactive
- Label remains uppercase

---

# 4. Alert Component

## Purpose

Communicates important information.

Examples

- Invalid credentials
- Session expired
- Verification required

---

## Anatomy

```
Icon

↓

Title

↓

Description

↓

Optional Action
```

---

## Variants

Information

Success

Warning

Error

---

## States

Visible

Dismissed

Expanded

Collapsed

---

## Behavior

Appears inline.

Never blocks interaction unless critical.

---

# 5. Success Card

## Purpose

Communicate completed actions.

Examples

- Password Updated
- Email Verified
- Organization Created

---

## Anatomy

```
Success Icon

↓

Title

↓

Description

↓

Primary Button
```

---

## Animation

Checkmark animation

↓

Fade in

↓

Button appears

---

# 6. Warning Card

## Purpose

Communicate recoverable issues.

Examples

- Expiring invitation
- Weak password
- Missing organization details

---

## Behavior

Allows users to continue after taking corrective action.

---

# 7. Error Card

## Purpose

Display blocking failures.

Examples

- Reset link expired
- Invitation expired
- Workspace creation failed

---

## Anatomy

```
Warning Icon

↓

Title

↓

Description

↓

Retry

↓

Secondary Action
```

---

## Behavior

Never expose technical details.

Always explain next action.

---

# 8. Toast Notification

## Purpose

Communicate short-lived events.

Examples

```
Password Updated

Verification Email Sent

Workspace Created

Invitation Accepted
```

---

## Position

Top Right

Desktop

Bottom Center

Mobile

---

## Variants

Success

Information

Warning

Error

---

## Duration

Success

```
3 seconds
```

Information

```
4 seconds
```

Warning

```
5 seconds
```

Error

Persistent until dismissed.

---

## Behavior

Maximum

```
3 visible toasts
```

Additional notifications queue automatically.

---

# 9. Loading Spinner

## Purpose

Indicate processing.

---

## Sizes

Small

Medium

Large

---

## Usage

Button Loading

Page Loading

Authentication Bootstrap

Workspace Initialization

---

## Behavior

Always accompanied by descriptive text.

Avoid spinner-only interfaces.

Example

```
Signing In...
```

---

# 10. Authentication Overlay

## Purpose

Prevent interaction during critical operations.

---

## Usage

- Login
- Registration
- Organization Creation
- Session Validation

---

## Layout

```
Dim Background

↓

Spinner

↓

Status Text
```

---

## Behavior

Blocks interaction.

Keyboard focus remains trapped inside overlay.

---

# 11. Progress Stepper

## Purpose

Visualize onboarding progress.

---

## Anatomy

```
Completed

↓

Current

↓

Upcoming
```

Example

```
✓────●────○────○
```

---

## States

Completed

Current

Upcoming

Disabled

---

## Behavior

Completed steps

Clickable

Current step

Highlighted

Future steps

Locked

---

# 12. Progress Indicator

## Purpose

Display task completion.

---

## Types

Linear

Circular

Checklist

---

## Example

```
Preparing Workspace...

██████████░░░░░

65%
```

or

```
✓ Organization

✓ Profile

○ Workspace

○ Dashboard
```

Use checklist whenever possible.

---

# 13. Status Badge

## Purpose

Represent current state.

---

## Examples

```
Verified

Pending

Expired

Connected

Disconnected

Admin

Recruiter
```

---

## Variants

Neutral

Success

Warning

Error

Information

---

## Behavior

Read-only.

Never interactive.

---

# 14. Empty State

## Purpose

Educate users when no content exists.

Examples

```
No organizations yet.

Create your first organization.
```

---

## Anatomy

```
Illustration

↓

Title

↓

Description

↓

Primary Action
```

---

## Guidelines

Explain

- Why nothing exists
- What users should do
- Expected outcome

---

# 15. Confirmation Dialog

## Purpose

Prevent accidental destructive actions.

Examples

- Logout
- Cancel Setup
- Leave Wizard

---

## Anatomy

```
Icon

↓

Title

↓

Description

↓

Cancel

↓

Confirm
```

---

## Behavior

Escape

Closes dialog.

Enter

Confirms primary action.

---

# 16. Footer Component

## Purpose

Provide supporting navigation.

---

## Contents

```
Terms

Privacy

Security

Contact
```

---

## Behavior

Always displayed.

Centered.

Small typography.

---

# 17. Authentication Overlay Messages

Examples

```
Signing In...

Creating Account...

Checking Session...

Creating Workspace...

Preparing Dashboard...

Almost Done...
```

Messages should reflect the actual operation.

---

# 18. Empty Loading State

If initialization has no measurable progress,

display an animated checklist instead of percentages.

Example

```
✓ Creating Account

✓ Preparing Workspace

○ Finalizing Setup
```

Avoid fake progress percentages.

---

# 19. Component State Consistency

Every component should support the appropriate combination of:

```
Default

Hover

Focus

Pressed

Loading

Success

Warning

Error

Disabled
```

Not every state applies to every component, but naming should remain consistent across the design system.

---

# 20. Motion & Transitions

Component transitions should communicate state changes without distracting the user.

Allowed transitions:

- Fade
- Scale
- Opacity
- Color interpolation
- Progress fill

Duration

```
150–250ms
```

Avoid:

- Bounce
- Flashing
- Excessive movement
- Long delays

Respect the user's **Reduced Motion** preference.

---

# 21. Responsive Component Behavior

## Desktop

- Fixed authentication container
- Inline alerts
- Top-right toasts
- Horizontal stepper

---

## Tablet

- Reduced spacing
- Same interaction model
- Medium-width cards

---

## Mobile

- Full-width cards
- Bottom toast notifications
- Vertical spacing increased
- Sticky primary actions
- Dialogs occupy most of the viewport
- Large touch targets (minimum 44×44px)

---

# 22. Accessibility Standards

Every supporting component must comply with WCAG 2.2 AA.

Requirements

- Semantic HTML
- Screen reader compatibility
- Visible keyboard focus
- ARIA labels where required
- Live region announcements for dynamic content
- Error messages associated with relevant inputs
- Success messages announced appropriately

Examples

Toast

```
aria-live="polite"
```

Authentication Error

```
role="alert"
```

Progress

```
aria-valuenow

aria-valuemin

aria-valuemax
```

---

# 23. Component Reusability Rules

These components should never be implemented specifically for authentication.

Instead, they should be part of the global Recrion Design System and reused throughout:

- Dashboard
- Recruiting Pipeline
- Candidate Profiles
- AI Copilot
- Analytics
- Settings
- Team Management
- Integrations

Authentication becomes the first consumer of these shared components.

---

# 24. Engineering Guidelines

Every component should be:

- Stateless where possible
- Independently testable
- Theme-aware
- Responsive by default
- Keyboard accessible
- Internationalization-ready
- Composable
- Reusable across the application

Business logic should remain outside UI components.

---

# 25. Component Inventory

Authentication UI includes the following reusable components:

```
Authentication Layout

Authentication Card

Logo

Page Header

Form

Input Field

Password Field

Password Strength Meter

Checkbox

Primary Button

Secondary Button

Social Login Button

Divider

Alert

Toast

Success Card

Warning Card

Error Card

Loading Spinner

Authentication Overlay

Progress Stepper

Progress Indicator

Status Badge

Empty State

Confirmation Dialog

Footer
```

These components form the complete Authentication UI library.

---

# 26. Acceptance Criteria

Authentication UI Components are complete when:

- All authentication screens are composed exclusively from reusable design-system components.
- Supporting components follow consistent anatomy, behavior, and interaction patterns.
- Loading, success, warning, and error feedback are standardized.
- Progress indicators communicate onboarding status clearly.
- Dialogs and overlays prevent accidental user actions while maintaining accessibility.
- Components adapt seamlessly across desktop, tablet, and mobile layouts.
- Motion is subtle, purposeful, and respects reduced-motion preferences.
- Every component complies with WCAG 2.2 AA accessibility guidelines.
- Components are framework-agnostic and ready for implementation in React with shadcn/ui-style architecture.
- The Authentication UI library is reusable throughout the entire Recrion platform, ensuring long-term consistency and maintainability.