---
title: Premium Redesign of the Verification Portal
type: note
date: 2026-07-17
tags: [design, verify, frontend, style]
---

# Premium Redesign of the Verification Portal

Redesigned the Qubit Certify Public Document Verification landing page ([VerifyPortal.tsx](file:///c:/Users/keych/Development/Projects/Personal/certify/frontend/src/pages/Verify/VerifyPortal.tsx)) and search widget to deliver a high-contrast, premium, dark enterprise aesthetic ("Indigo & Obsidian").

## Design Improvements

### 1. Immersive Background & Ambient Glow
- Implemented a smooth background gradient (`from-[#040612] to-[#040612]`) layered with subtle organic blurs (`bg-primary/5` and `bg-accent/5`) pulsing gently to create depth.

### 2. Scoped CSS Variable Gating
- Applied local inline overrides for DaisyUI's base colors inside the container:
  - `--color-base-100: oklch(12% 0.015 256)` (Obsidian black background)
  - `--color-base-200: oklch(20% 0.025 256)` (Sleek slate borders)
  - `--color-base-content: oklch(96% 0.005 256)` (Crisp white text)
  - `--color-primary: oklch(56% 0.18 250)` (Vibrant indigo primary)
- This local scoping overrides the header, footer, search widget, and stats cards inside this page, preserving the light-based corporate theme for the rest of the application.

### 3. High-Contrast Search widget
- Refactored the search input widget (`VerifySearchWidget.tsx`) to resolve contrast issues and squeezed padding:
  - Input container background uses `bg-base-100` and `border border-base-200/80` (1px thick soft borders).
  - Disabled verify button has high contrast: `bg-base-200 text-base-content/20 border-l border-base-200/40`.
  - Active verify button stands out with `bg-primary text-white hover:bg-primary/90`.

### 4. Layout Spacing & Landscape Certificate Mock
- Stats row wrapper: Changed to soft, thin borders `bg-slate-900/10 border border-slate-800/30`.
- Feature cards: Replaced custom variable opacity borders with browser-safe, soft slate borders `border-slate-800/60` and transparent backgrounds `bg-[#0b0f1d]/35` to avoid wireframe effects.
- **Landscape Certificate Mock Card:** Replaced the tall portrait layout (`aspect-[3/4]`) with a standard landscape layout (`aspect-[1.414/1]`). Added an elegant double border frame, mock seal, registrar/authority signature lines, and unique verification ID badge positioning on the bottom right.

### 5. Header Status Badge
- Scoped status indicator inside [Header.tsx](file:///c:/Users/keych/Development/Projects/Personal/certify/frontend/src/components/layout/Header/Header.tsx): When `IS_PHASE2` is false, it displays a glowing, pulse-dot green "System Active" trust badge, balancing the layout and filling empty navbar space.

