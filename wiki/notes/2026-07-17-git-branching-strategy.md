---
title: Git Branching Strategy for Phase 1 and Phase 2
type: note
date: 2026-07-17
tags: [git, branching, config, handoff]
---

# Git Branching Strategy for Phase 1 and Phase 2

To facilitate collaborative development with the CTO and enable independent polishing of both application states (the new Qubit Certify document verification portal and the core Phase 2 features):
- Split the repository into two dedicated branches: `phase1` and `phase2`.
- Adjusted feature flags in `frontend/src/config/features.ts` to set different default fallback states on each branch.

## Branch Configurations

### 1. `phase1` Branch
- **Purpose:** Document verification portal landing page (gated view).
- **Configuration (`features.ts`):** `export const IS_PHASE2 = import.meta.env.VITE_ENABLE_PHASE2 === 'true';`
- **Result:** Standard app routes (Dashboard, Editor) are hidden by default, rendering only the public document authenticator landing portal.

### 2. `phase2` Branch
- **Purpose:** Unlocked application view (full dashboard, single/batch editor, integrations).
- **Configuration (`features.ts`):** `export const IS_PHASE2 = import.meta.env.VITE_ENABLE_PHASE2 !== 'false';`
- **Result:** Standard app features, login CTAs, and templates galleries are fully enabled by default.
