# Habitat — Project Overview

> Regenerated 2026-09-09. Factual only — anything not implemented is marked as such.

Two independent Node projects, no monorepo tooling: `client/` (Next.js 16 App Router) + `server/` (Express 5 + Prisma 7 + PostgreSQL). REST over JSON, httpOnly cookie auth (`accessToken` 15min + `refreshToken` 30d, RTK Query auto-refresh-and-retry on 401).

## What it is

**Habitat** (`Habitat | Find a place worth coming home to`) — rental marketplace with landing page + **live tenant and manager dashboards**. No mock data in the request path; filter vocabulary types only (`src/data/rentals-data`).

- **Tenants:** browse/search listings, listing detail (gallery, fees, reviews, tour/message modals), favorites (persisted, optimistic), applications (submit/withdraw), residence, billing (invoices + pay flow, PDF statements/receipts), payment-method references (brand/last4 only, no PANs).
- **Managers:** overview, properties CRUD (Cloudinary photo uploads), applications (approve/deny — approval mints the lease, overlap-checked), leases + manual invoicing, inquiries (tour/message queues), maintenance queue.
- **Auth:** signup/login/logout/session/silent refresh, bcrypt + JWT rotation with reuse detection, rate-limited; manager signup gated by single-use invite code (`ManagerInviteCode`).

## Tech stack

- **Frontend:** Next 16, React 19, TS, Tailwind v4, shadcn `base-nova` + `@base-ui/react`, Redux Toolkit + RTK Query, React Hook Form + Zod, Framer Motion, Sonner, `@vis.gl/react-google-maps` (SVG fallback when keys absent), FilePond, `vitest`.
- **Backend:** Express 5, Helmet, Morgan, CORS, `express-rate-limit`, Prisma 7 + `pg`, JWT + bcrypt, Zod (auth/env), `pdfkit` (lease/receipt PDFs), Cloudinary + `multer` (10×5MB image-only uploads).
- **Infra:** `compose.yml` (postgres + api + web), Dockerfiles for both apps. No CI configured.

## API (13 routers, `server/src/routes/`)

`auth` (signup/login/logout/refresh/me + PATCH me), `properties`, `manager`, `applications`, `favorites`, `tenant`, `reviews`, `leases` (PDF agreements/receipts), `uploads` (Cloudinary), `payment-methods`, `maintenance`, `tours`, `messages`.

## Data model (`server/prisma/schema.prisma`)

`User` (TENANT | MANAGER) 1:1 `Manager` / `Tenant` profiles; `Property` (embedded address, `Decimal` money, enum-array amenities/highlights, plain `lat/lng` — no PostGIS); `Lease`; `Application` (Pending/Approved/Denied/Withdrawn, denormalized contact snapshot); `Payment`; `Review` (1 per tenant×property); `Favorite` (explicit join with `createdAt`); `PaymentMethod` (reference-only vault); `MaintenanceRequest`; `TourRequest`; `ContactMessage`; `ManagerInviteCode` (single-use).

## Seed & demo logins

`npm run seed` (schema-safe, upsert-with-skip, re-runnable). All seeded accounts share password `Habitat2026!`. Full matrix: `server/prisma/seedData/README-credentials.md`.

| Who | Email | Sees |
|---|---|---|
| Portfolio manager (12 props) | `eleanor.vance@habitat-properties.com` | queues, inquiries, volume |
| Mid-tier manager (6 props) | `david.chen@pacificliving.io` | balanced portfolio |
| Fresh manager (0 props) | `fresh.manager@habitat-demo.com` | empty states |
| Active resident | `aaravpatel.1@example.com` | residence, lease PDF, invoices |
| Applicant (2 pending) | `keanureeves.29@example.com` | applications list |
| Fresh tenant (empty) | `freshtenantdemo.60@example.com` | all empty states |

## Not started / known gaps

- **Real payments:** manual invoicing only, no gateway.
- **Map POIs:** `nearbyPOIs` always empty; toggles render but do nothing.
- **Split-domain cookies:** `SameSite: lax` fits same-site deploys; needs `None; Secure` if API and web split domains.
- **Tests:** `vitest` configured, ~zero tests. No CI.
