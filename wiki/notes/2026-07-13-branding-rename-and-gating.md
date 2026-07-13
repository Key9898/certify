---
title: Qubit Certify Branding and Gating
type: note
date: 2026-07-13
tags: [branding, gating, verify-portal, handoff]
---

# Qubit Certify Branding and Gating

To prepare the repository for CTO handoff and lock standard app workflows before Phase 2 UI/UX modifications:

- Renamed the branding from "Certify" to "Qubit Certify" throughout the landing interfaces.
- Added environment variable gating to hide all authenticated panels and editor interfaces behind a feature flag.
- Created a beautiful document verification portal to act as the default landing view.

## Changes Done

1. **Branding Rename:**
   - Modified `frontend/index.html` head title to `Qubit Certify — Document Authenticator`.
   - Updated `Header.tsx`, `Footer.tsx`, and `Sidebar.tsx` to reference `Qubit Certify` brand displays and copyrights.
   - Updated sign-in prompts and descriptions in `AuthPromptModal.tsx` to use the new name.
   - Updated descriptive strings inside `VerifyPortal.tsx` to align with the new brand name.
2. **Feature Gating configuration:**
   - Appended `VITE_ENABLE_PHASE2=false` inside `frontend/.env.local`.
   - Built `frontend/src/config/features.ts` to export `IS_PHASE2` based on the env configuration.
   - Customized `App.tsx` routing: when `IS_PHASE2` is `false`, the home path `/` directly mounts the `VerifyPortal` and all protected links redirect standard users back to `/`.
   - Conditioned `Header` and `Footer` to only display marketing links, sign-in controls, and navigation buttons when `IS_PHASE2` is `true`.
