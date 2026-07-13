---
title: Project Overview
type: reference
date: 2026-07-13
tags: [overview, project]
---

# Project Overview

**Name:** Certify
**Type:** Fullstack Monorepo (React SPA Frontend + Express REST API Backend)
**Purpose:** Certificate Generator Web App. Supports single certificate creation, batch imports from CSV/Excel, webhooks, analytics, and third-party integrations (Google Sheets + Canvas).

## Quick facts

- **Stack:** React 18 + TS 5 + Vite 6 + Tailwind CSS v4 + DaisyUI (Frontend); Node.js + Express + Mongoose + Puppeteer (Backend).
- **API:** Centralized under `frontend/src/utils/api.ts` with Auth0 bearer tokens. Supports localhost mock/demo mode out-of-the-box.
- **Testing:** Vitest (Frontend); backend-native integration checks (Backend).
- **Quality:** ESLint flat configs + Prettier formatting.
- **Hooks:** pre-commit runs `npx lint-staged` for code quality checks.

## Top-level commands

```bash
npm run dev          # orchestrates frontend + backend dev servers (port 5174 frontend, 3000 backend)
npm run dev:frontend # starts only the frontend dev server
npm run dev:backend  # starts only the backend dev server
npm run build        # builds both backend and frontend output
npm run lint         # runs eslint on both frontend and backend
npm run test         # runs tests on both backend and frontend
npm run readiness    # runs deployment readiness checks on environment variables and configs
npm run readiness:strict # strict deployment readiness checks
```

## Entry points

- **Frontend:** `frontend/index.html` → `frontend/src/main.tsx` → `frontend/src/App.tsx`
- **Backend:** `backend/src/app.ts` → connects MongoDB and starts HTTP listener.
- **PDF Templates:** `backend/templates/` → base, modern, and classic certificate HTML/CSS layouts.

## Documentation

- [00-overview.md](00-overview.md) — project overview
- [01-stack.md](01-stack.md) — tech stack details
- [02-workflow.md](02-workflow.md) — development workflow
- [03-folder-map.md](03-folder-map.md) — directory mapping
- `docs/sessions/YYYY-MM-DD-session-summary.md` — local daily work logging (gitignored)
