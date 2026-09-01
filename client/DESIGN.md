# DESIGN.md — Real Estate Landing Page Specification

> Blueprint for building a Next.js landing page that reproduces the layout, aesthetic, and structure of the "Chata" reference (dark hero, glass navbar, property card grid, filtered search block). This spec is written **against this repo's actual stack** — do not introduce new libraries, config files, or design-token systems not already present.

## 0. Workspace Audit (what already exists)

Findings from scanning `client/` before writing this spec. Nothing below was changed.

| Area | Finding |
|---|---|
| Framework | Next.js `16.3.4`, App Router, React `19.2.8`, TypeScript |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` (CSS-first). A legacy `app/tailwind.config.ts` (v3-style, `tailwindcss-animate` plugin) also exists — **not currently wired into the v4 PostCSS pipeline**. Treat CSS variables in `app/globals.css` as the source of truth; flag the config duplication rather than silently resolving it (see §6). |
| Component system | shadcn/ui, style `base-nova`, base color `neutral`, icon library `lucide-react`, primitives from `@base-ui/react` (not Radix). Config: `components.json`. |
| Existing UI primitives | `components/ui/`: `avatar, badge, button, card, checkbox, command, dialog, dropdown-menu, input-group, input, label, navigation-menu, radio-group, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, tooltip` |
| Utilities | `lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatPriceValue`, `cleanParams`, `withToast` |
| State | Redux Toolkit + RTK Query scaffold in `state/` (`api.ts`, `redux.tsx`) — not required for a static landing page, but available if the hero search needs to read live filter state later |
| Fonts | `Geist` and `Geist Mono` already loaded in `app/layout.tsx` via `next/font/google`, exposed as CSS vars `--font-geist-sans` / `--font-geist-mono` |
| `app/page.tsx` | Still the default `create-next-app` boilerplate — this is the file to replace with the landing page |
| Animation | `framer-motion` is a dependency — available for entrance/hover motion, not yet used anywhere |
| **Pre-existing landing assets in `public/`** | `landing-splash.jpg` (hero bg candidate), `landing-discover-bg.jpg`, `landing-call-to-action.jpg`, `landing-i1.png` … `landing-i7.png` (gallery/feature imagery), `landing-icon-calendar.png`, `landing-icon-heart.png`, `landing-icon-wand.png` (3 feature icons), `landing-search1.png` `landing-search2.png` `landing-search3.png` (3-step "how it works" imagery), `logo.svg` |

These filenames are a strong signal of the page's intended structure (splash hero → discover section → 3-icon feature row → 3-step search process → gallery → call-to-action) and should be treated as the actual content skeleton to build against — do not fetch or invent placeholder imagery.

---

## 1. Visual Hierarchy & Layout Architecture

Reading order top → bottom, matching the reference image:

### 1.1 Navigation (sticky/fixed header)
- Full-width bar, `max-w-7xl` inner container, `mx-auto`, `px-6 lg:px-8`, height ~`72px`.
- Layout: `flex items-center justify-between`.
- Left: logo mark (`logo.svg`) + wordmark, `flex items-center gap-2`.
- Center: primary nav links (`Start / About / Listings / Features / Gallery / Contact`) — `hidden lg:flex items-center gap-8`, hidden below `lg`.
- Right: locale switch (`PL / EN` text toggle), a divider, avatar + location label (`Wroclaw, Złota 66`)-style user chip, then a hamburger/menu icon for mobile — `flex items-center gap-4`.
- Background: transparent over the hero image with a bottom hairline (`border-b border-white/10`) OR solid dark bar (`bg-neutral-950/90 backdrop-blur`) if it needs to stay legible while scrolling. On scroll, it should transition to a solid/blurred state (`backdrop-blur-md bg-background/80 border-b border-border`).
- z-index: `z-50`, `fixed top-0 inset-x-0` if sticky.

### 1.2 Hero
- Full-bleed section, `min-h-[85vh]` to `100vh`, background image `landing-splash.jpg` with a dark gradient overlay (`bg-gradient-to-b from-black/70 via-black/40 to-black/70`) so light nav/text stay legible.
- Content wrapped in `max-w-7xl mx-auto px-6 lg:px-8`, vertically centered (`flex flex-col items-start justify-center h-full`) or bottom-aligned near a search panel.
- Headline: 1–2 lines, e.g. "Neat architecture design" equivalent — large, white, tight tracking.
- Optional thumbnail strip (small preview tiles bottom-right of hero image) — `absolute bottom-6 right-6 hidden lg:flex gap-2`.
- A floating/overlapping **Search panel card** sits either inline below the headline or overlapping the hero/next section boundary (the reference shows a white card with "Total area / Floor / Number of bedrooms / bathrooms" filters + a primary Search button) — see §3.6.

### 1.3 Featured Listing / Highlight Strip (the "Real Estate Title" block)
- Two-column split inside a white/light card region directly under the hero: `grid grid-cols-1 lg:grid-cols-2 gap-8 items-center`.
- Left column: status badge ("Ready to sell"), title, address line, two stat rows (icon + label + value) for "Number of flats" and "Total area".
- Right column: a single large rounded image (`rounded-xl overflow-hidden`, `aspect-[4/3]`).
- Section padding: `py-16 lg:py-24`.

### 1.4 "Find perfect flat for you!" — Filter/Discover section
- Background: `landing-discover-bg.jpg` as a textured/photo background with an overlay, OR a plain muted section — content sits in a **white filter card** (`bg-card rounded-2xl shadow-lg p-6 lg:p-8`) that overlaps the section imagery.
- Heading + subcopy left-aligned above the filter card.
- Filter row: 3 grouped inputs (`Total area`, `Floor`, `Number of bedrooms` [+ bathrooms on tablet card variant]), each rendered as a labeled dual "from/to" input pair — `grid grid-cols-1 sm:grid-cols-3 gap-4`, each group `flex flex-col gap-1.5`.
- A primary `Search` button, full-width on mobile, auto width with icon on desktop.

### 1.5 Featured Flats grid (property cards)
- Section header row: `flex items-center justify-between` — "Featured flats" title + "Change properties" link + a view-toggle (grid/list icon buttons).
- Grid: `grid grid-cols-2 lg:grid-cols-4 gap-6` (reference shows 4-up on tablet/desktop, 2-up condensed on the tablet mockup, 1-up on mobile).
- Pagination row below the grid, centered: `flex items-center justify-center gap-2` numbered pager + prev/next chevrons.

### 1.6 Gallery strip
- Full-width or contained 3-image row using `landing-i1.png … landing-i7.png` — `grid grid-cols-1 sm:grid-cols-3 gap-4`, uniform `aspect-square` or `aspect-[4/3]` crops, `rounded-xl overflow-hidden`.

### 1.7 Feature / value-prop row (3 icons)
- `landing-icon-calendar.png`, `landing-icon-heart.png`, `landing-icon-wand.png` each paired with a short heading + 1-line description — `grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left`.

### 1.8 "How it works" 3-step process
- Uses `landing-search1/2/3.png` as step illustrations — numbered steps, `grid grid-cols-1 lg:grid-cols-3 gap-10`, each step: number badge, image, title, description.

### 1.9 Call to action
- `landing-call-to-action.jpg` as a full-width banner background, dark overlay, centered content: heading, subcopy, one primary button. `rounded-2xl mx-6 lg:mx-8` if treated as an inset card, or full-bleed `py-24`.

### 1.10 Footer
- `bg-neutral-950 text-neutral-300` (dark, matches hero tone for bookend symmetry).
- 4-column link grid (`grid grid-cols-2 lg:grid-cols-4 gap-8`) + logo/blurb column, then a bottom bar (`border-t border-white/10 pt-6 mt-12 flex flex-col sm:flex-row justify-between text-xs`) with copyright + social icons.

### Structural containers (used everywhere)
- Page shell: `flex flex-col min-h-screen` (already the pattern in `app/layout.tsx`'s `<body>`).
- Content width: `max-w-7xl mx-auto px-6 lg:px-8` for all sections except full-bleed imagery.
- Vertical rhythm between sections: `py-16 lg:py-24` (`py-24 lg:py-32` for hero-adjacent sections).

---

## 2. Design Tokens & Theme Mapping

**Do not invent a new palette.** Map everything to the CSS variables already defined in `app/globals.css` (`:root` / `.dark`), consumed via Tailwind v4's automatic `hsl(var(--x))` utilities (`bg-background`, `text-foreground`, `bg-primary`, etc.) — the same variables the shadcn components already use.

| Reference visual | Existing token to use | Notes |
|---|---|---|
| Deep navy/black hero background, dark footer | `bg-neutral-950` / `bg-black` (Tailwind core scale) or `--background` in `.dark` scope (`hsl(222.2 84% 3.9%)`) | The reference's blue-navy hero is closer to a one-off `bg-gradient-to-b from-[#0b1330] to-[#151b3d]` gradient over the photo than to the neutral `--primary` scale below — do **not** repurpose `--primary` for the hero background. |
| Primary action color (blue "Search" button, links, badges) in reference | ⚠️ Conflict to flag, not silently resolve: `app/globals.css` defines `--primary` as blue (`hsl(221.2 83.2% 53.3%)`), matching the reference. But `app/tailwind.config.ts` (currently unwired) separately defines `primary` as a **neutral grey/black scale** (`primary-50…950`), and `components.json` sets `baseColor: "neutral"`. Use the CSS-variable `--primary` (blue) for interactive elements, since that's what `components/ui/button.tsx` already renders (`bg-primary text-primary-foreground`). Get the tailwind config duplication resolved by the team before this ships — see §6. |
| Card backgrounds | `bg-card` / `text-card-foreground` (`components/ui/card.tsx` already applies `ring-1 ring-foreground/10 rounded-xl`) | Reuse `<Card>` as-is; don't reimplement card chrome. |
| Muted/secondary text (address lines, subcopy) | `text-muted-foreground` | |
| Borders/dividers | `border-border` | |
| Success/"Ready to sell" badge | `Badge` component, custom `variant="secondary"` or a green accent added via `className` (no `--success` token exists yet — either add one to `:root`/`.dark` in `globals.css` or use a one-off `bg-emerald-500/10 text-emerald-600` combo scoped to this badge only) | |
| Focus rings | `focus-visible:ring-ring/50` (already baked into `button.tsx` / `input.tsx`) | Don't override. |
| Corner radius | `--radius: 0.5rem` → Tailwind `rounded-lg`; cards use `rounded-xl`; hero search panel/CTA banner use `rounded-2xl` for a slightly heavier feel matching the reference's soft panels. | |

### Typography
- Font family: `--font-geist-sans` (already loaded, sans-serif, matches the reference's clean grotesque headline face) for all UI text; `--font-geist-mono` only if a stat/price needs tabular figures.
- Scale (Tailwind core, no new config needed):
  - Hero H1: `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight`
  - Section H2: `text-2xl sm:text-3xl font-semibold tracking-tight`
  - Card/listing title: `text-base font-medium` (matches `CardTitle`'s existing `text-base font-medium` default — reuse, don't override)
  - Body/subcopy: `text-sm sm:text-base text-muted-foreground leading-relaxed`
  - Stat value (e.g. "960m²"): `text-lg font-semibold`
  - Stat label (e.g. "TOTAL AREA"): `text-xs font-medium uppercase tracking-wide text-muted-foreground`
  - Price on cards: `text-base font-semibold` (reuse `formatPriceValue()` from `lib/utils.ts` for formatting — do not hardcode `$` strings)
- Line-height: default Tailwind leading scale; headlines `leading-tight`, body `leading-relaxed`.

### Spacing standard
- Section vertical padding: `py-16 lg:py-24`
- Card internal padding: inherit `Card`'s `--card-spacing` var (`p-4`, `p-3` for `size="sm"`) — don't hardcode custom padding on top of it.
- Grid gaps: `gap-6` for card grids, `gap-4` for filter inputs, `gap-8` for feature columns.
- Icon-to-text gap: `gap-2` / `gap-1.5` (matches existing button/badge patterns).

---

## 3. Component Breakdown & Props Specification

Map every visual element in the reference to an existing primitive first; only propose a new component when nothing in `components/ui/` fits.

### 3.1 Navbar — **new composed component**, `components/landing/navbar.tsx`
- Built from: `NavigationMenu` (existing, for the desktop link row), `Avatar` (existing, for the user chip), `Sheet` (existing, for the mobile slide-out menu), plain `<Button variant="ghost" size="icon">` for the hamburger trigger.
- Props: `{ transparent?: boolean }` — toggles the transparent-over-hero vs solid-on-scroll visual state (see §1.1).
- States: default / scrolled (solid bg) / mobile-sheet-open.

### 3.2 Hero — **new**, `components/landing/hero.tsx`
- Plain composition: `next/image` (fill, `priority`) for `landing-splash.jpg` + a headline + the search panel (§3.6) as a child slot.
- No new primitive needed.

### 3.3 Buttons
- Primary CTA ("Search", "Deploy"-style banner button): `<Button variant="default" size="lg">` (existing `button.tsx`, variant `default` already renders `bg-primary text-primary-foreground hover:bg-primary/80`).
- Secondary/outline (e.g. "View details" on cards, "Documentation"-style pill): `<Button variant="outline" size="sm">`.
- Icon-only (view toggle, chevrons, hamburger): `<Button variant="ghost" size="icon">`.
- **Do not** create new button variants — `variant`/`size` already cover every visual state in the reference (default/outline/ghost/secondary × xs/sm/default/lg/icon).
- Interactive states already implemented and to be relied on as-is: hover (`hover:bg-primary/80` etc.), focus-visible ring, active (`active:translate-y-px`), disabled (`opacity-50`).

### 3.4 Badges ("Ready to sell", property status pills)
- `<Badge variant="secondary">` for neutral status; for the green "ready" state either add a `success` variant to `badgeVariants` in `components/ui/badge.tsx` (extends the existing `cva` config the same way `secondary`/`destructive` are defined) or pass a scoped `className` override — prefer adding the variant since it's a repeatable status across listing cards.

### 3.5 Property Card ("Small Flat / Large Flat / Medium Flat / Studio")
- Compose from existing `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` (`components/ui/card.tsx`) — the component already supports "image as first child gets rounded top corners" (`*:[img:first-child]:rounded-t-xl`), which matches the reference's image-topped cards exactly.
- New wrapper: `components/landing/property-card.tsx` with props:
  ```ts
  type PropertyCardProps = {
    image: string;
    title: string;          // "Small Flat"
    totalArea: number;      // m²
    bedrooms: number;
    floor: number;
    price: number;          // pass through formatPriceValue()
    status?: "available" | "sold" | "pending";
    href: string;           // "View details" link target
  };
  ```
- States: default, hover (`hover:ring-foreground/20` subtle lift + `hover:shadow-md` — extend, don't replace, the base card ring), focus-within (for keyboard nav to the "View details" link/button).

### 3.6 Search / Filter panel (hero overlay + "Find perfect flat" section)
- Compose from existing `Input`, `Label`, `Select` (for bedroom/bathroom counts if using a dropdown instead of free text), and `Button`.
- New wrapper: `components/landing/property-filter-panel.tsx`, props:
  ```ts
  type FilterField = { label: string; fromPlaceholder: string; toPlaceholder: string; unit?: string };
  type PropertyFilterPanelProps = {
    fields: FilterField[];       // "Total area", "Floor", "Number of bedrooms", "Number of bathrooms"
    onSearch: (values: Record<string, string>) => void;
    variant?: "hero" | "inline"; // hero = overlaid card on dark bg; inline = section on light bg
  };
  ```
- Each field renders as a small labeled group: `Label` (`text-xs font-medium`) above a two-`Input` row separated by "to" text, mirroring the reference's `[from] to [to]` inputs.
- States: input focus (existing `focus-visible:ring-3 focus-visible:ring-ring/50` from `input.tsx`), button loading (disable + spinner icon while `onSearch` is pending).

### 3.7 Pagination (under the flats grid)
- No existing pagination primitive in `components/ui/`. Build `components/landing/pagination.tsx` using `Button variant="ghost" size="icon-sm"` for numbers/chevrons, with an `aria-current="page"` active state styled via `data-active` → `bg-primary text-primary-foreground`.

### 3.8 View toggle (grid/list icon buttons)
- `Tabs`/`TabsList` (existing) repurposed as an icon-only segmented control, or two `Button variant="ghost" size="icon-sm"` with an active/inactive `aria-pressed` state — prefer `Tabs` since it already ships correct ARIA and focus handling.

### 3.9 Gallery tiles / feature icons
- Plain `next/image` inside a `rounded-xl overflow-hidden` wrapper — no interactive component needed unless the gallery becomes a lightbox (out of scope here; use `Dialog`, already available, if that's added later).

---

## 4. Responsive Rules & Breakpoints

Use Tailwind's default breakpoints already relied on elsewhere in the repo (`sm`, `lg` appear in `app/page.tsx`) — no custom breakpoints needed.

| Breakpoint | Navbar | Hero | Filter panel | Property grid | Gallery/feature rows |
|---|---|---|---|---|---|
| `< sm` (mobile, matches the reference's phone-width reading) | Logo + hamburger only; links + locale/user chip move into `Sheet` | Headline stacks full-width, thumbnail strip hidden, search panel becomes a stacked full-width card below the headline (not overlapping) | Fields stack 1-per-row (`grid-cols-1`), Search button full-width | `grid-cols-1` | `grid-cols-1` |
| `sm` (≥640px) | — | — | — | — | `grid-cols-3` (feature icons, gallery) |
| `md` (≥768px) | — | Thumbnail strip may appear | Fields `grid-cols-2` | `grid-cols-2` (matches the tablet mockup in the reference) | — |
| `lg` (≥1024px, matches the reference's "tablet device" mockup width) | Full inline nav links visible, hamburger hidden | Full hero height, thumbnail strip visible | Fields `grid-cols-3`/`grid-cols-4`, inline (not stacked) button | `grid-cols-4` | `grid-cols-3` |
| `xl`/`2xl` | Container hits `max-w-7xl` and stops growing — extra viewport width becomes side margin, not wider content | — | — | — | — |

General rules:
- Section horizontal padding steps: `px-4` (mobile) → `px-6` (sm) → `px-8` (lg), expressed as `px-4 sm:px-6 lg:px-8`.
- Section vertical padding compresses on mobile: `py-12 sm:py-16 lg:py-24`.
- The overlapping search panel (hero → next section) only overlaps at `lg+`; below that it stacks in normal flow to avoid clipping/overflow on short viewports.
- Images: always rendered via `next/image` with explicit `sizes` reflecting the grid column count at each breakpoint (e.g. cards: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"`).

---

## 5. Step-by-Step Implementation Plan

Ordered so each step is independently testable and nothing downstream breaks if you stop partway.

1. **Confirm the Tailwind v4/v3 config conflict is resolved first** (see §6) — building on top of an unwired `tailwind.config.ts` risks styles that work in this task but silently regress once the config situation is fixed. If it can't be resolved immediately, build using only utility classes already proven to work in `app/globals.css`/`components/ui/*` (core Tailwind scale + the existing CSS variables), and avoid any class that depends on the disputed `primary-50…950` scale.
2. **Scaffold section files** under `app/(landing)/` or directly compose them into `app/page.tsx` — replace the boilerplate content, keep `app/layout.tsx` untouched (fonts/shell are already correct).
   - `components/landing/navbar.tsx`
   - `components/landing/hero.tsx`
   - `components/landing/featured-listing.tsx`
   - `components/landing/property-filter-panel.tsx`
   - `components/landing/property-grid.tsx` + `property-card.tsx`
   - `components/landing/gallery.tsx`
   - `components/landing/feature-row.tsx`
   - `components/landing/how-it-works.tsx`
   - `components/landing/cta-banner.tsx`
   - `components/landing/footer.tsx`
3. **Build static, unstyled-data versions first** (hardcoded arrays of 4 sample listings, 3 features, 3 steps) so layout/spacing can be verified against the reference image before wiring any real data source.
4. **Wire existing primitives, not new styling systems** — every section should import from `@/components/ui/*` and `@/lib/utils` (`cn`, `formatPriceValue`) rather than writing new one-off class combinations that duplicate what `Button`/`Card`/`Badge` already do.
5. **Add the one missing primitive** (`Pagination`, §3.7) and the one variant extension (`Badge` `success` variant, §3.4) as small, isolated diffs to their existing files — do not fork them into new components.
6. **Assemble `app/page.tsx`** as a plain server component that renders the sections in order (§1.1–1.10); no client-side state needed except inside `property-filter-panel.tsx` (mark that one `"use client"`).
7. **Responsive pass**: verify each section against the table in §4 at `375px`, `768px`, `1024px`, `1440px`.
8. **Accessibility pass**: landmark roles (`<nav>`, `<main>`, `<footer>`), alt text on every `next/image`, focus order through the filter panel and pagination, `aria-current` on the active page number.
9. **Do not touch**: `state/`, `hooks/`, `types/`, `lib/schemas.ts`, or anything under `server/` — this task is presentation-only and none of those are needed for a static landing page.
10. **Read `AGENTS.md`/`node_modules/next/dist/docs/` before writing App Router code** — this repo is on Next.js 16, which the agent-generated `AGENTS.md` explicitly flags as having breaking changes versus older Next.js conventions; verify App Router file conventions and `next/image` API against that local doc source rather than assumed prior knowledge.

---

## 6. Open Question to Resolve Before/During Build (not a blocker, but flag it)

`components.json` (`baseColor: "neutral"`) and `app/globals.css`'s `--primary` (blue, `hsl(221.2 …)`) both point to a **blue accent system**, matching this reference image. But `app/tailwind.config.ts` independently redefines `primary`/`secondary` as **grey and dusty-red scales**, and isn't currently referenced by `postcss.config.mjs` (which only loads `@tailwindcss/postcss`, not this config file) — so right now it's likely dead code, but if someone wires it back in later, `bg-primary` would silently change meaning. Recommend either deleting `app/tailwind.config.ts` if Tailwind v4's CSS-based config fully replaces it, or reconciling the two `primary` definitions — flagging rather than resolving, since this touches shared config outside this task's scope.
