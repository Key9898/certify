---
title: Git Workflow & Documentation
type: convention
date: 2026-07-13
tags: [git, husky, workflow, checks]
---

# Git Workflow & Quality Checks

## Branches

- `main` — production / stable
- Feature branches: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`

## Hooks (husky)

### pre-commit

Runs `npx lint-staged` on staged files only:

- `*.{ts,tsx}`: runs ESLint fix and Prettier formatting.
- `*.{js,json,css,md}`: runs Prettier formatting.

### pre-push / manual check

Validates whole repository health:

1. `npm run readiness:strict` — checks config and env variables for local placeholders.
2. `npm run lint` — runs ESLint on all frontend and backend source files.
3. `npm run test` — runs all frontend vitest cases and backend native assertions.
4. `npm run build` — runs build compilations.

If any check fails, block the push and fix all errors.

## Documentation dual-track

| Location             | Purpose                                                                | Git        |
| -------------------- | ---------------------------------------------------------------------- | ---------- |
| **`wiki/`**          | Long-term knowledge base — overview, conventions, decisions, snippets. | Tracked    |
| **`docs/sessions/`** | Local daily session logs showing detailed implementations.             | Gitignored |

### Session Logging

- **Path:** `docs/sessions/YYYY-MM-DD-session-summary.md`
- **Git status:** Gitignored (`docs/sessions/` added to root `.gitignore`).
- **Always-on rule:** After any implementation changes, agents must update **both** `wiki/notes/` and `docs/sessions/` using the standard templates.

### Session Template

```yaml
---
title: Session summary YYYY-MM-DD
date: YYYY-MM-DD
phases: [<n>, ...]
wiki_mirror: wiki/notes/YYYY-MM-DD-<slug>.md
---
```
