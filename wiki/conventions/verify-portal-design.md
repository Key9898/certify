---
title: Verify Portal design (Phase 1)
type: convention
date: 2026-07-20
tags: [verify, design, theme, ux]
---

# Verify Portal design (Phase 1)

Standing visual and IA convention for the public document verification gateway (`/` when `IS_PHASE2 === false`, and `/verify`).

## Theme — Direction A

- Soft stone page ground (`#F7F8FA`)
- White surfaces with hairline `slate-200` borders
- `slate-900` / `slate-600` text
- Single accent: DaisyUI corporate **primary** blue
- Success / warning / error only for verification status meaning
- No indigo ambient orbs, purple headline gradients, or glowing “System Active” badges

## IA order

1. Hero with verify input as primary action
2. ID format + find-ID helper
3. What verification returns
4. How to locate the ID (annotated mock)
5. Status legend
6. Trust, privacy, support

## Copy rules

- Factual only — no blockchain, “global registry scan”, or fake metrics
- Certificate IDs are `nanoid(12).toUpperCase()` (12-character alphanumeric)
