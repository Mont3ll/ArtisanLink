# ChapaWorks Design System v1.0 — Spec

**Date:** 2026-05-14  
**Status:** Approved for implementation

---

## 1. Problem

ChapaWorks has inconsistent design across pages. Public pages use stone/warm tones from the editorial era. Dashboard pages have blue-tinted shadcn defaults. Some pages still use glass-card patterns from the old dark design. The new Airbnb-inspired tokens introduced on the homepage are not yet propagated system-wide.

---

## 2. Design Token Reference

### Canvas & Surfaces
| Token | Value | Use |
|---|---|---|
| `canvas` | `#ffffff` | Default page background for all public pages |
| `surface-soft` | `#f7f7f7` | Hover backgrounds, filter bands, skeleton fills |
| `surface-strong` | `#f2f2f2` | Avatar placeholder fills |

### Text
| Token | Tailwind | Use |
|---|---|---|
| `ink` | `text-[#222]` | Headlines, nav labels, strong text |
| `body` | `text-[#3f3f3f]` | Running body text |
| `muted` | `text-[#6a6a6a]` | Captions, secondary labels |
| `muted-soft` | `text-[#929292]` | Disabled, copyright |

### Brand Accent
| Token | Tailwind | Use |
|---|---|---|
| `primary` | `emerald-700` / `#047857` | CTAs, search orb, active states, verified badge, links |
| `primary-hover` | `emerald-800` | Press/hover state |
| `primary-light` | `emerald-50` | Pill hover background |

### Borders
| Token | Value | Use |
|---|---|---|
| `hairline` | `#dddddd` | Card borders, search bar, dividers |
| `hairline-soft` | `#ebebeb` | Section separators |

### Elevation
Single tier only:
```
box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px
```
Applied on: card hover, search bar at rest, dropdowns.

---

## 3. Shape Language

| Element | Radius | Tailwind |
|---|---|---|
| Buttons | 8px | `rounded-lg` |
| Cards | 12px | `rounded-xl` |
| Search bar | pill | `rounded-full` |
| Badges, pills | full | `rounded-full` |
| Form inputs | 8px | `rounded-lg` |
| Category tabs | 0 | underline only |

---

## 4. Typography

| Role | Size | Weight | Tailwind |
|---|---|---|---|
| Page headline | 28px | 600 (semibold) | `text-2xl md:text-3xl font-serif font-semibold` |
| Section head | 22px | 600 | `text-xl font-serif font-semibold` |
| Card title | 15px | 500 | `text-sm font-medium` |
| Body | 14-16px | 400 | `text-sm` |
| Caption | 14px | 500 | `text-sm font-medium` |
| Micro | 12-13px | 400 | `text-xs` |

No heavy `font-bold` on body text. Serif reserved for page/section headings.

---

## 5. Navigation

### Public Nav (`components/layout/public-nav.tsx`)
Links: **Browse Artisans** · **Pricing** · **For Artisans**  
Remove: ~~How It Works~~ (move to footer only)  
Logo: Tesseract icon + "ChapaWorks" serif wordmark — far left.

### Category Strip (homepage + browse page)
Sticky under nav. Tab-underline active state (2px `#222` underline). Text: `text-xs font-medium`. No pill backgrounds.

---

## 6. Artisan Card Design — Hybrid

The card combines a **portfolio-image header** with **rich-info metadata**, solving both problems:
- Shows work quality (not just face) when portfolio images exist
- Falls back to a clean info-first layout when no portfolio images exist

### Structure

```
┌────────────────────────────────┐
│  [Photo: portfolio img or      │ ← 4:3 aspect ratio, rounded-xl top
│   emerald gradient + initials] │   Heart button top-right (absolute)
│  [Available badge] [Verified]  │   Badges overlaid
├────────────────────────────────┤
│  [Avatar 40px] Name ★ 4.8(47) │ ← Profile pic + name + rating inline
│  Carpenter · Nairobi           │ ← Profession · Location (muted)
│  KES 1,200 / hr                │ ← Price
│  [Skills: tag1 tag2]           │ ← Max 2 specialization pills
├────────────────────────────────┤
│  [View Profile] [Message]      │ ← Two action buttons (always visible)
└────────────────────────────────┘
```

### Data needed
The search API needs to include `portfolioThumbnail` (first public portfolio image URL) in results.

### Fallback hierarchy for photo area
1. First portfolio image (if artisan has `isPublic: true` portfolio items)
2. Profile image (if set)
3. Emerald gradient with initials

---

## 7. Pages to Update

### Public Pages
1. `app/page.tsx` — Homepage (marketplace-first ✓ done, card design to update)
2. `app/artisans/page.tsx` — Browse page (card design + page bg)
3. `app/artisans/[id]/page.tsx` — Artisan profile
4. `app/pricing/page.tsx` — Pricing
5. `app/for-artisans/page.tsx` — For artisans

### Shared Components  
6. `components/layout/public-nav.tsx` — Remove "How It Works" link
7. `components/landing/header.tsx` — Same

### Auth Pages
8. `app/(auth)/sign-in/[[...sign-in]]/page.tsx` ✓ done
9. `app/(auth)/sign-up/[[...sign-up]]/page.tsx` ✓ done

### Dashboard  
The shadcn sidebar + layout stays — it's appropriate for a dense tool UI. Targeted fixes:
10. Replace `blue-*` with `emerald-*` across dashboard components
11. `invite-artisans.tsx` — pending count blue → emerald
12. `notification-bell.tsx` — message blue → emerald
13. `artisan-map.tsx` — spinner blue → emerald
14. `artisan/jobs/[id]/page.tsx` — info box blue → emerald/stone
15. `artisan/subscription/page.tsx` — loading spinner blue → emerald

---

## 8. Search API Update

`app/api/search/artisans/route.ts` — Add `portfolioThumbnail` to the result shape:
- Query: `portfolioItems: { where: { isPublic: true }, orderBy: { createdAt: 'desc' }, take: 1, select: { imageUrl: true } }`
- Return: `portfolioThumbnail: profile.portfolioItems[0]?.imageUrl ?? null`

---

## 9. Non-Goals

- Dark mode (Airbnb has no dark mode on public web; we defer this)
- Redesigning the shadcn sidebar structure
- Rewriting dashboard page content (just fix colors)
- Custom variable font (use Geist + serif)
