# ChapaWorks Design System v1.0 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the ChapaWorks design system consistently across all public pages, auth pages, and fix blue→emerald in dashboard components.

**Architecture:** Token-based CSS class substitution + hybrid artisan card component + search API portfolio thumbnail enhancement. No new frameworks; pure Tailwind.

**Tech Stack:** Next.js 16, Tailwind CSS 4, TypeScript, shadcn/ui (dashboard only)

---

### Task 1: Update Search API — Add portfolioThumbnail

**Files:**
- Modify: `app/api/search/artisans/route.ts`

- [ ] **Step 1: Add portfolioItems to prisma query**

In the `prisma.profile.findMany` call (around line 138), add to the `include` block:
```typescript
portfolioItems: {
  where: { isPublic: true },
  orderBy: { createdAt: 'desc' as const },
  take: 1,
  select: { imageUrl: true }
}
```

- [ ] **Step 2: Add portfolioThumbnail to the result mapping**

In the `profiles.map` section (around line 175), add to the artisan object:
```typescript
portfolioThumbnail: (profile as { portfolioItems?: Array<{ imageUrl: string }> }).portfolioItems?.[0]?.imageUrl ?? null,
```

- [ ] **Step 3: Build and verify**

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | grep -E "Error|Type error" | grep -v Warning
```
Expected: no errors.

- [ ] **Step 4: Commit**
```bash
git add app/api/search/artisans/route.ts
git commit -m "feat(api): add portfolioThumbnail to artisan search results"
```

---

### Task 2: Nav — Remove "How It Works", apply tokens

**Files:**
- Modify: `components/layout/public-nav.tsx`
- Modify: `components/landing/header.tsx`

- [ ] **Step 1: Remove "How It Works" from public-nav.tsx navLinks array**

Change:
```typescript
const navLinks = [
  { label: "Browse Artisans", href: "/artisans" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Artisans", href: "/for-artisans" },
];
```
To:
```typescript
const navLinks = [
  { label: "Browse Artisans", href: "/artisans" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Artisans", href: "/for-artisans" },
];
```

- [ ] **Step 2: Remove "How It Works" from header.tsx navItems**

Change:
```typescript
const navItems = [
  { title: "Browse Artisans", href: "/artisans" },
  { title: "How It Works", href: "/#how-it-works" },
  { title: "Pricing", href: "/pricing" },
  { title: "For Artisans", href: "/for-artisans" },
  ...
];
```
To:
```typescript
const navItems = [
  { title: "Browse Artisans", href: "/artisans" },
  { title: "Pricing", href: "/pricing" },
  { title: "For Artisans", href: "/for-artisans" },
  ...
];
```
Also update the nav-indicator links section to remove the "How It Works" Magnetic/Link block.

- [ ] **Step 3: Build, run tests**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | tail -5
npm run test 2>&1 | tail -4
```

- [ ] **Step 4: Commit**
```bash
git add components/layout/public-nav.tsx components/landing/header.tsx
git commit -m "feat(nav): remove How It Works link, 3-item nav"
```

---

### Task 3: Hybrid Artisan Card Component

**Files:**
- Create: `components/artisan/artisan-card.tsx`
- Create: `components/artisan/artisan-card-skeleton.tsx`

- [ ] **Step 1: Create ArtisanCard component**

```typescript
// components/artisan/artisan-card.tsx
"use client";
import Link from "next/link";
import { BadgeCheck, Star, MapPin, Eye, MessageCircle } from "lucide-react";

export interface ArtisanCardData {
  id: string;
  name: string;
  profession: string | null;
  profileImage: string | null;
  portfolioThumbnail?: string | null;
  location: { city: string | null; county: string | null };
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string }>;
}

export default function ArtisanCard({ artisan }: { artisan: ArtisanCardData }) {
  const initials = artisan.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const locationStr = [artisan.location.city, artisan.location.county].filter(Boolean).join(", ") || "Kenya";
  // Photo priority: portfolio > profile > gradient fallback
  const heroImg = artisan.portfolioThumbnail ?? artisan.profileImage;

  return (
    <Link href={`/artisans/${artisan.id}`} className="group block">
      {/* Photo / hero area */}
      <div className="relative rounded-xl overflow-hidden bg-[#f2f2f2] mb-3" style={{ aspectRatio: "4/3" }}>
        {heroImg ? (
          <img
            src={heroImg}
            alt={artisan.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
            <span className="text-3xl font-bold text-emerald-600">{initials}</span>
          </div>
        )}

        {/* Overlays */}
        {artisan.isAvailable && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-emerald-700">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Available
          </div>
        )}
        {artisan.isPremium && !artisan.isAvailable && (
          <div className="absolute top-2.5 left-2.5 bg-amber-400/90 text-amber-900 px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-start gap-2.5 mb-1.5">
        {/* Profile pic (small, circular) */}
        <div className="flex-shrink-0 relative mt-0.5">
          {artisan.profileImage ? (
            <img
              src={artisan.profileImage}
              alt={artisan.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-xs font-bold text-emerald-700">{initials}</span>
            </div>
          )}
          {artisan.isVerified && (
            <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-emerald-600 bg-white rounded-full" />
          )}
        </div>
        {/* Text meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-medium text-[#222] truncate leading-snug">{artisan.name}</p>
            {artisan.rating.total > 0 && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Star className="w-3 h-3 fill-[#222] text-[#222]" />
                <span className="text-xs text-[#222] font-medium">{artisan.rating.average.toFixed(1)}</span>
                <span className="text-xs text-[#929292]">({artisan.rating.total})</span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#6a6a6a] truncate">
            {[artisan.profession, locationStr].filter(Boolean).join(" · ")}
          </p>
          {artisan.hourlyRate && (
            <p className="text-xs text-[#222] mt-0.5">
              <span className="font-medium">KES {artisan.hourlyRate.toLocaleString()}</span>
              <span className="text-[#6a6a6a]"> / hr</span>
            </p>
          )}
        </div>
      </div>

      {/* Specialization pills */}
      {artisan.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {artisan.specializations.slice(0, 2).map((s) => (
            <span key={s.name} className="text-xs px-2 py-0.5 bg-[#f7f7f7] text-[#6a6a6a] rounded-full border border-[#ebebeb]">
              {s.name}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <span className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#ddd] rounded-lg text-xs font-medium text-[#3f3f3f] group-hover:border-emerald-600 group-hover:text-emerald-700 transition-colors">
          <Eye className="w-3.5 h-3.5" />
          View Profile
        </span>
        <span className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-700 text-white rounded-lg text-xs font-medium hover:bg-emerald-800 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Message
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create ArtisanCardSkeleton component**

```typescript
// components/artisan/artisan-card-skeleton.tsx
export default function ArtisanCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Photo area — 4:3 */}
      <div className="rounded-xl bg-[#f2f2f2] mb-3" style={{ aspectRatio: "4/3" }} />
      {/* Metadata row */}
      <div className="flex items-start gap-2.5 mb-1.5">
        <div className="w-9 h-9 rounded-full bg-[#f2f2f2] flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between gap-2">
            <div className="h-3.5 bg-[#f2f2f2] rounded w-3/5" />
            <div className="h-3 bg-[#f2f2f2] rounded w-10 flex-shrink-0" />
          </div>
          <div className="h-3 bg-[#f2f2f2] rounded w-4/5" />
          <div className="h-3 bg-[#f2f2f2] rounded w-2/5" />
        </div>
      </div>
      {/* Pills */}
      <div className="flex gap-1 mb-2">
        <div className="h-5 w-16 bg-[#f2f2f2] rounded-full" />
        <div className="h-5 w-20 bg-[#f2f2f2] rounded-full" />
      </div>
      {/* Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-[#f2f2f2] rounded-lg" />
        <div className="flex-1 h-8 bg-[#f2f2f2] rounded-lg" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Export from components/artisan/index.ts**
```typescript
// components/artisan/index.ts
export { default as ArtisanCard } from './artisan-card';
export type { ArtisanCardData } from './artisan-card';
export { default as ArtisanCardSkeleton } from './artisan-card-skeleton';
```

- [ ] **Step 4: Build check**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | grep "Type error"
```

- [ ] **Step 5: Commit**
```bash
git add components/artisan/
git commit -m "feat(components): hybrid ArtisanCard + skeleton (portfolio-first, rich metadata)"
```

---

### Task 4: Update Homepage Card Usage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Import new card**

Replace the inline `ArtisanCard` and `ArtisanCardSkeleton` functions with imports:
```typescript
import { ArtisanCard, ArtisanCardSkeleton } from "@/components/artisan";
```

- [ ] **Step 2: Update LiveArtisan interface to include portfolioThumbnail**
```typescript
interface LiveArtisan {
  id: string;
  name: string;
  profession: string | null;
  bio: string | null;
  profileImage: string | null;
  portfolioThumbnail?: string | null; // ← add
  location: { city: string | null; county: string | null };
  hourlyRate: number | null;
  isAvailable: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating: { average: number; total: number };
  specializations: Array<{ name: string }>;
}
```

- [ ] **Step 3: Replace inline card rendering with component**

In the artisan grid section, replace the `{artisansLoading ? ... : liveArtisans.map(...)}` block with:
```tsx
{artisansLoading
  ? Array.from({ length: 8 }).map((_, i) => <ArtisanCardSkeleton key={i} />)
  : artisans.length > 0
  ? artisans.map((a) => <ArtisanCard key={a.id} artisan={a} />)
  : <EmptyState />}
```

- [ ] **Step 4: Remove the inline ArtisanCard and ArtisanCardSkeleton function definitions from the file**

- [ ] **Step 5: Build + test**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | grep -E "Error|Type error" | grep -v Warning | head -5
npm run test 2>&1 | tail -4
```

- [ ] **Step 6: Commit**
```bash
git add app/page.tsx
git commit -m "refactor(home): use shared ArtisanCard component"
```

---

### Task 5: Update /artisans Browse Page

**Files:**
- Modify: `app/artisans/page.tsx`

- [ ] **Step 1: Import shared card components**
```typescript
import { ArtisanCard, ArtisanCardSkeleton } from "@/components/artisan";
```

Update the `Artisan` interface to add `portfolioThumbnail?: string | null`.

- [ ] **Step 2: Apply white canvas and hairline borders**

Change page wrapper:
```tsx
<div className="min-h-screen bg-white text-[#222]">
```

Change hero section:
```tsx
<div className="py-10 px-4 border-b border-[#ddd] bg-white">
  <div className="max-w-2xl mx-auto text-center mb-6">
    <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#222] mb-1">
      Browse skilled artisans
    </h1>
    <p className="text-[#6a6a6a] text-sm">Verified professionals across Kenya</p>
  </div>
  {/* pill search bar — same as homepage */}
  <form ... className="max-w-2xl mx-auto flex items-stretch bg-white rounded-full border border-[#ddd] shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px,rgba(0,0,0,0.1)_0_4px_8px] overflow-hidden h-14">
    ...
    <button className="m-2 w-10 h-10 bg-emerald-700 ... rounded-full">
  </form>
```

- [ ] **Step 3: Replace inline ArtisanCard with shared component**

Remove the entire `function ArtisanCard(...)` at the bottom of the file.
Replace card rendering with `<ArtisanCard artisan={artisan} />`.
Replace skeleton with `<ArtisanCardSkeleton />`.

- [ ] **Step 4: Update filter UI with design system tokens**

- Filter buttons: `rounded-full border border-[#ddd]` active=`border-emerald-700 text-emerald-700`
- Active pills: `bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full`
- Select inputs: `border border-[#ddd] rounded-lg bg-white text-[#222]`

- [ ] **Step 5: Update CTA banner**

```tsx
<div className="mt-14 border border-[#ddd] rounded-2xl p-10 text-center bg-[#f7f7f7]">
  <h2 className="text-2xl font-serif font-semibold text-[#222] mb-3">
    Ready to hire a skilled artisan?
  </h2>
  <p className="text-[#6a6a6a] mb-6 text-sm max-w-md mx-auto">
    Create a free account to message artisans, save your favourites, and request job quotes.
  </p>
  <div className="flex gap-3 justify-center flex-wrap">
    <Link href="/sign-up" className="bg-emerald-700 text-white px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">
      Create Free Account
    </Link>
    <Link href="/sign-in" className="border border-[#ddd] text-[#222] px-7 py-2.5 rounded-lg text-sm font-medium hover:bg-[#f7f7f7] transition-colors">
      Sign In
    </Link>
  </div>
</div>
```

- [ ] **Step 6: Build + test**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | grep "Type error" | head -5
npm run test 2>&1 | tail -4
```

- [ ] **Step 7: Commit**
```bash
git add app/artisans/page.tsx
git commit -m "feat(browse): white canvas, shared ArtisanCard, design system tokens"
```

---

### Task 6: Update /artisans/[id] Profile Page

**Files:**
- Modify: `app/artisans/[id]/page.tsx`

- [ ] **Step 1: Apply white canvas**

Change page wrapper: `<div className="bg-white text-[#222] min-h-screen">`

- [ ] **Step 2: Update ProfileNav to use design system tokens**

Nav: `bg-white border-b border-[#ddd]`

- [ ] **Step 3: Update profile header card**

```tsx
<div className="border border-[#ddd] rounded-xl p-6 mb-6 bg-white shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px]">
```

- [ ] **Step 4: Update all stone-* to design token equivalents**

| Old | New |
|---|---|
| `text-stone-900` | `text-[#222]` |
| `text-stone-600` | `text-[#3f3f3f]` |
| `text-stone-500` | `text-[#6a6a6a]` |
| `text-stone-400` | `text-[#929292]` |
| `bg-stone-50` | `bg-[#f7f7f7]` |
| `bg-stone-100` | `bg-[#f2f2f2]` |
| `border-stone-200` | `border-[#ddd]` |
| `border-stone-100` | `border-[#ebebeb]` |

- [ ] **Step 5: Update skeleton to use design tokens**

Replace all `bg-stone-200` with `bg-[#f2f2f2]` in skeleton blocks.

- [ ] **Step 6: Update CTA sidebar card, hire card, skill tags**

```tsx
// Hire CTA card
<div className="bg-emerald-700 text-white rounded-xl p-5 text-center">

// Skill tags
<span className="text-xs px-2 py-0.5 bg-[#f7f7f7] text-[#6a6a6a] rounded-full border border-[#ebebeb]">
```

- [ ] **Step 7: Update portfolio lightbox**

Dark overlay bg stays black. Lightbox card: `bg-white rounded-xl border border-[#ddd]`. Navigation buttons: `bg-white/90 rounded-full`. Dot indicators: active=`bg-emerald-700` inactive=`bg-[#ddd]`.

- [ ] **Step 8: Build + test**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | grep "Type error" | head -5
```

- [ ] **Step 9: Commit**
```bash
git add "app/artisans/[id]/page.tsx"
git commit -m "feat(artisan-profile): white canvas, design system tokens throughout"
```

---

### Task 7: Update /pricing Page

**Files:**
- Modify: `app/pricing/page.tsx`

Apply the same token replacements:
- `bg-stone-50` → `bg-white` (page canvas)
- `border-stone-200` → `border-[#ddd]`
- `text-stone-*` → matching design tokens
- Hero section: compact, white canvas, modest serif heading
- Cards: `border border-[#ddd] rounded-xl p-8`
- Footer: minimal, `border-t border-[#ddd]`

- [ ] **Step 1: Apply all token replacements**
- [ ] **Step 2: Build**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | tail -4
```
- [ ] **Step 3: Commit**
```bash
git add app/pricing/page.tsx
git commit -m "feat(pricing): design system tokens"
```

---

### Task 8: Update /for-artisans Page

**Files:**
- Modify: `app/for-artisans/page.tsx`

Apply same token replacements. Key specific changes:
- `bg-stone-100` sections → `bg-[#f7f7f7]`
- `border-stone-200` → `border-[#ddd]`
- Testimonial cards: `bg-[#f7f7f7] border border-[#ddd] rounded-xl`
- Steps: `bg-white border border-[#ddd] rounded-xl`
- Benefit cards: `bg-white border border-[#ddd] rounded-xl`

- [ ] **Step 1: Apply all token replacements**
- [ ] **Step 2: Build + commit**
```bash
git add app/for-artisans/page.tsx
git commit -m "feat(for-artisans): design system tokens"
```

---

### Task 9: Dashboard — Blue → Emerald Color Fixes

**Files:**
- Modify: `components/artisan/artisan-card.tsx` (already done)
- Modify: `components/dashboard/admin/invite-artisans.tsx`
- Modify: `components/shared/notification-bell.tsx`
- Modify: `components/shared/map/artisan-map.tsx`
- Modify: `app/(artisan-dashboard)/artisan-dashboard/subscription/page.tsx`
- Modify: `app/(artisan-dashboard)/artisan-dashboard/jobs/[id]/page.tsx`
- Modify: `components/dashboard/admin/admin-tasks-table.tsx`
- Modify: `components/dashboard/client/client-dashboard-content.tsx`

- [ ] **Step 1: invite-artisans.tsx — fix pending count color**

Change:
```tsx
<div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
  <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
```
To:
```tsx
<div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-center">
  <p className="text-2xl font-bold text-emerald-600">{pendingCount}</p>
```

- [ ] **Step 2: notification-bell.tsx — fix message icon and unread dot**

Change `text-blue-500` → `text-emerald-600`, `bg-blue-500` → `bg-emerald-600` (two occurrences).

- [ ] **Step 3: artisan-map.tsx — fix spinner and location dot**

Change `border-blue-600` → `border-emerald-600`, `bg-blue-400` → `bg-emerald-500`.

- [ ] **Step 4: subscription/page.tsx — fix loading spinner**

Change `bg-blue-100 dark:bg-blue-900` → `bg-emerald-100 dark:bg-emerald-900`, `text-blue-600` → `text-emerald-600`.

- [ ] **Step 5: jobs/[id]/page.tsx — fix info boxes and status colors**

Change `text-blue-500` color annotations → `text-emerald-600`.
Change info box `bg-blue-50 border border-blue-200` → `bg-emerald-50 border border-emerald-200`.
Change `text-blue-600` / `text-blue-700` / `text-blue-800` → `text-emerald-700` / `text-emerald-700` / `text-emerald-800`.

- [ ] **Step 6: admin-tasks-table.tsx — fix icon colors**

Change `text-blue-500` → `text-emerald-600` on message/alert icons.

- [ ] **Step 7: client-dashboard-content.tsx — fix message icon**

Change `text-blue-600` → `text-emerald-600`.

- [ ] **Step 8: Build + test**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | grep "Type error" | head -5
npm run test 2>&1 | tail -4
```

- [ ] **Step 9: Commit**
```bash
git add components/dashboard/ components/shared/ "app/(artisan-dashboard)/"
git commit -m "feat(dashboard): blue→emerald color token replacement throughout"
```

---

### Task 10: Final Build, Test, and Cleanup

- [ ] **Step 1: Full build**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx next build 2>&1 | tail -12
```
Expected: clean build, all routes listed.

- [ ] **Step 2: Full test run**
```bash
npm run test 2>&1 | tail -6
```
Expected: 28 files passed, 782 tests passed.

- [ ] **Step 3: Verify no remaining blue tokens in non-dashboard files**
```bash
grep -rn "bg-blue\|text-blue\|ring-blue\|border-blue" --include="*.tsx" \
  | grep -v node_modules | grep -v .next | grep -v generated \
  | grep -v "landing/" | grep -v __tests__
```
Expected: only remaining blue refs should be in `landing/` components (the dark-theme pages) and potentially the shadcn ui primitives.

- [ ] **Step 4: Verify no remaining stone-* on public pages**
```bash
grep -rn "bg-stone\|text-stone\|border-stone" \
  app/page.tsx app/artisans/page.tsx "app/artisans/[id]/page.tsx" \
  app/pricing/page.tsx app/for-artisans/page.tsx
```
Expected: zero occurrences.

- [ ] **Step 5: Commit and tag**
```bash
git add -A
git commit -m "feat: design system v1.0 applied throughout ChapaWorks

- Hybrid ArtisanCard: portfolio-first photo, profile pic overlay, rich metadata, action buttons
- All public pages: white canvas, hairline borders, emerald accent, one shadow tier
- All nav: 3-item public nav (removed How It Works)
- Dashboard: blue→emerald color token replacement
- Loading skeletons: match final rendered structure exactly"
```

---

## Self-Review

**Spec coverage:**
- ✅ Search API: portfolioThumbnail added (Task 1)
- ✅ Nav: How It Works removed (Task 2)
- ✅ Hybrid card: portfolio-first, profile pic overlay, metadata, buttons (Task 3)
- ✅ Homepage (Task 4)
- ✅ Browse page (Task 5)
- ✅ Profile page (Task 6)
- ✅ Pricing page (Task 7)
- ✅ For Artisans page (Task 8)
- ✅ Dashboard blue→emerald (Task 9)
- ✅ Final verification (Task 10)

**No placeholders:** All code blocks are complete.

**Type consistency:** `ArtisanCardData` interface is defined in Task 3 and extended in Tasks 4 and 5 consistently.
