# Habitat — Project Overview

> Generated 2026-09-06 from a full scan of the repo. Factual only — anything not implemented is marked as such. Intended as handoff context for another AI assistant (Claude).

Repo root contains two apps: `client/` (Next.js frontend) and `server/` (Express + Prisma backend). No monorepo tooling (no workspaces / turbo); the two `package.json` files are independent.

---

## 1. Project Summary

**Habitat** (`Habitat | Find a place worth coming home to` — `client/app/layout.tsx` metadata) is a real-estate rental web app.

- **Purpose:** marketing landing page + tenant-facing rental browsing experience (search/filter listings, view listing detail, save favorites, track applications / residence / billing / payment methods).
- **Target users:** renters/tenants first. A `MANAGER` role exists in the auth model and in `AppSidebarProps`, but there is **no manager dashboard or manager API** yet — all dashboard routes are grouped under `(tenant-dashboard)` and use mock data.
- **Current reality:** frontend UI is substantially built on top of **local mock data** (`src/data/rentals-data.ts`, `rental-details-data.ts`); backend currently implements **auth only** (`User` model + `/api/auth/*`). No property/listing/booking/payment endpoints exist yet.

---

## 2. Tech Stack

### Frontend — `client/package.json` (`name: real-estate-app`, `version: 0.1.0`)

| Area | Library @ version |
|---|---|
| Framework | `next` `16.3.4` (App Router), `react` + `react-dom` `19.2.8`, `typescript` `^5`, `@types/react`/`@types/react-dom` `^19` |
| Styling | `tailwindcss` `^4` + `@tailwindcss/postcss` `^4`, `postcss.config.mjs` uses only `@tailwindcss/postcss`; `tw-animate-css` `^1.4.0`, `tailwind-merge` `^3.6.0`, `clsx` `^2.1.1`, `class-variance-authority` `^0.7.1` |
| UI kit | shadcn `base-nova`, `neutral` base, `lucide-react` `^1.38.0` icons, primitives from `@base-ui/react` `^1.7.0` (not Radix); `shadcn` CLI `^4.19.1` |
| State / data | `@reduxjs/toolkit` `^2.12.0`, `react-redux` `^9.3.0` (RTK Query only talks to auth endpoints so far) |
| Forms/validation | `react-hook-form` `^7.87.0`, `@hookform/resolvers` `^5.9.1`, `zod` `^4.5.4` |
| Misc UI | `framer-motion` `^13.1.1`, `next-themes` `^0.4.6`, `sonner` `^2.0.8` (Toaster), `cmdk` `^1.1.1`, `date-fns` `^4.4.0`, `lodash` `^4.18.1` |
| Uploads (installed, no backend route yet) | `filepond` `^4.32.12`, `filepond-plugin-image-exif-orientation`, `filepond-plugin-image-preview`, `react-filepond` `^7.1.3` |
| Maps (installed, custom impl currently) | `mapbox-gl` `^3.29.0` — `components/rentals/interactive-map.tsx` is currently a custom CSS `x/y`-coordinate cluster/marker implementation over mock coords, not a live Mapbox map |
| Tooling | `eslint` `^9`, `eslint-config-next` `16.3.4`, `@types/node` `^20`, `@types/uuid` `^11` |
| Scripts | `dev: next dev`, `build: next build`, `start: next start`, `lint: eslint` |

### Backend — `server/package.json` (`name: server`, `version: 1.0.0`)

| Area | Library @ version |
|---|---|
| Server | `express` `^5.2.1`, `body-parser` `^2.3.0`, `cookie-parser` `^1.4.7`, `cors` `^2.8.6`, `helmet` `^8.3.0`, `morgan` `^1.12.0` |
| DB / ORM | `pg` `^8.23.0`, `@prisma/client` `^7.10.0`, `@prisma/adapter-pg` `^7.10.0`, `prisma` `^7.10.0` (dev); provider `postgresql` |
| Auth | `bcrypt` `^6.0.0`, `jsonwebtoken` `^9.0.3`, `express-rate-limit` `^8.7.0` |
| Validation | `zod` `^4.5.4` |
| Installed but unused (no code path mounts them) | `@aws-sdk/client-s3` + `@aws-sdk/lib-storage` `^3.1123.0`, `multer` `^2.3.0`, `axios` `^1.20.0`, `@terraformer/wkt` `^2.2.2` |
| TS/tooling | `typescript` `^7.0.2`, `tsx` `^4.23.13`, `nodemon`, `concurrently`, `rimraf`, `shx` |
| Scripts | `build: rimraf dist && npx tsc`, `start: npm run build && node dist/index.js`, `dev: npm run build && concurrently "npx tsc -w" "nodemon --exec tsx src/index.ts"`, `seed: tsx prisma/seed.ts` |

### Database / hosting

- **Database:** PostgreSQL (connection string via `DATABASE_URL`). Only table in schema/migrations is `"User"`.
- **Hosting:** not configured in repo (no Dockerfile, no CI, no Vercel/netlify config). CORS origin is `env.CLIENT_URL`; server listens on `env.PORT` (default `3002`) on `0.0.0.0`. Client dev default is Next `3000`.

---

## 3. Architecture Overview

**Type:** classic client-server monorepo (two separate Node projects). Communication is **REST over JSON** with **httpOnly cookie auth** (`accessToken` + `refreshToken`, `credentials: "include"`).

```
real-estate-applicaiton/
  client/   # Next.js 16 App Router frontend
  server/   # Express 5 JSON API + Prisma 7
```

### Top-level directories

| Path | Contents |
|---|---|
| `client/app/` | Routes: `/` (landing), `/sign-in`, `/sign-up`, `not-found.tsx`, `(tenant-dashboard)/` group (URL-transparent) with `overview`, `residence`, `favorites`, `rentals`, `rentals/[id]`, `billing`, `explore`, `payment-methods`, `applications`. `layout.tsx` (fonts + `StoreProvider` + `AuthBootstrap`), `globals.css` (Tailwind v4 source of truth), stray `tailwind.config.ts` (v3-style, unwired) + nested `tsconfig.json` |
| `client/components/` | `ui/` (27 shadcn/base-nova primitives), `landing/` (12: navbar, hero, featured-listing, property-card, property-filter-panel, property-grid, discover-section, gallery, feature-row, how-it-works, cta-banner, footer), `rentals/` (9 explorer + 13 `detail/`), `tenant-dashboard/app-sidebar.tsx`, `auth/` (auth-bootstrap, blueprint-panel), root `FormField.tsx` |
| `client/lib/` | `utils.ts` (`cn`, `formatEnumString`, `formatPriceValue`, `cleanParams`, `withToast`, `createNewUserInDatabase`), `constants.ts` (enums + icons + `NAVBAR_HEIGHT=52` + legacy `testUsers`), `schemas.ts` (zod `propertySchema`, `applicationSchema`, `settingsSchema`) |
| `client/state/` | `api.ts` (RTK Query `apiSlice`, auth endpoints + 401 auto-refresh), `redux.tsx` (`makeStore`, `StoreProvider`), `index.ts` (empty `globalSlice`) |
| `client/hooks/` | `use-mobile.ts` + `use-mobile.tsx` (duplicate `useIsMobile`, breakpoint 768) |
| `client/types/` + `client/src/` | `types/index.d.ts` (enums + prop interfaces); `src/data/rentals-data.ts` (509 lines: `MOCK_RENTALS`, `FilterState`, `INITIAL_FILTERS`), `src/data/rental-details-data.ts` (355 lines), `src/types/prismaTypes.d.ts` (generated stub — `User` only) |
| `client/public/` | 33 static assets: `landing-splash.jpg`, `landing-discover-bg.jpg`, `landing-call-to-action.jpg`, `featured-listing.jpg`, property/gallery jpgs, `landing-i1..i7.png`, `landing-search1..3.png`, `landing-icon-*.png`, `logo.svg`, next/vercel svgs |
| `client/` configs/docs | `next.config.ts` (only `images.qualities=[75,90]`), `tsconfig.json` (strict, `@/*` → `./*`), `components.json` (base-nova/neutral/lucide), `eslint.config.mjs`, `postcss.config.mjs`, `.env.local` (`NEXT_PUBLIC_API_BASE_URL` only), `DESIGN.md` (landing spec, 263 lines), `README.md` (stock create-next-app), `CLAUDE.md` (points to `AGENTS.md`), `AGENTS.md` (Next 16 breaking-changes warning) |
| `server/src/` | `index.ts` (middleware + mount + listen), `config/env.ts` (zod env validation), `routes/auth.routes.ts` (sole router), `controllers/auth.controller.ts` (5 handlers), `middleware/authenticate.ts`, `middleware/authorize.ts` (unused), `middleware/rateLimiter.ts`, `lib/prisma.ts` (Pg adapter singleton), `lib/tokens.ts` (JWT + cookie options), `validators/auth.schema.ts` |
| `server/prisma/` | `schema.prisma` (1 model + 1 enum), `seed.ts` (legacy multi-model seeder, currently incompatible — see §8), `seedData/*.json` (7 legacy fixtures), `migrations/20260903095937_init` + `20260903100353_add_current_refresh_token_hash`, `prisma.config.ts` |
| `server/` configs | `.env` + `.env.example` (6 vars, see §7), `tsconfig.json` (`module/moduleResolution: nodenext`, `rootDir: src`, `outDir: dist`), `package.json` |

### Frontend ↔ backend

- `state/api.ts`: `fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL, credentials: "include" })` + `baseQueryWithReauth` — on 401 (except login/signup/refresh itself) it `POST /api/auth/refresh` once and retries.
- Server `src/index.ts` middleware order: `express.json → helmet (+crossOriginResourcePolicy cross-origin) → morgan(common) → bodyParser.json/urlencoded → cors({ origin: CLIENT_URL, credentials: true }) → cookieParser → /api/auth router`.
- No GraphQL, no tRPC, no server actions calling the API, no websockets.

---

## 4. Core Features

Status key: **LIVE** = wired end-to-end · **UI-MOCK** = UI works against local mock data, no backend · **SCHEMA-ONLY** = zod type exists, no UI route or API.

| Feature | Status | Evidence |
|---|---|---|
| Landing page (navbar, hero over `landing-splash.jpg`, featured listing, property grid + filter panel, discover section, gallery, feature row, how-it-works 3 steps, CTA banner, footer) | UI-MOCK | `app/page.tsx` composes all `components/landing/*`; images from `public/` |
| User auth: sign-up / sign-in / sign-out / session (`getMe`) / silent refresh | LIVE | `app/sign-in|sign-up/page.tsx` → `useSignup/Login/Logout/GetMe` → `POST /api/auth/*`; `components/auth/auth-bootstrap.tsx`; bcrypt + JWT rotation (see §6) |
| Tenant dashboard shell (sidebar + navbar `isDashboard` + `dashboard-shell`) | UI-MOCK | `app/(tenant-dashboard)/layout.tsx` (`SidebarProvider`, `AppSidebar`, `SidebarInset`, `Toaster`) |
| Dashboard: Overview | UI-MOCK | `overview/page.tsx` — static cards/links |
| Dashboard: Explore / browse rentals (split/map/list views, TopFilterBar, FilterSidebar/Drawer, MobileBottomSheet, ResultsPanel, RentalCard, InteractiveMap) | UI-MOCK | `explore/page.tsx` → `RentalsExplorer`; filtering is `useMemo` over `MOCK_RENTALS` in `rentals-explorer.tsx`; `interactive-map.tsx` custom x/y clustering |
| Dashboard: Rentals list + listing detail (`rentals/[id]`: header, gallery + lightbox, key-facts, about, features, highlights, fees/policies, map section, reviews, contact card, similar carousel, tour/message modals) | UI-MOCK | `rentals/page.tsx`, `rentals/[id]/page.tsx` + 13 `components/rentals/detail/*` + `rental-details-data.ts` |
| Dashboard: Favorites (save/unsave, search, sort) | UI-MOCK | `favorites/page.tsx` (local state + framer-motion; `isFavorite` flag on mock type only) |
| Dashboard: Applications (list, search, status badges incl. "Manager review in progress") | UI-MOCK | `applications/page.tsx`; `applicationSchema` exists in `lib/schemas.ts` but no POST |
| Dashboard: Residence (current lease card) | UI-MOCK | `residence/page.tsx` (hardcoded `currentResidence`) |
| Dashboard: Billing (invoices table, search) | UI-MOCK | `billing/page.tsx` (local state + `sonner` toast) |
| Dashboard: Payment methods (cards/bank, dialogs) | UI-MOCK | `payment-methods/page.tsx` (local state only; no gateway) |
| Property creation form schema | SCHEMA-ONLY | `propertySchema`/`PropertyFormData` in `lib/schemas.ts`; `photoUrls: File[]` + FilePond deps suggest planned upload flow, but no route or API consumes it |
| Settings form schema | SCHEMA-ONLY | `settingsSchema` in `lib/schemas.ts`; no settings page |
| Messaging (tour/message modals) | UI-MOCK | `tour-and-message-modals.tsx` — modal UI only, no send API |
| Map integration | UI-MOCK | `mapbox-gl` installed; map UI is custom mock-coords implementation |
| Admin dashboard | NOT IMPLEMENTED | No route, no component, no API |
| Real payments | NOT IMPLEMENTED | No gateway dep, no endpoint; billing/payment-methods pages are static |
| Image storage (S3) | NOT IMPLEMENTED | `@aws-sdk/*` + `multer` installed but no upload route or S3 call in `src/` |

---

## 5. Data Models / Schema

### 5.1 Live database (`server/prisma/schema.prisma`, matches both migrations)

```prisma
enum Role { TENANT MANAGER }

model User {
  id                      String   @id @default(uuid()) @db.Uuid
  email                   String   @unique
  passwordHash            String
  name                    String
  role                    Role     @default(TENANT)
  refreshTokenVersion     Int      @default(0)
  currentRefreshTokenHash String?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

One table, no relations. `role` defaults to `TENANT`; nothing in the API sets `MANAGER` (no role input on signup).

### 5.2 Legacy/intended models (NOT in schema — from `prisma/seedData/*.json` + `seed.ts`)

`seed.ts` + 7 fixtures reference `Location, Manager, Property, Tenant, Lease, Application, Payment` with integer `id`s — a pre-reset design (likely Cognito-era, cf. `managerCognitoId`, `testUsers` with `us-east-2:` IDs). Example `property.json` record fields:

```json
{ "id": 1, "name": "...", "description": "...", "pricePerMonth": 1500.0,
  "securityDeposit": 1500.0, "applicationFee": 50.0,
  "photoUrls": ["https://example.com/..."],
  "amenities": ["AirConditioning", "WasherDryer", "Parking"],
  "highlights": ["HighSpeedInternetAccess", "CloseToTransit"],
  "isPetsAllowed": true, "isParkingIncluded": false,
  "beds": 2, "baths": 1, "squareFeet": 800, "propertyType": "Apartment",
  "postedDate": "2023-05-15T00:00:00Z",
  "averageRating": 4.5, "numberOfReviews": 10,
  "locationId": 1, "managerCognitoId": "010be580-..." }
```

`location.json` uses PostGIS (`ST_GeomFromText(coordinates, 4326)` in `seed.ts`). These models must be re-designed and re-migrated before any listing/booking feature can go live.

### 5.3 Client-side types (mock domain, not persisted)

- `src/data/rentals-data.ts`: `RentalProperty { id, title, address, neighborhood, city, price, beds, baths, sqft, propertyType: Apartment|House|Condo|Townhouse|Studio|Loft, image, gallery, badges, rating, reviewCount, coords { x, y, lat, lng }, amenities, petFriendly, parkingIncluded, isFavorite?, featured?, availableDate }`, `FilterState`, `INITIAL_FILTERS { minPrice: 800, maxPrice: 4500, minSqft: 400, maxSqft: 2800 }`, `AMENITIES_LIST`, `MOCK_RENTALS`.
- `src/data/rental-details-data.ts`: `RentalDetail extends RentalProperty { breadcrumbs, deposit, leaseTerm, aboutText, highlights, detailedGallery, feesBreakdown: FeeItem[], policies…, pointsOfInterest, reviews: ReviewItem[], host: HostProfile }`.
- `state/api.ts`: `AuthUser { id, email, name, role: TENANT|MANAGER }`, `AuthResponse { user }`, `SignupRequest { name, email, password }`, `LoginRequest { email, password }`.
- `lib/constants.ts` + `types/index.d.ts`: `AmenityEnum` (13 values), `HighlightEnum` (15), `PropertyTypeEnum` (Rooms, Tinyhouse, Apartment, Villa, Townhouse, Cottage) each with lucide icon maps; assorted component prop interfaces.
- `lib/schemas.ts` (zod): `propertySchema` (name, description, pricePerMonth, securityDeposit, applicationFee, isPetsAllowed, isParkingIncluded, photoUrls `File[]` min 1, amenities/highlights strings, beds/baths 0–10, squareFeet, propertyType enum, address/city/state/country/postalCode), `applicationSchema` (name, email, phoneNumber 10+, message?), `settingsSchema` (name, email, phoneNumber).

---

## 6. API Endpoints

Base URL = `NEXT_PUBLIC_API_BASE_URL` (client) / `CLIENT_URL`-restricted CORS (server). Auth = httpOnly cookies (`accessToken` 15 min, `refreshToken` 30 d, `SameSite=Lax`, `Secure` in production; refresh cookie `Path=/api/auth/refresh`). Rate limits via `express-rate-limit`.

| Method | Path | Purpose | Auth / limits |
|---|---|---|---|
| `GET` | `/` | Health check → `Hello from server!` | public |
| `POST` | `/api/auth/signup` | Validate `signupSchema` (`name` 2–100, email, password 8–128) → `bcrypt.hash(12)` → `prisma.user.create` → set both cookies + store `sha256(refreshToken)` → `201 { user }`; `409` on duplicate email | public, `signupRateLimiter` 5/hr |
| `POST` | `/api/auth/login` | Validate `loginSchema` → `findUnique(email)` + `bcrypt.compare` → rotate cookies/hash → `200 { user }`; `401 Invalid email or password` | public, `loginRateLimiter` 7/15min |
| `POST` | `/api/auth/logout` | If refresh cookie present, verify + `refreshTokenVersion+1`, null hash; always clears both cookies → `204` | public (optional-token); safe on missing/invalid token |
| `POST` | `/api/auth/refresh` | Rotation check `updateMany(where: { id, refreshTokenVersion == claims.tokenVersion, currentRefreshTokenHash == sha256(old) })`; mismatch → bump version + `401`; else re-issue both cookies → `200 { user }` | refresh-cookie required, `refreshRateLimiter` 30/15min |
| `GET` | `/api/auth/me` | Return `{ user }` from `req.user` | `authenticate` (valid access cookie + DB user) → `401` otherwise |

`authorize(...roles)` middleware exists (`403 Forbidden` on role mismatch) but is **imported nowhere** — no role-gated route yet. No property/user/upload routes exist. Client `apiSlice` exposes `useSignupMutation, useLoginMutation, useLogoutMutation, useRefreshMutation, useGetMeQuery` with auto-refresh-and-retry on 401.

Token internals (`src/lib/tokens.ts`): `ACCESS_TOKEN_MAX_AGE_MS=15min`, `REFRESH_TOKEN_MAX_AGE_MS=30d`; `signAccessToken(sub)`, `signRefreshToken(sub, tokenVersion)`, `verify*`, `hashRefreshToken=sha256`.

---

## 7. Environment & Configuration

### Required env vars (names only)

Client — `client/.env.local`:
```
NEXT_PUBLIC_API_BASE_URL
```

Server — `server/.env` (same set as `server/.env.example`):
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate?schema=public"
CLIENT_URL="http://localhost:3000"
JWT_ACCESS_SECRET="replace-with-a-random-secret-at-least-32-characters"
JWT_REFRESH_SECRET="replace-with-a-different-random-secret-at-least-32-characters"
NODE_ENV="development"
PORT="3002"
```

Validated in `server/src/config/env.ts` (zod): `DATABASE_URL` min 1, `CLIENT_URL` URL, both JWT secrets min 32 chars, `NODE_ENV ∈ {development,test,production}` default `development`, `PORT` positive int default `3002`. App throws on invalid env.

### Third-party services / integrations

| Service | State |
|---|---|
| PostgreSQL (`pg` + Prisma Pg adapter) | LIVE (User table) |
| Mapbox (`mapbox-gl`) | INSTALLED, not wired — map UI uses mock x/y coords |
| AWS S3 (`@aws-sdk/client-s3`, `lib-storage`) + `multer` | INSTALLED, no route or SDK call |
| Payment gateway | NONE (no dep, no API; billing pages are static) |
| Email / SMS / image CDN | NONE |
| Olive-branch legacy: AWS Cognito / Amplify | Residual only — `testUsers` with Cognito-style IDs in `lib/constants.ts`, `managerCognitoId` in seed fixture, `[data-amplify-authenticator]` CSS overrides in `globals.css`; no Amplify dep or code path |

Key configs: `client/next.config.ts` (`images.qualities=[75,90]`, Next 16 requirement), `client/components.json` (base-nova/neutral/lucide, aliases `@/*`), `server/prisma.config.ts` (`datasource.url = DATABASE_URL`), `server/tsconfig.json` (`module/moduleResolution: nodenext`, `rootDir: src`, `outDir: dist`).

---

## 8. Current State / Progress

### Fully built

- Landing page composition + static assets (all 12 `landing/` components, footer, 404 page).
- Cookie-based auth end-to-end (signup/login/logout/refresh/me, rotation + reuse detection, rate limits, `AuthBootstrap` + RTK Query reauth).
- Tenant dashboard shell + 9 routes with polished mock-data UI (overview, explore, rentals + `[id]` detail with gallery/lightbox/reviews/fees/contact/similar/tour-message modals, favorites, applications, residence, billing, payment-methods).
- Client-side browse/filter/sort (price, sqft, property type, location query, amenities) over `MOCK_RENTALS`; custom cluster map UI; responsive drawers/bottom sheets; toast feedback.
- Design tokens + dark mode scope in `globals.css`; 27 shadcn UI primitives; zod schemas for property/application/settings (validation ready, unconnected).

### In progress / not started (no backend)

- All domain persistence: Property/Location/Manager/Tenant/Lease/Application/Payment models, migrations, CRUD APIs.
- Connecting every dashboard page (favorites, applications, residence, billing, payment-methods, rentals) from mock data to real endpoints; favorites persistence; application submission; payments.
- File/image upload (FilePond installed; S3/multer installed; nothing wired).
- Real Mapbox map (dep installed; coords in mocks include `lat/lng` but UI uses `x/y`).
- Manager role flow (role exists on model; signup never sets it; `authorize` unused; no manager UI).
- Tests: none found (no `*.test.*` / `*.spec.*` outside `node_modules`).

### Known issues / TODOs (from code, not invented)

- `server/prisma/seed.ts` is **broken against current schema**: references 7 non-existent models, assumes integer IDs + `setval` sequences while `User.id` is UUID, and uses PostGIS `ST_GeomFromText` with no PostGIS migration. Running `npm run seed` will fail.
- `client/src/types/prismaTypes.d.ts` is a stale generated stub containing only `User` (consistent with schema, but anything importing legacy models will break).
- `authorize` middleware is dead code (no route uses it).
- Refresh cookie is `Path=/api/auth/refresh`-scoped — `fetchBaseQuery(credentials:include)` still sends it correctly for refresh, but browser devtools/clears limited to that path can confuse debugging; logout clears with matching path (correct).
- Duplicate hook: `hooks/use-mobile.ts` and `hooks/use-mobile.tsx` are identical — one should be deleted.
- Dead config: `client/app/tailwind.config.ts` (v3-style + `tailwindcss-animate`) is not wired into the Tailwind v4 PostCSS pipeline; `globals.css` is source of truth (also flagged in `DESIGN.md` §2 + open question on `primary` token conflict: CSS `--primary` blue vs config `primary` grey scale vs `baseColor: neutral`).
- Junk artifacts: `state/.DS_Store`, `types/.DS_Store`, `prisma/.DS_Store`; nested `client/app/tsconfig.json` of unclear purpose.
- `grep TODO|FIXME|XXX|HACK` finds **zero actionable code TODOs** — only input `placeholder=` attributes and a static "Manager review in progress" label; no `FIXME`/`HACK` markers. Roadmap below is therefore inferred from mock UI + schemas + fixtures + unused deps.
- `server/package.json` `postinstall: prisma skills sync` and `postprisma:generate` copying client types assume Prisma-skills tooling; will no-op/exit-0 outside that environment.

---

## 9. Design / UX Notes

- **System:** Tailwind CSS v4 CSS-first (`@import "tailwindcss"`, `@theme` mapping `--color-*` → `hsl(var(--*))`), shadcn `base-nova` + `neutral` + `lucide`, CSS-variable theming consumed as `bg-background/text-foreground/bg-primary/border-border/...`.
- **Tokens (`app/globals.css` `:root` / `.dark`):** light `--background 0 0% 98%`, `--primary 221.2 83.2% 53.3%` (blue) / dark `--primary 217.2 91.2% 59.8%`, `--radius 0.5rem` (cards `rounded-xl`, panels/banners `rounded-2xl`), sidebar tokens, custom scrollbar, Mapbox popup/marker classes (`.mapboxgl-popup-content`, `.marker-popup*`), `.dashboard-container` (`pt-8 pb-5 px-8`), `.dashboard-shell` (Geist), auth-form + Amplify-override + Sonner styles.
- **Typography:** `Geist` (`--font-geist-sans`), `Geist Mono`, `Fraunces` (`--font-display`) via `next/font/google` in root layout. Scale per `DESIGN.md`: hero `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight`, section H2 `text-2xl sm:text-3xl`, card titles `text-base font-medium`, body `text-sm sm:text-base text-muted-foreground`.
- **Layout:** page shell `flex flex-col min-h-screen`; sections `max-w-8xl mx-auto px-6 lg:px-8`, `py-16 lg:py-24`; dark hero/footer bookends; sticky glass navbar (`NAVBAR_HEIGHT=52`, transitions to `backdrop-blur-md bg-background/80` on scroll); spec source `client/DESIGN.md` maps every section to existing tokens/components — new Claude work should follow it and not introduce new palettes or token systems.

---

## 10. Next Steps / Roadmap

Inferred from mock UI (which defines the contract), unused deps/schemas/fixtures, and §8 issues — ordered by dependency:

1. **Restore domain schema:** design `Location / Property / Tenant(+profile) / Manager / Lease / Application / Payment (+ Favorite?)` in `schema.prisma`; decide PostGIS vs plain `lat/lng`; `prisma migrate`; regenerate client `prismaTypes.d.ts`.
2. **Fix/replace seeder:** rewrite `seed.ts` to match new schema (UUID-safe, no `setval` unless int IDs return, seed a demo tenant + manager + properties).
3. **Property APIs:** `GET /api/properties` (filter: city/query, price/sqft range, beds/baths, type, amenities) + `GET /api/properties/:id` (detail incl. fees/reviews/host) → swap `MOCK_RENTALS` / `rental-details-data.ts` for RTK Query hooks; keep `FilterState`/`INITIAL_FILTERS` shape to minimize UI churn.
4. **Favorites + applications:** persist favorites; `POST /api/applications` (consume `applicationSchema`) + tenant list/detail; manager review actions (needs `authorize(MANAGER)` + manager UI).
5. **Leases/residence/billing/payments:** lease → residence card; invoice/billing endpoints; choose a gateway (none today) before building payment-methods beyond local state.
6. **Uploads:** `multer` → S3 (`@aws-sdk/*`) `POST /api/uploads` → `photoUrls`; connect `propertySchema.photoUrls` + FilePond UI; add manager property-create page (schema exists, page doesn't).
7. **Maps:** wire `mapbox-gl` with real `lat/lng` (already in mock type) behind `NEXT_PUBLIC_MAPBOX_TOKEN`; keep custom cluster UI as fallback.
8. **Roles:** allow `MANAGER` signup/assignment (admin or invite flow), enforce via `authorize`, split manager vs tenant sidebars/dashboards.
9. **Hygiene:** delete duplicate `use-mobile` file, remove or wire `app/tailwind.config.ts`, remove `.DS_Store`s, resolve `primary`-token question in `DESIGN.md`, add at least auth + filter unit tests (none exist), document deploy (Dockerfile/CI/Vercel) and add `MAPBOX`/S3 vars to `.env.example`.

