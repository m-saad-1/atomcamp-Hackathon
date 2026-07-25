# Engineering Report: Sprint 3 (Resume Processing & Candidate Creation)

## Overview
This sprint successfully implemented the deterministically structured Resume Processing pipeline. We successfully moved from raw email attachments directly to strongly-typed Candidate models (Zod/OpenAI JSON mode), without invoking "AI Intelligence" scoring.

## Architecture Decisions
- **OCR Fallback**: We integrated `tesseract.js` for scanned documents. Due to OS dependency limitations, full PDF-to-Image rendering was scoped out; however, the OCR fallback correctly attempts processing. Scanned PDFs are flagged accordingly.
- **Document Extractors**: We implemented `pdf-parse` (PDF), `mammoth` (DOCX), and `word-extractor` (DOC). Raw text and basic RTF stripping are used as fallbacks.
- **Data Provenance**: A JSONB column tracks precisely which `attachment_id` and `email_id` sourced the data, fulfilling the traceability requirement.
- **Deduplication Engine**: A high-confidence (Email, Phone, Links) vs medium-confidence (Name only) matching heuristic safely segregates exact matches from potentially conflicted identities. Exact matches are automatically merged into new resume versions.

## Features Implemented
- Expanded `candidates` table schema to include nested JSON arrays (`projects`, `education`, `work_history`).
- `resumes` table mapping versions to candidates.
- `candidate_timeline` table appending lifecycle events (Email received, Created, Merged, etc).
- Candidate UI enriched with `applications` and `emails` sections to complete the Candidate Identity model.
- Duplicate Resolution UI (`/dashboard/duplicates`) for manual intervention.
- Improved Platform Health UI exposing OCR and extraction successes/failures.

## Files Created/Modified
- `supabase/migrations/006_sprint_3_candidate_schema.sql` (Created)
- `supabase/migrations/007_sprint_3_fixes.sql` (Created)
- `lib/parsers/extraction.ts` (Created)
- `lib/parsers/ocr.ts` (Created)
- `lib/candidates/schema.ts` (Created)
- `lib/candidates/processor.ts` (Created)
- `app/api/emails/[id]/process/route.ts` (Modified)
- `app/api/candidates/route.ts` (Modified)
- `app/dashboard/candidates/page.tsx` (Modified)
- `app/dashboard/candidates/[id]/page.tsx` (Modified)
- `app/dashboard/duplicates/page.tsx` (Created)
- `lib/health.ts` (Modified)

## Remaining Technical Debt
- **Scanned PDF Pipeline**: Needs a robust internal PDF rasterizer (`pdf2pic` + Ghostscript) to fully leverage Tesseract without external APIs.
- **Complex Edge Cases in Validation**: We need to validate logic such as dates inside work histories overlapping, or duplicate array string values.
