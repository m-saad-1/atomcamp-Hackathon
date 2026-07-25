# Project Vision

## Executive Summary  
This project envisions an **AI-Driven Recruiting Operations Platform** (name TBD) that transforms inbound candidate communications into structured intelligence and automated actions. In a single line: **“Autonomous hiring assistant that reads emails, analyzes candidate profiles with LLMs, and executes recruiter-approved workflows.”** It targets talent acquisition teams (recruiters, sourcers, hiring managers, TA leaders, enterprise admins) who struggle with unstructured resumes, high email volume, and manual workflows. Our platform ingests candidates from sources like email, LinkedIn, and job portals; parses resumes; scores and summarizes candidates with AI; and automates follow-up actions (create profiles, send Slack alerts, schedule interviews, draft emails) under human approval. In contrast to traditional ATS tools (like Ashby, Greenhouse, Lever) or sourcing CRM (Gem, hireEZ) or conversational assistants (Paradox, Eightfold), our novelty is **“inbound candidate intelligence”**: an autonomous agent that lives in recruiters’ inbox, plus a recruiter copilot chatbot for data-driven insights. 

The core value is reducing **time-to-hire**, **cost-per-hire**, and **manual effort** by automating routine tasks and surfacing insights, while keeping recruiters in control. Early traction can be measured by faster screening and positive recruiter feedback. Our phased roadmap starts with a 4–6 week MVP of automated email intake, resume parsing, candidate creation, AI scoring, and a simple approval queue. Later phases add enterprise integrations (ATS connectors, richer AI copilots, multi-tenant security, analytics) and advanced “talent intelligence” features. We assume access to Gmail/Outlook APIs, OpenAI models, and a cloud SQL database. Key success metrics include activation (daily active recruiters), conversion (trial→paid), reduction in time-to-hire, and customer retention. 

Below, we detail personas and problems, value propositions, features, differentiation, business model, go-to-market, technical architecture, security, and roadmap. This will feed into the **Document 01 (Foundation)** specification for the initial build.

## Product & Positioning  
- **Product Name:** _(TBD)_ – For now, “AI Recruiting Operations Platform.”  
- **Elevator Pitch:** “An autonomous recruiting assistant that reads your candidate emails, parses resumes with AI, scores candidates against your roles, and executes recruiter-approved next steps – boosting hiring speed and consistency with minimal manual effort.”  
- **Primary Personas:**  
  - **Recruiters/Sourcers:** Need to sift through high volumes of resumes and messages. They want to automate screening and reduce admin work.  
  - **Hiring Managers:** Want qualified candidate summaries quickly and transparency on pipeline. They rely on recruiters for filtered slates.  
  - **TA Leaders:** Care about team productivity, pipeline velocity, reporting on recruiting KPIs. They demand tools that scale and enforce consistency.  
  - **Enterprise Admins/IT:** Focus on security, compliance, integrations with existing systems (ATS, email, calendar, Slack). They need multi-tenant isolation and auditability.

- **Primary Problems:**  
  - Unstructured inboxes: Candidates apply via email or LinkedIn, creating siloed, disorganized data.  
  - Manual screening: Recruiters waste time manually reading and summarizing resumes.  
  - Inconsistent evaluation: Hard to compare candidates without data-driven scoring.  
  - Slow processes: Scheduling and follow-ups are often delayed or forgotten, lengthening time-to-hire.  
  - Tool sprawl: Recruiters juggle many apps (ATS, calendar, Slack, spreadsheets) with lots of copy-paste and data entry.  
  - Lack of insight: No quick way to ask “What are this candidate’s strengths/weaknesses?”, leaving decisions opaque.

- **Core Value Propositions:**  
  - **Autonomous Intake:** Instantly capture every candidate from your inbox (and other sources) with minimal manual effort.  
  - **AI-Powered Screening:** Use LLMs to extract skills, experience, and fit, producing consistent candidate profiles and scores.  
  - **Action Automation:** Auto-draft interview invites, calendar events, Slack notifications, or CRM entries with one click.  
  - **Recruiter Copilot:** A contextual chatbot delivers insights (e.g. “Why is this candidate a 90% match?” or “What questions should I ask?”) on demand.  
  - **Faster, Fairer Hiring:** Speed up screening and scheduling while reducing human bias via data.  
  - **Seamless Workflow:** Integrates with existing ATS/CRMs, Slack, email, and calendar so recruiters never re-enter data.

## Key Features (MVP Scope)

| Feature Category        | Description                                                                         | In Milestone 1 (Foundation)? |
|-------------------------|-------------------------------------------------------------------------------------|------------------------------|
| **Inbound Sources**     | Receive candidates via Gmail, Outlook/IMAP, web forms, or LinkedIn outreach.         | ✓                           |
| **Intake Agent**        | Continuously poll connected inbox(es) for new emails and attachments.                | ✓                           |
| **Resume Parser**       | Extract text from PDF/DOC resumes (OCR if needed).                                   | ✓                           |
| **Candidate Profile**   | Create database records with parsed name, contact, skills, experience, etc.          | ✓                           |
| **Candidate Intelligence** | Summarize strengths, weaknesses, role fit; generate AI-driven resume highlights.   | ✓ (basic)                   |
| **AI Scoring**          | Score candidate vs job using OpenAI (job description + resume).                      | ✓                           |
| **Copilot Chat**        | Context-aware chat UI using LLM to answer recruiter questions about a candidate.     | — (future milestone)        |
| **Approval Queue**      | Human-in-loop decisions for actions (e.g. “Proceed to interview?”).                  | ✓                           |
| **Action Execution**    | On approval, create tasks: populate ATS profile, send Slack message, draft email.    | ✓ (basic)                   |
| **ATS Integrations**    | Connect to popular systems (Greenhouse, Lever, etc.) to sync candidates.            | — (post-MVP)                |
| **Slack Integration**   | Notify via Slack channel or DMs about candidate moves or needs.                      | ✓                           |
| **Calendar Sync**       | Create interview events in Google/Outlook Calendar when scheduled.                   | ✓                           |
| **Reporting Dashboard** | Basic metrics: total candidates, time in stages, etc.                                | Basic (counts)              |
| **Security & Multi-Tenancy** | Per-org data isolation, RBAC, encrypted storage.                                   | Design; minimal MVP         |

The **Milestone 1 (Foundation)** will implement the checkmarked core features. This allows a user to send an email to a monitoring inbox and watch candidates auto-appear on the Dashboard, complete with parsed data and an AI match score, ready for an “approve” decision.

## Competitive Landscape

Current ATS/Recruiting platforms offer pieces of this puzzle, but **none** automate the entire *inbound-to-intelligence* flow end-to-end:

| Competitor        | Core Focus                                 | AI/Automation Highlights             | Differentiators vs. Our Vision                  |
|-------------------|--------------------------------------------|--------------------------------------|-------------------------------------------------|
| **Ashby**         | All-in-one ATS + CRM (startup to enterprise) | AI-powered hiring workflows, analytics | Rich ATS features, strong automation; but not focused on autonomous email ingestion or LLM-backed QA. |
| **Greenhouse**    | Enterprise ATS + structured hiring          | New AI features: candidate note-taking, interview AI | Leader in structured hiring; requires manual data entry or integration for email inputs. |
| **Lever**         | ATS + CRM with embedded AI                | AI-driven sourcing and screening (built-in from day one) | Good CRM and collaborative tools; does not autonomously import candidates from arbitrary emails. |
| **Paradox (Olivia)** | Conversational recruiting chatbot        | AI texting and chat for screening, scheduling | Excels at text-based candidate engagement; less of an inbound intake engine or contextual recruiter copilot. |
| **Eightfold**     | Talent intelligence platform                | Deep AI on skills and careers | Focus on internal talent and AI matching at scale; oriented to large enterprises, not email-centric. |
| **Gem**           | Sourcing & CRM platform (all-in-one)       | AI sourcing agents, CRM/ATS, scheduling | All-in-one with AI; strong sourcing; our edge is inbound email parsing and recruiter Q&A. |
| **hireEZ**       | AI sourcing on top of ATS                 | “Agentic AI” for sourcing, screening, outreach | Built on ATS integration; excels at sourcing; we focus on inbound candidates and full workflow automation. |

*Table 1. Major recruiting platforms and how our product differs.*  

Unlike competitors, our novelty is **“intake + intelligence + action”** in one loop: we **start in the recruiter’s inbox**, pull out candidates with AI, and then help decide & act—all with a human-approved, audit-trailed workflow. No other single tool we know bundles an email listener, resume parsing, LLM-based scoring/summarization, a QA copilot, and automated workflow execution. This positions us as an “AI Recruiting Copilot” that complements any existing ATS or can operate standalone with minimal setup.

## Target Market & GTM Strategy  
We target mid-market to enterprise companies with high hiring velocity (tech startups, staffing firms, rapidly scaling businesses). Key decision makers are TA leaders and senior recruiters who want immediate ROI from AI. Early adopters often have:
- **High email/LinkedIn volume:** e.g. roles soliciting inbound interest (technical recruiters, agency recruiters).  
- **Distributed interview teams:** where automating scheduling and notifications yields big time savings.  
- **Existing ATS usage:** they’ll appreciate automating data entry into Greenhouse, Lever, or others (future integration).  
- **Focus on efficiency:** companies eyeing technology to cut cost-per-hire and speed time-to-fill.

**Go-To-Market:**  
- **Initial Outreach:** Partner with HR communities, post demos on recruiting tech forums, attend TA conferences.  
- **Content Marketing:** Thought leadership on AI hiring automation, case studies (e.g. “From Inbox to Offer in One Click”).  
- **Freemium/Pilot:** Allow small teams to try free limited version (e.g. one inbox + 5 job slots).  
- **Enterprise Sales:** For large customers, offer SLAs, on-prem/cloud options, and integrations.  
- **Channels:** Partnerships with ATS/HRIS providers (e.g. listing on Greenhouse Marketplace), recruitment agencies.

## Business Model  
Likely **SaaS subscription**, with possible variations:
- **Tiered pricing:** e.g. “Starter” (up to N recruiters/jobs), “Pro”, “Enterprise” (multi-tenant, RBAC, analytics).  
- **Usage-based:** Additional fees per email processed or API usage (OpenAI tokens).  
- **Enterprise licensing:** On-premises or dedicated cloud, with advanced security/compliance (SOC 2, ISO 27001) and support.  
- **Consulting/Setup:** One-time fees for setup, custom integrations, data migrations.

Pricing could be per-user or per-job pipeline. We assume average cost-per-hire ~$4.7K, so even modest improvements save customers significant money. 

## Success Metrics  
Key performance indicators will include:

- **Activation/Engagement:** e.g. % of invited recruiters who connect an inbox and process ≥1 candidate in first week.  
- **Pipeline Throughput:** Reduction in average *time-to-hire* compared to historical (baseline ~44 days).  
- **Efficiency Gains:** e.g. % reduction in manual steps (interviews scheduled per recruiter per week).  
- **Conversion Rates:** Demo→trial, trial→paid conversion.  
- **Customer ROI:** Metrics like “candidate screening time per role dropped by X%”, or surveys of recruiter satisfaction.  
- **Retention/Churn:** Renewals, usage patterns (if usage dips, analyze why).  

We’ll benchmark against industry averages (Cost-per-hire ~$4,700; recruiters handling ~14 jobs each). A compelling success story: our platform could cut screening from 1h per candidate to ~5min AI summary, and cut scheduling time by 80%.

## Technical Overview

- **Core Architecture:**  
  - **Front-End:** React/Next.js UI for Dashboard and Copilot chat.  
  - **Back-End:** Node/TypeScript serverless API (e.g. Cloud Run) exposing endpoints for web UI and webhook handlers.  
  - **Database:** Supabase (Postgres) or similar multi-tenant DB to store candidates, jobs, messages, user profiles.  
  - **AI Integration:** OpenAI GPT-4 or Gemini via secure API; JSON parsing enforced by Zod schemas.  
  - **Email Integration:** Gmail API (OAuth2) with long-lived refresh tokens; Outlook/IMAP in future.  
  - **Job Queue:** Background workers (e.g. BullMQ or Trigger.dev) for polling, parsing, AI calls, and actions.  
  - **CRON/Trigger:** Cloud scheduler or a continuously running worker (`inbox-poller.ts`) to fetch new emails regularly.  
  - **Slack/Calendar APIs:** Bot tokens for notifications and scheduling.

- **High-Level Flow:**  
  1. **Email Intake:** Worker fetches unread emails from configured inboxes.  
  2. **Attachment Extraction:** Downloads PDF/DOC resumes (with OCR fallback).  
  3. **Data Extraction:** LLMs parse text into structured JSON (name, skills, contact, education, work history).  
  4. **Candidate Creation:** Save to DB, link to a Job if a JD is available, or flag as unassigned.  
  5. **Scoring & Summarization:** LLM scores fit vs job description and generates a candidate summary.  
  6. **Review / Approval:** Candidate appears in “Approvals” queue; recruiter reviews summary and approves or rejects automated actions (like creating a profile in the ATS, scheduling an interview, sending an email, etc.).  
  7. **Execution:** On approval, system performs actions via APIs (create candidate record, Slack message, draft email, schedule event).  
  8. **Copilot Chat:** Recruiter can click into candidate profile and ask the AI questions in a chat interface, using context (resume + JD + notes).

- **Key Integrations:**  
  - **Email (Gmail/Outlook):** For inbound parsing and sending drafts.  
  - **Slack:** For real-time notifications and multi-user alerts.  
  - **Calendar (Google/Outlook):** To schedule interviews.  
  - **ATS/HRIS (Greenhouse, Lever, Workday):** To sync candidate status with enterprise systems (post-MVP).  
  - **OpenAI / Google Gemini:** For NLP tasks.

- **Multi-Tenancy:** Each organization’s data is logically separated. Include `organization_id` on all tables. For post-MVP, implement separate schemas or RLS policies so one customer’s candidates are never visible to another.

## Security & Compliance  
Our platform will handle sensitive PII (candidate contact details, resumes, possibly salary info). Key considerations:

- **Data Encryption:** All data **at rest** must be encrypted (e.g. AES-256 by the cloud provider). All **in transit** (API calls, web access) use TLS 1.2+.  
- **Access Control:** Implement robust **RBAC** so users only see data for their org and roles. E.g., recruiters vs hiring managers vs admins have different permissions. Multi-factor authentication (MFA) should be enforced for admin accounts.  
- **Audit Logging:** Every action (data creation, candidate progression, approvals) is logged with user ID and timestamp (tamper-evident logs). This aids compliance audits.  
- **Compliance Certifications:** For enterprise readiness, aim for SOC 2 Type II and ISO 27001 to prove good practices.  
- **Regulatory Compliance:** We must support GDPR/CCPA rights: e.g. data export, right-to-be-forgotten. Candidate data should be retained only as long as needed; automated retention policies can purge old data.  
- **PII Minimization:** Store only needed fields. Avoid unnecessary sensitive data (e.g. SSNs). Use pseudonymization if needed.  
- **Candidate Data Rights:** As [Pinpoint notes](#), candidates have the right to ask what data we hold and request deletion. We must implement API or UI flows to handle data subject requests promptly.  

- **Workspace Security:** Customers may want geo-specific data residency (e.g., EU customers in EU region to satisfy GDPR). Multi-region cloud deployments or region-locking can be considered.  

- **Incident Response:** We’ll document breach notification procedures and response timelines (as required by laws).

## Privacy & Data Residency  
Since resumes contain personal data, our privacy policy must be clear. We’ll avoid selling personal data or any usage outside the hiring context. **Data Residency:** Initially use multi-region clouds with GDPR-safe regions. Mark any assumptions (e.g., “initial version deployed on AWS us-east-1”). Later, offer EU/US-specific deployments.  

## Nonfunctional Requirements  
- **Availability:** 99.9% SLA (24/7 support for mission-critical tasks). Use cloud auto-scaling.  
- **Latency:** Interactive operations (chat, UI) should respond <500ms for typical queries; AI calls ~2s (depends on model). Email polling can run asynchronously.  
- **Scalability:** Must handle orgs from 10 to 10,000 employees. Architect for horizontal scaling: stateless services + managed DB that can scale (Postgres read replicas).  
- **Cost Targets:** Cloud costs (OpenAI tokens, hosting) should scale linearly with usage; pricing tiers should cover high-volume use. Optimize prompt tokens (e.g. gpt-4o-mini by default).  
- **Security:** Already detailed above (Encryption, RBAC). Also protect against OWASP risks: input validation, secure coding, secret management (no hard-coded keys).  
- **Localization:** English-only MVP, but architecture should allow other languages (UI + prompts) later.  

## Milestone 1 (Foundation) Scope  
We explicitly define **Milestone 1** features (to be built to completion before moving on):

- **Auth & Access:** Google OAuth for login (managed via NextAuth). One org admin user onboards and connects a Gmail inbox.  
- **Database Schema:** Design tables for Emails, Candidates, Jobs, Users, Actions. No duplication: e.g. use `gmail_message_id` as unique for emails to avoid reprocessing.  
- **Email Intake:** A background worker polls Gmail (using refresh token) every minute (configurable). It fetches unread messages, saves metadata.  
- **Attachment Handling:** Downloads resume attachments (PDF, DOCX). If PDF, extract text (Tesseract OCR fallback if not text-embedded).  
- **Resume Parsing & LLM Integration:** Send resume text + associated Job Description to OpenAI to extract structured data (name, email, skills, experience, etc.) and a brief summary. Use strict JSON schema (Zod) to parse the LLM output.  
- **Candidate Creation:** If parsing succeeds, create a Candidate record linked to the Job (if job mapping exists via email). Otherwise, place in “Unassigned leads” queue.  
- **AI Scoring:** Run an OpenAI prompt to score the candidate 0–100% fit for the job and generate 1–3 bullet-point reasons. Save score and summary in DB.  
- **Dashboard UI:** Show counts (# new emails, # new candidates). Provide views of Inbound Emails (with classification), Candidate List (sortable by score), and an Approvals queue.  
- **Approvals Queue:** For each new candidate, show resume PDF, extracted data, AI summary/score, and buttons “Approve” or “Reject.”  
- **Action Planning (basic):** On approve, log an action “Move to Stage X” or “Create draft email.” (Complex multi-action planning deferred; MVP can simply flag candidate as “Approved” and trigger a Slack alert or draft email template.)  
- **Slack Notification:** When a candidate is approved, send a customizable message to a Slack channel (e.g. “New candidate Jane Doe (Sr. Engineer) approved for interview”).  
- **Calendar Draft (optional):** Provide a sample interview invite template (e.g. pre-filled subject/body) on approval. Full API integration can be iterative.  
- **Error Handling & Logging:** Implement try/catch with meaningful logs for failures (e.g. email fetch errors, LLM parse errors). Mark failed items in the DB with retry counters.  
- **Basic Monitoring:** Health-check endpoint. Log key metrics (emails processed, parsing errors, token usage).  

All frontend pages and API endpoints that present these features must pass validation (no TS/React errors), with mobile-responsive layouts considered. UI copy should be concise. 

### MVP Feature Checklist (Milestone 1)

| Feature                              | Done |
|--------------------------------------|:----:|
| Gmail OAuth login/connect (NextAuth) | ☐    |
| Email polling & DB storage           | ☐    |
| Resume download & OCR               | ☐    |
| Resume parsing via OpenAI           | ☐    |
| Candidate DB record creation         | ☐    |
| AI summary & score generation        | ☐    |
| Dashboards: Inboxes, Candidates, Approvals | ☐ |
| Approve/Reject workflow              | ☐    |
| Slack notification on approval       | ☐    |
| Configurable env (`.env` keys etc.)  | ☐    |
| Unit tests for core logic            | ☐    |

*Table 2. Milestone 1 feature checklist (Foundation).*

## Acceptance Criteria (Milestone 1)

- **End-to-End Flow Works:** A real Gmail email (with attachment) results in a new Candidate in the dashboard, with parsed profile fields, summary text, and a match score.  
- **UI Stability:** Dashboard pages load without JS errors; actions (Approve/Reject) update state instantly.  
- **Data Integrity:** No duplicate candidates from the same email (idempotency by `gmail_message_id`). Approved candidates trigger exactly one Slack message (no duplicates).  
- **LLM Output Structured:** All OpenAI responses are parsed into valid JSON per schema, and failures are clearly handled (e.g. retry a fixed number of times).  
- **Tests Passing:** All automated tests (schema validation, core functions) pass and build succeeds without ESLint/TS errors.  

Any deviation must block “done.” Only then do we ship Milestone 1.

## Risks & Mitigations

- **LLM Hallucinations:** AI might fabricate skills or misread resumes. *Mitigation:* Use Zod schemas to constrain output. Always show “confidence” and actual resume text to recruiters for verification.  
- **Email Rate Limits:** Gmail or Outlook API quotas may block frequent polling. *Mitigation:* Use exponential backoff, request proper scopes (offline access), and move to webhook (“watch” API) in later versions.  
- **Data Privacy:** Storing resumes means we are responsible for PII. *Mitigation:* Use encryption, access controls, and comply with data retention laws.  
- **User Adoption:** Recruiters may distrust AI suggestions or find the workflow foreign. *Mitigation:* Provide transparency (show raw resume, give explicit reasons for scores) and allow easy overrides.  
- **Operational Costs:** LLM tokens and cloud resources can get expensive at scale. *Mitigation:* Optimize prompts (GPT-4o-mini by default), cache frequent calls, and monitor usage. Consider pass-through billing or usage caps in pricing.  
- **Integration Complexity:** Real-world ATS systems (Greenhouse, Workday) have varying APIs. *Mitigation:* Modular design for integration layer; start with simpler Slack/Calendar which have well-known APIs.  
- **Legal/Compliance:** Recruiting data may be subject to local laws (e.g. GDPR, CCPA). *Mitigation:* Document legal requirements upfront, implement user data export/delete flows, and consider hosting regions.

## Roadmap (3 Phases)

| Phase                        | Timeline           | Goals                                                             |
|------------------------------|--------------------|-------------------------------------------------------------------|
| **Production MVP**           | 4–6 weeks          | - Achieve Milestone 1 features end-to-end; deploy to cloud (e.g. AWS/GCP).<br>- Basic GA-ready security (SSL, secrets, minimal logs).<br>- Collect feedback from initial users/testers. |
| **Enterprise Version**       | 3–6 months         | - Outlook/IMAP support, job board/web form ingestion.<br>- Integrate popular ATS (Greenhouse, Lever) and HRIS.<br>- Enhance Copilot chat with memory across candidates.<br>- Multi-tenant architecture (data isolation, per-org configs).<br>- Improved UI/UX (sortable pipeline, charts).<br>- Role-based access (recruiter vs manager), audit trail per action. |
| **AI Platform**              | 6–12+ months      | - Advanced AI agents (full workflow orchestration, interview summarization, bias detection).<br>- Candidate career-path predictions, internal mobility features.<br>- Marketplace/integrations (niche tools, compliance services).<br>- Analytics dashboard (time-to-hire, cost savings, DEI metrics).<br>- Scalability to large enterprises (1M+ candidates, multi-region). |

*Table 3. High-level roadmap timeline.*  

This three-phase plan balances getting a usable product quickly with building out an enterprise-grade platform and eventually a differentiated AI-centric talent solution. **Milestone 1 (Foundation)** falls in the “Production MVP” phase; once it’s validated, we’ll iterate with user feedback and expand to integrations and robustness.

## Assumptions & Open Questions

- **Assumption:** Initial MVP supports *one* Gmail or Outlook inbox per organization. (Scalable later.)  
- **Assumption:** Jobs are either manually entered or auto-matched from email subject; sophisticated JD parsing is not in scope for MVP.  
- **Question:** How will pricing be structured per customer? (Seat-based vs usage vs per-job.) This affects UI (seat management).  
- **Assumption:** Using OpenAI’s GPT models; budgeting for token usage.  
- **Question:** Do customers want data residency (e.g. EU-only) from Day 1? If so, must plan infrastructure accordingly.  
- **Assumption:** Customers will still maintain an ATS (we integrate later) but want this as a front-end “AI filter/assistant.”  
- **Question:** What level of customization do recruiters expect for AI prompts/rules?  
- **Assumption:** We start with a single default approval action (“approve moves to next stage”), with options to configure in future.  
- **Question:** How do we verify the parsed data (e.g. correct candidate extraction)? Maybe manual corrections needed.  

These assumptions will be validated with stakeholders early. Uncertainties (integration priorities, pricing) should be resolved by customer interviews as we move to Founding.

## Next Steps: From Vision to Document 01 (Foundation)

1. **Create Docs/00-Project-Vision.md:** Use this vision manuscript as the official product brief.  
2. **Define Detailed Spec:** Convert Milestone 1 scope into Document 01 Foundation specification. This includes folder structure, DB schema, API definitions, UI wireframes.  
3. **Draft Prompt for Coding Agent:** Using Document 01, craft a precise prompt (Objective, Scope, Files to modify/create, Acceptance criteria, Rules) for the coding AI.  
4. **Iterative Review:** After agent output, review and generate refinement prompts until Foundation is implemented to spec.  

### Example Agent Prompt Template (Milestone 1)

```
Objective: Implement the Foundation features of the AI Recruiting Platform as specified.
Scope: Based on the docs/specifications/01-Foundation.md, complete features 1–10. Do NOT refactor existing working code unless necessary. 
Files/Modules to create or update: 
- `lib/gmail/*.ts` for OAuth and polling
- `workers/inbox-poller.ts`
- `lib/ai/prompts.ts`
- `app/api/gmail.ts`, `app/api/emails.ts`, `app/api/candidates.ts`, etc.
- `app/dashboard/*` React pages (Inbox, Candidates, Approvals)
- Supabase schema (migrations).
Acceptance Checklist:
  [ ] Gmail OAuth login works and tokens stored.
  [ ] New emails are polled, attached PDFs are parsed to text.
  [ ] Candidate records created with extracted fields.
  [ ] AI match score and summary generated and stored.
  [ ] Dashboard shows correct counts and lists.
  [ ] Approve button triggers Slack notification.
  [ ] No duplicate processing of same email (idempotency).
  [ ] All new code passes tests; build succeeds.
Strict rules:
- Do not alter any code outside the Foundation scope.
- Do not remove existing functionality.
- Every change must be tested; failing tests block completion.
- Use the provided OpenAI prompt templates and Zod schemas without modification.
- Preserve data contracts and env variable usage exactly as documented.
```

This template will guide the agent (e.g. Antigravity) to implement the Foundation exactly as defined, and sets clear “Definition of Done.” 

**With this Vision Document and prompt-driven implementation process, we move from concept to code in a structured, production-grade way.** Each milestone’s completion will be validated against the vision above, ensuring alignment with the overarching product goals.