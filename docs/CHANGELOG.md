# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Comprehensive **Premium UI/UX Overhaul** across all core modules (Home, Dashboard, Templates, Certificates, Builder, Wizard, Batch).
- **High-Fidelity Interaction System**: Glassmorphism, animated glow points, and a standardized Framer Motion stagger system for premium feedback.
- **Unified Brand Design Tokens**: Extended `global.css` with `.glass-card`, `.glow-point`, `.brand-tag`, and `.meta-label` utility classes.
- **Advanced Layout Animations**: Integrated `LayoutGroup` for fluid transitions in the Template selection and navigation systems.
- Repository-side production readiness tooling with `npm run readiness`, a deployment preflight script, backend runtime env warnings, and GitHub CI workflow coverage
- Native Google Sheets API write-back and Canvas API callback support for Integration Hub workflows
- Backend connector test runner plus frontend Integration Hub coverage for native provider flows
- Workspace organizations with team invitations, role management, and workspace-scoped access to templates, certificates, batches, and analytics
- White-label workspace branding with brand name, logo, colors, support email, custom domain, and hide-powered-by controls
- Third-party Integration Hub with provider catalog, workspace-managed webhook endpoints, setup testing, and inbound single/batch execution flows
- Provider-specific setup guides, launch-kit recipes, and workspace template recommendations inside the Integration Hub
- Repository-root `package.json` and `scripts/dev.mjs` so `npm run dev` can orchestrate frontend and backend together
- `docs/SESSION_SUMMARY.md` as the authoritative project snapshot
- Public REST API with API keys, Swagger docs, webhooks, analytics, public verification, PNG export, and batch ZIP download
- Vitest unit test setup with 25 passing tests for CSV parsing, validators, and formatters
- Demo mode for exploring the UI without Auth0 credentials
- Storybook coverage for the remaining shared UI and certificate components

### Changed

- Root workspace scripts now use cross-platform `npm --prefix ...` commands, and Vercel can build the frontend correctly even when the monorepo root is imported
- Git ignore coverage now blocks local env variants, downloaded credential/key files, temp folders, PID files, and patch conflict leftovers before repository publishing
- Git ignore rules now keep project-shared docs, scripts, deployment config, and AI instruction files trackable while only local tool settings and skill links stay ignored
- Home, Settings, and Integration Hub now have a deeper polish layer with launch-summary cards, workspace snapshot metrics, and clearer first-glance onboarding context
- A second live visual QA pass refined the templates library, certificates repository, and batch wizard with smoother Framer Motion-driven controls, stronger status surfaces, and clearer mobile handling
- App-wide motion polish now uses Framer Motion route transitions, animated shell surfaces, and upgraded header/footer/loading states
- Framer Motion now drives the landing page, certificate creation flow, Integration Hub, batch progress states, template selection, upload surfaces, shared buttons, and other high-traffic interactions instead of scattered CSS-only transitions
- Integration setup forms now capture native Google Sheets and Canvas settings, while sample payloads include row and learner identifiers for direct provider callbacks
- Google Sheets onboarding now ships an Apps Script starter that sends spreadsheet context and row numbers so the backend can write statuses back natively
- Backend env examples and Render deployment config now cover Atlas-style MongoDB URIs, Google service account credentials, Canvas API tokens, and the correct health check path
- Settings now persists user defaults and workspace white-label values through `/api/users/settings`
- Certificate creation now respects saved workspace branding for live preview, defaults, and public verification UI
- Dashboard charts now use live analytics data, and workspace members share analytics visibility
- Template, certificate, and batch access rules are now workspace-aware instead of single-user only
- Dashboard, landing page, footer, and shell navigation were refreshed to better surface automation workflows and workspace context
- Integration onboarding now includes provider-specific field mapping, QA checks, recipe presets, and guided progress states
- Integration Hub now prioritizes Google Sheets and Canvas as first-class workflows, with Custom Webhook as the advanced fallback and the other providers demoted to secondary onboarding paths
- Root `npm run dev` now starts from the monorepo root instead of requiring separate frontend/backend terminals
- Vite configuration now dedupes React-related packages and uses the correct top-level Vitest coverage config
- Demo mode now derives data locally without Auth0 sync or live API calls

### Fixed

- Production readiness checks now report the real local blocker set instead of relying on docs-only assumptions
- Shared `Button` typing now supports motion props cleanly, and frontend tests now mock `IntersectionObserver` for Framer Motion viewport animations
- Render health checks now target the live `/health` endpoint instead of a non-existent `/api/health` path
- API key settings now render the masked `keyPreview` returned by the backend
- Webhook list responses no longer expose secrets after creation
- Batch wizard completion now waits for real processing results
- Protected raw downloads and uploads now consistently send Auth0 bearer tokens
- Dashboard no longer crashes in demo mode because chart errors are isolated and React StrictMode was removed for the incompatible dev-only path
- Inline CSS and hardcoded non-semantic color class regressions were removed from core marketing and preview surfaces

---

## [0.0.0] - 2026-03-27

### Added

- Project initialization
- `PROJECT_PLAN.md` with full project specification
