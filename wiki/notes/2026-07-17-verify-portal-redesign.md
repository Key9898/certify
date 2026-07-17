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

### 3. Glassmorphism Search Container
- Refactored the search input widget wrapper to use a modern, semi-transparent frosted card:
  - `bg-base-200/25 border border-base-200/40 backdrop-blur-xl shadow-2xl`
- Updated the search input (`VerifySearchWidget.tsx`) to replace hardcoded white backgrounds with `bg-base-100` so it responds dynamically to theme overrides.

### 4. Centered Layout Hierarchy
- Aligned typography and spacing. Used a clean centered layout for stats and guidelines.
- Features use responsive hover elevation effects (`hover:bg-base-200/30 hover:border-primary/30`) with custom colored accent badges.
- Polished the certificate ID locator step guide and interactive layout.
