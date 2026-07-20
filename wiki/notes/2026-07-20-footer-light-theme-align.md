---
title: Footer light theme align with Verify Portal
type: note
date: 2026-07-20
tags: [footer, design, verify-portal, frontend, a11y, contrast]
---

# Footer light theme align with Verify Portal

Completed (and contrast-fixed) the `Footer.tsx` change on `phase1` so the public footer matches the Verify Portal light theme **and** remains readable.

## Changes

- Outer wrapper is a plain `<footer>` with `relative z-10 border-t border-slate-200 bg-white text-slate-900` so it sits above portal ambient blurs and establishes a dark text baseline.
- Stagger reveal motion lives on an inner `motion.div` (`STAGGER_CONTAINER` + `REVEAL_ITEM`).
- Minimal footer variant uses the same white/slate surface and copyright copy.

## Contrast fix (follow-up)

Screenshot QA showed brand name, description, and nav links nearly invisible on white.

**Cause:** DaisyUI `text-base-content` / `text-base-content/50|60` did not provide enough contrast on the forced white footer surface (appeared washed-out / near-white). Section headings using `text-primary` and bottom bar using `text-slate-*` stayed readable.

**Fix:** Replace `base-content*` text utilities with explicit slate tokens on the light footer:

| Element | Class |
| ------- | ----- |
| Brand | `text-slate-900` |
| Description | `text-slate-600` |
| Links | `text-slate-600` + `hover:text-primary` (shared `FOOTER_LINK_CLASS`) |
| Copyright | `text-slate-500` |
| Tagline | `text-slate-400` |

## Key file

- `frontend/src/components/layout/Footer/Footer.tsx`
