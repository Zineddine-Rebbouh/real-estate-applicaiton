# Habitat

**Find a place worth coming home to.**

Habitat is a real-estate rental web app: a marketing landing page paired with a tenant-facing dashboard for browsing listings, viewing property detail, saving favorites, and tracking applications, residence, billing, and payment methods.

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-active%20development-orange" />
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-Next.js%2016-black" />
  <img alt="Backend" src="https://img.shields.io/badge/backend-Express%205%20%7C%20Prisma%207-green" />
  <img alt="Database" src="https://img.shields.io/badge/database-PostgreSQL-blue" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
</p>

🔗 **Live demo:** [real-estate-applicaiton.vercel.app](https://real-estate-applicaiton.vercel.app)

> **Try it without signing up** — all seeded accounts use password `Habitat2026!`:
> | Role | Email | Shows |
> |---|---|---|
> | Portfolio manager (12 properties) | `eleanor.vance@habitat-properties.com` | queues, inquiries, volume |
> | Mid-tier manager (6 properties) | `david.chen@pacificliving.io` | balanced portfolio |
> | Active resident | `aaravpatel.1@example.com` | residence, lease PDF, invoices |
> | Applicant (2 pending) | `keanureeves.29@example.com` | applications list |
> | Fresh tenant (empty states) | `freshtenantdemo.60@example.com` | empty dashboards |
>
> Full matrix + manager invite codes: [`server/prisma/seedData/README-credentials.md`](./server/prisma/seedData/README-credentials.md). Local seed: `cd server && npm run seed`.

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

Habitat targets renters/tenants first, with a working manager side alongside it. Both dashboards are wired to a live REST API — no mock data in the request path.

**Where things stand today:**

- The frontend is a fully designed tenant + manager experience running on **live RTK Query data**: browse/search listings, property detail, favorites (persisted), applications (submit/withdraw), residence, billing, and payment methods.
- The backend implements **13 route groups (~44 endpoints)**: auth, properties, manager, applications, favorites, tenant, reviews, leases (signed PDF agreements/receipts), uploads, payment-methods, maintenance, tours, and messages — backed by PostgreSQL via Prisma 7.
- Seeding is schema-safe (`npm run seed`, upsert-with-skip) and Docker Compose boots the full stack (db + api + web) with migrations + seed.

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| Landing page | ✅ UI complete | Navbar, hero, featured listing, property grid & filters, discover section, gallery, how-it-works, CTA, footer |
| Authentication | ✅ Live | Signup / login / logout / session / silent refresh, httpOnly cookies (`Path: /`), rate-limited; manager signup gated by single-use invite code |
| Tenant dashboard | ✅ Live | Overview, explore, rentals + detail, applications (submit/withdraw), residence, billing, payment-methods, favorites — all RTK Query |
| Browse & filter listings | ✅ Live | `useGetPropertiesQuery`; filter vocabulary (`FilterState`, `INITIAL_FILTERS`) still type-imported from `src/data/rentals-data` |
| Listing detail | ✅ Live | Server component fetching `/api/properties/[id]` + live reviews/tour/message sections; has `loading.tsx` |
| Favorites | ✅ Live | Heart toggles in cards/gallery persist via `addFavorite`/`removeFavorite` (optimistic) |
| Applications | ✅ Live | Tenant submit/withdraw + manager approve/deny (approval mints the lease, overlap-checked) |
| Residence / Billing / Payment methods | ✅ Live | Current lease, invoices + pay flow, PDF statements/receipts, brand/last4 method references (no PANs) |
| Manager dashboard | ✅ Live | Overview, properties CRUD, applications, leases + manual invoicing, inquiries (tours/messages), maintenance queue |
| Image uploads | ✅ Live | Multer (10×5MB, image-only) straight to Cloudinary; returns `secure_url`s for `photoUrls`; upload rate-limited |
| Live map | ✅ Partial | Google Maps where keys set, graceful SVG fallback otherwise; POI toggles currently empty |
| Real payments | 🔜 Not started | Manual invoicing only — no payment gateway integrated |
| Feature                               | Status         | Notes                                                                                                                                           |
| ------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing page                          | ✅ UI complete | Navbar, hero, featured listing, property grid & filters, discover section, gallery, how-it-works, CTA, footer                                   |
| Authentication                        | ✅ Live        | Signup / login / logout / session / silent refresh, httpOnly cookies (`Path: /`), rate-limited; manager signup gated by single-use invite code  |
| Tenant dashboard                      | ✅ Live        | Overview, explore, rentals + detail, applications (submit/withdraw), residence, billing, payment-methods, favorites — all RTK Query             |
| Browse & filter listings              | ✅ Live        | `useGetPropertiesQuery`; filter vocabulary (`FilterState`, `INITIAL_FILTERS`) still type-imported from `src/data/rentals-data`                  |
| Listing detail                        | ✅ Live        | Server component fetching `/api/properties/[id]` + live reviews/tour/message sections; has `loading.tsx`                                        |
| Favorites                             | ✅ Live        | Heart toggles in cards/gallery persist via `addFavorite`/`removeFavorite` (optimistic)                                                          |
| Applications                          | ✅ Live        | Tenant submit/withdraw + manager approve/deny (approval mints the lease, overlap-checked)                                                       |
| Residence / Billing / Payment methods | ✅ Live        | Current lease, invoices + pay flow, PDF statements/receipts, brand/last4 method references (no PANs)                                            |
| Manager dashboard                     | ✅ Live        | Overview, properties CRUD, applications, leases + manual invoicing, inquiries (tours/messages), maintenance queue                               |
| Image uploads                         | ✅ Live        | Multer (10×5MB, image-only) straight to Cloudinary; returns `secure_url`s for `photoUrls`; upload rate-limited                                  |
| Live map                              | ✅ Live        | Google Maps when API keys set with interactive POI pins, graceful SVG fallback otherwise; schools, transit, grocery, dining toggles fully wired |
| Real payments                         | 🔜 Not started | Manual invoicing only — no payment gateway integrated                                                                                           |

## Tech Stack

**Frontend** (`client/`)

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4, shadcn (`base-nova`), Radix-alternative `@base-ui/react`, `lucide-react`
- Redux Toolkit + RTK Query (full API slice with automatic 401 refresh-and-retry)
- React Hook Form + Zod for forms and validation
- Framer Motion, `next-themes`, Sonner (toasts), Google Maps (with SVG fallback when keys are absent)

**Backend** (`server/`, Express + Prisma)

- Express 5, Helmet, Morgan, CORS, cookie-based sessions
- Prisma 7 + PostgreSQL (via `pg` and the Prisma Pg adapter)
- JWT access/refresh tokens (httpOnly cookies, `Secure` in prod, `SameSite: lax`), bcrypt password hashing
- Rate limiting: login/signup/refresh + a shared write limiter on tenant POSTs + a stricter upload limiter
- Zod for auth/env validation; inline validators elsewhere (enum allowlists, finite/positive number checks, UUID guards)
- pdfkit for lease-agreement / statement / receipt PDFs; Cloudinary for image uploads

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
│   ├── app/                 # Routes: landing, sign-in/up, (tenant-dashboard)/*, (manager-dashboard)/*
│   ├── components/          # ui/, landing/, rentals/, tenant-dashboard/, auth/
│   ├── lib/                 # utils (incl. lease/receipt download helpers), listings adapters
│   ├── state/               # RTK Query API slice, Redux store
│   ├── src/data/            # Legacy filter vocabulary + types (value-level mocks removed)
│   └── types/
├── server/
│   ├── src/
│   │   ├── routes/           # 13 routers: auth, properties, manager, applications, favorites,
│   │   │                     # tenant, reviews, leases, uploads, payment-methods, maintenance, tours, messages
│   │   ├── controllers/      # One controller per domain; ownership checks live here
│   │   ├── middleware/       # authenticate, authorize, rateLimiter
│   │   ├── lib/              # Prisma client, JWT/token + cookie helpers, Cloudinary
│   │   └── config/           # env validation (zod)
│   └── prisma/
│       ├── schema.prisma      # User (TENANT | MANAGER) + Manager/Tenant profiles, Property, Lease,
│       │                      # Application, Payment, Review, favorites, payment-methods, maintenance, tours, messages
│       ├── seed.ts            # Schema-safe seeder (dependency order, upsert-with-skip)
│       └── seedData/*.json    # 14 seed files; photoUrls resolve to client/public/
├── compose.yml                # Local full-stack run: postgres + api + web
└── PROJECT_OVERVIEW.md        # Full technical audit of the codebase
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
cp .env.example .env   # fill in your own values, see below
npm install
npx prisma migrate dev
npm run seed            # schema-safe, upsert-with-skip; re-runnable
npm run dev             # runs on http://localhost:3002
```

**Frontend**

```bash
cd client
cp .env.example .env.local   # or: NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
npm install
npm run dev                  # runs on http://localhost:3000
```

**Full stack (Docker)**

```bash
docker compose up --build   # postgres + api (migrate + seed) + web
```

> Replace the `JWT_*_SECRET` placeholders in `compose.yml` before any non-local use.

## Environment Variables

**`server/.env`**

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate?schema=public"
CLIENT_URL="http://localhost:3000"
JWT_ACCESS_SECRET="a-random-secret-at-least-32-characters"
JWT_REFRESH_SECRET="a-different-random-secret-at-least-32-characters"
NODE_ENV="development"
PORT="3002"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_FOLDER="real-estate/listings"
```

**`client/.env.local`**

```
NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=""
```

## Roadmap

What's left, ordered by dependency:

1. **Seed + click-through testing**, run `npm run seed` (or compose) and exercise tenant + manager flows end to end against real data.
2. **Map POIs**, `nearbyPOIs` is currently always empty — wire a places source or drop the toggles.
3. **Payment gateway**, invoicing is manual; pick a provider if online collection is needed.
4. **Split-domain cookies**, `SameSite: lax` fits same-site deploys; move to `None; Secure` only if the frontend and API end up on different domains.
5. **Hygiene**, remaining `TODO`s are near-zero; `src/data/rentals-data` survives as type-only filter vocabulary.

## License

MIT — see [LICENSE](./LICENSE).
