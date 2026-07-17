---
title: Premium Redesign of the Verification Portal
type: note
date: 2026-07-17
tags: [design, verify, frontend, style]
---

# International Standard Redesign of the Verification Portal

Redesigned the Qubit Certify Public Document Verification landing page ([VerifyPortal.tsx](file:///c:/Users/keych/Development/Projects/Personal/certify/frontend/src/pages/Verify/VerifyPortal.tsx)) and search widget to deliver a high-contrast, clean, light-themed digital credential gateway of international standard.

## Gating & Rendering Isolate
- To prevent gitignored local `.env.local` files from overriding the active state in development environments, `IS_PHASE2` is forced to `false` at the code level in the `phase1` branch. This guarantees that checking out this branch always renders the document verification gateway correctly.

## Design Improvements

### 1. Light Backdrops & Ambient Accents
- Replaced the dark neon theme with an authoritative clean background (`bg-[#f8fafc]`) layered with soft ambient indigo/blue blurs (`indigo-50` and `blue-50`) in the corners to create depth without sacrificing clarity.
- Complies fully with the project's light-mode-only (corporate theme) constraints.

### 2. High-Contrast Search Widget
- The search widget input container uses `bg-white` and a crisp, light border `border-slate-200` to sit cleanly inside the layout.
- The disabled state uses a highly visible but understated `bg-slate-50 text-slate-400 border-l border-slate-250/50` style, avoiding any contrast accessibility issues.
- The active button stands out with solid `bg-primary` (royal indigo).

### 3. Layout Spacing & Landscape Certificate Mock
- Stats & Features: Presented in structured white cards with fine grey borders (`border-slate-200`) and soft shadows, aligning with official web registries.
- **Landscape Certificate Mock Card:** Replaced the tall portrait layout (`aspect-[3/4]`) with a standard landscape layout (`aspect-[1.414/1]`). Added an elegant double-border frame, mock credential text for recipient "WUNNA AUNG", mock signatures on the bottom left, and unique verification ID badge positioning on the bottom right.

### 4. Header Status Badge
- Scoped status indicator inside [Header.tsx](file:///c:/Users/keych/Development/Projects/Personal/certify/frontend/src/components/layout/Header/Header.tsx): Displays a glowing green "System Active" pulse badge to balance empty navbar space and provide direct user feedback.


