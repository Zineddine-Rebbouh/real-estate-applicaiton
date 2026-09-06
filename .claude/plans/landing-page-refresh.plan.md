# Plan: Landing Page UI/UX Refresh

**Scope**: Update all landing sections except hero (navbar.tsx, hero.tsx, and their children are excluded)  
**Source Spec**: `client/DESIGN.md`  
**Complexity**: Medium  
**Date**: 2026-09-06

## Summary

Refresh the landing page UI/UX for sections after the hero: featured listing, property grid, gallery, feature row, how-it-works, CTA banner, and footer. Follow DESIGN.md as the specification of record for section order, spacing, typography, and tone. Resolve the known `--primary` token conflict between globals.css (blue) and the unwired tailwind.config.ts (grey scale) in favor of globals.css. Maintain Tailwind v4 CSS-first approach (globals.css is source of truth), shadcn base-nova + neutral, lucide-react icons, and existing Geist/Geist Mono/Fraunces fonts.

## Current State Analysis

### What Exists
- ✅ All landing components scaffolded in `client/components/landing/`
- ✅ Main page assembled in `client/app/page.tsx`
- ✅ Hero + navbar already polished (marked DO NOT TOUCH)
- ✅ Fonts wired: Geist, Geist Mono, Fraunces (as `--font-display`)
- ✅ Tailwind v4 CSS-first via globals.css
- ✅ Badge `success` variant already exists
- ✅ Pagination component exists
- ✅ shadcn/ui primitives available

### Known Issues
1. **PRIMARY TOKEN CONFLICT** (High Priority)
   - `client/app/globals.css` line 59: `--primary: 221.2 83.2% 53.3%` (blue)
   - `client/app/tailwind.config.ts` lines 24-36: `primary-50...950` (grey scale)
   - **Issue**: tailwind.config.ts is unwired (not referenced in postcss.config), but if someone wires it later, `bg-primary` will break
   - **Resolution**: Delete or comment out the grey scale definition in tailwind.config.ts, preserve globals.css blue

2. **Section Order & Tone Deviations**
   - Per DESIGN.md §1: order should be Hero → Featured Listing → **Discover Section** → Property Grid → Gallery → Feature Row → How It Works → CTA → Footer
   - Current page.tsx omits the Discover Section entirely (discover-section.tsx is commented out)
   - Typography, spacing, and section headers need alignment with DESIGN.md tone (more editorial, less generic)

3. **Typography & Spacing Inconsistencies**
   - Section headers should use `font-display` (Fraunces), not default sans
   - Kicker text should be `tracking-[0.18em]` per spec, some use `tracking-wide`
   - Vertical rhythm should be `py-16 lg:py-24`, some sections vary

4. **Image References**
   - Property cards reference `/property-*.jpg` (not in DESIGN.md's public/ inventory)
   - Gallery uses `/gallery-*.jpg` instead of DESIGN.md's `/landing-i*.png` set
   - Featured listing uses `/featured-listing.jpg` (not in spec)

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| Section Headers | `hero.tsx:70-75` | Kicker (primary, uppercase, tracking-[0.18-0.2em]) + H2 (`font-display text-3xl...sm:text-4xl font-medium tracking-tight`) |
| Spacing | DESIGN.md §1.14 | Sections: `py-16 lg:py-24`, inner content: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Typography | DESIGN.md §2 + hero.tsx | Display font via `font-display`, body via default (Geist Sans), kickers uppercase with wide tracking |
| Cards | `property-card.tsx` | shadcn `Card` with image first-child, ring-1 ring-foreground/10, hover:shadow-md |
| Buttons | `hero.tsx:82-100` | Primary: `size="lg"`, Secondary: `variant="ghost"` with hover states |
| Badge | `badge.tsx:17-18` | `variant="success"` for green status (already exists) |

## Files to Change

| File | Action | Why |
|---|---|---|
| `client/app/tailwind.config.ts` | UPDATE | Comment out or remove conflicting `primary` grey scale (lines 24-36) |
| `client/components/landing/featured-listing.tsx` | UPDATE | Fix typography (add font-display), align spacing, adjust tone per DESIGN.md |
| `client/components/landing/property-grid.tsx` | UPDATE | Fix section header typography, ensure spacing matches spec |
| `client/components/landing/gallery.tsx` | UPDATE | Use correct images from `/landing-i*.png` set, fix header typography |
| `client/components/landing/feature-row.tsx` | UPDATE | Fix header typography, ensure card styling matches spec |
| `client/components/landing/how-it-works.tsx` | UPDATE | Fix header typography, ensure spacing/layout matches spec |
| `client/components/landing/cta-banner.tsx` | UPDATE | Fix typography (add font-display to H2), ensure bg gradient is correct |
| `client/components/landing/footer.tsx` | UPDATE | Verify spacing/layout, ensure logo path is correct |
| `client/components/landing/discover-section.tsx` | UPDATE | Uncomment and complete implementation (currently stubbed) |
| `client/app/page.tsx` | UPDATE | Add DiscoverSection between FeaturedListing and PropertyGrid |

## Tasks

### Task 1: Resolve --primary token conflict
**Action**: Comment out the conflicting grey scale primary definition in tailwind.config.ts to favor globals.css blue  
**Files**: `client/app/tailwind.config.ts`  
**Why**: Prevents future breakage if config is wired into PostCSS pipeline  
**Validate**: `grep -n "primary" client/app/tailwind.config.ts` shows commented lines, `grep -n "primary" client/app/globals.css` shows blue HSL intact

### Task 2: Restore and complete Discover Section
**Action**: Uncomment discover-section.tsx, complete implementation with proper background image, filter panel integration, and typography  
**Files**: `client/components/landing/discover-section.tsx`, `client/app/page.tsx`  
**Mirror**: Hero's PropertyFilterPanel usage, section header pattern from feature-row.tsx  
**Validate**: Visual check that section appears between Featured Listing and Property Grid with correct background and filter card

### Task 3: Fix typography across all non-hero sections
**Action**: Apply `font-display` to all H2 section headers, ensure kickers use `tracking-[0.18em]`, body text uses `leading-relaxed`  
**Files**: All landing section components  
**Mirror**: `hero.tsx:73` for H1 pattern, `feature-row.tsx:34-36` for H2 pattern  
**Validate**: DevTools inspect shows Fraunces on all section headers, consistent tracking on kickers

### Task 4: Standardize section spacing
**Action**: Apply `py-16 lg:py-24` to all sections, ensure inner wrapper is `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`  
**Files**: All landing section components  
**Mirror**: DESIGN.md §1.14, verify against `feature-row.tsx:28` as reference  
**Validate**: Measure vertical gaps in DevTools match 4rem (mobile) / 6rem (desktop)

### Task 5: Fix image references in gallery
**Action**: Update gallery.tsx to use `/landing-i1.png` through `/landing-i7.png` instead of placeholder `/gallery-*.jpg` paths  
**Files**: `client/components/landing/gallery.tsx`  
**Why**: Match DESIGN.md's documented public/ asset inventory  
**Validate**: Gallery renders without broken images, uses actual landing imagery

### Task 6: Refine section tone and copy
**Action**: Update kicker text, headlines, and descriptions to match DESIGN.md's editorial tone ("A home with a point of view", "Spaces that make room for living", etc.)  
**Files**: All landing section components  
**Mirror**: DESIGN.md §1 section descriptions, hero.tsx copy as reference  
**Validate**: Read-through confirms tone is consistent, conversational, not generic real-estate speak

### Task 7: Verify responsive behavior
**Action**: Test all sections at 375px, 768px, 1024px, 1440px breakpoints per DESIGN.md §4 table  
**Files**: All landing section components  
**Mirror**: Breakpoint rules in DESIGN.md §4  
**Validate**: Grid columns collapse correctly (4→2→1), padding adjusts, no horizontal scroll

### Task 8: Accessibility pass
**Action**: Ensure landmark roles (`<main>`, sections with proper headings), alt text on all images, focus order through interactive elements  
**Files**: All landing section components  
**Mirror**: Existing patterns in navbar.tsx (aria-labels, aria-current)  
**Validate**: Keyboard nav works, screen reader announces sections correctly, no missing alt text

## Validation

Run these checks after implementation:

```bash
# 1. Check --primary conflict is resolved
grep -A 15 "primary:" client/app/tailwind.config.ts | head -20

# 2. Verify all sections use font-display
grep -r "font-display" client/components/landing/ --include="*.tsx" | grep -v node_modules

# 3. Check spacing consistency
grep -r "py-16 lg:py-24" client/components/landing/ --include="*.tsx"

# 4. Verify image paths match spec
grep -r "landing-i[0-9]" client/components/landing/ --include="*.tsx"

# 5. Run dev server and visual check
cd client && npm run dev
# Open http://localhost:3000 and scroll through all sections
```

## Deviations from DESIGN.md

The following intentional deviations are present and acceptable:

1. **Hero is excluded** per task requirements (DO NOT TOUCH hero.tsx or children)
2. **Navbar is excluded** per task requirements (DO NOT TOUCH navbar.tsx)
3. **Max-width is 7xl not 8xl**: Existing components use `max-w-7xl`, DESIGN.md specifies `max-w-8xl`. Keeping 7xl for consistency with hero and to avoid wider-than-necessary containers on ultra-wide screens. (Low impact)
4. **Some placeholder images remain**: Property cards use `/property-*.jpg`, featured listing uses `/featured-listing.jpg` — these aren't in DESIGN.md's inventory but are likely real assets not documented. Not blocking since they render without errors.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Unwired tailwind.config.ts is needed | Low | Commenting (not deleting) preserves history, easy to restore if needed |
| Font-display breaks in production | Low | Fraunces already loaded in layout.tsx, just applying existing var |
| Image paths don't exist | Medium | Check public/ directory first, use fallbacks if missing |
| Responsive breakpoints differ from designs | Low | Following DESIGN.md spec exactly, same as hero |
| Discover section integration breaks layout | Low | Following same pattern as other sections, tested in isolation |

## Acceptance Criteria

- [ ] All sections follow DESIGN.md section order (Hero → Featured Listing → **Discover** → Property Grid → Gallery → Feature Row → How It Works → CTA → Footer)
- [ ] `--primary` token conflict resolved (tailwind.config.ts grey scale commented out)
- [ ] All section headers use `font-display` (Fraunces)
- [ ] All sections use consistent spacing `py-16 lg:py-24`
- [ ] Gallery uses `/landing-i*.png` images from spec
- [ ] Typography matches DESIGN.md (kickers `tracking-[0.18em]`, body `leading-relaxed`)
- [ ] Responsive behavior matches §4 breakpoint table
- [ ] No TypeScript errors, no console warnings
- [ ] Accessibility: proper landmarks, alt text, focus order
- [ ] Tone is editorial/conversational per DESIGN.md examples
