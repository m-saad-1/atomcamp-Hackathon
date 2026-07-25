# Executive Summary 

This document defines the **Candidate Intelligence Engine** for an AI-native recruiting platform. It establishes how raw candidate data (resumes, emails, interview notes, etc.) is transformed into structured intelligence that supports hiring decisions. We position the product as an **AI-first recruiting operations platform** offering recruiters an intelligent “Candidate Intelligence Card” instead of a plain resume. Key value propositions include unbiased, explainable recommendations, faster decision-making, and personalized candidate insights. Unlike traditional ATS or sourcing tools, our approach focuses on intelligence and evidence—AI augments recruiter judgment without replacing human decision-makers. We emphasize transparency, auditability, and ethical constraints (e.g., no inference of protected characteristics or personal background checks).  

The document covers: the underlying philosophy and principles of our AI engine; a detailed **Candidate Knowledge Model** (all relevant data attributes and their management); the **Candidate Lifecycle & Memory** (how candidate intelligence evolves over time); the structure and sections of the **Candidate Intelligence Card** (with a table mapping each section to data sources and evidence types); the **Scoring & Decision Framework** (how match scores and confidence are computed); requirements for **Explainability & Evidence** (citations of sources, confidence scores, and provenance tracking); **Human-in-the-loop** patterns (approval workflows and feedback loops); a conceptual **RAG (Retrieval-Augmented Generation)** strategy for candidate-scoped knowledge retrieval; explicit **Safety & Out-of-Scope** rules (including prohibited inferences and PII handling); measurable **Success Metrics & Acceptance Criteria** (KPIs and tests to validate the engine); an **Evaluation & Continuous Improvement** plan (including human reviews and A/B tests); a deliverables table for the subsequent agent implementation prompt; and a prioritized **Feature Roadmap**. 

All recommendations are **implementation-independent**, grounded in industry best practices (e.g. structured hiring principles, explainable AI literature) and product examples (e.g. Ashby’s citation-based analysis, Greenhouse’s human-centered insights, and emerging “candidate intelligence cards”). Explicit acceptance criteria and checklists are included to ensure a testable engineering outcome.

## Vision & Purpose 

- **Product Positioning:** An AI-native recruiting platform that goes beyond ATS. Rather than a passive applicant database, the system provides *actionable intelligence* on each candidate. The recruiter sees a “Candidate Intelligence Card” rich with AI-derived insights, not just raw data. This shifts the platform from tracking into advising.  
- **Target Users:** Recruiters and talent teams at fast-growing companies who need to evaluate candidates rapidly and fairly. Hiring managers and interviewers also benefit from concise intelligence when preparing for interviews or debriefs.  
- **Value Propositions:** 
  - **Time Saved:** Automates repetitive analysis (screening, summarization, match scoring) so recruiters can focus on high-value decisions.  
  - **Data-Driven Confidence:** Provides evidence-backed fit assessments and interview guidance, reducing guesswork.  
  - **Bias Reduction:** Standardizes evaluations around job-related criteria and highlights potential biases (e.g. Ashby warns about bias in criteria).  
  - **Personalized Hiring:** Surface hidden strengths or risks, improving candidate experience and placement quality.  
  - **Audit & Compliance:** Maintain audit trails of AI logic and human approvals for reporting and fairness checks.  
- **Differentiation from ATS/Sourcing Tools:** Traditional ATS focus on workflow management (tracking candidates, scheduling) or on passive resume keyword matches. Our platform actively **generates insights**: summarizing career highlights, analyzing skill gaps, scoring fit, and offering recommendations. Unlike bolt-on AI features in legacy ATS, our system is built on an *end-to-end* AI engine using the full candidate context (as Ashby notes, drawing on applications, emails, feedback, etc.). We integrate actionable AI outputs (interview questions, red-flag alerts) directly into workflows, rather than just automating tasks.

## Intelligence Philosophy & Principles 

- **Human-in-the-Loop:** AI _assists_, not replaces, recruiters. The hiring decision remains human. All outputs are guidance or suggestions that require human approval. This follows Ashby and Greenhouse principles that “human must always be involved”. The system will pause at decision points (e.g. move-to-interview recommendations) for recruiter review.

- **Evidence-First & Explainability:** Every AI insight must cite sources from the candidate’s data. For example, if the engine says “Candidate has strong Python skills,” it should reference the resume lines or projects that mention Python (as Ashby “links to specific evidence”). Recommendations (e.g. “Recommend interview with Data Team”) must be accompanied by reasoning. We follow explainable AI best practices (e.g. LIME/SHAP, or prompt design yielding rationale) to make decisions transparent. The UI will display the **Candidate Intelligence Card** with sections including supporting evidence and confidence levels, ensuring recruiters understand *why* the AI suggests something.

- **No Hallucination / Safe Outputs:** The AI must never invent facts about a candidate. If required data is missing, the engine should indicate “unknown” rather than guess. It must avoid “common sense” inferences about sensitive traits. For example, it must not infer race, religion, disabilities, gender identity, or other protected attributes (per legal standards). All analysis stays grounded in documented candidate data. Any assumption should be explicitly labeled “assumed” or “unknown” with a low confidence.  

- **Ethical Constraints:** Inferences about personal traits (health, political views, sexual orientation, etc.) are strictly prohibited. The AI should not use external psychological profiling or predict irrelevant attributes. It should not suggest any candidates based on third-party background checks (especially if not integrated). On fairness, the engine avoids score factors correlated with demographics; it can highlight if certain criteria may introduce bias (as Ashby does).  

- **Privacy & Auditability:** The system logs all AI queries and outputs, including prompt versions and model versions, for audit purposes. Recruiters see citations of data sources (e.g. “Resume v3, section ‘Experience’”) to trace insights. Personal Identifiable Information (PII) like SSN or home address is stripped before sending to models (Ashby practice). Data retention policies comply with regulations: sensitive data is redacted, encrypted at rest, and RLS policies ensure only authorized organizational users see a candidate’s info.

- **Continuous Learning (Conceptual):** Over time, the system should refine its assessments based on outcomes (hired performance, hiring manager feedback). While we will not train ML models in this phase, we design for future feedback loops. For now, feedback (thumbs-up/down on AI suggestions) is recorded to improve prompt design and calibration iteratively.

## Candidate Knowledge Model 

We must maintain a comprehensive **Candidate Profile** that captures all relevant attributes. This knowledge model is the input to the intelligence engine. Each attribute should include its data type, source (provenance), update rules, and tenant isolation via Row-Level Security (RLS) since this is multi-tenant SaaS. Below is an exhaustive table of candidate entities and key fields:

| **Entity / Table**             | **Fields (Key Attributes)**                                                                                                                                                                                                                                                                                                              | **Provenance & Update Rules**                                                               | **Notes (RLS/Multi-tenant)**                                   |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| **Candidate Master**           | `candidate_id` (UUID)<br>`org_id` (foreign key)<br>`name`<br>`email`<br>`phone`<br>`external_profile_url` (LinkedIn, etc.)<br>`tags` (JSON array)                                                                                                                                                                                         | Populated via Gmail (email sender), recruiter import, or API. `<br>` Name/email from first email or resume parser. Updates: editable by recruiter.                                               | RLS on `org_id`. Only users within tenant see these records. |
| **Resume / CV**               | `resume_text` (text)<br>`resume_upload_timestamp`<br>`parsed_skills` (array)<br>`parsed_experience` (JSON list of roles with dates)<br>`parsed_education` (JSON)<br>`parsed_contacts` (JSON excluding PII)<br>`last_parsed_at`                                                                                                          | Obtained from email attachment via resume parser. Updates when a new resume is uploaded. Redact PII fields (SSN, full addresses).                                                                | Only available to same org.                                      |
| **Email Interaction**         | `email_id`<br>`candidate_id`<br>`subject`<br>`body_text`<br>`received_date`<br>`attachments` (list of URLs or metadata)<br>`ai_classification` (e.g. "job inquiry", "follow-up", etc.)<br>`parsed_resume_id` (FK if resume extracted)                                                                                                        | Synchronized from Gmail. Emails inserted with RLS, classify via ML as relevant/informational. Attachments flagged for parsing.                                                              | Each email belongs to an org via `candidate_id`.                |
| **Parsed Attachment**         | `attachment_id`<br>`candidate_id`<br>`type` (e.g. "resume", "cover_letter")<br>`original_filename`<br>`parsed_text`<br>`extraction_status` (success/fail)<br>`failure_reason`                                                                                                                                                                  | Created by attachment processor. On success, links to candidate. On failure, logs error.                                                                                                      | RLS by org.                                                    |
| **Screening Metadata**        | `screen_id`<br>`candidate_id`<br>`job_id`<br>`skills_missing` (list)<br>`qualification_score`<br>`AI_summary` (text)                                                                                                                                                                                                                       | Generated per role screening run. Compares candidate to role criteria. Updates when role changed.                                                                                           | Tied to both candidate & job (RLS by org).                    |
| **Job Application**           | `application_id`<br>`candidate_id`<br>`job_id`<br>`status`<br>`applied_date`                                                                                                                                                                                                                                                             | Tracked in ATS. From candidate’s application action. Updates by pipeline moves.                                                                                                               | Org-specific.                                                  |
| **Interview Feedback**        | `feedback_id`<br>`candidate_id`<br>`job_id`<br>`interview_round`<br>`scorecard_responses` (JSON)<br>`feedback_text`<br>`submitted_by` (user_id)                                                                                                                                                                                            | Entered by interviewers after each round. Accessible for AI summarization.                                                                                                                   | Tenant-scoped.                                                 |
| **Candidate Notes**           | `note_id`<br>`candidate_id`<br>`content`<br>`created_by` (user_id)<br>`created_at`<br>`note_type` (e.g. “recruiter comment”)                                                                                                                                                                                                             | Added by recruiters in the UI. Editable/deletable by author. Notes should be immutable for AI history after creation.                                                                      | Visible to all users in organization.                          |
| **Candidate Timeline**        | `timeline_id`<br>`candidate_id`<br>`event_type` (enum: “Applied”, “EmailReceived”, “PhoneScreen”, “Interview”, “Offer”, “Hire”, etc.)<br>`timestamp`<br>`details` (JSON)                                                                                                                                                                  | System-maintained timeline of activities/events. Automatically append on key actions (e.g. application date, interview scheduled/completed, status changes).                                 | Org-specific.                                                 |
| **Skills & Qualifications**   | `skill_id`<br>`candidate_id`<br>`skill_name`<br>`proficiency`<br>`years_exp`<br>`source` (e.g. "parsed", "self_reported")                                                                                                                                                                                                               | Extracted from resume or manually entered. Updates when resume re-parsed or recruiter edits.                                                                                               | Shared within org.                                            |
| **Education**                 | `education_id`<br>`candidate_id`<br>`degree`<br>`institution`<br>`year`                                                                                                                                                                                                                                                                 | Parsed from resume or added. Updates only on resume changes or manual edit.                                                                                                                 | -                                                            |
| **Certifications**            | `cert_id`<br>`candidate_id`<br>`name`<br>`issuer`<br>`date_obtained`                                                                                                                                                                                                                                                                     | Parsed from resume or added.                                                                                                | -                                                            |
| **Projects/Portfolio**        | `project_id`<br>`candidate_id`<br>`title`<br>`description`<br>`url`                                                                                                                                                                                                                                                                      | Candidate-supplied (if any) or parsed. Updates on resume re-parse.                                                                                                                          | -                                                            |
| **Recruiter Feedback**        | `feedback_id`<br>`candidate_id`<br>`user_id`<br>`feedback_type` (enum “thumb_up”, “thumb_down”)<br>`reason` (text)<br>`timestamp`                                                                                                                                                                                                          | Captured when recruiter rates an AI suggestion. Used for improvement.                                                                                                                     | Scoped by org/user.                                           |
| **AI Evaluations**            | `evaluation_id`<br>`candidate_id`<br>`job_id`<br>`evaluation_type` (e.g. "screening", "summary", "Q&A"), `content` (JSON with structured analysis), `confidence_score`<br>`timestamp`                                                                                                                                                        | Each run of the AI engine produces structured output stored here. Not user-edited. Retain history for auditing.                                                                            | Tenant-scoped, read-only.                                     |

**Update Rules & Retention:** Candidate records are retained indefinitely or per legal retention policies. Some sensitive details (e.g. parsed addresses) are ephemeral and not stored. RLS policies ensure each tenant (`org_id`) can only access its own candidate rows; global admins have higher privileges. All changes and AI outputs are timestamped, enabling audit trails.

## Candidate Lifecycle & Memory 

The engine tracks a candidate’s journey from first contact through hiring (or rejection) and beyond. Intelligence accumulates at each stage, forming a long-lived “memory” for the candidate.

```mermaid
timeline
    title Candidate Lifecycle Timeline
    section Intake
        Email Received       :active, 2026-01-01
        Resume Parsed        :done, 2026-01-01
        Candidate Created    :done, 2026-01-01
    section Screening
        Initial Screening    :active, 2026-01-02
        AI Summary Generated :done, 2026-01-02
    section Engagement
        Recruiter Follow-Up  :done, 2026-01-03
        Phone Screen         :done, 2026-01-04
    section Interviews
        Technical Interview  :active, 2026-01-05
        AI Feedback Summary  :done, 2026-01-05
    section Decision
        Hiring Manager Debrief :active, 2026-01-06
        Final Decision       :done, 2026-01-06
    section Onboarding
        Offer Extended      :active, 2026-01-07
        Hired (or Rejected)  :done, 2026-01-08
    section Post-Hire (Future)
        Ongoing Performance :active, 2026-07-03
```

- **Stages:** The lifecycle includes: *Intake* (first email or referral), *Screening* (AI initial assessment), *Engagement* (any recruiter interactions, calls), *Interviews* (live assessments and feedback), *Decision* (offer or reject), and *Onboarding* (post-hire processes). Each stage can trigger new intelligence or updates. 

- **Memory:** At any point, the *Candidate Memory* is the aggregated knowledge of all past interactions. For example, after interviews, the engine stores summarized feedback and updates the candidate’s skill confidence. If a candidate returns months later (or is considered for another role), the engine recalls their full history (previous roles, scores, notes). Essentially, every piece of data (emails, resumes, feedback, notes) is a node in the timeline.

- **Long-lived Profile:** The profile is not ephemeral to a single job. While screening is job-specific, core intelligence (skills, experience, major accomplishments) persists. This allows personalized context if the candidate reapplies or is considered for future roles.

- **Timeline Model:** Each timeline event (from the table above) is recorded. AI annotations attach to events (e.g. “AI: strong match to Job X with 87% confidence – reasons…”). The history becomes richer over time, improving future AI assessments.

- **Session vs. Global Memory:** “Session” refers to a single hiring loop, while “global memory” refers to the candidate’s combined history across sessions. The engine must differentiate: for a new role, job-specific screening resets, but core profile remains. All AI outputs include both session context (relevant job) and global context (overall profile).

## Candidate Intelligence Card 

The **Candidate Intelligence Card** is a standardized report generated for each candidate when reviewed. It encapsulates key insights with supporting evidence. The Card has the following sections:

| **Section**             | **Content**                                                                                                                                                                                                              | **Data Sources & Evidence**                                                                                                                                           |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Executive Summary**   | A brief overall narrative of the candidate’s profile and fit (2-3 sentences). It highlights the primary role match and any standout points (positive or concerns).                                                  | Synthesized from parsed resume, key skills match, and any past performance (for internal hires). Sources: resume summary, top skills, scorecard short descriptions.   |
| **Overall Fit Score**   | A numeric score (0–100) and/or rating (e.g. "High/Medium/Low") that represents the candidate’s match to the target role.                                                                                              | Computed by the Scoring Framework. Inputs: skill match percentage, years experience vs. requirement, education, job relevance. Sources: resume and job requirements.   |
| **Confidence Level**    | AI’s confidence percentage in its recommendations. Should be calibrated (e.g. via Bayesian or ensemble methods).                                                                                                        | Derived from model ensemble agreement or past calibration. Metadata from AI prompts.                                                                                |
| **Key Strengths**       | Bullet list of the candidate’s strongest skills/experiences relevant to the role (e.g. “5+ years of Python development, led 3 projects”).                                                                              | Extracted from resume content (education, past titles, skill lists). Each bullet includes evidence citation (e.g. "Experience: Senior Eng 2019-2023").  |
| **Primary Weaknesses/Gaps** | Bullet list of areas where the candidate may lack certain skills or experience for the role (e.g. “No Kubernetes exposure”, “Limited leadership experience”).                                                          | Determined by comparing required skills vs. parsed skills. Cite evidence for what’s missing (if resume has similar but not exact experience).                        |
| **Skill Coverage**      | Visual or tabular representation of key skill match. For each core skill (from job req), mark: "Met / Partially Met / Unmet".                                                                                         | Skills from job vs. skills from resume. Indicates exact matches (with evidence pointers).                                                                           |
| **Experience Analysis** | Narrative on breadth of experience (e.g. industry domain, size of past companies, career progression). Notes any lateral moves or promotions.                                                                          | From parsed `Experience` entries. Evidence by date ranges.                                                                                                          |
| **Leadership & Soft Skills** | Insights on leadership roles, teamwork, communication skills inferred from titles or past descriptions.                                                                                        | Parsed job titles (e.g. "Team Lead"), notes from recommendations if any (or hire outcomes).                                                                           |
| **Cultural/Personality Fit** | Optional: cues about working style or personality (e.g. “Demonstrated initiative in open-source contributions”).                                                      | Derived from projects, personal statements, or standardized questions answered.                                                                                            |
| **Career Trajectory**   | Observations on stability (tenure at companies, career progression speed) and long-term potential.                                                                                                                     | Calculated from timeline of experience. E.g. “Average tenure 2.5 years.”                                                                                    |
| **Red Flags/Concerns**  | Any potential issues: large unexplained gaps, very frequent job-hopping, negative feedback, or mismatches (e.g. “Inconsistent career path”). <br>**(Important:** Only fact-based flags.)                                | Data-driven: e.g. “Resume gap 2019–2020”; “2-month contract not explained.” Feedback from references or interviews (if negative).                                       |
| **Missing Information** | Explicitly list what’s unknown or incomplete (e.g. “No GitHub/portfolio provided,” “No salary expectations given”). <br>*(This prevents AI guessing.)*                                                                | Based on checklist: If a required field is empty, note it. (E.g. resume had no mention of specific skill).                                                     |
| **Suggested Next Steps**| Actionable recommendation (e.g. “Schedule a technical interview”, “Follow-up email about salary,” “Reject with feedback”). Must be phrased as question or option (never an order).                                   | Synthesized from context. Backed by reasons (e.g. “Strong fit on X, but gap in Y”).                                                                               |
| **Suggested Interview Q’s** | A few targeted questions for interviewers, based on candidate’s background or gaps (e.g. “How have you used Python in a team setting?” if Python is key skill).                                                  | Generated by analyzing resume and missing skills. Each question drawn from evidence in profile (e.g. “You led [Project X] – can you explain...”).                        |
| **Evidence Links**      | A footnote list showing snippets or references (e.g. “”, “”) used in insights above.                                                                                  | Collected from each section’s sources. The format should allow clickable review (for each insight).                                                               |
| **Review History**      | (Hidden by default) Log of any recruiter edits or overrides to AI suggestions, including timestamps.                                                                                                               | Application DB logs (e.g. when user thumbs-up/down, or edits summary).                                                                                           |

Each section of the Intelligence Card must explicitly map to underlying data. For example, **Key Strengths** are backed by bullet-proof evidence from the resume or past interview notes. The **Missing Information** section signals “unknowns” rather than leaving silence. The table below exemplifies how each section ties to data:

| **Section**               | **Primary Data Source**             | **Evidence Example**                                            |
|---------------------------|------------------------------------|-----------------------------------------------------------------|
| Executive Summary         | Resume summary, Cover letter       | “5 years at [Company]; led team of 4”                  |
| Overall Fit Score         | Weighted skill matrix              | Computed from skill match (e.g. “4/5 required skills matched”)   |
| Key Strengths             | Resume (Experience, Skills)        | “Lead Software Engineer (2018-2023)”                   |
| Primary Weaknesses        | Skill vs. Requirements diff        | “No listing of Kubernetes (required)”                 |
| Skill Coverage            | Resume & Job Req fields            | “Python: Met; AWS: Partially (limited usage)” |
| Experience Analysis       | Resume chronology                 | “Promotion from Mgr to Sr. Mgr in 2 years”             |
| Red Flags                 | Resume gaps, Feedback             | “Gap between 2020-2021 unexplained”                 |
| Missing Info              | Data fields or prompts            | “No coding samples provided”                                     |
| Interview Questions       | Combination of all above          | “Ask about [ProjectName] usage of X”                  |

## Scoring & Decision Framework 

We adopt a conceptual framework to score candidates and support decisions, without locking into a specific numeric formula (that can evolve). 

- **Scoring Dimensions:** Determine core dimensions such as Technical Skills, Experience, Domain Knowledge, Culture Fit, Communication, Leadership Potential. Each dimension may have sub-factors. For example:
  - *Technical Skills:* Percentage of required skills present (weighted), level of expertise.
  - *Experience:* Years of relevant experience, seniority of past roles.
  - *Domain Fit:* Industry familiarity (if applicable).
  - *Communication:* Proxy via clarity in resume, public communications (publications/GitHub).
  - *Leadership:* Number of people managed or projects led.
  - *Growth Potential:* Attributes like self-learning (certifications, side projects).
- **Weighting & Aggregation:** Each job defines weights for these dimensions (from recruiter-defined criteria). The engine computes a weighted sum or rule-based aggregate for an **Overall Match Score**. We do not present this as a single magic number by default (to avoid bias/overconfidence), but as an optional indexed score. Instead, we present categorical fit (High/Medium/Low) with breakdown by dimension. 
- **Confidence Calculation:** We’ll use heuristics: e.g. if multiple independent facts support a conclusion, confidence is higher. If we have incomplete data or conflicting info, confidence lowers. In practice, prompt the model to output a confidence percentage. We log this to gauge calibration (Greenhouse notes the importance of trust and allow human override).
- **Evidence Aggregation Rules:** When deriving any conclusion, explicitly aggregate evidence. For instance, “Strong Python skills” if more than 3 resume entries mention Python across projects. If evidence contradicts (two roles vs one skill), note the discrepancy. 
- **Uncertainty Presentation:** Low-confidence items should be labeled (e.g. gray text or question mark icon) with a note like “insufficient data”. This prevents recruiter from treating all output as absolute truth. For example: “Likely comfortable with cloud (confidence: 60%; resume lists AWS in one project)”. 
- **No Absolute Elimination:** The framework never auto-reject. Scores can suggest “low fit” but final rejection requires human sign-off (e.g. via thumbs-down feedback). The engine can flag “Low alignment” but always in “suggest vs. command” language.

## Explainability & Evidence 

Explainability is a first-class requirement. The engine must maintain provenance for all statements and allow audit trails.

- **Citation Format:** Use in-text citations like “” or “” (preferably link to data records). For example: “Expert in Python, led integration projects at Company X.” All numeric values (e.g. years of experience) cite source.
- **Provenance Linking:** In the output JSON (or structured internal log), attach references with each claim (e.g., pointers to the `Candidate Profile` DB entries or source documents). This is critical for audit logs. For example, store `{"claim": "managed a team of 5", "source": {"entity": "parsed_experience", "field": "team_size", "value": 5}}`.
- **Prompt Version & Model Tracking:** Each AI output record should include metadata: model name (e.g., GPT-4v), prompt version ID, generation timestamp. This allows reproducibility and rollback.
- **Unknowns Handling:** If the model doesn’t have data to answer, it must output “Unknown” with reasoning (“No data on [attribute]”). For instance, if asked “Does candidate have Kubernetes experience?” and the resume doesn’t mention it, reply “Unknown – Kubernetes not mentioned in resume or conversations.” It should never hallucinate or guess beyond evidence.
- **Local Justifications:** Each section of the Intelligence Card ends with a “Based on” line listing evidence (e.g. “Based on interview feedback and resume”).
- **Confidence & Explanation:** Pair every recommendation with a confidence score and brief explanation. For example: “Recommend moving to technical interview (Confidence: 92%). AI notes candidate’s 8 years in similar role and strong problem-solving examples.” 
- **Audit Trail:** All AI decisions (recommendations, notes) along with user actions (approved/rejected, edits) are logged. Include fields: `ai_decision`, `ai_confidence`, `user_decision`, `user_notes`. This forms an audit log for compliance and analysis.

## Human-in-the-loop Workflows 

The engine supports multiple review patterns:

- **Approval Queue:** At key junctures (e.g. “Should this candidate proceed to phone screen?”), the system generates an approval task. This appears in “Approvals” view. Recruiters see the AI recommendation, rationale, and have options (approve/reject/needs info). Each action is recorded with context.
- **Feedback Capture:** For each AI suggestion (e.g. interview questions, fit assessment), recruiters can give binary feedback (thumbs up/down) and optional reason. E.g. “Good question” or “Irrelevant point”. This feedback feeds back into the candidate memory (marked in profile) and eventual model improvements.
- **Interactive Corrections:** Recruiters can edit certain AI-generated text (like the Executive Summary) before finalizing. The system should record both original and edited texts for analysis.
- **Thumbs Schema:** Standardize feedback options (👍, 👎) per suggestion. If thumbs-down, require a reason: “Why was this suggestion off? Missing context? Inaccurate?”. Store these responses.
- **Feedback Impact:** Conceptually, feedback is used to adjust future behavior. For instance, if multiple users thumbs-down interview questions about leadership for a role, deprioritize leadership questions in that context. Documented as: "If X% of recruiters reject a suggestion type, reduce its weight."
- **Role of AI as Assistant:** Emphasize that the recruiter “asks” questions of the AI. The AI is positioned as an assistant. For example, in the UI, a chat with the “Candidate Copilot” (see later phase) uses the stored candidate profile to answer recruiter queries. The Copilot queries the RAG layer for facts and reasons, never straying from known data.
- **Approval vs. Execution:** Once human approves an action (e.g. move pipeline stage, send email), the system executes it via the Execution Engine. But even that flow has a final human toggle to prevent unintended moves.

## RAG & Knowledge Retrieval 

To ground AI responses in actual data, we use a Retrieval-Augmented Generation (RAG) strategy:

- **Knowledge Base (KB) Design:** All candidate-related content is stored in a searchable KB (could be vector store or document DB). This includes resumes text, email texts, notes, interview transcripts, and schema fields. We chunk large texts (like resumes) into logical segments (e.g. “Experience at Company X (lines 30-50)”) to allow fine-grained retrieval. 
- **Indexing & Chunking:** Each source document is chunked by semantic units (paragraphs, bullet points). We index by embedding candidate context (name, job ID) so that retrieval is scoped per candidate. For example, each chunk’s metadata includes candidate_id and job_id, ensuring we retrieve only that candidate’s info.
- **Retrieval Policies:** For each query or prompt, retrieve relevant chunks. E.g. when generating strengths, retrieve “experience”, “projects”, “skills” chunks. We use role-based heuristics: Questions about skills fetch resume/skills table; questions about interview fetch interview feedback logs. 
- **Candidate-Scoped Grounding:** The RAG retrieval is strictly candidate-bound. Do not mix info from different candidates or external text (no Wikipedia). Each prompt to LLM is pre-pended with retrieved context chunks that are clearly labeled. 
- **Freshness:** Use timestamps to ensure most recent info. If new email arrives or user note added, index updates. 
- **Fallback:** If no direct match found for a query (e.g. recruiter asks “What is candidate’s GitHub activity?” and none exists), the system should clearly say “Data not available”. 
- **Chaining:** For complex outputs (like generating interview Qs), use multi-step: e.g. first retrieve summary of skills gaps, then feed that into question-generation prompt.
- **Example RAG workflow:** To answer “Why should we interview this candidate?”, system retrieves candidate’s top project descriptions, past job titles, and interviewer notes; then prompts LLM: “Summarize why candidate X is a good interview subject based on these facts.” The LLM answer includes citations from those retrieved docs.

## Safety & Out-of-Scope 

Explicit prohibitions:

- **Protected Attributes:** Do *not* infer or mention race, ethnicity, gender identity, sexual orientation, religion, health status, genetic info, political affiliation, age, or any other protected characteristic. The system should not even store such inferences.
- **PII Handling:** Personal data (DOB, SSN, address) found in resumes are redacted or hashed before any AI use. Never output PII in AI-generated text. 
- **Background Checks:** The engine will not perform or presume criminal or credit checks. If integrated services (outside scope) provide such info, mark as separate verification tasks, not AI deductions.
- **Out-of-Scope Predictions:** No predictions about candidate behavior outside the hiring context (e.g. tenure at other companies, likelihood of leaving after hire, personality traits like “shyness”). We limit analysis to professional fit.
- **External Data:** No use of social media or non-consented data. Only consider what candidate submitted or explicitly linked (e.g. a public GitHub link they provided).
- **Legal Compliance:** The engine should flag if job criteria may violate legal hiring standards (like protected class-based requirements) and drop such criteria. This is partly addressed in architecture (requirements input) and partly in AI warnings (as Ashby does).
- **Consent:** Candidates should be informed that AI is reviewing their data and the data retention policy. In jurisdictions requiring consent for AI processing, the system should enforce appropriate opt-outs (beyond this document’s scope, but assume compliance processes exist).
- **Bias Mitigation:** While not an immediate engine output, document that any use of historical hiring data for improving scoring must be audited for bias. For now, keep the scoring rule-based rather than learning from potentially biased historical hires.

## Success Metrics & Acceptance Criteria 

### Key Performance Indicators (KPIs)

1. **Recruiter Efficiency:** Time saved per candidate (e.g. targeted metric: reduce first-screen time by 50% compared to manual evaluation).  
2. **Accuracy vs Baseline:** Percentage of top candidates identified by AI that match human shortlist over time (target: 90% overlap).  
3. **False Positive Rate:** Instances where AI strongly recommends a candidate but recruiter rejects vs. baseline. Aim to minimize misguidance (target: <10%).  
4. **Confidence Calibration:** Ratio of AI confidence to actual correctness. For example, when AI says 80% confident, outcomes should align ~80% of time.  
5. **User Trust / Satisfaction:** Recruiter survey on AI usefulness and trust (target improvement after 3 months).  
6. **Adoption Rate:** Percentage of candidates processed with AI assistance vs. old pipeline.  
7. **Bias Indicators:** Representation of demographics in interviewed pool vs. applicant pool (should not worsen with AI use).  

### Acceptance Tests

Each of these must be verifiable:

- [ ] **Executive Summary Generation:** Given a parsed candidate profile, AI produces a 2–3 sentence summary that correctly cites at least one evidence source.  
- [ ] **Strengths/Weaknesses Accuracy:** The `Strengths` bullets correspond to actual keywords from the resume, with cited lines. Weaknesses correspond to missing job requirements.  
- [ ] **Skill Coverage Table:** The skill matrix correctly labels meets/partials. A test job with known requirements should match resume parsed skills, and unknown skills should be “Unmet.”  
- [ ] **Red Flags Identification:** If candidate has an unexplained work gap (simulated data), engine flags it correctly.  
- [ ] **Missing Info Listing:** If a required field (e.g. GitHub link) is blank in profile, AI lists it in Missing Info.  
- [ ] **Fit Recommendation:** For a test candidate matching criteria, AI suggests “move to interview” with a confidence > 70%. For a non-matching candidate, suggests “maybe reject” but with justification.  
- [ ] **Interview Questions:** Generated questions relate to candidate’s listed experiences (e.g. if resume has “Developed microservices”, ask about that).  
- [ ] **Citing Evidence:** Every AI statement about the candidate includes an evidence pointer (e.g. ``).  
- [ ] **No Hallucinations:** On a blank or fictitious data input, AI should not output real-world facts.  
- [ ] **Privacy Compliance:** Test resume with PII (address/SSN) must not appear in any AI output.  
- [ ] **Response to Unknowns:** If asked about a missing field, AI responds “Unknown” rather than fabricating.  
- [ ] **Feedback Loop:** Provide example thumbs-down feedback and ensure it is logged in the candidate’s feedback history.  
- [ ] **RAG Retrieval:** Query the system for a known fact (e.g. “What tool did candidate use at XYZ Corp?”) and verify the retrieved snippet matches the resume line.  
- [ ] **Confidence Calibration Check:** Over a set of 100 known cases, AI confidence correlates (within ±10%). (This is a long-term test.)  
- [ ] **Compliance Flags:** Input job requirements with a disallowed attribute (age > X). Ensure AI warns or ignores it.  

## Evaluation & Continuous Improvement 

- **Human Review Sampling:** Routinely (e.g. weekly) have human reviewers inspect a sample of AI-generated cards vs. human-prepared notes to catch errors or biases. Use checklists similar to acceptance tests. Record false positives/negatives.  
- **A/B Testing:** For large organizations, consider A/B testing “AI-assisted vs. baseline” workflows on metrics like time to decision, interviewer satisfaction.  
- **Feedback Incorporation:** Tally thumbs-up/down trends. If certain suggestions are consistently rejected, update prompts or business rules. For example, if interview questions on a particular topic score poorly, remove that generator.  
- **Prompt Refinement:** Maintain versioned prompts; track which prompt version was used for each output. Periodically review LLM performance with new model releases (e.g. GPT updates) and recalibrate.  
- **Data Drift Monitoring:** Monitor if candidate profiles or job descriptions change over time (e.g. new skills trending) and update the skill extraction patterns.  
- **Bias Audits:** Conduct periodic fairness audits to ensure no subgroup of candidates is systematically scored worse without job-related cause.  

## Deliverables for Agent Prompting 

The agent implementation must produce or update the following artifacts for this milestone:

| **Artifact**                   | **Purpose**                                                                                                 | **Acceptance Criteria**                                                                                                                                                       |
|--------------------------------|-------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `IntelligenceCardSchema.json`  | JSON Schema defining the structure of the Candidate Intelligence Card (all sections and fields).            | Schema is valid, complete, and enforced. Fields include: summary, score, confidence, strengths[], weaknesses[], skillsCoverage[], redFlags[], missingInfo[], suggestions[], evidenceLinks[]. |
| `CandidateProfileSchema.json`  | JSON Schema for the Candidate Profile (aggregated fields used by intelligence engine).                      | Must include all attributes from Knowledge Model (name, skills[], experiences[], etc.) with types. Enforce RLS fields (org_id).                                                  |
| `ai/prompts/skill-extraction.md`       | Prompt template for extracting skills and experience bullet points from resume text (to be used by email/resume pipeline).                | Template includes instruction to output JSON with “skills” and “experience” keys. Test: sample resume yields JSON matching expectations.                                         |
| `ai/prompts/strengths-weaknesses.md`    | Prompt for generating top 5 strengths and top 3 weaknesses for a candidate relative to a given job.    | Uses role criteria and candidate data to output bullet lists. Test: Known resume and job should yield expected strengths/weaknesses.                                              |
| `ai/prompts/score-candidate.md`         | Prompt for computing match score and confidence.                                                          | Should combine skill match and experience heuristics. Test: Candidate with X/5 skills match yields score ~X/5 (plus weight).                                                    |
| `ai/prompts/generate-summary.md`        | Prompt for executive summary of candidate’s profile (2-3 sentences).                                      | Must mention key highlights and be supported by evidence. Test: Summary for a test profile includes at least one evidence pointer.                                              |
| `ai/prompts/generate-questions.md`      | Prompt for suggested interview questions based on candidate’s profile.                                     | Should produce 3–5 questions relevant to gaps/experience.                                                                  |
| `ai/prompts/qa-candidate.md`            | Prompt for Q&A (candidate copilot) to answer any recruiter question with evidence.                         | Ensure answer is scoped to retrieved chunks and cites them.                                                              |
| `knowledge_base/` (folder)       | Structure to store sample candidate documents for RAG (e.g. `candidate_{id}_resume.txt`, `email_{id}.txt`).   | Placeholder files with dummy content for testing retrieval pipeline.                                                   |
| `evaluation/test_profiles.json`         | Sample candidate profiles (with fields populated) for unit testing the engine.                             | At least 3 diverse profiles (good, borderline, poor) with ground-truth outputs for comparison.                           |
| `evaluation/test_jobs.json`             | Sample job requirements JSON for scoring and matching.                                                     | Contains required skills and weights.                                                                                    |
| `evaluation/test_cases/`                | YAML or JSON test case definitions mapping sample profiles + jobs to expected outputs (for unit tests).    | Each test case states expected fit decision, example strengths, missing items, etc.                                      |
| Documentation (Markdown pages)   | Detailed docs explaining each section of the Intelligence Card and how to interpret it (for user guide).  | Pages under `docs/` referencing sections of JSON schema.                                                                 |

Each artifact should include comments or descriptions explaining fields. The agent should validate schemas (e.g. using Zod or JSON Schema validators) and include example usage in docs. 

## Prioritized Feature List & Roadmap 

**MVP (current milestone):**  
- Basic Candidate Profile ingestion (resume parsing, email integration).  
- Generate **Executive Summary**, **Skills Matched**, **Strengths/Weaknesses**, **Missing Info**, and **Red Flags**.  
- Implement **Fit Score** and **Confidence** output (rules-based).  
- Show Evidence citations.  
- Support recruiter queries via basic RAG QA (job-specific questions).  
- Approvals workflow (thumbs up/down logging).  

**Medium-term (Phase 3+):**  
- **Enhanced Q&A Copilot:** Natural language interface for recruiter questions using full profile.  
- **Contextual Interview Questions:** Expand question templates using generative AI.  
- **Adaptive Scoring Models:** Possibly learn weights from past outcomes.  
- **Advanced RAG:** Include external labor market trends (if data available).  
- **Continuous Learning:** Use human feedback to fine-tune prompts.  

**Long-term (Phase 4+):**  
- **Cross-Candidate Insights:** Identify top performers patterns from hires.  
- **Talent Pipeline Recommendations:** Suggest nurturing candidates over time.  
- **Predictive Talent Analytics:** Forecast time-to-hire, attrition risk (with caution and ethics review).  
- **Enterprise Features:** Bulk candidate compare, team diversity metrics, compliance reporting.  

## References 

- AshbyHQ (2026), *AI Recruiting Features* – highlights explainability, evidence, human-in-loop.  
- Greenhouse (2026), *AI in Structured Hiring* – emphasizes evidence-grounded AI and accountability.  
- PeopleFirst HR (2025), *AI-Augmented HR Function* – concept of Candidate Intelligence Card and AI agents.  
- Zhang et al. (2025), *Explainable AI in Recruitment* – review of XAI techniques in hiring.  
- OpenAI Documentation (2025) on Retrieval-Augmented Generation.  
- Industry Best Practices: Explainable AI, RAG design guides, and ATS competitor docs (Paradox, Eightfold, etc.) on AI recruiting features.  

