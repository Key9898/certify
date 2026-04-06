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
- Always validate JWT tokens on backend
- Use Auth0's `getAccessTokenSilently()` for API calls
- Implement proper logout flow with Auth0 SDK

### Secrets Management

- **NEVER** commit secrets to repository
- **NEVER** log API keys, tokens, or passwords
- Use `.env` files for local development
- Use environment variables in production

### API Security

- Validate all user inputs on backend
- Use rate limiting on API endpoints
- Implement CORS properly
- Sanitize data before database operations

### Frontend Security

- Escape user-generated content
- Use React's built-in XSS protection
- Validate file uploads (type, size)
- Never expose sensitive data in client-side code

---

## 18. Error Handling

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

## 19. State Management

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

## 20. Performance

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

### Bundle Optimization

- Use dynamic imports for large libraries
- Split code by route
- Optimize images before upload
- Use Cloudinary for image optimization

### Performance Checklist

- [ ] Lazy load routes
- [ ] Memoize expensive computations
- [ ] Optimize re-renders
- [ ] Use proper key props in lists
- [ ] Debounce search inputs

---

## 21. Accessibility (a11y)

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

## 22. Responsive Design

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

## 23. File Upload

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

## 24. PDF Generation

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
