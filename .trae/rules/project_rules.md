# Certify Project Rules

This document defines rules that all AI agents must follow when working on the Certify project.

---

## 1. Project Overview

- **Project Name:** Certify - Certificate Generator Web App
- **Tech Stack:** React + TypeScript + Vite + Tailwind v4 + DaisyUI (Frontend), Node.js + Express + TypeScript + MongoDB (Backend)
- **Project Plan:** Always read `docs/PROJECT_PLAN.md` before making any changes

---

## 2. Code Style

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### ESLint Rules

- Use flat config format (ESLint 9+)
- TypeScript strict mode enabled
- React Hooks rules enforced
- React Refresh for fast refresh
- Prettier integration for formatting

### General Rules

- Use TypeScript for all new files
- Use named exports for components
- Use functional components with hooks
- Avoid `any` type - use proper types
- Use const assertions for constants

---

## 3. UI & Styling

### DaisyUI Theme

Project uses **corporate** theme (defined in `src/global.css`).

**Color Palette:**

| Color     | Usage               | Value                     |
| --------- | ------------------- | ------------------------- |
| primary   | Main actions, links | Blue `oklch(58% 0.158)`   |
| secondary | Secondary actions   | Slate `oklch(55% 0.046)`  |
| accent    | Highlights          | Teal `oklch(60% 0.118)`   |
| success   | Success states      | Green `oklch(62% 0.194)`  |
| warning   | Warning states      | Yellow `oklch(85% 0.199)` |
| error     | Error states        | Red `oklch(70% 0.191)`    |
| info      | Info states         | Cyan `oklch(60% 0.126)`   |

**Usage Rules:**

- Use DaisyUI components: `btn`, `card`, `input`, `modal`, `table`, etc.
- Apply semantic colors: `btn-primary`, `btn-secondary`, `btn-accent`
- Use `base-100` for backgrounds, `base-content` for text
- Maintain consistent `radius-*` values (0.25rem)
- No dark mode (light theme only)
- **NEVER use inline CSS** - always use Tailwind/DaisyUI classes

**Example:**

```tsx
<button className="btn btn-primary">Create Certificate</button>
<div className="alert alert-success">Certificate saved!</div>
```

---

## 4. Code Preservation

### Critical Rule

**Only modify what is explicitly requested.**

When making changes:

- **DO NOT** touch existing working UI/UX, Logic, Functions, or Code
- **DO NOT** refactor code that is not related to the requested change
- **DO NOT** change variable names, function names, or file structure unless asked
- **ONLY** modify the specific code necessary for the requested feature/fix

### Before Making Changes

1. Read and understand the existing code
2. Identify the minimum changes needed
3. Make only those changes
4. Leave everything else untouched

---

## 5. Component Structure

### File Organization

Each component should have:

```
ComponentName/
├── ComponentName.tsx        # Main component
├── ComponentName.types.ts   # TypeScript types
├── ComponentName.stories.tsx # Storybook stories
└── index.ts                 # Barrel export
```

### Component Template

```tsx
import type { ComponentNameProps } from './ComponentName.types';

export const ComponentName: React.FC<ComponentNameProps> = (props) => {
  return (
    // Component implementation
  );
};
```

### Storybook Stories

- Create `.stories.tsx` file for every UI component
- Include multiple variants (default, disabled, loading, etc.)
- Document props and usage examples

---

## 6. Naming Conventions

| Type       | Convention           | Example               |
| ---------- | -------------------- | --------------------- |
| Components | PascalCase           | `CertificateCard`     |
| Hooks      | camelCase with `use` | `useCertificates`     |
| Utils      | camelCase            | `formatDate`          |
| Types      | PascalCase           | `CertificateData`     |
| Constants  | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`       |
| Files      | PascalCase           | `CertificateCard.tsx` |
| Folders    | PascalCase           | `CertificateCard/`    |

---

## 7. Import Order

```tsx
// 1. External libraries
import React from "react";
import { useNavigate } from "react-router-dom";

// 2. Internal components
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";

// 3. Hooks
import { useAuth } from "@/hooks/useAuth";

// 4. Utils
import { formatDate } from "@/utils/formatters";

// 5. Types
import type { Certificate } from "@/types/certificate";

// 6. Styles (if needed)
import "./styles.css";
```

---

## 8. API & Data Handling

### API Calls

- Use Fetch API for all HTTP requests
- Centralize API calls in `utils/api.ts` files
- Handle errors consistently
- Use proper TypeScript types for responses

### Error Handling

```tsx
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error("API Error:", error);
  throw error;
}
```

---

## 9. Git & Commits

### Commit Message Format

```
type(scope): description

# Examples:
feat(auth): add login button component
fix(certificate): resolve PDF generation issue
docs(readme): update installation instructions
style(button): fix padding inconsistency
refactor(api): simplify error handling
test(hooks): add useAuth tests
chore(deps): update dependencies
```

### Commit Types

| Type     | Description                           |
| -------- | ------------------------------------- |
| feat     | New feature                           |
| fix      | Bug fix                               |
| docs     | Documentation changes                 |
| style    | Code style changes (formatting)       |
| refactor | Code refactoring                      |
| test     | Adding or updating tests              |
| chore    | Maintenance tasks, dependency updates |

---

## 10. Change Log Rule

When making changes to the project:

1. **Update docs/CHANGELOG.md** under `[Unreleased]` section
2. **Use categories:** Added, Changed, Fixed, Removed
3. **Move items** to version section when releasing
4. **Include issue/PR numbers** if applicable

### Example

```markdown
## [Unreleased]

### Added

- New Button component with variants
- Storybook stories for common components

### Fixed

- PDF generation timeout issue

### Changed

- Improved error handling in API calls
```

---

## 11. Progress Tracking

### Update docs/PROGRESS.md

When completing tasks:

1. Mark task as completed with date
2. Add notes about implementation
3. Update current status
4. List next steps

---

## 12. Architecture Decisions

### Update docs/DECISIONS.md

When making significant architecture decisions:

1. Document the decision
2. Explain the rationale
3. List alternatives considered
4. Note any consequences

---

## 13. File Restrictions

### Never Create

- Do not create documentation files (\*.md) unless explicitly requested
- Do not create README files unless explicitly requested
- Do not create test files unless explicitly requested

### Always Prefer

- Edit existing files over creating new ones
- Follow existing patterns in the codebase
- Check docs/PROJECT_PLAN.md before adding new features

---

## 14. Pre-commit Checks

Before committing:

1. Run `npm run lint` - Fix all linting errors
2. Run `npm run prettier` - Format all files
3. Run `npm run build` - Ensure build succeeds
4. Update docs/CHANGELOG.md if needed
5. Update docs/PROGRESS.md if needed

---

## 15. Environment Variables

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

### Backend (.env)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/certify
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-audience
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 16. Quick Reference

### Commands

| Command                   | Description              |
| ------------------------- | ------------------------ |
| `npm run dev`             | Start development server |
| `npm run build`           | Build for production     |
| `npm run lint`            | Run ESLint               |
| `npm run prettier`        | Format with Prettier     |
| `npm run storybook`       | Start Storybook          |
| `npm run build-storybook` | Build Storybook static   |

### Key Files

| File                 | Purpose                    |
| -------------------- | -------------------------- |
| docs/PROJECT_PLAN.md | Full project specification |
| docs/CHANGELOG.md    | Version history            |
| docs/PROGRESS.md     | Current status             |
| docs/DECISIONS.md    | Architecture decisions     |
| .prettierrc          | Prettier config            |
| eslint.config.js     | ESLint config              |

---

## 17. Security Rules

### Authentication (Auth0)

- Never store tokens in localStorage - use Auth0 SDK memory storage
- Always validate JWT tokens on backend using `express-oauth2-jwt-bearer`
- Use Auth0's `getAccessTokenSilently()` for API calls
- Implement proper logout flow with Auth0 SDK
- Workspace-based authorization via `organizationId` and `organizationRole` claims

### API Key Authentication

- API keys have optional expiration dates with MongoDB TTL index auto-cleanup
- Per-key rate limiting implemented for API key requests
- Keys are hashed before storage, only shown once on creation
- Masked key preview returned in API responses (never expose full key)

### Secrets Management

- **NEVER** commit secrets to repository
- **NEVER** log API keys, tokens, or passwords
- Use `.env` files for local development (not tracked by Git)
- Use environment variables in production
- Secure logger with automatic sensitive data redaction (passwords, tokens, API keys, secrets)

### API Security

- Validate all user inputs on backend
- Use rate limiting on API endpoints (`express-rate-limit`)
- Implement CORS properly with allowed origins
- Sanitize data before database operations
- MongoDB ObjectId validation with regex pattern
- Security headers via Helmet middleware

### File Upload Security

- Validate file type via MIME type checking
- Validate file extension against whitelist
- **Magic byte signature validation** for file content verification
- **Filename sanitization** - remove control characters, path traversal sequences, null bytes
- Maximum file size limits enforced
- Signed upload URLs for Cloudinary

### SSRF Protection

- DNS resolution checks for webhook URLs
- Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x)
- Block localhost and link-local addresses
- Validate URL scheme (http/https only)

### Frontend Security

- Escape user-generated content
- Use React's built-in XSS protection
- Validate file uploads (type, size)
- Never expose sensitive data in client-side code

### Dependency Security

- Run `npm audit` regularly to check for vulnerabilities
- Use `overrides` in package.json to force secure versions of transitive dependencies
- Current overrides: `lodash@^4.18.1` (fixes prototype pollution, code injection)
- Replace vulnerable packages with secure alternatives (e.g., `xlsx` → `exceljs`)

---

## 18. Critical Implementation Notes

### Auth0 Audience Strategy (DO NOT MODIFY)

**Problem:** Passing `audience` in `loginWithRedirect` causes "Client not authorized to access resource server" error.

**Solution:**

- `audience` is passed **ONLY** inside `getAccessTokenSilently({ authorizationParams: { audience } })`
- Located in `AuthContext.tsx` and `useAuth.ts`
- Routes through `/oauth/token` refresh-token exchange path (governed by Client Grant)
- Backend receives correctly-scoped JWT access tokens without re-triggering authorization flow

**Files to NOT modify:**

- `frontend/src/contexts/AuthContext.tsx` - audience in `getAccessTokenSilently` only
- `frontend/src/hooks/useAuth.ts` - audience in `getAccessTokenSilently` only
- `backend/src/middleware/auth.ts` - `audience: process.env.AUTH0_AUDIENCE` is REQUIRED

### MongoDB Duplicate Key Handling (DO NOT REMOVE)

**Problem:** Race conditions during organization creation cause `E11000 duplicate key error`.

**Solution:**

- Retry logic with exponential backoff in `workspaceService.ts`
- Handles concurrent requests attempting to create the same workspace

**Files to NOT modify:**

- `backend/src/services/workspaceService.ts` - retry logic must remain

### Sidebar Navigation Labels (Current Names)

The sidebar uses user-friendly labels. Do NOT revert to technical names:

| Current Label | Do NOT Revert To |
| ------------- | ---------------- |
| Overview      | -                |
| Certificates  | Ledger           |
| Templates     | Library          |
| Quick Create  | Instant Issue    |
| Bulk Create   | Batch Flow       |
| Integrations  | Automation       |
| Settings      | Admin Tools      |

### Component Architecture: Filtering Logic (DO NOT DUPLICATE)

**Problem:** Child components implementing their own filtering logic causes duplicate UI and double-filtering.

**Solution:**

- Filtering logic lives in **parent pages**, not child components
- Child components receive pre-filtered data via props
- This prevents duplicate category tabs and inconsistent state

**Example - Templates Page:**

- `Templates.tsx` (page): Manages `activeCategory` state, filters templates, passes `filteredTemplates` to child
- `TemplateGallery.tsx` (component): Receives `templates` prop, renders directly without additional filtering

**Files pattern to follow:**

- Pages (`src/pages/*`): Own state, filtering, and category UI
- Components (`src/components/*`): Receive filtered props, render without additional state logic

### Category Tab Animation Pattern (Framer Motion)

**Problem:** Default spring transitions cause jarring color shifts and slow pill movements.

**Solution - Use faster spring physics for layoutId animations:**

```tsx
// Pill background animation (layoutId)
transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}

// Text color transition (CSS)
className="transition-colors duration-200"

// Hover background (flat transition, not spring)
transition={{ duration: 0.15 }}
```

**Key patterns:**

- Use conditional rendering `{isActive && ...}` instead of ternary for cleaner animations
- Add `initial={false}` to layoutId elements to prevent initial animation
- Hover states should use primary color tint: `rgba(59,130,246,0.12)` for background, `text-primary` for text
- Text transitions via Tailwind `transition-colors duration-200` for smooth color changes

### UI Naming Consistency (DO NOT USE LEGACY NAMES)

**Problem:** Legacy technical names still appear in UI text, buttons, and descriptions.

**Solution - Always use user-friendly names:**

| Legacy Name (DO NOT USE) | Current Name (USE THIS) |
| ------------------------ | ----------------------- |
| ledger / Ledger          | registry / Registry     |
| library / Library        | templates / Templates   |
| automation / Automation  | integration / Integration |
| Design Library           | Template Gallery        |
| Automation Center        | Integration Center      |
| Automations (label)      | Sync Runs               |
| Excel automation         | Excel integration       |
| automation health        | integration health      |
| automation sequences     | integration sequences   |
| issuance / Issuance      | creation / Creation     |
| New Issuance             | Create New              |
| Begin Issuance           | Create New              |
| issuance records         | certificate records     |

**Files to check when adding new UI text:**
- `src/pages/` - All page components
- `src/components/` - All shared components
- Run grep search before committing: `grep -r "ledger\|Library\|automation\|issuance" src/`

---

## 19. Error Handling

### Frontend Error Handling

- Use React Error Boundaries for component errors
- Display user-friendly error messages
- Log errors to console in development only
- Use toast notifications for non-critical errors

### Error Boundary Example

```tsx
import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="alert alert-error">Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

### Backend Error Handling

- Use consistent error response format
- Include appropriate HTTP status codes
- Log errors with context
- Never expose internal errors to clients

### JWT Middleware Error Handling (express-oauth2-jwt-bearer)

The `express-oauth2-jwt-bearer` library throws errors with `status` property (not `statusCode`). The error handler must check both properties:

```typescript
// Error handler must check both statusCode and status
const statusCode = err.statusCode || err.status || 500;

// JWT errors need code mapping
const getErrorCode = (err: AppError): string => {
  if (err.code) return err.code;
  if (err.name === 'UnauthorizedError') return 'UNAUTHORIZED';
  if (err.message?.includes('invalid token')) return 'INVALID_TOKEN';
  if (err.message?.includes('jwt expired')) return 'TOKEN_EXPIRED';
  if (err.message?.includes('jwt malformed')) return 'INVALID_TOKEN';
  if (err.message?.includes('no authorization token')) return 'TOKEN_MISSING';
  return 'INTERNAL_ERROR';
};
```

**Important**: Without checking `status` property, JWT auth errors return HTTP 500 instead of 401.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": {}
  }
}
```

---

## 20. State Management

### React Context

- Use React Context for global state (auth, theme)
- Keep context providers at appropriate level
- Split contexts by domain (AuthContext, ThemeContext)

### When to Use Context

| State Type        | Solution            |
| ----------------- | ------------------- |
| Auth state        | AuthContext         |
| Theme             | ThemeContext        |
| Form state        | Local state         |
| Server state      | Fetch + local state |
| UI state (modals) | Local state/hooks   |

### State Rules

- Prefer local state over global state
- Lift state up only when necessary
- Use custom hooks to encapsulate state logic
- Avoid prop drilling - use context instead

---

## 21. Performance

### React Optimization

- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for functions passed to children
- Implement lazy loading for routes

### Lazy Loading Example

```tsx
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));

function App() {
  return (
    <Suspense fallback={<div className="loading loading-spinner" />}>
      <Dashboard />
    </Suspense>
  );
}
```

### Library Lazy Loading (Heavy Libraries)

Heavy libraries (>500kB) must be lazy-loaded to avoid Vite chunk warnings:

| Library   | Lazy Load Method              | Used In           |
| --------- | ----------------------------- | ----------------- |
| ExcelJS   | Dynamic import (`import()`)   | csvParser.ts      |
| Recharts  | React.lazy() + Suspense       | Dashboard.tsx     |

**Pattern - Dynamic Import for Utilities:**

```typescript
const parseXLSX = async (file: File) => {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.default.Workbook();
  // ... parsing logic
};
```

**Pattern - React.lazy for Components:**

```tsx
const OverviewChart = React.lazy(() => import('./OverviewChart'));

<Suspense fallback={<div className="loading loading-spinner" />}>
  <OverviewChart data={data} />
</Suspense>;
```

### Bundle Optimization

- Use dynamic imports for large libraries
- Split code by route
- Optimize images before upload
- Use Cloudinary for image optimization

### Performance Checklist

- [ ] Lazy load routes
- [ ] Lazy load heavy libraries (ExcelJS, Recharts)
- [ ] Memoize expensive computations
- [ ] Optimize re-renders
- [ ] Use proper key props in lists
- [ ] Debounce search inputs

---

## 22. Accessibility (a11y)

### WCAG Compliance

- Follow WCAG 2.1 Level AA guidelines
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Provide text alternatives for images

### Required Attributes

| Element | Required Attribute |
| ------- | ------------------ |
| Images  | `alt` text         |
| Buttons | Accessible label   |
| Forms   | Labels + hints     |
| Links   | Descriptive text   |
| Modals  | `aria-modal`       |

### DaisyUI Accessibility

- DaisyUI components have built-in a11y
- Add `aria-label` for icon-only buttons
- Use `role` attributes when needed
- Test with screen readers

### Example

```tsx
<button className="btn btn-primary" aria-label="Create new certificate">
  <PlusIcon aria-hidden="true" />
</button>
```

---

## 23. Responsive Design

### Mobile-First Approach

- Write styles for mobile first
- Add breakpoints for larger screens
- Use Tailwind responsive prefixes

### Tailwind Breakpoints

| Prefix | Min Width |
| ------ | --------- |
| `sm:`  | 640px     |
| `md:`  | 768px     |
| `lg:`  | 1024px    |
| `xl:`  | 1280px    |
| `2xl:` | 1536px    |

### Responsive Patterns

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

<nav className="flex flex-col md:flex-row">
  {/* Navigation items */}
</nav>
```

### Touch Targets

- Minimum touch target: 44x44px
- Use appropriate spacing between targets
- Ensure buttons are easily tappable on mobile

---

## 24. File Upload

### Cloudinary Integration

- Use Cloudinary for all file uploads
- Validate file type and size before upload
- Use signed uploads for security
- Store Cloudinary public_id in database

### Allowed File Types

| Purpose    | Types             | Max Size |
| ---------- | ----------------- | -------- |
| Logo       | PNG, JPG, SVG     | 2MB      |
| Signature  | PNG (transparent) | 1MB      |
| CSV Import | CSV, XLSX         | 5MB      |

### Upload Flow

1. Validate file on frontend
2. Get signed upload URL from backend
3. Upload directly to Cloudinary
4. Store public_id in database
5. Use Cloudinary transformations for display

### Example Hook

```tsx
const { upload, isUploading, error } = useCloudinary();

const handleUpload = async (file: File) => {
  const result = await upload(file, { folder: "logos" });
  return result.public_id;
};
```

---

## 25. PDF Generation

### Puppeteer Usage

- Generate PDFs on backend using Puppeteer
- Use HTML templates for certificate layout
- Apply CSS for styling
- Return PDF as base64 or upload to Cloudinary

### PDF Template Structure

```
backend/templates/
├── certificate-base.html
├── certificate-modern.html
├── certificate-classic.html
└── styles/
    └── certificate.css
```

### Generation Flow

1. Receive certificate data from frontend
2. Select appropriate HTML template
3. Inject data into template
4. Generate PDF with Puppeteer
5. Upload to Cloudinary or return directly

### PDF Options

```ts
const pdfOptions = {
  format: "A4",
  landscape: true,
  printBackground: true,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
};
```

### Performance Tips

- Reuse browser instance
- Set reasonable timeouts
- Handle generation errors gracefully
- Queue batch PDF generation jobs

---

## 26. Component-Specific Responsive Patterns

### Navigation Components

| Component   | Mobile (< 768px) | Tablet (768px - 1024px) | Desktop (> 1024px) |
| ----------- | ---------------- | ----------------------- | ------------------ |
| Navbar      | Hamburger menu   | Compact top nav         | Full top nav       |
| Sidebar     | Hidden/drawer    | Collapsible             | Always visible     |
| Breadcrumbs | Hide or truncate | Show abbreviated        | Full path          |

### Content Components

| Component | Mobile                         | Tablet              | Desktop               |
| --------- | ------------------------------ | ------------------- | --------------------- |
| Cards     | Stack vertically               | 2-column grid       | 3-4 column grid       |
| Tables    | Horizontal scroll or card view | Scrollable          | Full width            |
| Forms     | Single column                  | Single column       | Multi-column possible |
| Modals    | Full screen or bottom sheet    | Centered, 90% width | Centered, max-width   |
| Lists     | Single column                  | 2 columns           | 3+ columns            |

### Implementation Examples

```tsx
// Responsive Card Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {cards.map(card => <Card key={card.id} {...card} />)}
</div>

// Responsive Table with Mobile Card View
<div className="hidden md:block">
  <table className="table">...</table>
</div>
<div className="md:hidden">
  {data.map(item => <MobileCard key={item.id} {...item} />)}
</div>

// Responsive Form
<form className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <Input label="First Name" />
  <Input label="Last Name" />
  <div className="lg:col-span-2">
    <Textarea label="Description" />
  </div>
</form>
```

---

## 27. Typography Scaling

### Font Size Scale

| Element | Mobile   | Tablet   | Desktop  |
| ------- | -------- | -------- | -------- |
| H1      | 2rem     | 2.5rem   | 3rem     |
| H2      | 1.5rem   | 1.75rem  | 2rem     |
| H3      | 1.25rem  | 1.5rem   | 1.75rem  |
| H4      | 1.125rem | 1.25rem  | 1.5rem   |
| Body    | 1rem     | 1rem     | 1rem     |
| Small   | 0.875rem | 0.875rem | 0.875rem |

### Tailwind Typography Classes

```tsx
// Responsive headings
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Page Title
</h1>

<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">
  Section Title
</h2>

// Body text - minimum 16px for readability
<p className="text-base leading-relaxed">
  Content text
</p>
```

### Line Height Guidelines

| Font Size | Line Height |
| --------- | ----------- |
| < 1rem    | 1.5         |
| 1-1.5rem  | 1.5-1.6     |
| > 1.5rem  | 1.2-1.4     |

### Font Weight Usage

| Weight | Usage             |
| ------ | ----------------- |
| 400    | Body text         |
| 500    | Emphasis, labels  |
| 600    | Subheadings       |
| 700    | Headings, buttons |

---

## 28. Navigation Patterns

### Mobile Navigation (< 768px)

```tsx
// Hamburger Menu with Drawer
<nav className="navbar lg:hidden">
  <div className="flex-none">
    <button className="btn btn-square btn-ghost" aria-label="Open menu">
      <HamburgerIcon />
    </button>
  </div>
</nav>

// Bottom Navigation (Alternative)
<nav className="fixed bottom-0 left-0 right-0 bg-base-100 border-t lg:hidden">
  <div className="flex justify-around py-2">
    <NavLink icon={<HomeIcon />} label="Home" />
    <NavLink icon={<CertIcon />} label="Certificates" />
    <NavLink icon={<ProfileIcon />} label="Profile" />
  </div>
</nav>
```

### Tablet Navigation (768px - 1024px)

```tsx
// Compact Top Navigation
<nav className="navbar hidden md:flex lg:hidden">
  <div className="flex-1">
    <span className="text-xl font-bold">Certify</span>
  </div>
  <div className="flex-none gap-2">
    <NavLink>Home</NavLink>
    <NavLink>Certificates</NavLink>
    <DropdownMenu label="More" items={[...]} />
  </div>
</nav>
```

### Desktop Navigation (> 1024px)

```tsx
// Full Top Navigation with Dropdowns
<nav className="navbar hidden lg:flex">
  <div className="flex-1">
    <span className="text-xl font-bold">Certify</span>
  </div>
  <div className="flex-none gap-4">
    <NavLink>Home</NavLink>
    <NavLink>Certificates</NavLink>
    <NavLink>Templates</NavLink>
    <NavLink>Settings</NavLink>
    <div className="dropdown dropdown-end">
      <ProfileMenu />
    </div>
  </div>
</nav>
```

### Navigation Rules

- Mobile: Maximum 5 items in bottom nav
- Tablet: Use dropdowns for overflow items
- Desktop: Show all primary navigation items
- Always include logo/home link
- Highlight current page/section

---

## 29. Image & Media Responsiveness

### Cloudinary Transformations

```tsx
// Responsive Image Component
const ResponsiveImage = ({ publicId, alt }) => (
  <img
    src={`https://res.cloudinary.com/${cloudName}/image/upload/
      c_scale,w_auto:100:400,
      dpr_auto,
      q_auto,
      f_auto
    /${publicId}`}
    alt={alt}
    loading="lazy"
    className="w-full h-auto"
  />
);

// Hero Image with Different Crops
<picture>
  <source
    media="(min-width: 1024px)"
    srcSet={`cloudinary-url/w_1920,h_600,c_fill/${publicId}`}
  />
  <source
    media="(min-width: 768px)"
    srcSet={`cloudinary-url/w_1024,h_400,c_fill/${publicId}`}
  />
  <img
    src={`cloudinary-url/w_768,h_300,c_fill/${publicId}`}
    alt="Hero"
    className="w-full h-auto"
  />
</picture>;
```

### Image Guidelines

| Image Type | Mobile Width | Tablet Width | Desktop Width |
| ---------- | ------------ | ------------ | ------------- |
| Hero       | 100%         | 100%         | 100%          |
| Thumbnail  | 80px         | 100px        | 120px         |
| Logo       | 32-40px      | 40-48px      | 48-56px       |
| Avatar     | 32px         | 40px         | 48px          |
| Card Image | 100%         | 100%         | 100%          |

### Lazy Loading

```tsx
// Always use lazy loading for below-fold images
<img
  src={imageUrl}
  alt={alt}
  loading="lazy"
  decoding="async"
  className="w-full h-auto"
/>

// For critical above-fold images, use eager loading
<img
  src={heroUrl}
  alt="Hero"
  loading="eager"
  className="w-full h-auto"
/>
```

### Aspect Ratio Maintenance

```tsx
// Use aspect-ratio for consistent image containers
<div className="aspect-video w-full overflow-hidden rounded-lg">
  <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
</div>

// Square thumbnails
<div className="aspect-square w-20 overflow-hidden rounded">
  <img src={thumbUrl} alt={alt} className="w-full h-full object-cover" />
</div>
```

---

## 30. Spacing System

### Spacing Scale (Tailwind Default)

| Class  | Value   | Usage           |
| ------ | ------- | --------------- |
| `p-1`  | 0.25rem | Tight spacing   |
| `p-2`  | 0.5rem  | Compact spacing |
| `p-3`  | 0.75rem | Default small   |
| `p-4`  | 1rem    | Default medium  |
| `p-6`  | 1.5rem  | Comfortable     |
| `p-8`  | 2rem    | Section padding |
| `p-12` | 3rem    | Large sections  |

### Responsive Spacing

```tsx
// Section padding
<section className="py-8 md:py-12 lg:py-16">
  {/* Content */}
</section>

// Container padding
<div className="px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>

// Card padding
<div className="p-4 md:p-6">
  {/* Card content */}
</div>
```

### Gap Guidelines

| Context       | Mobile | Tablet | Desktop |
| ------------- | ------ | ------ | ------- |
| Card grid     | gap-4  | gap-4  | gap-6   |
| Form fields   | gap-3  | gap-4  | gap-4   |
| Nav items     | gap-2  | gap-4  | gap-6   |
| Section stack | gap-6  | gap-8  | gap-12  |

### Margin Rules

- Use consistent vertical rhythm
- Section margins: `mb-8 md:mb-12 lg:mb-16`
- Element margins: `mb-4` for related items
- Avoid arbitrary margin values

---

## 31. Form UX Patterns

### Input Sizing

```tsx
// Touch-friendly inputs (minimum 44px height)
<input
  type="text"
  className="input input-bordered h-11 md:h-12"
  placeholder="Enter text"
/>

// Larger touch targets on mobile
<button className="btn btn-primary h-11 md:h-12 min-w-[44px]">
  Submit
</button>
```

### Form Layout Patterns

```tsx
// Mobile: Single column, Desktop: Multi-column
<form className="space-y-4">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="form-control">
      <label className="label">First Name</label>
      <input className="input input-bordered" />
    </div>
    <div className="form-control">
      <label className="label">Last Name</label>
      <input className="input input-bordered" />
    </div>
  </div>

  <div className="form-control">
    <label className="label">Email</label>
    <input type="email" className="input input-bordered" />
  </div>

  <div className="form-control">
    <label className="label">Message</label>
    <textarea className="textarea textarea-bordered" rows={4} />
  </div>

  <button className="btn btn-primary w-full md:w-auto">Submit</button>
</form>
```

### Error Message Positioning

```tsx
// Error below input, visible on all devices
<div className="form-control">
  <label className="label">
    <span className="label-text">Email</span>
  </label>
  <input className={`input input-bordered ${error ? "input-error" : ""}`} />
  {error && (
    <label className="label">
      <span className="label-text-alt text-error">{error}</span>
    </label>
  )}
</div>
```

### Button Placement

| Context        | Mobile           | Desktop                   |
| -------------- | ---------------- | ------------------------- |
| Form submit    | Full width       | Auto width, right-aligned |
| Dialog actions | Stack vertically | Horizontal, right-aligned |
| Card actions   | Full width       | Auto width                |

### Keyboard Navigation

- Tab order follows visual order
- Focus states visible on all interactive elements
- Enter key submits forms
- Escape key closes modals

---

## 32. Performance for Mobile

### Image Optimization

- Use WebP format with fallbacks
- Implement responsive images with srcset
- Lazy load below-fold images
- Use Cloudinary transformations

### Bundle Size Limits

| Resource Type | Max Size                 |
| ------------- | ------------------------ |
| Initial JS    | 200KB                    |
| Initial CSS   | 50KB                     |
| Per-route JS  | 100KB                    |
| Images        | Optimized via Cloudinary |

### Code Splitting

```tsx
// Lazy load routes
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Certificates = lazy(() => import("@/pages/Certificates"));
const Templates = lazy(() => import("@/pages/Templates"));

// Lazy load heavy components
const PDFPreview = lazy(() => import("@/components/PDFPreview"));
const CertificateEditor = lazy(() => import("@/components/CertificateEditor"));
```

### Loading States

```tsx
// Skeleton loading for content
<div className="skeleton h-32 w-full rounded-lg" />

// Spinner for actions
<button className="btn btn-primary">
  {isLoading ? <span className="loading loading-spinner" /> : 'Save'}
</button>

// Suspense fallback
<Suspense fallback={<div className="loading loading-spinner loading-lg" />}>
  <LazyComponent />
</Suspense>
```

### Network Considerations

- Assume slow 3G connection
- Minimize API calls
- Implement offline fallbacks
- Cache responses when appropriate

---

## 33. Testing Checklist

### Device Testing

| Device Type | Viewport | Priority |
| ----------- | -------- | -------- |
| Mobile S    | 320px    | High     |
| Mobile M    | 375px    | High     |
| Mobile L    | 425px    | High     |
| Tablet      | 768px    | High     |
| Laptop      | 1024px   | High     |
| Desktop     | 1280px   | Medium   |
| Large       | 1536px   | Low      |

### Browser Testing

| Browser | Version | Priority |
| ------- | ------- | -------- |
| Chrome  | Latest  | High     |
| Safari  | Latest  | High     |
| Firefox | Latest  | Medium   |
| Edge    | Latest  | Medium   |

### Testing Requirements

**Before Each Release:**

- [ ] Test on actual mobile device (not just browser resize)
- [ ] Test on actual tablet device
- [ ] Test touch interactions (tap, swipe, scroll)
- [ ] Test landscape orientation on mobile
- [ ] Test on slow 3G connection (Chrome DevTools)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Verify all touch targets are 44x44px minimum
- [ ] Check text readability at all sizes
- [ ] Verify no horizontal scroll on mobile

### Chrome DevTools Testing

```
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test responsive breakpoints
5. Enable network throttling (3G)
6. Check Lighthouse score
```

### Lighthouse Targets

| Metric         | Target |
| -------------- | ------ |
| Performance    | > 90   |
| Accessibility  | > 95   |
| Best Practices | > 90   |
| SEO            | > 90   |

---

## 34. Accessibility Form Elements (REQUIRED)

**Problem:** Form elements without labels cause accessibility errors in VS Code diagnostics.

**Solution - All form elements MUST have accessible names:**

### Select Elements

```tsx
// CORRECT - Both aria-label AND title required
<select
  aria-label="Provider"
  title="Provider"
  value={form.provider}
  onChange={handleChange}
>
  <option value="google_sheets">Google Sheets</option>
  <option value="canvas">Canvas</option>
</select>

// WRONG - Missing accessible name
<select value={form.provider} onChange={handleChange}>
```

### Checkbox/Toggle Inputs

```tsx
// CORRECT - aria-label required
<input
  type="checkbox"
  aria-label="Enable Google Sheets sync"
  checked={form.googleSheetsEnabled}
  onChange={handleChange}
/>

// WRONG - Missing aria-label
<input type="checkbox" checked={form.enabled} onChange={handleChange} />
```

### Required Attributes Summary

| Element Type | Required Attributes |
| ------------ | ------------------- |
| `<select>` | `aria-label` + `title` |
| `<input type="checkbox">` | `aria-label` |
| `<input type="radio">` | `aria-label` |
| `<input type="text">` | `placeholder` or wrapped `<label>` |

### Files to Check

- `src/pages/Integrations/Integrations.tsx` - Multiple form elements
- `src/pages/Settings/Settings.tsx` - Settings forms
- `src/components/` - Any component with form inputs

---

## 35. 502 Bad Gateway Troubleshooting

**Problem:** Frontend shows 502 Bad Gateway errors when making API calls.

**Root Cause:** Backend server is not running on port 3000.

**Solution:**

### Check Backend Status

```powershell
# Check if backend is running
Set-Location backend; npm run dev
```

### Expected Output

```
✅ MongoDB connected successfully
✅ Cloudinary configured
🚀 Server running on http://localhost:3000
```

### Common Issues

| Issue | Solution |
| ----- | -------- |
| Port 3000 in use | Kill existing process or change PORT in .env |
| MongoDB not running | Start MongoDB service |
| Missing .env | Copy .env.example to .env and fill values |

### When Making Frontend Changes

- Backend server MUST be running before testing frontend
- If 502 errors appear, check backend terminal first
- Do NOT modify frontend code when backend is down - errors are backend-related

---

## 36. Landing Page Dynamic Elements (DO NOT HARDCODE)

The following elements on public-facing pages must remain dynamic. Do NOT replace with hardcoded values:

### Home.tsx (Landing Page)

| Element | Location | Dynamic Implementation |
| ------- | -------- | ---------------------- |
| Certificate Preview Date | Carousel footer | `formatPreviewDate()` - `new Date().toLocaleDateString()` |
| Template Count | Stats section | API call to `/api/templates/count` |
| Social Proof Text | Hero section | "Join Early Adopters" (no badge) |

### About.tsx

| Element | Location | Dynamic Implementation |
| ------- | -------- | ---------------------- |
| "Since" Year | Hero section | `new Date().getFullYear()` |

### Privacy.tsx & Terms.tsx

| Element | Location | Dynamic Implementation |
| ------- | -------- | ---------------------- |
| Last Updated Date | Document header | `new Date().toLocaleDateString()` |

### Footer.tsx

| Element | Location | Dynamic Implementation |
| ------- | -------- | ---------------------- |
| Copyright Year | Footer bottom | `new Date().getFullYear()` |

### formatPreviewDate Function (Home.tsx)

```tsx
const formatPreviewDate = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
```

### Files to Check Before Committing

Run this grep to catch hardcoded dates:

```bash
grep -rn "202[4-9]" frontend/src/pages/ --include="*.tsx"
```

Exclude test files and sample/mock data (TemplateBuilder.tsx, *.test.tsx)
