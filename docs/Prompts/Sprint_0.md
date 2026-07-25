# Sprint 0 — Codebase Audit & Production Stabilization

## Role

You are the Lead Software Engineer responsible for preparing an existing AI Recruiting Operations Platform for production development.

This is NOT a greenfield project.

A significant portion of the platform already exists.

Your responsibility is NOT to rebuild it.

Your responsibility is to audit, stabilize, refactor, standardize, and prepare the existing codebase for future development.

The goal is to transform the current implementation into a production-quality foundation while preserving all existing functionality.

---

# Current Project Context

The following functionality already exists and must be treated as production assets unless improvements are necessary.

## Frontend

The dashboard is fully scaffolded and operational.

Current pages include:

- Dashboard
- Inbox
- Candidates
- Pipeline
- Jobs
- Approvals

These pages already render data and should NOT be redesigned or rewritten.

Only improve quality where necessary.

---

## Backend APIs

The project already contains API routes for:

- Authentication
- Gmail
- Emails
- Resume Processing
- Candidates
- Jobs
- Dashboard
- Approvals
- Slack

These routes should be audited and improved instead of recreated.

---

## Existing Services

Current services include:

- Gmail OAuth
- Gmail Poller
- Gmail Attachment Downloader
- OpenAI Prompt Engine
- Slack Notifications
- Inbox Worker

Do NOT duplicate these services.

Reuse and improve them.

---

# Primary Objective

Perform a complete engineering audit of the existing project.

Then refactor and stabilize the platform for production development.

No new product features should be added.

No new workflows should be introduced.

The platform should behave exactly the same after this sprint—but the internal quality should be significantly improved.

---

# Phase 1 — Engineering Audit

Before changing any code, perform a complete audit of the entire repository.

Review:

- app/
- components/
- lib/
- workers/
- middleware/
- hooks/
- types/
- utils/
- styles/
- configuration
- database
- environment

Generate an internal report identifying:

- Existing architecture
- Folder structure
- Dependency graph
- Technical debt
- Duplicate logic
- Dead code
- Unused files
- Unused packages
- Missing abstractions
- Tight coupling
- Circular dependencies
- Naming inconsistencies
- Large components
- Large API routes
- Large utility files
- Type safety issues
- Error handling issues
- Validation issues
- Security concerns
- Performance concerns
- UI inconsistencies
- Accessibility issues

Do NOT modify anything until the audit is complete.

---

# Phase 2 — Preserve Existing Functionality

Everything currently working must continue working.

Especially:

- Authentication
- Dashboard
- Inbox
- Candidates
- Pipeline
- Jobs
- Approvals
- Gmail Integration
- Gmail Polling
- Resume Upload
- AI Prompts
- Slack Notifications
- Workers
- Existing APIs

Backward compatibility is mandatory.

---

# Phase 3 — Architecture Cleanup

Improve architecture without changing business behavior.

Possible improvements include:

- Extract duplicated code
- Create shared utilities
- Improve separation of concerns
- Improve modularity
- Standardize naming
- Simplify folder structure
- Reduce unnecessary complexity
- Improve maintainability

Do NOT redesign the product.

---

# Phase 4 — Type Safety

Review the entire project for TypeScript quality.

Requirements:

- Eliminate unnecessary any types
- Improve type inference
- Centralize shared types
- Remove duplicated interfaces
- Improve generic usage
- Strengthen API typing
- Strengthen database typing

The project should move toward strict type safety.

---

# Phase 5 — Error Handling

Every critical operation should fail gracefully.

Review:

- API routes
- Gmail integration
- AI requests
- Database operations
- Authentication
- Workers

Ensure:

- Consistent error responses
- Helpful user messages
- Proper logging
- No silent failures

---

# Phase 6 — Validation

Review validation across the project.

Ensure consistent validation for:

- API requests
- AI outputs
- Environment variables
- Database writes
- Forms
- Authentication

Validation logic should be centralized wherever appropriate.

---

# Phase 7 — Production Logging

Introduce consistent structured logging.

Review logging across:

- Authentication
- Gmail
- AI
- Workers
- APIs
- Database

Logs should:

- Be structured
- Avoid sensitive information
- Support debugging
- Support production monitoring

---

# Phase 8 — Security Review

Audit security across the application.

Review:

- Authentication
- Authorization
- Middleware
- API permissions
- OAuth
- Secret handling
- Input validation
- Prompt injection risks
- XSS
- CSRF
- Injection risks

Fix issues where appropriate.

---

# Phase 9 — Environment & Configuration

Review project configuration.

Ensure:

- Environment variables are validated
- Missing variables are detected
- Unused variables removed
- Configuration centralized
- Secrets never exposed

---

# Phase 10 — UI Polish

Do NOT redesign the UI.

Instead, improve the overall SaaS quality.

Review:

- Spacing
- Typography
- Consistency
- Responsive layouts
- Empty states
- Loading states
- Error states
- Hover states
- Keyboard navigation
- Accessibility
- Visual consistency
- Component reuse

The application should feel polished and professional.

---

# Phase 11 — Performance Review

Review:

- Large components
- Client Components
- Server Components
- Dynamic imports
- Memoization
- Rendering performance
- Bundle size
- Unnecessary rerenders

Optimize where beneficial.

---

# Phase 12 — Worker Review

Audit background workers.

Review:

- Polling
- Retry logic
- Timeouts
- Concurrency
- Shutdown handling
- Error recovery

Workers should be production-ready.

---

# Phase 13 — API Review

Audit every API route.

Ensure:

- Consistent response format
- Proper HTTP status codes
- Validation
- Authentication
- Authorization
- Error handling
- Logging

---

# Phase 14 — Database Review

Review:

- Tables
- Relations
- Constraints
- Indexes
- Migrations
- Naming
- Duplicate data risks

Recommend improvements where appropriate.

---

# Deliverables

At the end of this sprint provide a complete engineering report including:

1. Codebase Audit Summary

2. Files Modified

3. Files Created

4. Files Removed

5. Architecture Improvements

6. UI Improvements

7. Security Improvements

8. Performance Improvements

9. Validation Improvements

10. Logging Improvements

11. Remaining Technical Debt

12. Risks

13. Recommendations for Sprint 1

---

# Constraints

Do NOT:

- Redesign the architecture
- Rewrite working features
- Remove existing functionality
- Add new product features
- Change workflows
- Introduce placeholder code
- Introduce TODOs
- Duplicate existing logic

Reuse existing components whenever possible.

---

# Validation Checklist

Before completing this sprint ensure:

- Production build succeeds
- TypeScript passes with zero errors
- ESLint passes
- Existing functionality is preserved
- Authentication works
- Dashboard works
- Gmail integration works
- Inbox polling works
- Candidate pages work
- Pipeline works
- Approval page works
- Workers execute correctly
- APIs function correctly

---

# Stop Condition

Once every validation step has passed:

STOP.

Do NOT begin the next sprint.

Generate the engineering report.

Wait for the next implementation prompt.