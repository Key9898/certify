# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed

- **Railway Backend Deployment**: Replaced the Render backend deployment target with Railway config-as-code, added a root-level `railway.json` that builds and starts the backend via `npm --prefix backend ...`, updated the readiness preflight to require Railway deployment configs, and bound the Express server to `0.0.0.0:$PORT` for Railway public networking.
- **Railway Healthcheck Startup**: Backend now starts the HTTP listener before external dependency initialization so Railway `/health` checks validate process liveness instead of failing when MongoDB or seed data setup is delayed.
- **Railway Database Recovery**: Backend now reports whether a production MongoDB URI is configured in `/health`, retries MongoDB connection in the background after degraded startup, and seeds default templates once the database becomes available.
- **Production CORS Origins**: Backend CORS now normalizes configured frontend origins, supports comma-separated `CORS_ORIGINS`, and includes the active Vercel production domain as a safe fallback for Railway deployments.
- **Auth0 Runtime Defaults**: Backend Auth0 validation now accepts backend `AUTH0_*` env vars, frontend-style `VITE_AUTH0_*` aliases, or the project public Auth0 domain/audience defaults so Railway deployments do not return `AUTH_NOT_CONFIGURED` when only public auth values are missing.
- **MongoDB Runtime Aliases**: Backend database config now accepts `MONGODB_URI`, `MONGO_URI`, `MONGODB_URL`, `MONGO_URL`, or Mongo-style `DATABASE_URL`, and `/health` reports the non-secret `databaseConfigSource` for Railway diagnostics.
- **Production Progress Docs**: Updated production status notes to reflect the live Railway `/health` response reporting Auth0 configured, MongoDB configured from `MONGODB_URI`, and database connectivity established.
- **Security Maintenance**: Updated frontend Vite to `^8.0.9` and refreshed backend transitive dependency locks so `npm audit --omit=dev` reports 0 production vulnerabilities for both frontend and backend.
- **Local CORS Fallback**: Backend CORS fallback now allows the supported local Vite range (`localhost`/`127.0.0.1` ports `5174-5180`) when `FRONTEND_URL` is not set.
- **Bundle Size Optimization**: Implemented lazy loading for heavy libraries to eliminate Vite 500kB chunk warnings. ExcelJS dynamically imported in csvParser.ts for XLSX parsing. Recharts components (OverviewChart, UsageChart) lazy loaded via React.Suspense in Dashboard.tsx. Results: BatchGenerate chunk reduced from 955.96 kB to 26.36 kB (97% reduction), Dashboard chunk reduced from 417.81 kB to 16.03 kB (96% reduction). New lazy chunks: exceljs.min (929.91 kB), Chart (362.12 kB).
- **UI Label Updates**: Changed "Program & Branding" to "Program" and "Program Logo" to "Organization Logo" in CertificateForm and TemplateBuilder for consistency with organization-level branding terminology.

### Fixed

- **Production API 401 Race**: Protected dashboard routes now wait until the Auth0 API access token is prepared before rendering data-fetching pages, Auth0 login requests include the API audience/scope up front, and frontend API calls no longer silently drop failed token acquisition into unauthenticated backend requests.
- **Auth0 Google Redirect Loop**: Replaced the post-login callback full-page reload with same-origin history replacement so Auth0's in-memory SPA session state survives the callback and authenticated users can land on Dashboard instead of re-entering the login loop.
- **Vercel Dynamic Chunk MIME Errors**: Restricted Vercel SPA rewrites to known app routes so missing `/assets/*.js` files no longer return `index.html`, and added a one-time Vite chunk-load recovery reload for stale browser caches after deployments.
- **Preset Template QR Coverage**: Added `verifyQR` placeholders to the modern, classic, and base preset certificate templates so all shipped PDF templates render both the QR code and public certificate ID.
- **Public Verify Route Rendering**: Fixed `/verify/:certificateId` so QR scans and manual certificate ID lookups open the certificate verification result page instead of the generic verification portal, and made public verify lookups bypass authenticated API token handling.
- **Background Template QR Placement**: Background template rendering now supports explicit `verifyQR` image fields while preserving the automatic fallback QR stamp when users do not place a QR field.
- **Deep QA Auth0 Token Handling**: Removed frontend Auth0 `localstorage` token caching and stopped sending the API audience during the initial login redirect; API audience tokens are requested only through `getAccessTokenSilently()` for backend calls.
- **Certificate QR Verify URLs**: PDF/PNG QR generation now falls back to the configured `FRONTEND_URL` instead of the placeholder `https://certify.app`, preventing exported certificates from embedding broken verification links.
- **API Error Resilience**: Frontend API helpers now handle empty or non-JSON server responses with a friendly `INVALID_RESPONSE` error instead of crashing on `response.json()`.
- **Auth0 Settings Runtime Config**: Account settings password/account flows now use the centralized Auth0 runtime config and support `VITE_AUTH0_CLIENT_ID` as a public client ID fallback instead of accidentally treating the API audience as a client ID.
- **Certificate Create Navigation**: Fixed Certificates page "Create New" actions so they open the Background Template Builder directly instead of stopping on the Templates gallery or the Quick Create form.
- **Production API 404s**: Frontend API base URL now normalizes production `VITE_API_URL` values that omit `/api`, preventing calls like `https://backend/templates` and routing them to `https://backend/api/templates` instead.
- **Railway Healthcheck Failure**: MongoDB connection errors no longer terminate the process before the Railway healthcheck can reach `/health`; default template seeding is skipped when the database is unavailable and logged as a degraded startup state.
- **Railway MongoDB Degraded Startup**: A one-time MongoDB startup failure no longer leaves the service permanently disconnected; configured Railway services continue retrying until Atlas becomes reachable.
- **Railway/Vercel CORS Preflight**: Fixed production browser requests failing before auth with missing `Access-Control-Allow-Origin` when Railway did not have an exact `FRONTEND_URL` match.
- **Railway Auth 503s**: Fixed authenticated production endpoints returning `AUTH_NOT_CONFIGURED` despite valid Auth0 tokens by centralizing Auth0 runtime config and exposing `authConfigured` in `/health`.
- **Railway Database Health Diagnostics**: `/health` can now distinguish a missing MongoDB runtime variable from a recognized MongoDB URI source without exposing the secret connection string.
- **Integration Webhook URLs**: Manage screen now copies and opens the backend-provided integration webhook URL instead of constructing a frontend-origin `/api/webhooks/*` URL that can 404 in production.
- **Deep Scan Hygiene**: Fixed Prettier drift in Dashboard and backend v1 routes, and removed the non-component export from `IntegrationTabs.tsx` that caused a React Fast Refresh lint warning.
- **Landing Page Dynamic Dates**: Fixed hardcoded dates in Home.tsx certificate preview carousel. Added `formatPreviewDate()` function to dynamically render dates using `new Date().toLocaleDateString()`. Previously showed static "Mar 28, 2026" - now displays current date in "Mon DD, YYYY" format.
- **About Page "Since Year"**: Fixed hardcoded "Since 2026" in About.tsx to use `new Date().getFullYear()` for dynamic year display.
- **Privacy/Terms Last Updated Dates**: Fixed hardcoded dates in PrivacyPolicy.tsx and TermsOfService.tsx to dynamically render current date.
- **Social Proof Text**: Changed "Join 500+ organizations" to "Join Early Adopters" in Home.tsx for accurate pre-launch messaging.
- **Template Count Display**: Fixed hardcoded template count to use actual count from templates API in Home.tsx.

### Fixed

- **Google Sheets Default Sheet Name**: Reverted default sheet name from "Ready to Issue" back to "Ready to Create" in `integrationService.ts`. Tests define expected behavior - code should match tests, not the other way around.
- **Usage Stats API 500 Error**: Fixed three bugs in `usageController.ts` causing Internal Server Error:
  1. Wrong user ID type - used `req.user` (MongoDB ObjectId) instead of `req.auth?.payload.sub` (Auth0 ID string) for `getWorkspaceMemberIds`
  2. Response format mismatch - wrapped response in `ApiResponse` format (`{ success: true, data: {...} }`) to match frontend expectations
  3. Error response format - standardized error responses with `{ success: false, error: { code, message } }`

### Added

- **Usage Stats Dashboard**: Real-time usage statistics in sidebar showing certificates created this month, batch jobs completed, and storage used with animated progress bars (Phase 1 simple stats - no billing/limits yet)
  - Backend: `GET /api/usage` endpoint with organization-scoped statistics
  - Frontend: `useUsageStats` hook with demo mode support
  - UI: `UsageStats` component with Framer Motion animated progress bars

### Changed

- **Settings Security Tab Labels**: Simplified 10 technical labels to user-friendly terminology - "Security Protocol" → "Security Settings", "Credential Standard" → "Login Method", "Session Protocol" → "Session", "Multi-Factor Authentication" → "Two-Factor Auth", "Password Management" → "Password", "Technical Support Email" → "Support Email", "Custom Verification URL" → "Custom Verify Link", "API Credential Management" → "API Keys", "Webhook Configuration" → "Webhooks", "Account Deletion Protocol" → "Account Deletion"
- **Settings Branding Tab**: Changed "Corporate Brand Mark" to "Organization Logo" for clearer terminology
- **Danger Zone UI**: Added spacing between "Danger Zone" and "Account Deletion" labels; removed italic styling from "Account Deletion" for cleaner appearance
- **VerifyPortal Stats**: Simplified "Security Protocol" to "Security" for cleaner UI

### Fixed

- **SecurityTab Linter Warnings**: Removed unused `Mail` import from lucide-react; renamed unused props (`pwResetStatus`, `pwResetLoading`, `handlePasswordReset`) with underscore prefix to satisfy TypeScript noUnusedLocals rule

### Fixed

- **500 Internal Server Error for Unauthenticated API Requests**: Fixed error handler in `backend/src/middleware/errorHandler.ts` to properly handle JWT middleware errors from `express-oauth2-jwt-bearer`. The library throws errors with `status` property (e.g., 401) instead of `statusCode`, causing the error handler to default to 500. Added `status` property check and `getErrorCode`/`getErrorMessage` functions to map JWT errors to proper HTTP status codes and error codes.

- **TemplateGallery Duplicate UI**: Removed duplicate category filter tabs from `TemplateGallery.tsx` component. Filtering logic now lives exclusively in parent `Templates.tsx` page, preventing double-filtering and duplicate UI elements.
- **Templates Category Tabs Animation**: Fixed jarring color transitions on category filter tabs. Improved spring physics (`stiffness: 400, damping: 30`), added smooth text color transitions, and implemented prominent primary-color hover states for better UX.
- **UI Naming Consistency**: Systematically replaced all legacy naming references across pages and components - "ledger" → "registry", "library" → "templates", "automation" → "integration", "Design Library" → "Template Gallery", "Automation Center" → "Integration Center", "Automations" → "Sync Runs".

### Changed

- **Sidebar Navigation Naming**: Renamed sidebar items for better user clarity - "Ledger" → "Certificates", "Library" → "Templates", "Instant Issue" → "Quick Create", "Batch Flow" → "Bulk Create", "Automation" → "Integrations", "Admin Tools" → "Settings"
- **Dashboard UI Labels**: Updated "Issuance Ledger" → "Recent Certificates", "Ledger is empty" → "No certificates yet" for user-friendly terminology
- **Certificates Page**: Changed "Immutable Ledger" badge to "Certificate Records" for clearer context
- **Batch Progress Table**: Simplified "Ledger Action" column header to "Action" for cleaner UI
- **Mass Refactoring**: Systematically refactored all non-compliant "bubble-mode" rounding tokens (rounded-lg, rounded-xl, rounded-2xl, rounded-full) to standard `rounded` utility while preserving decorative blurs and status indicators.
- **Corporate UI Polish**: Standardized buttons, cards, avatars, and navigation elements in Header, Sidebar, and Dashboard for a premium, professional SaaS aesthetic.

- **Certificate Revocation**: `status: 'active' | 'revoked'` field on Certificate model; `PATCH /api/certificates/:id/revoke` authenticated endpoint.
- **Public Verify Rate Limiter**: `verifyLimiter` (20 req/min per IP) applied to `GET /api/verify/:certificateId`.
- **Revoked Certificate UI**: Verify page shows dedicated "Certificate Revoked" state (HTTP 410) with `ShieldAlert` icon.
- **Settings Modularization**: Refactored monolithic Settings into a tab-based system (Account, Team, Branding, Developer, Security).
- **Security Hub**: Integrated Password Change UI with Auth0 connection detection and reset workflows.
- **Dashboard UI/UX Overhaul**: Complete professional transformation of the main dashboard with premium SaaS layout.

- **Layout Optimization**: Normalized spacing and grid patterns across all modules for a consistent user experience.
- **Home Workflow Optimization**: Revamped the "How Certify Powers You" section with balanced card dimensions (p-8) and optimized grid spacing (gap-8) to eliminate awkward text wrapping and improve visual rhythm.
- **Cross-Page Hash Navigation**: Updated "Features" link to `/#features` across all headers and footers to ensure instant jump to Home page features section.
- **Accessibility Refinement**: Standardized CTA and Hero backgrounds to `slate-950` and `slate-900` to fix text contrast and visibility issues.
- **Home Instant Scroll**: Immersive `useLayoutEffect` implementation for zero-delay navigation to the features section from any page.
- **Unified Portal Layout**: Integrated persistent Header and Footer across all support and legal portals.
- **Refinement**: Removed redundant grid pattern from VerifyPortal for a cleaner, more consistent look.
- **Scroll-to-Top**: Framer-motion animated floating button for improved long-page navigation.

### Changed

- **Standardized Footer**: Complete reorganization into Product, Legal, and Support categories; updated developer credit to "Developed by Wunna Aung" and removed separate "Built with ❤️" line.
- **Unified Branding Navigation**: Added "Verification" portal link to the main header and restructured footer hierarchy.
- **Responsive Motion System**: Enhanced the Home page with staggered reveal animations and glassmorphic UI elements for verification.
- **Branding Assets Overhaul**: Reorganized the `public/` directory into a structured `Logo/` and `favicon/` architecture; replaced the generic Lucide `Award` branding icon with a dedicated `logo.svg` across Sidebar, Header, Footer, Home, and Verify modules for improved brand consistency and visual fidelity.
- **Delete Account**: Danger Zone section in Settings with a `DELETE` confirmation gate; backend `DELETE /api/users/account` removes the user from MongoDB and attempts Auth0 Management API deletion if `AUTH0_MGMT_CLIENT_ID`/`AUTH0_MGMT_CLIENT_SECRET` env vars are set
- Canva-compatible background template builder that lets users import custom certificate artwork, place dynamic fields, and reuse the layout for CSV/XLSX batch PDF generation
- Home-page authentication prompt with Sign in, Sign up, and Sign in with Google actions that launch Auth0-hosted Universal Login pages from a Certify modal
- **Security Hardening**: SSRF protection utility with DNS resolution checks for webhook URLs
- **Security Hardening**: Secure logger with sensitive data redaction (passwords, tokens, API keys, secrets)
- **Security Hardening**: File upload validation with magic byte signature checking and filename sanitization
- **Security Hardening**: API key expiration support with MongoDB TTL index auto-cleanup
- **Security Hardening**: Per-API-key rate limiting with configurable limits (1-1000 requests/minute)
- Comprehensive **Premium UI/UX Overhaul** across all core modules (Home, Dashboard, Templates, Certificates, Builder, Wizard, Batch).
- **High-Fidelity Interaction System**: Glassmorphism, animated glow points, and a standardized Framer Motion stagger system for premium feedback.
- **Unified Brand Design Tokens**: Extended `global.css` with `.glass-card`, `.glow-point`, `.brand-tag`, and `.meta-label` utility classes.
- **Advanced Layout Animations**: Integrated `LayoutGroup` for fluid transitions in the Template selection and navigation systems.
- Workspace organizations with team invitations, role management, and workspace-scoped access to templates, certificates, batches, and analytics
- White-label workspace branding with brand name, logo, colors, support email, custom domain, and hide-powered-by controls
- Third-party Integration Hub with provider catalog, workspace-managed webhook endpoints, setup testing, and inbound single/batch execution flows
- Provider-specific setup guides, launch-kit recipes, and workspace template recommendations inside the Integration Hub
- Repository-root `package.json` and `scripts/dev.mjs` so `npm run dev` can orchestrate frontend and backend together
- `docs/SESSION_SUMMARY.md` as the authoritative project snapshot
- Public REST API with API keys, Swagger docs, webhooks, analytics, public verification, PNG export, and batch ZIP download
- Vitest unit test setup with 25 passing tests for CSV parsing, validators, and formatters
- Demo mode for exploring the UI without Auth0 credentials
- **Integrations Optimization**: Standardized the Hub with a clean grid system and vertical field grouping; removed secondary providers (Zapier, Make, Moodle) to focus on native first-class integrations.
- **Responsive Alignment**: Improved padding, margins, and grid breakpoints across Admin settings and Integration Hub for better visual rhythm on desktop and mobile.
- Storybook coverage for the remaining shared UI and certificate components

### Changed

- **Branding Assets Overhaul**: Reorganized the `public/` directory into a structured `Logo/` and `favicon/` architecture; replaced the generic Lucide `Award` branding icon with a dedicated `logo.svg` across Sidebar, Header, Footer, Home, and Verify modules for improved brand consistency and visual fidelity
- Auth0 entry actions now use hosted redirect-based login pages instead of popup-first flows, local development defaults to `http://localhost:5174` with canonical localhost handling for callback stability, and API audience tokens are requested on demand after login instead of during the initial marketing-site auth redirect
- Home-page Sign In, Sign Up, Google, and Explore Templates entrypoints now force a fresh Universal Login step for signed-out visitors so Auth0 SSO session reuse does not skip the visible credential form on localhost or production
- Frontend API calls now use the local Vite proxy during development instead of the production `VITE_API_URL`, and the backend CORS fallback now matches the supported localhost port range
- Authenticated account chrome now normalizes Auth0 profile data from `name`, `nickname`, `given_name`, or email-local fallback so sign-up flows without a full-name field still show the real signed-in identity consistently
- Template authoring now supports both preset themes and imported background templates with drag-and-drop field placement for recipient data, dates, IDs, logos, and signatures
- Home header now surfaces working Sign In, Start Free, and Dashboard actions more clearly, while the dashboard shell keeps the desktop sidebar fixed during page scrolling
- **Security Hardening**: Replaced vulnerable `xlsx` package with `exceljs` to mitigate prototype pollution vulnerability
- **Security Hardening**: Added rate limiting to batch, team, and webhook endpoints
- **Security Hardening**: Integrated secure logging across error handler, webhook service, and batch controller
- **Security Hardening**: Enhanced file upload middleware with signature validation and dangerous extension blocking
- Root workspace scripts now use cross-platform `npm --prefix ...` commands, and Vercel can build the frontend correctly even when the monorepo root is imported
- Batch import now supports both CSV and XLSX uploads end-to-end
- Git ignore coverage now blocks local env variants, downloaded credential/key files, temp folders, PID files, and patch conflict leftovers before repository publishing
- Git ignore rules now keep project-shared docs, scripts, deployment config, and AI instruction files trackable while only local tool settings and skill links stay ignored
- Home, Settings, and Integration Hub now have a deeper polish layer with launch-summary cards, workspace snapshot metrics, and clearer first-glance onboarding context
- A second live visual QA pass refined the templates library, certificates repository, and batch wizard with smoother Framer Motion-driven controls, stronger status surfaces, and clearer mobile handling
- App-wide motion polish now uses Framer Motion route transitions, animated shell surfaces, and upgraded header/footer/loading states
- Framer Motion now drives the landing page, certificate creation flow, Integration Hub, batch progress states, template selection, upload surfaces, shared buttons, and other high-traffic interactions instead of scattered CSS-only transitions
- Integration setup forms now capture native Google Sheets and Canvas settings, while sample payloads include row and learner identifiers for direct provider callbacks
- Google Sheets onboarding now ships an Apps Script starter that sends spreadsheet context and row numbers so the backend can write statuses back natively
- Backend env examples and Railway deployment config now cover Atlas-style MongoDB URIs, Google service account credentials, Canvas API tokens, and the correct health check path
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

- **Sidebar Accessibility**: Added `title="Close menu"` attribute to mobile close button for screen reader compatibility — resolves "Buttons must have discernible text" lint error
- **MongoDB Duplicate Key Error Handling**: Added retry logic with exponential backoff in `workspaceService.ts` to handle race conditions during organization creation — resolves `E11000 duplicate key error` when multiple requests attempt to create the same workspace simultaneously
- **CI backend build failure**: Removed deprecated `zapier`, `make`, and `moodle` provider entries from `INTEGRATION_CATALOG` in `integrationService.ts` — these providers were already removed from the `IntegrationProvider` type union, causing TS2322 type mismatch errors on every push
- **CI frontend test failure**: Rewrote `Integrations.test.tsx` to assert against current UI text (`Integrations Hub`, `Google Sheets, Canvas LMS, and Webhooks`) instead of stale strings that no longer exist in the page after the Hub layout optimization
- **Decorative blur blobs**: Restored `rounded-full` on background decorative blurs in `Dashboard.tsx`, `Home.tsx`, and `main.tsx` that were incorrectly flattened to `rounded` during the mass design-system refactor
- **Auth error URL cleanup**: Clear `?error=` and `?error_description=` URL params after displaying the auth error modal so hard reload no longer re-triggers the modal with stale error state
- **FAQ.tsx `Award` icon missing import**: Fixed `ReferenceError: Award is not defined` console error — added `Award` to the `lucide-react` import list and removed the unused `ChevronDown` import
- **Backend JWT validation 500 errors**: `express-oauth2-jwt-bearer` v1.7.4 throws `Error: An 'audience' is required to validate the 'aud' claim` at runtime even though TypeScript types mark `audience` as optional — restored `audience: process.env.AUTH0_AUDIENCE` in `backend/src/middleware/auth.ts` so authenticated API routes return 200 instead of 500
- **Auth0 audience strategy — login vs token**: Removed `audience` from ALL `loginWithRedirect` calls and from `Auth0Provider.authorizationParams` to prevent the "Client not authorized to access resource server" error on the `/authorize` endpoint; audience is now passed **only** inside `getAccessTokenSilently({ authorizationParams: { audience } })` in `AuthContext.tsx` and `useAuth.ts`, which routes through the `/oauth/token` refresh-token exchange path (governed by the existing Client Grant) so the backend receives correctly-scoped JWT access tokens without re-triggering the authorization flow
- Localhost dashboard sidebar links now stay inside the real authenticated dashboard shell instead of bouncing through temporary preview routing
- Explore Templates now behaves like an auth entrypoint for signed-out visitors instead of pushing directly into a protected route that can dead-end on localhost or production
- Auth entry actions now surface the hosted Auth0 sign-in/sign-up pages more reliably during local development by avoiding popup-first behavior
- Landing-page auth CTAs no longer dead-end on the Auth0 consent screen before any visible form because the initial login redirect no longer requests the API audience
- Authenticated dashboard routes now require real Auth0 login again, so local sessions reflect the actual signed-in user instead of a dev-only preview shell
- Email/password Auth0 sign-ups no longer fail app-user creation when the hosted form returns no full name, because the backend now derives a usable display name and the frontend falls back to the real Auth0 profile while sync completes
- Home-page Explore Templates CTA now opens the auth choice modal for signed-out visitors and sends authenticated users to `/dashboard`
- Home certificate preview carousel no longer uses `AnimatePresence mode="wait"` with multiple children, removing the related console warning
- Home CTA buttons now route correctly for authenticated users, and the header/logo/footer navigation flow has been aligned with the latest landing-page UX
- Auth0 sign-in, sign-up, and Google flows now attempt the correct hosted Auth0 popup forms first, preserve the intended `/dashboard` return path, surface localhost origin misconfiguration hints, and redirect protected pages without firing auth side effects during render
- Production readiness checks now report the real local blocker set instead of relying on docs-only assumptions
- Shared `Button` typing now supports motion props cleanly, and frontend tests now mock `IntersectionObserver` for Framer Motion viewport animations
- Deployment health checks now target the live `/health` endpoint instead of a non-existent `/api/health` path
- API key settings now render the masked `keyPreview` returned by the backend
- Webhook list responses no longer expose secrets after creation
- Batch wizard completion now waits for real processing results
- Protected raw downloads and uploads now consistently send Auth0 bearer tokens
- Dashboard no longer crashes in demo mode because chart errors are isolated and React StrictMode was removed for the incompatible dev-only path
- **`consent_required` silent auth failure (white screen / app crash):** Added refresh token rotation support to `Auth0Provider` while keeping token caching out of `localStorage`; API audience tokens are requested only when backend calls need them
- App no longer shows white screen on unhandled render errors — top-level `ErrorBoundary` in `main.tsx` now catches all crashes and shows "Something went wrong" + Reload button
- **Settings Implementation Gaps**: Restored missing React hooks imports and Lucide icons following the modular refactor; fixed prop assignment errors on the FileUpload component.
- **Lint & Clean-up**: Eliminated all unused imports (SOFT_SPRING, Palette, Globe, etc.) and implicit 'any' types introduced during the architectural split.

### Removed

- `render.yaml` after switching the production backend deployment target from Render to Railway.
- `frontend/.env.example` and `backend/.env.example` placeholder env files after production environments were provisioned and the team switched to real local/hosted secrets

---

## [0.0.0] - 2026-03-27

### Added

- Project initialization
- `PROJECT_PLAN.md` with full project specification
