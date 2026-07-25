# Requirements Traceability Matrix - Sprint 3

| Phase | Requirement | Status | Files / Evidence |
|-------|-------------|--------|------------------|
| A | Resume discovery | ✅ | `app/api/emails/[id]/process/route.ts` - fetches `queued_for_ai` emails |
| A | Resume extraction | ✅ | `lib/parsers/extraction.ts` - `pdf-parse`, `mammoth`, `word-extractor` |
| A | OCR fallback | ✅ | `lib/parsers/ocr.ts` - `tesseract.js` integration |
| A | Processing status | ✅ | `lib/candidates/processor.ts` - updates email `lifecycle_status` |
| B | PDF, DOCX, TXT support | ✅ | `lib/parsers/extraction.ts` |
| B | DOC support | ✅ | `lib/parsers/extraction.ts` - `word-extractor` handles legacy .doc |
| B | RTF support | ✅ | `lib/parsers/extraction.ts` - basic regex parsing added |
| C | Candidate Identity Model | ✅ | `006_sprint_3_candidate_schema.sql` - schema setup |
| C | Resumes & Timeline | ✅ | `006_sprint_3_candidate_schema.sql` - schemas setup |
| C | Applications & Emails Linking | ✅ | `app/dashboard/candidates/[id]/page.tsx` - added data fetching and rendering |
| D | Dedupe by Email, Phone, LinkedIn, GitHub | ✅ | `lib/candidates/processor.ts` - queries these fields precisely |
| D | Prefer manual review / No aggressive merges | ✅ | `lib/candidates/processor.ts` - Medium confidence yields `pending_review` |
| E | Extract structured info (No AI inference) | ✅ | `lib/ai/prompts.ts` & `lib/candidates/schema.ts` - explicit system instructions |
| F | Timeline Logging | ✅ | `lib/candidates/processor.ts` - `email_received`, `document_attached`, `created` |
| G | Resume Versioning | ✅ | `lib/candidates/processor.ts` - inserts with incrementing `version_number` and tracks `is_latest` |
| H | Validation | ⚠️ | `lib/candidates/schema.ts` - Zod ensures shape, but logic edge-cases remain |
| I | Provenance | ✅ | `lib/candidates/processor.ts` - logs `source_email_id` and `source_attachment_id` |
| J | UI Candidate Cards / Empty States / Errors | ✅ | `app/dashboard/candidates/page.tsx` - updated components |
| J | Timeline UI | ✅ | `app/dashboard/candidates/[id]/page.tsx` - added right pane |
| K | Resume Health Metrics | ✅ | `lib/health.ts` - surfaces Extraction Pipeline metrics using Audit Logs |
