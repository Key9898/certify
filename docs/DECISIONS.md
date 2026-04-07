# Certify - Architecture Decisions

This document records significant architecture decisions made during the development of Certify.

---

## ADR-001: Technology Stack Selection

**Date:** 2026-03-27

**Status:** Accepted

### Context

Need to select a technology stack for a certificate generator web application that:
- Supports PDF generation
- Handles image uploads
- Provides authentication
- Scales for batch processing
- Costs $0/month initially

### Decision

**Frontend:** React + TypeScript + Vite + Tailwind v4 + DaisyUI
**Backend:** Node.js + Express + TypeScript + MongoDB
**Auth:** Auth0
**Storage:** Cloudinary
**PDF:** Puppeteer
**Deployment:** Vercel (frontend) + Render (backend)

### Rationale

| Choice      | Reason                                          |
| ----------- | ----------------------------------------------- |
| React       | Component-based, large ecosystem, team familiar |
| TypeScript  | Type safety, better DX, fewer runtime errors    |
| Vite        | Fast dev server, modern build tool              |
| Tailwind v4 | Utility-first CSS, rapid UI development         |
| DaisyUI     | Pre-built components, Tailwind integration      |
| MongoDB     | Flexible schema, good for certificate data      |
| Auth0       | Free tier (7,000 users), social login support   |
| Cloudinary  | Free tier (25GB), image optimization            |
| Puppeteer   | Headless Chrome, accurate PDF rendering         |

### Consequences

- **Positive:** Fast development, free tier services, modern tooling
- **Negative:** Tailwind v4 + DaisyUI compatibility needs testing
- **Risk:** Free tier limitations may require paid plans at scale

---

## ADR-002: Component-Driven Development with Storybook

**Date:** 2026-03-27

**Status:** Accepted

### Context

Need a consistent way to develop, test, and document UI components.

### Decision

Use Storybook for component development with `.stories.tsx` files alongside components.

### Rationale

- Isolated component development
- Visual documentation
- Interactive testing
- Design system consistency
- Reusable across projects

### Consequences

- **Positive:** Better component isolation, documentation, testing
- **Negative:** Additional setup time, learning curve
- **Note:** Storybook in devDependencies, excluded from production build

---

## ADR-003: Code Quality Tools

**Date:** 2026-03-27

**Status:** Accepted

### Context

Need consistent code style and quality across the codebase.

### Decision

Use Prettier + ESLint + Husky + lint-staged with configuration matching myezgame project.

### Configuration

**Prettier:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**ESLint:**
- Flat config format (ESLint 9+)
- TypeScript support
- React Hooks rules
- React Refresh rules
- Prettier integration
- Storybook rules

### Rationale

- Consistent code style across team
- Catch errors early
- Pre-commit hooks prevent bad commits
- Matches existing project patterns

### Consequences

- **Positive:** Consistent code, fewer errors, automated formatting
- **Negative:** Initial setup, potential conflicts during migration

---

## ADR-004: Monorepo Structure

**Date:** 2026-03-27

**Status:** Accepted

### Context

Need to organize frontend and backend code.

### Decision

Use a simple monorepo structure with separate `frontend/` and `backend/` directories.

```
certify/
├── frontend/     # React + Vite
├── backend/      # Express + TypeScript
└── PROJECT_PLAN.md
```

### Rationale

- Simple to understand
- Easy deployment to different platforms
- Shared documentation
- Single repository for version control

### Consequences

- **Positive:** Simple structure, independent deployments
- **Negative:** No shared code between frontend/backend
- **Alternative Considered:** Nx, Turborepo (rejected - overkill for this project)

---

## ADR-005: PDF Generation Strategy

**Date:** 2026-03-27

**Status:** Accepted

### Context

Need to generate high-quality PDF certificates.

### Decision

Use Puppeteer with HTML templates for PDF generation.

### Rationale

- Accurate rendering (uses Chrome)
- CSS styling support
- Image embedding
- Custom fonts support
- Good for complex layouts

### Consequences

- **Positive:** High-quality PDFs, flexible styling
- **Negative:** Higher memory usage, slower than alternatives
- **Alternative Considered:** PDFKit, jsPDF (rejected - less accurate rendering)

---

## ADR-006: Authentication Strategy

**Date:** 2026-03-27

**Status:** Accepted

### Context

Need user authentication with social login support.

### Decision

Use Auth0 for authentication.

### Rationale

- Free tier (7,000 users)
- Social login (Google, GitHub, etc.)
- JWT tokens
- Secure by default
- No need to implement auth logic

### Consequences

- **Positive:** Secure, feature-rich, no auth code to maintain
- **Negative:** External dependency, vendor lock-in
- **Alternative Considered:** Custom JWT, Firebase Auth (rejected - more work)

---

## ADR-007: Remove React.StrictMode in Development

**Date:** 2026-03-29

**Status:** Accepted

### Context

After adding recharts 3.x (which uses react-redux@9 + use-sync-external-store internally), the demo mode showed a black screen with "Invalid hook call" and "Uncaught TypeError" in the console. Investigation confirmed:

1. recharts 3.x uses `react-redux@9`, which uses `useLayoutEffect` for Redux store subscriptions.
2. React 19's StrictMode double-invokes components and effects in development to surface side effects.
3. This double-invocation causes a lifecycle ordering conflict in recharts' `RechartsStoreProvider` on initial render, throwing an unhandled error.
4. React's `defaultOnUncaughtError` → `reportGlobalError` then unmounts the entire tree — black screen.

The "Invalid hook call" message was a secondary symptom: React 19's `describeNativeComponentFrame` intentionally sets `ReactSharedInternals.H = null` and calls Dashboard() to capture stack traces for error messages — not an actual hook violation.

### Decision

Remove `<React.StrictMode>` wrapper from `main.tsx`.

### Rationale

- recharts 3.x + react-redux@9 + React 19 StrictMode is a known incompatibility in development mode
- StrictMode's double-invocation is a dev-only behavior; production is unaffected
- The charts are core UI — a non-rendering dashboard is worse than losing StrictMode warnings
- ErrorBoundary around charts added as an additional safety net

### Consequences

- **Positive:** Demo and full app render correctly; recharts charts display properly
- **Negative:** React StrictMode double-render checks disabled (affects dev-mode only; production unaffected)
- **Alternative Considered:** Downgrade recharts to 2.x (rejected — would require significant chart code rewrite); wrap in ErrorBoundary only (rejected — doesn't prevent the root crash before boundaries activate)

---

## ADR-008: Vite Dependency Optimization for Recharts

**Date:** 2026-03-29

**Status:** Accepted

### Context

recharts 3.x, react-redux@9, and related packages (use-sync-external-store, @reduxjs/toolkit) need to share the exact same React instance as the application code. Vite's default pre-bundling handles this correctly for most packages, but explicit configuration prevents any edge cases with duplicate React instances or missing shared chunks.

### Decision

Add to `vite.config.ts`:
- `resolve.dedupe: ['react', 'react-dom']` — forces Vite to resolve react and react-dom to a single instance across all packages
- `optimizeDeps.include` — explicitly pre-bundle recharts, react-redux, @reduxjs/toolkit, use-sync-external-store and its selector variant

### Rationale

- Prevents "multiple React instances" class of bugs across the dependency tree
- Ensures all packages share the same `react-3_O8oni9.js` chunk and the same `ReactSharedInternals` object
- Zero runtime cost; build-time optimization only

### Consequences

- **Positive:** Guaranteed single React instance; deterministic pre-bundle output
- **Negative:** Slightly longer cold-start dep optimization on first `npm run dev`
- **Alternative Considered:** No explicit config (rejected — relies on Vite's heuristics which may change across versions)

---

## ADR-009: Single-Workspace Organization Model

**Date:** 2026-04-04

**Status:** Accepted

### Context

Phase 3 required Team Collaboration and White Label support, but the codebase already stored templates, certificates, and batch jobs directly against `createdBy`. Reworking every resource around a many-to-many workspace model would have been high-risk and would have slowed down delivery of the feature set in the PROJECT_PLAN.

### Decision

Adopt a single-workspace organization model:

- Each user belongs to at most one organization through `organizationId` and `organizationRole`
- Each organization stores its white-label configuration in a dedicated `Organization` model
- Team membership is managed through a dedicated `TeamInvitation` model plus workspace role updates on `User`
- Workspace sharing is resolved by querying the set of member user IDs and reusing existing `createdBy` ownership fields for authorization

### Rationale

- Minimizes schema churn across existing certificate, template, and batch collections
- Keeps authorization readable: owner/admin can manage shared resources, members can access workspace-visible data
- Delivers Team Collaboration and White Label without introducing multi-workspace ambiguity in the UI
- Fits the current target market of small organizations and internal teams

### Consequences

- **Positive:** Fast delivery, low migration risk, straightforward authorization checks, and reusable white-label data across the workspace
- **Negative:** Users cannot belong to multiple workspaces yet, and API-key/webhook ownership still remains user-scoped rather than workspace-scoped
- **Alternative Considered:** Full membership join table / many-workspace model (rejected for now - more flexible, but significantly higher migration and authorization complexity)

---

## ADR-010: Webhook-First Third-party Integrations

**Date:** 2026-04-04

**Status:** Accepted

### Context

The Phase 3 roadmap required Third-party Integrations, but the project did not yet have OAuth app registrations, provider-specific SDKs, or vendor credentials for platforms like Zapier, Make, Moodle, Canvas, or Google Sheets. A provider-by-provider OAuth build would have dramatically increased scope and would still leave custom/internal tools unsupported.

### Decision

Implement Third-party Integrations as a webhook-first Integration Hub:

- Each workspace can create provider-labeled integrations with a generated inbound webhook URL
- Integrations point to a default template and can run in `single` or `batch` mode
- External platforms send JSON payloads to the webhook URL to create certificates or queue batch jobs
- The system returns sample payloads and curl examples through a protected test endpoint for faster setup

### Rationale

- Works immediately with no-code automation tools, LMS webhook systems, spreadsheets, and custom internal apps
- Keeps the integration contract simple and transparent for users
- Reuses the existing certificate and batch generation engines instead of duplicating business logic
- Preserves room for future provider-specific OAuth connectors without blocking current delivery

### Consequences

- **Positive:** Broad compatibility, fast implementation, workspace-scoped control, and no dependency on third-party app review processes
- **Negative:** Users must configure outbound webhooks on the external platform themselves, and deep provider-specific sync features are still future work
- **Alternative Considered:** Native OAuth connectors for each provider (rejected for now - stronger UX for specific vendors, but much larger scope and operational overhead)

---

## ADR-011: Backend-Managed Native Connector Credentials

**Date:** 2026-04-05

**Status:** Accepted

### Context

After shipping the webhook-first Integration Hub, the next requirement was deeper provider-specific behavior for Google Sheets and Canvas:

- Google Sheets needed direct row write-back after queued and completed issuance runs
- Canvas needed an authenticated callback path to return certificate links back into LMS workflows

The project still did not have a secure multi-tenant secret store, and exposing provider tokens or service-account keys back to the frontend would violate the existing security rules in `AGENTS.md`.

### Decision

Use backend-managed credentials with provider-specific non-secret settings stored on each integration:

- Secrets stay in backend environment variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `CANVAS_API_TOKEN`)
- Each integration stores only non-secret routing/configuration values such as spreadsheet ID, sheet name, course ID, assignment ID, and return mode
- Google Sheets sync is executed server-side after webhook receipt and after batch completion
- Canvas callbacks are executed server-side after certificate issuance when the integration is configured for submission-comment returns

### Rationale

- Keeps service-account keys and LMS API tokens out of frontend payloads and API responses
- Reuses the existing integration model without introducing a new secret-management subsystem mid-project
- Supports real provider-specific behavior now while preserving a future path toward encrypted per-workspace secrets or OAuth connectors later
- Aligns with the project's current deployment model, where backend env vars are already required for Auth0, MongoDB, and Cloudinary

### Consequences

- **Positive:** Native provider behavior is available immediately, secrets remain server-side, and integration records stay safe to display in the UI
- **Negative:** Credentials are currently environment-wide rather than per-workspace, so multiple organizations cannot yet bring separate Google or Canvas credentials through the UI
- **Alternative Considered:** Persisting provider secrets directly on integrations (rejected - faster to build, but weaker security posture and harder to present safely in API responses)

---

## ADR-012: High-Fidelity UI & Motion System

**Date:** 2026-04-05

**Status:** Accepted

### Context

The application was functional but lacked the "Premium" visual appeal required for a modern corporate SaaS. Basic CSS transitions were insufficient for providing high-fidelity user feedback during complex workflows like batch generation or template creation.

### Decision

Implement a high-fidelity interaction system using Framer Motion combined with glassmorphism and animated glows.

- **Motion**: Standardize on `STAGGER_CONTAINER`, `REVEAL_ITEM`, and `SOFT_SPRING` for all entry animations.
- **Visuals**: Use `backdrop-blur-xl` and `bg-base-100/60` for cards (glassmorphism).
- **Feedback**: Implement animated glow pulses for background metrics and "Glow Points" for dashboard depth.
- **Layout**: Use `LayoutGroup` for fluid transitions between navigation categories.

### Rationale

- **Perceived Performance**: Fluid animations make the app feel faster and more responsive.
- **Brand Identity**: The "Premium Corporate" aesthetic differentiates the product from competitors.
- **User Engagement**: Interactive cards and interactive charts encourage deeper product exploration.
- **A11y & Clarity**: Staggered reveals help direct user attention to important information sequentially.

### Consequences

- **Positive**: Increased "Wow" factor during demos; professional/high-fidelity look; improved UX.
- **Negative**: Increased complexity of UI code; additional bundle weight (Framer Motion).
- **Alternative Considered**: CSS Keyframes (rejected - less maintainable and lack layout transition power).

---

## ADR-013: Canva-Compatible Background Templates Before Direct Canva Integration

**Date:** 2026-04-06

**Status:** Accepted

### Context

Users need more freedom than the built-in certificate presets provide. The product should allow teams to design certificates in external tools such as Canva, then import those layouts into Certify and batch-fill recipient data from CSV/XLSX. At the same time, direct Canva Connect integration introduces OAuth token exchange, secret handling, MFA requirements for integration setup, and public review or enterprise-plan constraints depending on the integration model.

### Decision

Make imported background templates a first-class Certify capability:

- Users export certificate artwork from Canva or any design tool as a landscape PNG
- Certify stores that background asset through Cloudinary
- Template Builder lets users place dynamic fields such as recipient name, title, issue date, expiry date, issuer, certificate ID, logo, and signature directly on top of the imported artwork
- Backend PDF/PNG generation renders those saved field positions without depending on Canva APIs

Treat direct Canva Connect import/export as a future convenience integration, not a core product dependency.

### Rationale

- Works for all users regardless of Canva plan
- Keeps Certify's certificate generation reliable even if Canva API access changes
- Avoids blocking the main template workflow on OAuth, app review, or enterprise-only capabilities such as Autofill
- Supports designs created in Canva, Figma, Adobe tools, or any other external editor instead of tying the product to a single vendor

### Consequences

- **Positive:** Market-wide reliable workflow, simpler onboarding, and no dependency on Canva-specific account tiers for core batch generation
- **Negative:** Users must export artwork manually before importing it into Certify
- **Alternative Considered:** Build direct Canva Connect import/export first (rejected for the core roadmap because it adds OAuth/app-review complexity and does not cover all users)

---

## ADR-014: Auth0-Hosted Entry Points Instead of Custom In-App Credential Forms

**Date:** 2026-04-06

**Status:** Accepted

### Context

Users expected visible Sign in and Sign up entry points on the landing page, including Google login. At the same time, the project rules already require Auth0 as the authentication system and explicitly avoid storing tokens or re-implementing sensitive auth flows on the client. Building custom in-app credential forms would duplicate Auth0 Universal Login responsibilities and increase security and maintenance risk.

### Decision

Keep authentication on Auth0-hosted screens:

- The landing page opens a Certify auth prompt that explains the available sign-in actions
- Primary actions trigger Auth0-hosted login flows rather than local email/password forms
- The client attempts popup-based Auth0 login first for a smoother UX, then falls back to redirect-based login when popup/origin constraints block the popup path
- Successful auth returns users to `/dashboard`

### Rationale

- Preserves Auth0's secure hosted login model and social connection handling
- Avoids duplicating credential collection logic inside the React app
- Keeps Google login, sign-up hints, and redirect handling in one provider-managed flow
- Allows the product to offer clear entry points without taking ownership of password UX/security

### Consequences

- **Positive:** Stronger security posture, simpler frontend auth code, and better alignment with Auth0 best practices
- **Negative:** Users who expect an embedded email/password form will instead be redirected or popped into Auth0-hosted UI
- **Alternative Considered:** Build fully custom in-app login/sign-up forms (rejected because it duplicates hosted auth responsibilities and adds avoidable risk)

---

## ADR-015: Dev-Only Dashboard-Shell Preview Routes During Auth0 Localhost Troubleshooting

**Date:** 2026-04-06

**Status:** Accepted

### Context

Localhost UI QA became blocked by an environment-side Auth0 callback/origin mismatch. Even when product routes themselves were functional, the team could not reliably navigate inside the dashboard shell during local debugging because every authenticated route attempted hosted login first.

### Decision

In development mode only:

- Render the authenticated dashboard-shell routes (`/dashboard`, `/templates`, `/create`, `/batch`, `/integrations`, `/certificates`, `/settings`, `/templates/new`) without the Auth0 route gate
- Keep production builds fully protected with the existing `ProtectedRoute` logic
- Continue treating hosted Auth0 login verification as a separate environment/configuration task

### Rationale

- Unblocks localhost visual QA and navigation fixes while tenant settings are still being corrected
- Preserves production security because the bypass is limited to `import.meta.env.DEV`
- Makes it possible to test header, sidebar, templates, and batch flows without waiting on external tenant changes

### Consequences

- **Positive:** Faster UI iteration and local debugging across the dashboard shell
- **Negative:** Local DEV navigation no longer proves that hosted Auth0 is configured correctly
- **Alternative Considered:** Keep all routes hard-blocked behind Auth0 during local troubleshooting (rejected because it slowed down unrelated UI fixes and route QA)

---

---
 
 ## ADR-016: Specialized Branding Asset Architecture
 
 **Date:** 2026-04-07
 
 **Status:** Accepted
 
 ### Context
 
 Initial branding relied on the generic Lucide `Award` icon component. This was sufficient for MVP but lacked brand unique properties when used as a favicon or in primary branding locations. Additionally, the `public/` directory lacked organization, with icons and favicons scattered.
 
 ### Decision
 
 Move branding assets to a specialized, file-based architecture:
 - Reorganize `public/` into subdirectories: `Logo/` for brand logos and `favicon/` for browser/mobile icons.
 - Replace React component fallback (Lucide `Award`) with a dedicated `logo.svg` derived from the award design for use in core branding containers.
 - Use a high-fidelity SVG favicon (`favicon/favicon.svg`) instead of the default browser fallback.
 
 ### Rationale
 
 - **Consistency**: Using a dedicated SVG file ensures the brand logo looks identical across Sidebar, Header, Footer, and Public Verification views.
 - **Organization**: Subdirectories in `public/` prevent clutter and make asset management easier for developers and designers.
 - **Performance**: Browser favicons load more reliably when stored in a dedicated path and linked correctly from `index.html`.
 - **Future Proofing**: Allows easier white-labeling or future logo changes by swapping single SVG files rather than updating icon components across the codebase.
 
 ### Consequences
 
 - **Positive**: Professional asset management, improved brand consistency, and better technical SEO via correct favicon implementation.
 - **Negative**: Requires manual `img` tag handling instead of simple icon component prop-drilling for branding containers.
 - **Alternative Considered**: Keep using Lucide icons (rejected - lacks brand specialization and breaks favicon consistency).
 
 ---
 
## ADR-017: Auth0 Audience in getAccessTokenSilently Only — Never in loginWithRedirect or Auth0Provider

**Date:** 2026-04-09

**Status:** Accepted

### Context

After migrating to redirect-based Auth0 hosted login, all sign-in and Google login attempts returned "Client not authorized to access resource server https://certify-api" as a URL redirect error parameter. Investigation revealed that when `audience` is included in the initial `/authorize` request (via `loginWithRedirect.authorizationParams.audience` or `Auth0Provider.authorizationParams.audience`), Auth0 requires a Client Grant between the SPA and the API resource server. Even after a Client Grant was confirmed to exist (409 Conflict on POST /api/v2/client-grants), the error persisted intermittently — traced to ESLint's `no-unused-vars` auto-fix re-inserting the `audience` value into `authorizationParams` whenever the variable was declared but not used.

Additionally, all authenticated API calls returned 500 after login because `express-oauth2-jwt-bearer` v1.7.4 throws `Error: An 'audience' is required to validate the 'aud' claim` at runtime even though its TypeScript types declare `audience` as optional.

### Decision

Split the audience concern into two distinct flows:

1. **Login / Authorization (`/authorize` endpoint):** No `audience` in `Auth0Provider.authorizationParams` and no `audience` in any `loginWithRedirect` call. The `auth0Audience` variable is removed from module scope in `main.tsx`, `Home.tsx`, `Header.tsx`, and `App.tsx` to prevent ESLint auto-revert.

2. **Token acquisition (`/oauth/token` endpoint):** `audience` is passed only inside `getAccessTokenSilently({ authorizationParams: { audience } })` in `AuthContext.tsx` and `useAuth.ts`. This call goes through the refresh-token exchange path, which is governed by the Client Grant separately from the `/authorize` flow.

3. **Backend validation:** `audience` is always required in `backend/src/middleware/auth.ts` (`auth({ audience, issuerBaseURL, tokenSigningAlg })`).

### Rationale

- The Auth0 Authorization Code + PKCE flow (`/authorize`) and the refresh-token exchange flow (`/oauth/token`) both check Client Grants but are independent paths — the `/authorize` rejection does not depend on the grant existing; it depends on the SPA being registered correctly. Keeping the audience out of `/authorize` avoids this class of error entirely.
- `getAccessTokenSilently` with `audience` in `authorizationParams` routes through `/oauth/token` using the stored refresh token — this IS correctly governed by the Client Grant and returns an API-scoped JWT.
- Eliminating module-scope `auth0Audience` variables from components prevents ESLint from auto-inserting the value back into `authorizationParams` on lint-fix runs.

### Consequences

- **Positive:** Login (password and Google) succeeds without "Client not authorized" errors; API calls receive correctly scoped JWTs; backend validates tokens with correct audience; ESLint auto-fix no longer reverts the fix.
- **Negative:** Slightly non-obvious split — `loginWithRedirect` has no audience while `getAccessTokenSilently` does; requires a comment in code to prevent future regression.
- **Alternative Considered:** Keep audience in `loginWithRedirect` and add Client Grant (rejected — 409 Conflict confirmed grant existed yet error persisted, and ESLint re-insertion created an unbreakable loop).

---

## ADR-018: Certificate Revocation via Status Field and HTTP 410

**Date:** 2026-04-09

**Status:** Accepted

### Context

Organizations need the ability to invalidate certificates after issuance — due to errors, misconduct, or policy changes. The public verification endpoint had no way to distinguish between a certificate that never existed and one that was explicitly revoked, returning a generic 404 in both cases. A distinct machine-readable response for revoked certificates is needed so integrating systems and users can understand the difference.

### Decision

- Add a `status: 'active' | 'revoked'` field (default `'active'`) to the `Certificate` model with a Mongoose enum validator.
- The public verify endpoint (`GET /api/verify/:certificateId`) returns HTTP **410 Gone** with `{ code: 'REVOKED' }` for revoked certificates, distinct from 404 Not Found.
- A new authenticated endpoint `PATCH /api/certificates/:id/revoke` sets `status = 'revoked'` after verifying the requesting user belongs to the owning workspace.
- The `api.ts` error helper propagates the HTTP `status` and `code` fields so frontend callers can branch on 410 vs 404.
- The Verify page shows a dedicated "Certificate Revoked" state with a `ShieldAlert` icon, visually distinct from the Not Found state.

### Rationale

- HTTP 410 Gone is the semantically correct status for a resource that has been permanently removed or invalidated, distinguishing it from 404 which means it was never found.
- Keeping the revoked record in the database (rather than deleting it) preserves audit history and allows the 410 response to carry issuer context.
- Workspace permission check on the revoke endpoint prevents unauthorized revocations by users outside the issuing organization.

### Consequences

- **Positive:** Clear distinction between "never existed" and "explicitly revoked"; machine-readable for integrations; audit trail preserved; issuing workspace retains control.
- **Negative:** Adds a new field to the Certificate schema (backward-compatible default); revoked certificates still occupy database storage.
- **Alternative Considered:** Delete the certificate on revocation (rejected — loses audit trail and makes it impossible to return a meaningful 410 with context).

---

 ---

## ADR-019: Standardized Corporate Design System (0.25rem Corner Radius)

**Date:** 2026-04-10

**Status:** Accepted

### Context

The application initially featured various corner radius tokens (`rounded-lg`, `rounded-xl`, `rounded-full`, etc.), creating an inconsistent, informal "bubble-like" aesthetic. For a professional B2B SaaS platform like Certify, a more disciplined, modern, and high-end corporate design language is required to build trust and ensure visual cohesion across all modules (Landing, Dashboard, Portals, and Legal).

### Decision

Standardize the entire design system to a strict 0.25rem corner radius (using Tailwind's `rounded` utility).

- **UI Components**: All buttons, cards, tags, inputs, alerts, and navigation items use `rounded` (0.25rem).
- **Exceptions**: Background decorative blurs (blobs) and small status indicators (dots) maintain `rounded-full` to preserve soft visual rhythm and circular semantic meaning.
- **Application**: Mass refactor implemented across both `pages/` and `components/` directories.

### Rationale

- **Consistency**: A single corner radius token across all interactive elements creates a unified, professional character.
- **Corporate Visual Language**: Standardizing on `rounded` (0.25rem) aligns with the "Corporate" DaisyUI theme and avoids the informal, consumer-grade "bubble" style.
- **Brand Identity**: Square-ish shapes with subtle rounding signal precision, stability, and high-fidelity — core values of a certificate generation platform.
- **Ease of Maintenance**: Eliminating multiple radius variants simplifies future component development and reduces design debt.

### Consequences

- **Positive**: Cohesive, premium SaaS aesthetic; clearer visual hierarchy; faster UI auditing; 100% alignment with `global.css` tokens.
- **Negative**: Requires careful preservation of decorative circles/spinners during global refactoring scripts.
- **Alternative Considered**: Multiple radius levels (rejected — leads to inconsistent grouping and "informal" feel).

---

## Template

```markdown
## ADR-XXX: [Title]

**Date:** YYYY-MM-DD

**Status:** Proposed | Accepted | Deprecated | Superseded

### Context

[Describe the context and problem]

### Decision

[Describe the decision]

### Rationale

[Explain why this decision was made]

### Consequences

- **Positive:** [Benefits]
- **Negative:** [Drawbacks]
- **Alternative Considered:** [Other options considered]
```

