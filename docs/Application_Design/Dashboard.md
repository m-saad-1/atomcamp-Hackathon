# Recrion Dashboard UI/UX Specification v1.0

> Purpose:
>
> This document defines the visual design, layout, UI components, styling, interactions, spacing, hierarchy, and animations of the Dashboard.
>
> Backend logic, API integration, and business rules are intentionally excluded.

---

# Dashboard Philosophy

The dashboard should answer one question within five seconds:

> "What requires my attention right now?"

Unlike traditional ATS dashboards that display static statistics, Recrion presents the recruiting operation as a live system.

The dashboard should feel:

- Calm
- Premium
- Intelligent
- Fast
- Operational
- Human-centered

Never overwhelming.

Never empty.

Never decorative.

---

# Overall Layout

Desktop

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Header                                                          │
│         ├──────────────────────────────────────────────────────────────────┤
│         │                                                                  │
│         │ Welcome Banner                                                   │
│         │                                                                  │
│         ├────────────── KPI Grid ──────────────────────────────────────────┤
│         │ KPI │ KPI │ KPI │ KPI                                            │
│         ├────────────────────────────┬─────────────────────────────────────┤
│         │                            │                                     │
│         │ Hiring Pipeline            │ AI Activity                         │
│         │                            │                                     │
│         ├────────────────────────────┼─────────────────────────────────────┤
│         │ Recruiting Health          │ Pending Approvals                   │
│         ├────────────────────────────┴─────────────────────────────────────┤
│         │ Recent Candidates                                        │Interviews│
│         ├──────────────────────────────────────────────────────────────────┤
│         │ AI Recommendations                                            │
│         ├──────────────────────────────────────────────────────────────────┤
│         │ Team Activity                               │ System Status       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# Page Background

Color

```
#F7F8FA
```

Never pure white.

---

# Content Width

Maximum

```
1600px
```

Centered.

Padding

```
32px
```

---

# Sidebar

Width

```
264px
```

White background

Sticky

Full height

Border right

```
1px #E6EAF0
```

---

## Sidebar Structure

```
Logo

Workspace

Search

Navigation

Divider

AI Shortcuts

Divider

Profile
```

---

## Logo

Top left

Large whitespace

Simple icon

Text

```
Recrion
```

Logo never animated.

---

## Workspace

Shows

Company logo

Company name

Chevron

Click opens workspace switcher.

---

## Navigation

Dashboard

Inbox

Candidates

Jobs

Copilot

Approvals

Execution

Analytics

Integrations

Settings

---

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

Radius

```
14px
```

No left indicator.

---

Hover

Background

```
#F4F5F8
```

---

# Header

Height

```
72px
```

Sticky

White

Bottom border

---

## Left

Breadcrumb

↓

Page Title

↓

Small description

---

## Center

Search

Width

```
360px
```

Placeholder

```
Search candidates, emails, jobs...
```

Leading search icon

Trailing keyboard shortcut

```
⌘K
```

---

## Right

Quick AI Button

Notifications

Help

Profile

---

# Welcome Banner

Height

```
120px
```

Rounded

24px

Background

Soft Indigo Gradient

Very subtle

Contains

Greeting

Current date

Motivational insight

Quick Actions

Dismiss button

---

# KPI Section

Four Cards

Equal width

Gap

```
24px
```

Height

```
150px
```

---

Each Card

Top

Icon

↓

Title

↓

Large Number

↓

Trend

↓

Mini Sparkline

---

Card Style

White

20px radius

24px padding

Minimal shadow

---

Hover

Lift

2px

Shadow increases

---

No gradients.

---

KPI Typography

Title

14px

Medium

---

Number

36px

Bold

---

Trend

13px

Green

Red

Gray

---

Sparkline

Single color

Very subtle

---

# Main Analytics Grid

Two-column layout

Ratio

```
2fr

1fr
```

---

# Hiring Pipeline

Largest card

Height

```
420px
```

Contains

Header

Filters

Pipeline Visualization

Legend

Footer

---

Chart

Horizontal stages

Rounded bars

Soft colors

Counts

Percentages

---

Footer

View Details

Export

---

# AI Activity

Height

420px

Shows

Timeline

Recent AI Decisions

Confidence

Execution Status

Every row

Avatar

↓

Action

↓

Timestamp

↓

Status Badge

↓

Open Button

---

Never resembles chat.

---

# Recruiting Health

Medium Card

Shows

Overall Health Score

Breakdown

Progress Bars

Insights

Recommendations

---

# Pending Approvals

Compact Card

Scrollable

Each item

Title

Candidate

Action

Priority

Approve Button

Reject Button

---

# Recent Candidates

Large Table Card

Columns

Avatar

Name

Role

Stage

Owner

AI Score

Updated

Action

---

Rows

56px

Hover

Light gray

---

Avatar

40px

---

AI Score

Colored badge

---

# Upcoming Interviews

Calendar style

Compact

Shows

Candidate

Interviewer

Time

Meeting Platform

---

# AI Recommendations

Large Card

Contains

Recommendation Cards

Each Recommendation

Icon

↓

Title

↓

Summary

↓

Evidence

↓

Action Button

---

Purple accent

Reserved for AI only.

---

# Team Activity

Activity Feed

Avatar

↓

Action

↓

Time

↓

Open

Very clean

---

# System Status

Shows

API

Email

AI

Storage

Sync

Each row

Indicator

Status

Latency

---

Green

Healthy

Yellow

Warning

Red

Issue

---

# Cards

All Cards

Background

White

Radius

20px

Padding

24px

Border

None

Shadow

Soft

Header spacing

16px

---

# Buttons

Primary

Filled

Indigo

---

Secondary

White

Border

---

Ghost

Transparent

---

AI

Purple

---

Icon Buttons

40x40

Circle

---

# Search Fields

Height

44px

Radius

14px

Leading icon

Gray placeholder

---

# Tables

Rounded Header

56px rows

Sticky header

Hover highlight

No vertical borders

---

# Charts

Minimal

Rounded

Soft fills

No gradients

No shadows

Animated on load only

---

# Badges

Types

Pending

Approved

AI

Verified

Running

Failed

All

Filled

Rounded

Small

---

# Empty States

Illustration

↓

Title

↓

Description

↓

CTA

Centered

Large whitespace

---

# Loading States

Skeleton only

Never spinner

Skeleton

Cards

Charts

Tables

Sidebar

---

# Error States

Simple illustration

↓

Headline

↓

Explanation

↓

Retry Button

---

# Toasts

Top Right

Rounded

Shadow

Auto dismiss

4 seconds

---

# Dialogs

Centered

Radius

24px

Max width

720px

Backdrop blur

Very subtle

---

# Dropdowns

Radius

16px

Padding

8px

Soft shadow

---

# Tooltips

Dark

Small

Rounded

8px padding

---

# Motion

Cards

Hover

TranslateY(-2px)

Duration

180ms

---

Buttons

Scale

1.02

Duration

120ms

---

Sidebar

Smooth active transition

---

Dialogs

Fade

+

Scale

0.98 → 1

240ms

---

Page Load

Crossfade

200ms

---

Charts

Animate once

Never repeat

---

# Dashboard Color Distribution

Background

75%

White Cards

20%

Brand Color

4%

AI Purple

1%

This prevents visual fatigue.

---

# Visual Hierarchy

Priority

1.

KPI Numbers

↓

2.

Hiring Pipeline

↓

3.

Pending Actions

↓

4.

AI Recommendations

↓

5.

Activity Feed

↓

6.

Supporting Metrics

Every dashboard glance should naturally follow this sequence.

---

# Component Inventory

Layout

- Sidebar
- Header
- Content Container
- Grid
- Card

Navigation

- Navigation Item
- Workspace Switcher
- Breadcrumb
- Search

Display

- KPI Card
- Activity Card
- Candidate Table
- Timeline
- Health Meter
- Status Card
- Recommendation Card
- Approval Card

Feedback

- Badge
- Toast
- Tooltip
- Empty State
- Skeleton
- Error State

Charts

- Funnel
- Area Chart
- Line Chart
- Bar Chart
- Progress Ring

Overlays

- Dialog
- Drawer
- Dropdown
- Context Menu

Buttons

- Primary
- Secondary
- Ghost
- Icon
- AI

---

# Dashboard Success Criteria

The Dashboard is considered visually complete when:

- It feels like a production enterprise application.
- Every component follows the Design System.
- Visual hierarchy is immediately understandable.
- Information density is balanced.
- Cards are reusable across the application.
- Motion is subtle and purposeful.
- The interface is responsive and accessible.
- AI elements are distinguishable without dominating the UI.
- No placeholder styling or inconsistent patterns remain.
- The Dashboard alone establishes the complete visual language for every future page in Recrion.