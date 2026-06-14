┌──────────────────────────────┐
│  Recruiter Email Inbox       │
│  (Gmail/Outlook/IMAP)        │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Email Listener Agent        │
│  (Polls/Listens to Emails)   │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  LLM Analysis Agent          │
│  (OpenAI/Claude/Llama)       │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Information Extraction      │
│  • Candidate name            │
│  • Technical skills          │
│  • Job role                  │
│  • Urgency level             │
│  • Availability              │
│  • Contact information       │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Decision Agent              │
│  (Scoring & Filtering)       │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Automated Actions           │
│  • Create candidate profile  │
│  • Store in database         │
│  • Schedule interview        │
│  • Draft email response      │
│  • Send notifications        │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Human Approval UI           │
│  (Review & Approve/Reject)   │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Execution Agent             │
│  (Commit Actions)            │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  Final Actions               │
│  • Send confirmation email   │
│  • Update candidate pipeline │
│  • Create calendar events    │
└──────────────────────────────┘