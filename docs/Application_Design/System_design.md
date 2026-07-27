# Recrion Design System v1.0
## Foundation for the AI Recruiting Operations Platform

> **Version:** 1.0
>
> This document defines the complete visual language, UI patterns, interaction principles, spacing system, component standards, accessibility rules, animations, and styling guidelines for Recrion.
>
> Every screen, component, and feature must strictly follow this system to ensure consistency across the entire platform.

---

# 1. Design Philosophy

## Vision

Recrion is **not** another ATS.

It is an **AI Recruiting Operations Platform**.

The interface should communicate:

- Professional
- Trustworthy
- Intelligent
- Fast
- Enterprise-grade
- Calm
- Minimal
- Data-driven

The UI should never compete with the user's work.

Instead,

the software disappears,

allowing recruiters to focus on hiring.

---

## Design Principles

### Calm

Avoid visual noise.

Remove unnecessary colors.

Reduce distractions.

Every element must have a purpose.

---

### Enterprise First

The interface should resemble software used by recruiters every day,

not a startup landing page.

---

### Functional Beauty

Beauty comes from hierarchy,

spacing,

typography,

alignment,

and consistency—

not flashy gradients.

---

### AI Without Looking Like AI

Avoid:

- neon effects
- futuristic holograms
- glowing gradients
- robots
- floating glass cards

Instead,

AI should feel integrated,

professional,

and invisible.

---

### Information Hierarchy

The eye should naturally move from:

Primary

↓

Secondary

↓

Supporting

↓

Actions

without confusion.

---

# 2. Design Inspiration

Inspired by:

- Linear
- Stripe Dashboard
- Ramp
- Ashby ATS
- Notion
- Vercel
- Attio
- Arc Browser

The goal is inspiration,

not imitation.

---

# 3. Theme

## Initial Release

Light Theme Only

Reasons:

- HR software is primarily used during working hours.
- Better readability.
- Better tables.
- Better analytics.
- Better marketing screenshots.
- Better PDF exports.

Dark mode can be introduced later.

---

# 4. Layout System

The application uses a consistent desktop-first layout.

```
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Header                                             │
│         ├────────────────────────────────────────────────────┤
│         │                                                    │
│         │                Main Content                        │
│         │                                                    │
│         │                                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Sidebar

Width

```
264px
```

Fixed.

Scrollable independently.

---

## Header

Height

```
72px
```

Sticky.

Always visible.

---

## Content Area

Maximum Width

```
1600px
```

Centered.

Large breathing room.

---

# 5. Grid System

Desktop

```
12 Columns

24px Gutters

24px Margins
```

Tablet

```
8 Columns
```

Mobile

```
4 Columns
```

Every page follows the same grid.

---

# 6. Spacing System

The entire interface follows an 8-point grid.

| Size | Usage |
|------|------|
| 4 | Tiny spacing |
| 8 | Icons |
| 12 | Labels |
| 16 | Form spacing |
| 20 | Card content |
| 24 | Standard padding |
| 32 | Section spacing |
| 40 | Large groups |
| 48 | Page spacing |
| 64 | Hero spacing |

Never invent random spacing.

---

# 7. Border Radius

| Component | Radius |
|------------|---------|
| Buttons | 12px |
| Inputs | 14px |
| Cards | 20px |
| Dialogs | 24px |
| Tables | 18px |
| Dropdown | 16px |
| Charts | 20px |
| Avatar | Circle |

---

# 8. Shadows

Minimal shadows only.

### Default

```
0 1px 2px rgba(0,0,0,.05)

0 6px 24px rgba(0,0,0,.05)
```

---

### Hover

```
0 10px 30px rgba(0,0,0,.08)
```

---

### Dialog

```
0 24px 64px rgba(0,0,0,.12)
```

Never use dramatic shadows.

---

# 9. Color Palette

## Background

Primary

```
#F7F8FA
```

---

Secondary

```
#FFFFFF
```

---

Tertiary

```
#F2F4F7
```

---

Sidebar

```
#FFFFFF
```

---

Border

```
#E6EAF0
```

---

Divider

```
#EEF2F6
```

---

# 10. Brand Colors

Primary

```
#5B5CEB
```

---

Hover

```
#4E50DD
```

---

Pressed

```
#3E42C7
```

---

Soft Background

```
#EEF0FF
```

---

# 11. Semantic Colors

## Success

```
#16A34A
```

Background

```
#ECFDF3
```

---

## Warning

```
#F59E0B
```

Background

```
#FEF3C7
```

---

## Error

```
#DC2626
```

Background

```
#FEF2F2
```

---

## Info

```
#0284C7
```

Background

```
#E0F2FE
```

---

## AI Accent

```
#7C3AED
```

Background

```
#F3E8FF
```

Only AI features may use purple.

---

# 12. Typography

Font Family

```
Inter
```

---

Weights

| Weight | Usage |
|---------|------|
| 700 | Hero Numbers |
| 600 | Titles |
| 500 | Labels |
| 400 | Body |

---

Type Scale

| Size | Usage |
|------|------|
| 36 | Dashboard KPI |
| 30 | Page Title |
| 24 | Section Title |
| 20 | Card Title |
| 18 | Large Body |
| 16 | Default |
| 15 | Tables |
| 14 | Inputs |
| 13 | Captions |
| 12 | Meta |

---

# 13. Icons

Library

```
Lucide Icons
```

Size

```
20px
```

Stroke

```
2px
```

Never mix icon libraries.

---

# 14. Buttons

## Primary

Filled

Soft Indigo

White text

Height

```
44px
```

---

## Secondary

White

Border

---

## Ghost

Transparent

---

## Danger

Red

---

## AI

Soft Purple

Reserved exclusively for AI actions.

---

# 15. Inputs

Height

```
44px
```

Radius

```
14px
```

Border

```
#E5E7EB
```

Focus

Soft Indigo ring.

---

# 16. Cards

Every card follows:

```
Header

↓

Content

↓

Footer (Optional)
```

Padding

```
24px
```

Radius

```
20px
```

Cards should never feel crowded.

---

# 17. Sidebar

Contains:

- Logo
- Workspace
- Search
- Navigation
- User Profile

Navigation

- Dashboard
- Inbox
- Candidates
- Jobs
- Copilot
- Approvals
- Execution
- Analytics
- Integrations
- Settings

Selected Item

Background

```
#EEF0FF
```

Text

```
#5B5CEB
```

Icon

```
#5B5CEB
```

No left border.

No glowing effects.

---

# 18. Header

Contains

- Breadcrumb
- Page Title
- Search
- Quick Actions
- Notifications
- User Menu

Sticky.

Height

```
72px
```

---

# 19. Search

Width

```
320px
```

Height

```
44px
```

Placeholder

```
Search candidates, emails...
```

Rounded.

Subtle border.

---

# 20. Tables

Row Height

```
56px
```

Sticky header.

Rounded header.

No vertical borders.

Hover

Light gray.

---

# 21. Charts

Rules

- Flat colors
- Rounded bars
- Minimal grid
- No gradients
- No shadows
- No 3D

Animation

Only on initial load.

---

# 22. KPI Cards

Structure

```
Icon

↓

Title

↓

Large Number

↓

Trend

↓

Sparkline
```

Very minimal.

---

# 23. Badges

Used for

- Pending
- Approved
- AI
- Verified
- Failed
- Executing

Always

- Rounded
- Filled
- Tinted background

No outlined badges.

---

# 24. AI Components

Every AI component includes

- Sparkle icon
- Confidence
- Reasoning
- Evidence
- Recommendation

Purple is only used here.

---

# 25. Empty States

Every empty state contains

- Illustration/Icon
- Title
- Description
- Primary Action

Never leave blank pages.

---

# 26. Loading States

Prefer

Skeleton Loaders

instead of

Spinners.

Show realistic placeholders.

---

# 27. Error States

Every error includes

- Icon
- Explanation
- Suggested Fix
- Retry Button

---

# 28. Success States

Display

- Toast
- Banner
- Confirmation

Keep messages concise.

---

# 29. Notifications

Use

Toast Notifications

Top-right

Duration

```
4 seconds
```

---

# 30. Motion System

Motion communicates state,

never decoration.

---

Hover

Cards

```
TranslateY(-2px)
```

---

Buttons

```
Scale(1.02)
```

---

Sidebar

Smooth highlight transition.

---

Dialogs

Fade

+

Scale

```
0.98 → 1
```

---

Page Transition

Crossfade only.

No sliding pages.

---

Animation Duration

Fast

```
120ms
```

Standard

```
180ms
```

Large

```
240ms
```

---

# 31. Accessibility

Must support

- Keyboard navigation
- Screen readers
- Focus states
- High contrast
- Proper labels
- ARIA attributes

Minimum text contrast

```
4.5:1
```

---

# 32. Responsive Design

Desktop

```
1440–1600px
```

Laptop

```
1280px
```

Tablet

```
768px
```

Mobile

```
390px+
```

Sidebar

Desktop

Fixed

Tablet

Collapsible

Mobile

Drawer

---

# 33. Dashboard (Reference Implementation)

The Dashboard establishes every visual pattern used across the application.

## Structure

```
Header

↓

Welcome Banner (optional)

↓

KPI Grid (4 Cards)

↓

Main Analytics Grid

├── Hiring Pipeline
├── AI Activity
├── Recruiting Health

↓

Secondary Grid

├── Recent Candidates
├── Upcoming Interviews
├── Pending Approvals

↓

Bottom Grid

├── Team Activity
├── AI Recommendations
└── System Status
```

Design Rules:

- Use an asymmetrical grid for a more natural, less template-like appearance.
- KPI cards should be compact with strong numerical hierarchy.
- The Hiring Pipeline is the primary visual anchor.
- AI Activity is presented as an operational feed, not a chat interface.
- Every card includes a contextual action (e.g., "View all", "Inspect", "Export").
- No card should exist solely for decoration; each must communicate actionable information.

---

# 34. Component Library

The design system defines reusable components for the entire application.

### Navigation

- Sidebar
- Header
- Breadcrumb
- Tabs

### Inputs

- Text Input
- Search
- Select
- Combobox
- Multi-select
- Date Picker
- Time Picker
- Checkbox
- Radio
- Toggle
- Slider

### Buttons

- Primary
- Secondary
- Ghost
- Destructive
- AI

### Feedback

- Toast
- Alert
- Banner
- Skeleton
- Empty State
- Error State
- Loading Overlay

### Data Display

- KPI Card
- Statistic Card
- Candidate Card
- Email Card
- Activity Card
- Timeline
- Badge
- Avatar
- Tooltip
- Table
- Pagination
- Chart
- Progress Indicator

### Overlays

- Dialog
- Drawer
- Popover
- Dropdown
- Context Menu
- Command Palette

---

# 35. Design Rules

The following principles are mandatory across the application:

- Maintain consistent spacing using the 8-point grid.
- Use typography, not color, to establish hierarchy.
- Reserve purple exclusively for AI-related features.
- Use restrained colors and avoid visual clutter.
- Prefer skeleton loaders over spinners.
- Ensure every page provides clear empty, loading, error, and success states.
- Keep animations subtle and purposeful.
- Build every page from reusable components rather than custom layouts.
- Preserve consistent interaction patterns for all actions, dialogs, and navigation.
- Design for productivity first, aesthetics second.

---

# 36. Definition of Done

A screen is considered complete only when it:

- Conforms to the design system.
- Uses reusable components exclusively.
- Is fully responsive.
- Meets accessibility requirements.
- Includes loading, empty, error, and success states.
- Uses the defined spacing, typography, colors, and motion system.
- Feels consistent with every other screen in Recrion.

Only after a screen satisfies these criteria should it be considered production-ready.