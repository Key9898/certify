---
title: Codebase Folder Map
type: reference
date: 2026-07-13
tags: [codebase, structure, folders]
---

# Codebase Folder Map

```
certify/
├── package.json             # workspace configuration & scripts
├── vercel.json              # Vercel SPA routing rewrites
├── railway.json             # Railway root deployment setup
├── backend/                 # Express API backend
│   ├── package.json         # backend dependencies
│   ├── tsconfig.json        # backend TypeScript config
│   ├── railway.json         # Railway backend runtime port setup
│   ├── src/
│   │   ├── app.ts           # server startup & retry lifecycle
│   │   ├── config/          # Auth0, Cloudinary, DB connection pools
│   │   ├── controllers/     # REST request/response handling
│   │   ├── middleware/      # rate limiting, JWT check, errors
│   │   ├── models/          # Mongoose DB schema definitions
│   │   ├── routes/          # API route bindings (v1 & internal)
│   │   └── services/        # Puppeteer PDF generation & integrations
│   └── templates/           # HTML templates & certificate.css styles
├── frontend/                # React SPA frontend
│   ├── package.json         # frontend dependencies
│   ├── tsconfig.json        # frontend TypeScript config
│   ├── vite.config.ts       # Vite + Tailwind + alias setup
│   ├── index.html           # main HTML entry
│   ├── src/
│   │   ├── main.tsx         # ReactDOM root creator
│   │   ├── App.tsx          # route definitions & layout wraps
│   │   ├── global.css       # Tailwind imports + DaisyUI corporate config
│   │   ├── components/      # modular common, Layout, auth, batch views
│   │   ├── context/         # Auth, Demo, and Theme states
│   │   ├── hooks/           # useCertificates, useCloudinary, useUsageStats
│   │   ├── pages/           # page routes (Dashboard, Verify, Templates)
│   │   └── utils/           # fetch requests, formatters, csvParser
└── wiki/                    # tracked AI knowledge base
    ├── README.md            # index portal
    ├── 00-overview.md       # project outline
    ├── 01-stack.md          # detailed tech stack mapping
    ├── 02-workflow.md       # git pre-commit & pre-push workflow
    └── 03-folder-map.md     # this codebase diagram
```

## Key Directory Policies

- **Frontend & Backend Decoupling:** Keep API calls centralized inside `frontend/src/utils/api.ts`.
- **Styling:** Custom modifications to padding, buttons, fields, etc., belong in `frontend/src/global.css` or using Tailwind v4 utility tokens. No inline styles.
- **Storybook & Stories:** Storybook files (`*.stories.tsx`) are located colocated next to component files.
- **Gitignore:** Daily session summaries in `docs/sessions/` are local-only and gitignored. Permanent logs go into `wiki/notes/`.
