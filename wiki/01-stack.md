---
title: Tech Stack
type: reference
date: 2026-07-13
tags: [stack, react, vite, express, puppeteer]
---

# Tech Stack

| Layer             | Tool                      | Version   | Why                                                      |
| ----------------- | ------------------------- | --------- | -------------------------------------------------------- |
| **Frontend UI**   | React                     | 18        | Declarative layouts, modular components                  |
| **Lang**          | TypeScript                | 5         | Strict typing and clean compiling                        |
| **Build**         | Vite                      | 6         | High-speed hot module reloading (HMR)                    |
| **Style**         | Tailwind CSS v4 + DaisyUI | 4.0 / 4.x | Utility styles + DaisyUI elements. Corporate theme.      |
| **Server**        | Express                   | 4.x       | Fast, minimalist routing                                 |
| **Database**      | MongoDB + Mongoose        | 8.x       | Document database with schema enforcement                |
| **PDF Rendering** | Puppeteer                 | 22.x      | High fidelity server-side HTML to PDF/PNG conversion     |
| **Auth**          | Auth0                     | SDK       | Identity provider for SPA login and API token extraction |
| **Uploads**       | Cloudinary                | API       | Production-grade logo and signature asset storage        |
| **Test**          | Vitest (frontend)         | 1.x / 2.x | Vite-native unit testing                                 |

## Frontend Design Standards (DaisyUI + Tailwind v4)

- Configured inside `frontend/src/global.css`.
- **Predefined CSS Rounding:** Box, field, and selector borders must use `0.25rem` (`--radius-selector: 0.25rem`, etc.).
- **Themes:** Only light mode corporate theme is enabled (`prefersdark: false`, `color-scheme: 'light'`).
- Avoid inline CSS styles — use DaisyUI standard utilities (`btn-primary`, `btn-secondary`, `base-100` backgrounds).

## PDF Rendering Configuration (Puppeteer)

- Instantiates a persistent headless browser instance using a pooled connection in `backend/src/services/pdfService.ts`.
- Recycles browser processes on disconnection or page timeouts.
- Injects generated verification QR codes directly into HTML certificate layouts prior to A4 Landscape printing.

## API token handling (Auth0)

- Relies on SPA standard access tokens (`getAccessTokenSilently`).
- Token getter centralized in `frontend/src/utils/api.ts` so all API requests carry bearer headers.
- Replaces history state upon Auth0 redirect callbacks to prevent reload loops.
