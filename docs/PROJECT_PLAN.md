# Certify - Certificate Generator Web App

## Project Overview

**Certify** is a web application for generating professional certificates. It supports single certificate creation, batch generation from CSV/Excel data, and API integration for third-party platforms.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Feature List](#3-feature-list)
4. [MVP Features](#4-mvp-features)
5. [Phase Breakdown](#5-phase-breakdown)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [User Flow](#8-user-flow)
9. [Deployment](#9-deployment)
10. [Timeline](#10-timeline)

---

## 1. Tech Stack

### Frontend

| Technology    | Purpose           |
| ------------- | ----------------- |
| React         | UI Framework      |
| TypeScript    | Type Safety       |
| Vite          | Build Tool        |
| Tailwind v4   | CSS Framework     |
| DaisyUI       | UI Components     |
| Fetch API     | API Communication |
| React Router  | Routing           |
| Auth0 SDK     | Authentication    |
| Lucide React  | Icons             |
| Framer Motion | Animations        |

#### Bundle Optimization

Heavy libraries are lazy-loaded to keep initial bundle size under 500kB:

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
const UsageChart = React.lazy(() => import('./UsageChart'));

<Suspense fallback={<LoadingSpinner />}>
  <OverviewChart data={data} />
</Suspense>;
```

### Backend

| Technology | Purpose        |
| ---------- | -------------- |
| Node.js    | Runtime        |
| Express    | Web Framework  |
| TypeScript | Type Safety    |
| Mongoose   | MongoDB ODM    |
| Puppeteer  | PDF Generation |
| Auth0      | Authentication |
| Cloudinary | File Storage   |

#### PDF Generation

PDF certificates are generated server-side using Puppeteer with the following features:

| Feature       | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| QR Code       | Auto-generated using `qrcode` library, embedded in PDF       |
| certificateId | Auto-generated using `nanoid(12).toUpperCase()` on creation  |
| Verify URL    | QR code points to `/verify/{certificateId}` for verification |

**Template Placeholders:**

| Placeholder         | Description                            |
| ------------------- | -------------------------------------- |
| `{{certificateId}}` | Unique certificate ID for verification |
| `{{verifyQR}}`      | QR code image (base64 data URL)        |

**QR Code Configuration:**

```typescript
{
  width: 150,
  margin: 1,
  color: { dark: '#1a1a1a', light: '#ffffff' },
  errorCorrectionLevel: 'M'
}
```

### Database

| Technology    | Purpose                    |
| ------------- | -------------------------- |
| MongoDB       | Database                   |
| MongoDB Atlas | Cloud Hosting (Production) |

### Development Tools

| Technology  | Purpose               |
| ----------- | --------------------- |
| Vitest      | Unit Testing          |
| Storybook   | Component Development |
| Prettier    | Code Formatting       |
| ESLint      | Code Linting          |
| Husky       | Git Hooks             |
| lint-staged | Pre-commit Linting    |
| TypeScript  | Type Safety           |

### Deployment

| Environment         | Platform      |
| ------------------- | ------------- |
| Development         | Local Machine |
| Production Frontend | Vercel        |
| Production Backend  | Render        |
| Database            | MongoDB Atlas |

### Cost

| Service       | Cost               |
| ------------- | ------------------ |
| Vercel        | Free               |
| Render        | Free               |
| MongoDB Atlas | Free (512MB)       |
| Auth0         | Free (7,000 users) |
| Cloudinary    | Free (25GB)        |
| **Total**     | **$0/month**       |

### Development Configuration

#### Prettier (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

#### ESLint (`eslint.config.js`)

- Flat config format (ESLint 9+)
- TypeScript support
- React Hooks rules
- React Refresh rules
- Prettier integration
- Storybook rules

#### Storybook

- Component-driven development
- Create `.stories.tsx` alongside components
- Located in `frontend/src/components/**/`
- Run: `npm run storybook`
- Build: `npm run build-storybook` (devDependencies, excluded from production)

#### Git Hooks (Husky + lint-staged)

```json
{
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx}": ["npm run prettier", "eslint --fix"],
    "**/*.{json,css,md}": ["npm run prettier"]
  }
}
```

---

## 2. Project Structure

```
certify/
├── frontend/                              # React + Vite App
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── assets/                        # Static assets
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/                    # Modular Components
│   │   │   │
│   │   │   ├── common/                    # Common UI Components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.types.ts
│   │   │   │   │   ├── Button.stories.tsx # Storybook
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Input/
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Input.types.ts
│   │   │   │   │   ├── Input.stories.tsx  # Storybook
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Modal/
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Modal.types.ts
│   │   │   │   │   ├── Modal.stories.tsx  # Storybook
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Loading/
│   │   │   │   │   ├── Loading.tsx
│   │   │   │   │   ├── Loading.types.ts
│   │   │   │   │   ├── Loading.stories.tsx # Storybook
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Card/
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Card.types.ts
│   │   │   │   │   ├── Card.stories.tsx   # Storybook
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Dropdown/
│   │   │   │   │   ├── Dropdown.tsx
│   │   │   │   │   ├── Dropdown.types.ts
│   │   │   │   │   ├── Dropdown.stories.tsx # Storybook
│   │   │   │   │   └── index.ts
│   │   │   │   ├── FileUpload/
│   │   │   │   │   ├── FileUpload.tsx
│   │   │   │   │   ├── FileUpload.types.ts
│   │   │   │   │   ├── FileUpload.stories.tsx # Storybook
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── layout/                    # Layout Components
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Header.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Sidebar/
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Sidebar.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Footer/
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── Footer.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── MainLayout/
│   │   │   │   │   ├── MainLayout.tsx
│   │   │   │   │   ├── MainLayout.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── certificate/               # Certificate Components
│   │   │   │   ├── CertificatePreview/
│   │   │   │   │   ├── CertificatePreview.tsx
│   │   │   │   │   ├── CertificatePreview.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── CertificateEditor/
│   │   │   │   │   ├── CertificateEditor.tsx
│   │   │   │   │   ├── CertificateEditor.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── CertificateCard/
│   │   │   │   │   ├── CertificateCard.tsx
│   │   │   │   │   ├── CertificateCard.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── CertificateList/
│   │   │   │   │   ├── CertificateList.tsx
│   │   │   │   │   ├── CertificateList.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── CertificateForm/
│   │   │   │   │   ├── CertificateForm.tsx
│   │   │   │   │   ├── CertificateForm.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── template/                  # Template Components
│   │   │   │   ├── TemplateCard/
│   │   │   │   │   ├── TemplateCard.tsx
│   │   │   │   │   ├── TemplateCard.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── TemplateGallery/
│   │   │   │   │   ├── TemplateGallery.tsx
│   │   │   │   │   ├── TemplateGallery.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── TemplatePreview/
│   │   │   │   │   ├── TemplatePreview.tsx
│   │   │   │   │   ├── TemplatePreview.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── auth/                      # Auth Components
│   │   │   │   ├── LoginButton/
│   │   │   │   │   ├── LoginButton.tsx
│   │   │   │   │   ├── LoginButton.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── LogoutButton/
│   │   │   │   │   ├── LogoutButton.tsx
│   │   │   │   │   ├── LogoutButton.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── UserProfile/
│   │   │   │   │   ├── UserProfile.tsx
│   │   │   │   │   ├── UserProfile.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── batch/                     # Batch Components (Phase 2)
│   │   │       ├── BatchUpload/
│   │   │       │   ├── BatchUpload.tsx
│   │   │       │   ├── BatchUpload.types.ts
│   │   │       │   └── index.ts
│   │   │       ├── BatchProgress/
│   │   │       │   ├── BatchProgress.tsx
│   │   │       │   ├── BatchProgress.types.ts
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── hooks/                         # Custom Hooks (Smart Logic)
│   │   │   ├── useAuth.ts                 # Authentication logic
│   │   │   ├── useModal.ts                # Modal state management
│   │   │   ├── useCertificates.ts         # Certificate CRUD operations
│   │   │   ├── useTemplates.ts            # Template operations
│   │   │   ├── useCloudinary.ts           # File upload logic
│   │   │   ├── usePdf.ts                  # PDF generation
│   │   │   ├── useBatchImport.ts          # CSV import logic (Phase 2)
│   │   │   ├── useDebounce.ts             # Debounce utility
│   │   │   ├── useLocalStorage.ts         # Local storage
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                         # Utility Functions & API
│   │   │   ├── api.ts                     # Base API configuration
│   │   │   ├── certificateApi.ts          # Certificate API calls
│   │   │   ├── templateApi.ts             # Template API calls
│   │   │   ├── authApi.ts                 # Auth API calls
│   │   │   ├── batchApi.ts                # Batch API calls (Phase 2)
│   │   │   ├── formatters.ts              # Date, text formatters
│   │   │   ├── validators.ts              # Form validators
│   │   │   ├── constants.ts               # App constants
│   │   │   ├── csvParser.ts               # CSV parsing (Phase 2)
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                         # Global TypeScript Types
│   │   │   ├── certificate.ts             # Certificate types
│   │   │   ├── template.ts                # Template types
│   │   │   ├── user.ts                    # User types
│   │   │   ├── api.ts                     # API response types
│   │   │   ├── batch.ts                   # Batch types (Phase 2)
│   │   │   └── index.ts
│   │   │
│   │   ├── context/                       # React Context
│   │   │   ├── AuthContext.tsx            # Auth state provider
│   │   │   ├── ThemeContext.tsx           # Theme provider
│   │   │   └── index.ts
│   │   │
│   │   ├── pages/                         # Page Components
│   │   │   ├── Home/
│   │   │   │   ├── Home.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Templates/
│   │   │   │   ├── Templates.tsx
│   │   │   │   └── index.ts
│   │   │   ├── CreateCertificate/
│   │   │   │   ├── CreateCertificate.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Certificates/
│   │   │   │   ├── Certificates.tsx
│   │   │   │   └── index.ts
│   │   │   ├── BatchGenerate/             # Phase 2
│   │   │   │   ├── BatchGenerate.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Settings/
│   │   │   │   ├── Settings.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── demo/                          # Demo/Mock Data
│   │   │   ├── mocks/
│   │   │   │   ├── certificates.ts        # Mock certificates
│   │   │   │   ├── templates.ts           # Mock templates
│   │   │   │   ├── users.ts               # Mock users
│   │   │   │   └── batchData.ts           # Mock batch data
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── .env.local
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── index.html
│
├── backend/                               # Express + TypeScript API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts                # MongoDB connection
│   │   │   ├── cloudinary.ts              # Cloudinary config
│   │   │   ├── auth0.ts                   # Auth0 config
│   │   │   └── index.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── certificateController.ts   # Certificate endpoints
│   │   │   ├── templateController.ts      # Template endpoints
│   │   │   ├── userController.ts          # User endpoints
│   │   │   ├── authController.ts          # Auth endpoints
│   │   │   ├── batchController.ts         # Batch endpoints (Phase 2)
│   │   │   └── index.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT verification
│   │   │   ├── errorHandler.ts            # Error handling
│   │   │   ├── validate.ts                # Request validation
│   │   │   ├── upload.ts                  # File upload middleware
│   │   │   ├── rateLimiter.ts             # Rate limiting
│   │   │   └── index.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts                    # User schema
│   │   │   ├── Template.ts                # Template schema
│   │   │   ├── Certificate.ts             # Certificate schema
│   │   │   ├── BatchJob.ts                # BatchJob schema (Phase 2)
│   │   │   └── index.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── certificateRoutes.ts       # Certificate routes
│   │   │   ├── templateRoutes.ts          # Template routes
│   │   │   ├── userRoutes.ts              # User routes
│   │   │   ├── authRoutes.ts              # Auth routes
│   │   │   ├── batchRoutes.ts             # Batch routes (Phase 2)
│   │   │   └── index.ts
│   │   │
│   │   ├── services/
│   │   │   ├── certificateService.ts      # Certificate business logic
│   │   │   ├── templateService.ts         # Template business logic
│   │   │   ├── pdfService.ts              # Puppeteer PDF generation
│   │   │   ├── cloudinaryService.ts       # Cloudinary operations
│   │   │   ├── emailService.ts            # Email sending (Phase 2)
│   │   │   ├── batchService.ts            # Batch processing (Phase 2)
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.ts                 # Helper functions
│   │   │   ├── constants.ts               # App constants
│   │   │   ├── csvParser.ts               # CSV parsing (Phase 2)
│   │   │   └── index.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript types
│   │   │
│   │   └── app.ts                         # Express app setup
│   │
│   ├── templates/                         # HTML Templates for PDF
│   │   ├── certificate-base.html          # Base certificate template
│   │   ├── certificate-modern.html        # Modern style template
│   │   ├── certificate-classic.html       # Classic style template
│   │   └── styles/
│   │       └── certificate.css            # Certificate styles
│   │
│   ├── uploads/                           # Temporary uploads
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

---

## 3. Feature List

### All Features by Phase

| #   | Feature                  | Phase   | Priority |
| --- | ------------------------ | ------- | -------- |
| 1   | Authentication (Auth0)   | MVP     | High     |
| 2   | Template Gallery         | MVP     | High     |
| 3   | Certificate Editor       | MVP     | High     |
| 4   | Real-time Preview        | MVP     | High     |
| 5   | PDF Generation (Single)  | MVP     | High     |
| 6   | Certificate List         | MVP     | High     |
| 7   | Custom Branding          | MVP     | Medium   |
| 8   | Search & Filter          | MVP     | Medium   |
| 9   | User Dashboard           | MVP     | Medium   |
| 10  | Excel/CSV Import         | Phase 2 | High     |
| 11  | Batch Generation (100+)  | Phase 2 | High     |
| 12  | Progress Tracking        | Phase 2 | Medium   |
| 13  | Email Delivery           | Phase 2 | Medium   |
| 14  | Custom Template Builder  | Phase 2 | Medium   |
| 15  | Template Categories      | Phase 2 | Low      |
| 16  | Certificate Verification | MVP     | High     |
| 17  | PNG Download             | Phase 2 | Low      |
| 18  | Usage Stats              | Phase 1 | Medium   |
| 19  | Stripe Integration       | Phase 2 | High     |
| 20  | Subscription Plans       | Phase 2 | High     |
| 21  | Usage Limits & Quotas    | Phase 2 | High     |
| 22  | Quota Enforcement        | Phase 2 | High     |
| 23  | Invoice Generation       | Phase 2 | Medium   |
| 24  | Public REST API          | Phase 3 | High     |
| 25  | API Documentation        | Phase 3 | High     |
| 26  | Webhooks                 | Phase 3 | Medium   |
| 27  | Third-party Integrations | Phase 3 | Medium   |
| 28  | Advanced Analytics       | Phase 3 | Low      |
| 29  | Team Collaboration       | Phase 3 | Medium   |
| 30  | White Label              | Phase 3 | Low      |

---

## 4. MVP Features

### What Users Can Do in MVP

| Action                | Description                                      |
| --------------------- | ------------------------------------------------ |
| Login/Signup          | Email/Password or Social login via Auth0         |
| View Dashboard        | See statistics and quick actions                 |
| Browse Templates      | Select from pre-built certificate templates      |
| Create Certificate    | Fill in certificate details via form             |
| Upload Logo           | Add organization logo                            |
| Upload Signature      | Add issuer signature                             |
| Customize Colors      | Change template colors                           |
| Real-time Preview     | See changes instantly                            |
| Download PDF          | High-quality PDF download                        |
| View All Certificates | List of all generated certificates               |
| Search Certificates   | Find by name, date, etc.                         |
| Re-download PDF       | Download previously generated certificates       |
| Delete Certificate    | Remove unwanted certificates                     |
| Edit Profile          | Update user information                          |
| Verify Certificates   | Public portal for instant certificate validation |

### What Users Cannot Do in MVP

| Action                  | Available In |
| ----------------------- | ------------ |
| Batch Generation        | Phase 2      |
| CSV Import              | Phase 2      |
| Email Delivery          | Phase 2      |
| Custom Template Builder | Phase 2      |
| PNG Download            | Phase 2      |

| API Access | Phase 3 |
| Team Collaboration | Phase 3 |
| Analytics | Phase 3 |

---

## 5. Phase Breakdown

### Phase 1: MVP (Foundation)

**Duration:** 4-6 weeks

**Features:**

- Authentication (Auth0)
- Template Gallery (5-10 pre-built templates)
- Certificate Editor (Form-based)
- Real-time Preview
- PDF Generation (Single certificate)
- Certificate List
- Custom Branding (Logo, Colors)
- Search & Filter
- User Dashboard
- Certificate Verification (Public verify page, revoke endpoint)

**Target Users:**

- Individuals needing one-time certificates
- Non-technical users
- Small organizations

**Complexity:** Manageable

---

### Phase 2: Batch & Billing

**Duration:** 4-6 weeks

**Features:**

- Excel/CSV Import
- Batch Generation (100+ certificates)
- Progress Tracking
- Email Delivery
- Custom Template Builder
- Template Categories
- PNG Download
- **Billing & Monetization**
  - Stripe Integration
  - Subscription Plans (Free, Pro, Enterprise)
  - Usage Limits & Quotas
  - Quota Enforcement
  - Invoice Generation

**Target Users:**

- Online Course Platforms
- Corporate Training
- Events/Seminars
- Schools/Universities

**Complexity:** Moderate

**Subscription Plans:**

| Plan       | Price  | Certificates/Month | Storage | Batch Jobs | Features                                  |
| ---------- | ------ | ------------------ | ------- | ---------- | ----------------------------------------- |
| Free       | $0     | 100                | 1 GB    | 5          | Basic templates, Single generation        |
| Pro        | $29/mo | 1,000              | 5 GB    | 50         | All templates, Batch, Email delivery      |
| Enterprise | $99/mo | Unlimited          | 50 GB   | Unlimited  | API access, White label, Priority support |

---

### Phase 3: API & Integration

**Duration:** 4-6 weeks

**Features:**

- Public REST API
- API Documentation (Swagger)
- Webhooks
- Third-party Integrations
- Advanced Analytics
- Team Collaboration
- White Label

**Target Users:**

- Developers
- Platform integrators
- Enterprise clients

**Complexity:** Advanced

---

## 6. Database Schema

### User Model

```typescript
interface User {
  _id: ObjectId;
  auth0Id: string; // Auth0 user ID
  email: string; // User email
  name: string; // Full name
  avatar?: string; // Profile picture URL
  role: "admin" | "user"; // User role
  organizationId?: ObjectId; // Workspace / organization reference
  organizationRole?: "owner" | "admin" | "member"; // Workspace role
  settings: {
    defaultLogo?: string; // Default organization logo
    defaultColors: {
      primary: string; // Primary color (hex)
      secondary: string; // Secondary color (hex)
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Organization Model (Phase 3)

```typescript
interface Organization {
  _id: ObjectId;
  name: string; // Workspace / company name
  slug: string; // URL-safe identifier
  owner: ObjectId; // Owner user
  whiteLabel: {
    brandName?: string; // Public-facing brand label
    logoUrl?: string; // Workspace logo
    primaryColor: string; // Brand primary color
    secondaryColor: string; // Brand secondary color
    supportEmail?: string; // Verification/support contact
    customDomain?: string; // Reserved for custom domain support
    hidePoweredBy: boolean; // Hide "Powered by Certify" in public verify UI
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### TeamInvitation Model (Phase 3)

```typescript
interface TeamInvitation {
  _id: ObjectId;
  organizationId: ObjectId; // Target workspace
  email: string; // Invitee email
  role: "admin" | "member"; // Assigned workspace role
  status: "pending" | "accepted" | "cancelled" | "expired";
  invitedBy: ObjectId; // Inviting user
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Integration Model (Phase 3)

```typescript
interface Integration {
  _id: ObjectId;
  organizationId: ObjectId; // Workspace that owns the integration
  createdBy: ObjectId; // User who configured it
  name: string; // Human-readable integration name
  provider:
    | "zapier"
    | "make"
    | "google_sheets"
    | "moodle"
    | "canvas"
    | "custom";
  status: "active" | "paused";
  mode: "single" | "batch";
  templateId: ObjectId; // Default certificate template
  webhookKey: string; // Public inbound webhook token
  defaults: {
    certificateTitle?: string;
    description?: string;
    issuerName?: string;
    issuerSignature?: string;
    organizationLogo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  settings: {
    autoGeneratePdf: boolean;
  };
  stats: {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    lastTriggeredAt?: Date;
    lastSuccessfulRunAt?: Date;
    lastTestedAt?: Date;
    lastError?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Template Model

```typescript
interface Template {
  _id: ObjectId;
  name: string; // Template name
  description: string; // Template description
  category: "academic" | "corporate" | "event" | "general";
  thumbnail: string; // Preview image URL
  htmlContent: string; // HTML template content
  styles: string; // CSS styles
  fields: TemplateField[]; // Customizable fields
  isPublic: boolean; // Public or private
  createdBy: ObjectId; // User who created
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateField {
  name: string; // Field identifier
  label: string; // Display label
  type: "text" | "date" | "image";
  required: boolean;
  defaultValue?: string;
  position: {
    x: number;
    y: number;
  };
}
```

**Available Template Placeholders:**

| Placeholder            | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `{{recipientName}}`    | Certificate recipient name                       |
| `{{certificateTitle}}` | Certificate title                                |
| `{{issueDate}}`        | Issue date                                       |
| `{{expiryDate}}`       | Expiry date (optional)                           |
| `{{issuerName}}`       | Issuer name                                      |
| `{{issuerSignature}}`  | Signature image URL                              |
| `{{organizationLogo}}` | Organization logo URL                            |
| `{{certificateId}}`    | Auto-generated unique ID for verification        |
| `{{verifyQR}}`         | QR code image (base64 data URL) for verification |

### Certificate Model

```typescript
interface Certificate {
  _id: ObjectId;
  templateId: ObjectId; // Reference to template
  recipientName: string; // Certificate recipient
  recipientEmail?: string; // Recipient email
  certificateTitle: string; // Certificate title
  description?: string; // Certificate description
  issueDate: Date; // Issue date
  expiryDate?: Date; // Expiry date (optional)
  issuerName: string; // Issuer name
  issuerSignature?: string; // Signature image URL
  organizationLogo?: string; // Logo image URL
  customFields?: Record<string, any>; // Additional fields
  pdfUrl?: string; // Generated PDF URL
  certificateId: string; // Auto-generated unique ID using nanoid(12).toUpperCase()
  status: "active" | "revoked"; // Certificate status for verification
  revokedAt?: Date; // Revocation timestamp
  revokedBy?: ObjectId; // User who revoked
  revokeReason?: string; // Reason for revocation
  createdBy: ObjectId; // User who created
  createdAt: Date;
  updatedAt: Date;
}
```

### BatchJob Model (Phase 2)

```typescript
interface BatchJob {
  _id: ObjectId;
  templateId: ObjectId; // Template to use
  status: "pending" | "processing" | "completed" | "failed";
  totalCertificates: number; // Total to generate
  processedCertificates: number; // Processed count
  data: Record<string, any>[]; // CSV data
  results: BatchResult[]; // Generation results
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface BatchResult {
  recipientName: string;
  status: "success" | "failed";
  certificateId?: ObjectId;
  error?: string;
}
```

### Subscription Model (Phase 2)

```typescript
interface Subscription {
  _id: ObjectId;
  organizationId: ObjectId; // Workspace reference
  plan: "free" | "pro" | "enterprise"; // Subscription tier
  stripeCustomerId?: string; // Stripe customer ID
  stripeSubscriptionId?: string; // Stripe subscription ID
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  limits: {
    certificatesPerMonth: number; // Monthly certificate limit
    storageBytes: number; // Storage limit in bytes
    batchJobsPerMonth: number; // Batch job limit
  };
  usage: {
    certificatesThisMonth: number;
    storageUsedBytes: number;
    batchJobsThisMonth: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 7. API Endpoints

### Authentication

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| GET    | `/api/auth/me`   | Get current user        |
| POST   | `/api/auth/sync` | Sync Auth0 user with DB |

### Users & Workspace

| Method | Endpoint                          | Description                                |
| ------ | --------------------------------- | ------------------------------------------ |
| PATCH  | `/api/users/settings`             | Update user defaults and white-label brand |
| GET    | `/api/users/team`                 | Get workspace members and invitations      |
| POST   | `/api/users/team/invitations`     | Invite a teammate to workspace             |
| PATCH  | `/api/users/team/members/:userId` | Change a teammate role                     |
| DELETE | `/api/users/team/members/:userId` | Remove a teammate from workspace           |
| DELETE | `/api/users/team/invitations/:id` | Cancel a pending invitation                |

### Templates

| Method | Endpoint             | Description                                 |
| ------ | -------------------- | ------------------------------------------- |
| GET    | `/api/templates`     | List public and workspace-visible templates |
| GET    | `/api/templates/:id` | Get template by ID                          |
| POST   | `/api/templates`     | Create template                             |
| PUT    | `/api/templates/:id` | Update workspace-owned template             |
| DELETE | `/api/templates/:id` | Delete workspace-owned template             |

### Certificates

| Method | Endpoint                             | Description                                 |
| ------ | ------------------------------------ | ------------------------------------------- |
| GET    | `/api/certificates`                  | List workspace certificates                 |
| GET    | `/api/certificates/:id`              | Get certificate by ID                       |
| POST   | `/api/certificates`                  | Create certificate                          |
| POST   | `/api/certificates/generate-pdf/:id` | Generate PDF                                |
| POST   | `/api/certificates/generate-png/:id` | Generate PNG                                |
| PATCH  | `/api/certificates/:id/revoke`       | Revoke certificate (sets status to revoked) |
| DELETE | `/api/certificates/:id`              | Delete creator or admin-owned cert          |

### Batch (Phase 2)

| Method | Endpoint                      | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| POST   | `/api/batch/upload`           | Upload CSV file                    |
| POST   | `/api/batch/generate`         | Start batch generation             |
| GET    | `/api/batch/:id/status`       | Get batch status                   |
| GET    | `/api/batch/:id/download-zip` | Download all generated PDFs as ZIP |

### Billing (Phase 2)

| Method | Endpoint                    | Description                           |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/api/billing/subscription` | Get current subscription details      |
| POST   | `/api/billing/checkout`     | Create Stripe checkout session        |
| POST   | `/api/billing/portal`       | Create Stripe customer portal session |
| POST   | `/api/billing/webhook`      | Stripe webhook handler                |
| GET    | `/api/billing/plans`        | List available subscription plans     |
| GET    | `/api/billing/usage`        | Get current usage vs limits           |

### Upload

| Method | Endpoint                | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| GET    | `/api/upload/signature` | Get signed Cloudinary upload parameters |

### Public Verification

| Method | Endpoint                     | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| GET    | `/api/verify/:certificateId` | Public certificate verification |

**Rate Limiting:** 30 requests per 15 minutes per IP address (verifyLimiter)

### Analytics (Phase 3)

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| GET    | `/api/analytics` | Workspace analytics summary |

### API Keys (Phase 3)

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| GET    | `/api/keys`     | List masked API keys |
| POST   | `/api/keys`     | Create API key       |
| DELETE | `/api/keys/:id` | Revoke API key       |

### Webhooks (Phase 3)

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/api/webhooks`     | List configured webhooks |
| POST   | `/api/webhooks`     | Create webhook           |
| DELETE | `/api/webhooks/:id` | Delete webhook           |

### Third-party Integrations (Phase 3)

| Method | Endpoint                              | Description                           |
| ------ | ------------------------------------- | ------------------------------------- |
| GET    | `/api/integrations/catalog`           | List supported integration providers  |
| GET    | `/api/integrations`                   | List workspace integrations           |
| POST   | `/api/integrations`                   | Create integration                    |
| PATCH  | `/api/integrations/:id`               | Update integration                    |
| POST   | `/api/integrations/:id/test`          | Generate sample payload and curl test |
| DELETE | `/api/integrations/:id`               | Delete integration                    |
| GET    | `/api/integrations/hooks/:webhookKey` | Inspect public webhook contract       |
| POST   | `/api/integrations/hooks/:webhookKey` | Receive external certificate request  |

Integration Hub UX should also provide:

- Google Sheets and Canvas as first-class onboarding paths, with Custom Webhook positioned as the advanced fallback
- Provider-specific setup guides with field mapping expectations and rollout QA checks
- Sample launch-kit recipes and template recommendations that prefill the integration setup flow
- Native Google Sheets write-back using spreadsheet context, row numbers, and backend-managed service-account credentials
- Native Canvas callbacks that can post certificate links back into assignment submission comments after issuance

### Public REST API (Phase 3)

| Method | Endpoint                                | Description                          |
| ------ | --------------------------------------- | ------------------------------------ |
| GET    | `/api/v1/certificates`                  | List certificates via API key        |
| GET    | `/api/v1/certificates/:id`              | Get certificate via API key          |
| POST   | `/api/v1/certificates`                  | Create certificate via API key       |
| POST   | `/api/v1/certificates/:id/generate-pdf` | Generate certificate PDF via API key |
| GET    | `/api/v1/templates`                     | List public templates via API key    |

---

## 8. User Flow

### MVP User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP USER JOURNEY                          │
│                                                             │
│  1. Landing Page                                            │
│     └── View features, pricing, etc.                        │
│           │                                                 │
│           ▼                                                 │
│  2. Login/Signup                                            │
│     └── Auth0 authentication                                │
│           │                                                 │
│           ▼                                                 │
│  3. Dashboard                                               │
│     └── View statistics, quick actions                     │
│           │                                                 │
│           ▼                                                 │
│  4. Templates                                               │
│     └── Browse & select template                           │
│           │                                                 │
│           ▼                                                 │
│  5. Create Certificate                                      │
│     ├── Fill form (name, title, date, etc.)                │
│     ├── Upload logo & signature                            │
│     ├── Customize colors                                   │
│     └── Real-time preview                                  │
│           │                                                 │
│           ▼                                                 │
│  6. Generate & Download                                     │
│     └── Download PDF                                        │
│           │                                                 │
│           ▼                                                 │
│  7. Certificates                                            │
│     ├── View all certificates                              │
│     ├── Search & filter                                    │
│     ├── Re-download PDF                                    │
│     └── Delete certificate                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2 User Journey (Batch)

```
┌─────────────────────────────────────────────────────────────┐
│                   BATCH USER JOURNEY                         │
│                                                             │
│  1. Prepare Data                                            │
│     └── Create CSV/Excel file with recipient data          │
│           │                                                 │
│           ▼                                                 │
│  2. Upload CSV                                              │
│     └── Upload file to system                              │
│           │                                                 │
│           ▼                                                 │
│  3. Preview Data                                            │
│     └── Review imported data                               │
│           │                                                 │
│           ▼                                                 │
│  4. Select Template                                         │
│     └── Choose certificate template                        │
│           │                                                 │
│           ▼                                                 │
│  5. Start Generation                                        │
│     └── Begin batch process                                │
│           │                                                 │
│           ▼                                                 │
│  6. Monitor Progress                                        │
│     └── Track generation status                            │
│           │                                                 │
│           ▼                                                 │
│  7. Download All                                            │
│     └── Download all certificates as ZIP                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Deployment

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT SETUP                         │
│                                                             │
│  Frontend (localhost:5173)                                  │
│  └── Vite Dev Server                                        │
│                                                             │
│  Backend (localhost:3000)                                   │
│  └── Express Server                                         │
│                                                             │
│  Database                                                   │
│  └── MongoDB Local or Atlas (Free)                         │
│                                                             │
│  Services                                                   │
│  ├── Auth0 (Cloud)                                          │
│  └── Cloudinary (Cloud)                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
│                                                             │
│  Frontend                                                   │
│  └── Vercel (certify.vercel.app)                           │
│                                                             │
│  Backend                                                    │
│  └── Render (certify-api.onrender.com)                     │
│                                                             │
│  Database                                                   │
│  └── MongoDB Atlas (Free - 512MB)                          │
│                                                             │
│  Services                                                   │
│  ├── Auth0 (Free - 7,000 users)                            │
│  └── Cloudinary (Free - 25GB storage)                      │
│                                                             │
│  Cost: $0/month                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

When native provider sync is enabled in production, the backend environment must also provide:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `CANVAS_API_TOKEN`

---

## 10. Timeline

### Overall Timeline

| Phase         | Duration        | Features        |
| ------------- | --------------- | --------------- |
| Phase 1 (MVP) | 4-6 weeks       | 9 features      |
| Phase 2       | 4-6 weeks       | 8 features      |
| Phase 3       | 4-6 weeks       | 7 features      |
| **Total**     | **12-18 weeks** | **24 features** |

### Phase 1 (MVP) Breakdown

| Week     | Tasks                                          |
| -------- | ---------------------------------------------- |
| Week 1-2 | Project setup, Authentication, Database models |
| Week 2-3 | Template system, Certificate editor            |
| Week 3-4 | PDF generation, Preview system                 |
| Week 4-5 | Certificate list, Search & Filter              |
| Week 5-6 | Dashboard, Testing, Deployment                 |

---

## 11. Future Roadmap

### Optional Canva Connect Add-on

Direct Canva Connect import/export should stay a future convenience integration, not a core dependency.

- Requires OAuth token exchange and refresh on the backend
- Requires MFA for integration setup in Canva Developer Portal
- Public use may require Canva review/approval, while private/team-only flows can be constrained by higher-tier Canva plans
- Canva Autofill is not a reliable baseline for all users, so it should not gate the main certificate workflow

### Core Template Workflow (Recommended Baseline)

Certify should treat imported background templates as the default market-wide reliable workflow:

1. User designs a certificate in Canva or any external design tool
2. User exports the artwork as a landscape PNG in A4 ratio
3. User imports that PNG into Certify Template Builder
4. User places dynamic fields such as recipient name, title, dates, issuer, logo, signature, and certificate ID
5. User uploads CSV/XLSX data and batch-generates PDF certificates from the saved template

This keeps the main product reliable even without any direct Canva API dependency.

---

## Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    CERTIFY - SUMMARY                         │
│                                                             │
│  PROJECT NAME: Certify                                      │
│                                                             │
│  TECH STACK:                                                │
│  ├── Frontend: React + TypeScript + Vite + Tailwind +      │
│  │              DaisyUI + Fetch API + React Router +       │
│  │              Auth0 SDK + Lucide React + Framer Motion   │
│  ├── Backend: Node.js + Express + TypeScript + Mongoose    │
│  ├── PDF: Puppeteer                                         │
│  ├── Auth: Auth0                                            │
│  └── Storage: Cloudinary                                    │
│                                                             │
│  DEPLOYMENT:                                                │
│  ├── Development: Local Machine                             │
│  └── Production: Vercel + Render + MongoDB Atlas            │
│                                                             │
│  COST: $0/month (Free Tiers)                                │
│                                                             │
│  PHASES:                                                    │
│  ├── Phase 1 (MVP): 9 features - 4-6 weeks                 │
│  ├── Phase 2: 8 features - 4-6 weeks                       │
│  └── Phase 3: 7 features - 4-6 weeks                       │
│                                                             │
│  TOTAL: 24 features - 12-18 weeks                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

 
 - - - 
 
 # #   1 1 .   D e s i g n   S y s t e m   &   U X 
 
 # # #   D e s i g n   L a n g u a g e 
 * * C e r t i f y * *   u s e s   a   * * P r e m i u m   H i g h - F i d e l i t y   C o r p o r a t e * *   d e s i g n   l a n g u a g e : 
 -   * * G l a s s m o r p h i s m * * :   C a r d s   a n d   p a n e l s   u s e   \  a c k d r o p - b l u r - x l \   w i t h   s e m i - t r a n s p a r e n t   b a c k g r o u n d s   f o r   d e p t h . 
 -   * * G l o w   P o i n t s * * :   A m b i e n t   a n i m a t e d   g l o w s   p r o v i d e   a   d y n a m i c   b a c k d r o p   t o   m e t r i c s   a n d   s t a t s . 
 -   * * C o r p o r a t e   T y p o g r a p h y * * :   H e a v y   b l a c k   w e i g h t s ,   i n c r e a s e d   l e t t e r   s p a c i n g   ( t r a c k i n g ) ,   a n d   u p p e r c a s e   l a b e l s   f o r   a   c l e a n ,   f o r m a l   h i e r a r c h y . 
 -   * * S t a g g e r e d   M o t i o n * * :   A l l   e n t r y   v i e w s   u s e   s t a g g e r e d   r e v e a l   a n i m a t i o n s   t o   d i r e c t   u s e r   a t t e n t i o n   a n d   i m p r o v e   p e r c e i v e d   p e r f o r m a n c e . 
 
 # # #   I n t e r a c t i o n   P r i n c i p l e s 
 -   * * S o f t   S p r i n g s * * :   B u t t o n s   a n d   m o d a l s   u s e   l o w - t e n s i o n   s p r i n g   a n i m a t i o n s   f o r   o r g a n i c   f e e d b a c k . 
 -   * * L a y o u t   T r a n s i t i o n s * * :   V i e w   s w i t c h i n g   ( l i k e   t e m p l a t e   f i l t e r i n g )   u s e s   F r a m e r   M o t i o n   \ L a y o u t G r o u p \   f o r   f l u i d   r e o r g a n i z a t i o n . 
 -   * * M i c r o - f e e d b a c k * * :   H o v e r   s t a t e s   i n c l u d e   s u b t l e   Y - a x i s   t r a n s f o r m s   a n d   b o r d e r - c o l o r   t r a n s i t i o n s   t o   s i g n i f y   i n t e r a c t i v i t y . 
 
 
