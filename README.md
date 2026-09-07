# Habitat

**Find a place worth coming home to.**

Habitat is a real-estate rental web app: a marketing landing page paired with a tenant-facing dashboard for browsing listings, viewing property detail, saving favorites, and tracking applications, residence, billing, and payment methods.

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-active%20development-orange" />
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-Next.js%2016-black" />
  <img alt="Backend" src="https://img.shields.io/badge/backend-Express%205%20%7C%20Prisma%207-green" />
  <img alt="Database" src="https://img.shields.io/badge/database-PostgreSQL-blue" />
</p>

🔗 **Live demo:** [real-estate-applicaiton.vercel.app](https://real-estate-applicaiton.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Feature Status](#feature-status)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Habitat targets renters/tenants first. A `MANAGER` role is defined in the data model, but the current build focuses entirely on the tenant experience — property manager tooling is on the roadmap, not yet implemented.

**Where things stand today:**
- The frontend is a fully designed, polished tenant experience — currently running on **local mock data** for listings, favorites, applications, billing, and residence.
- The backend currently implements **authentication only**: signup, login, logout, session, and silent token refresh, backed by a real PostgreSQL database.
- No property, booking, or payment endpoints exist yet — that's the next major phase of work.

This repo is intentionally transparent about that split, since it's actively being built out feature by feature.

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| Landing page | ✅ UI complete | Navbar, hero, featured listing, property grid & filters, discover section, gallery, how-it-works, CTA, footer |
| Authentication | ✅ Live | Signup / login / logout / session / silent refresh, httpOnly cookies, rate-limited |
| Tenant dashboard shell | 🎨 UI complete | Sidebar + routing scaffold for all dashboard sections |
| Browse & filter listings | 🎨 UI complete (mock data) | Split/map/list views, filter sidebar & drawer, interactive map (custom coordinate clustering) |
| Listing detail | 🎨 UI complete (mock data) | Gallery, key facts, fees/policies, reviews, contact & tour modals, similar listings |
| Favorites | 🎨 UI complete (mock data) | No persistence yet |
| Applications | 🎨 UI complete (mock data) | Validation schema ready, no submission endpoint |
| Residence / Billing / Payment methods | 🎨 UI complete (mock data) | No lease, invoicing, or payment gateway wired up yet |
| Manager dashboard | 🔜 Not started | `MANAGER` role exists in the schema; no UI or API yet |
| Image uploads | 🔜 Not started | FilePond, Multer, and AWS S3 SDK are installed but not wired |
| Live map (Mapbox) | 🔜 Not started | `mapbox-gl` installed; map currently renders mock coordinates |
| Real payments | 🔜 Not started | No payment gateway integrated |

## Tech Stack

**Frontend** (`client/` — `real-estate-app`)
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4, shadcn (`base-nova`), Radix-alternative `@base-ui/react`, `lucide-react`
- Redux Toolkit + RTK Query (auth endpoints, with automatic 401 refresh-and-retry)
- React Hook Form + Zod for forms and validation
- Framer Motion, `next-themes`, Sonner (toasts), Mapbox GL (installed, not yet wired)

**Backend** (`server/` — Express + Prisma)
- Express 5, Helmet, Morgan, CORS, cookie-based sessions
- Prisma 7 + PostgreSQL (via `pg` and the Prisma Pg adapter)
- JWT access/refresh tokens (httpOnly cookies), bcrypt password hashing, rate limiting
- Zod for request validation

**Installed for upcoming work:** AWS S3 SDK + Multer (uploads), Mapbox GL (live maps) — not yet connected to any route.

## Architecture

Classic client/server setup as two independent Node projects (no monorepo tooling):

```
real-estate-applicaiton/
├── client/     # Next.js 16 App Router frontend
└── server/     # Express 5 REST API + Prisma 7
```

Communication is REST over JSON, authenticated with httpOnly cookies (`accessToken`, 15 min; `refreshToken`, 30 days). The client's RTK Query layer automatically refreshes and retries once on a 401.

```
Client (Next.js, :3000)  ──REST/JSON, credentials: include──►  Server (Express, :3002)
                                                                        │
                                                                        ▼
                                                                  PostgreSQL (Prisma)
```

## Repository Layout

```
real-estate-applicaiton/
├── client/
│   ├── app/                 # Routes: landing, sign-in/up, (tenant-dashboard)/*
│   ├── components/          # ui/, landing/, rentals/, tenant-dashboard/, auth/
│   ├── lib/                 # utils, constants, zod schemas
│   ├── state/                # RTK Query API slice, Redux store
│   ├── src/data/             # Mock listing data (to be replaced by live API)
│   └── types/
├── server/
│   ├── src/
│   │   ├── routes/           # auth.routes.ts (currently the only router)
│   │   ├── controllers/      # auth.controller.ts
│   │   ├── middleware/       # authenticate, authorize (unused), rateLimiter
│   │   ├── lib/               # Prisma client, JWT/token helpers
│   │   └── config/            # env validation (zod)
│   └── prisma/
│       ├── schema.prisma      # Current model: User (Role: TENANT | MANAGER)
│       └── seed.ts            # Legacy seeder — currently out of sync with schema
└── PROJECT_OVERVIEW.md         # Full technical audit of the codebase
```

> See [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) for a complete, line-by-line technical breakdown of the codebase, data models, and API surface.

## Getting Started

**Prerequisites:** Node.js, PostgreSQL

```bash
git clone https://github.com/Zineddine-Rebbouh/real-estate-applicaiton.git
cd real-estate-applicaiton
```

**Backend**
```bash
cd server
cp .env.example .env   # fill in your own values — see below
npm install
npx prisma migrate dev
npm run dev             # runs on http://localhost:3002
```

**Frontend**
```bash
cd client
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3002" > .env.local
npm install
npm run dev             # runs on http://localhost:3000
```

## Environment Variables

**`server/.env`**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate?schema=public"
CLIENT_URL="http://localhost:3000"
JWT_ACCESS_SECRET="a-random-secret-at-least-32-characters"
JWT_REFRESH_SECRET="a-different-random-secret-at-least-32-characters"
NODE_ENV="development"
PORT="3002"
```

**`client/.env.local`**
```
NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"
```

> Note: `server/prisma/seed.ts` currently targets a legacy schema (property/lease/payment models that no longer exist) and will fail against the current `User`-only schema until it's rewritten.

## Roadmap

Ordered by dependency, based on the current state of the schema, mock UI, and installed-but-unused dependencies:

1. **Domain schema** — design `Location / Property / Tenant / Manager / Lease / Application / Payment` models and migrate.
2. **Fix the seeder** — rewrite `seed.ts` to match the new schema.
3. **Property APIs** — listing search/filter + detail endpoints, replacing `MOCK_RENTALS` with real RTK Query calls.
4. **Favorites & applications** — persistence and a manager review flow.
5. **Leases, residence, billing, payments** — connect the existing dashboard UI to real data and pick a payment gateway.
6. **Uploads** — wire Multer + S3 to the existing property-creation form and FilePond UI.
7. **Live maps** — connect Mapbox GL using the lat/lng already present in the mock data.
8. **Manager role** — enable manager signup/assignment and a manager dashboard.
9. **Hygiene & testing** — remove duplicate/dead files, add test coverage, document deployment.

## License

No license has been set for this repository yet — all rights reserved by default until one is added.
