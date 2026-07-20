---
title: Verify Portal soft stone + corporate blue redesign
type: note
date: 2026-07-20
tags: [design, verify, frontend, theme, ux]
---

# Verify Portal soft stone + corporate blue redesign

Phase 1 public Document Verification landing page redesigned to direction **A**: Soft stone + corporate blue — calm institutional trust, not AI marketing SaaS.

## Design direction

| Token | Value |
| ----- | ----- |
| Ground | `#F7F8FA` |
| Surface | White + `border-slate-200` |
| Text | `slate-900` / `slate-600` |
| Accent | Corporate primary blue only |
| Status colors | success / warning / error — status legend only |
| Avoided | Indigo blurs, purple gradients, fake stats, blockchain copy, System Active glow |

## Information architecture

1. Hero — purpose + verify tool (primary job)
2. ID format helper + “Where is my ID?”
3. What you will see (public result fields)
4. How to find ID + annotated certificate mock
5. Status meanings (Valid / Revoked / Not found)
6. Trust & privacy + support

## Key files

- `frontend/src/pages/Verify/VerifyPortal.tsx`
- `frontend/src/components/common/VerifySearchWidget/VerifySearchWidget.tsx`
- `frontend/src/components/layout/Header/Header.tsx` (phase1 chrome label)

## Related

- Supersedes visual direction in `wiki/notes/2026-07-17-verify-portal-redesign.md`
- Convention: `wiki/conventions/verify-portal-design.md`
