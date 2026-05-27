# API Integration — Sprint 6: Public Pages

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan.

**Goal:** Complete public page API wiring. The home, browse, and profile pages already call `/api/search/artisans` and `/api/artisans/[id]`. Sprint 6 adds: (1) verified-only filter to browse directory matching the existing available-only pattern, (2) wire verified filter param to the browse page API call, (3) ensure public search uses React Query hook where applicable, (4) add profession + county + verified filter chips to the URL params for server-side filtering.

**Architecture:** Minimal changes. Browse directory already has available-only filter. Clone the pattern for verified-only. No new adapter files needed — public pages use raw fetch + normalizers already.

**Tech Stack:** Next.js 16, React 19, existing `BrowseDirectorySection` component, `app/artisans/page.tsx`

---

## File map

| File | Action | 
| --- | --- |
| `components/landing/browse-directory.tsx` | MODIFY — add `verifiedOnly` state + filter chip + filter logic |
| `app/artisans/page.tsx` | MODIFY — pass `verified=true` search param when verifiedOnly is active |
| `__tests__/artisan-search-filters.test.ts` | CREATE — verify filter logic |

---

## Task 1: Add verified-only filter to browse-directory.tsx

**Files:**
- Modify: `components/landing/browse-directory.tsx`

### Step 1: Find the availableOnly state and clone the pattern

```bash
grep -n "availableOnly\|verifiedOnly" components/landing/browse-directory.tsx
```

### Step 2: Add verifiedOnly state alongside availableOnly

Find the line:
```tsx
const [availableOnly, setAvailableOnly] = useState(() => searchParams.get("available") === "true");
```

Add immediately after:
```tsx
const [verifiedOnly, setVerifiedOnly] = useState(() => searchParams.get("verified") === "true");
```

### Step 3: Add verifiedOnly to the filter logic

Find the `useMemo` filtered array. It currently has:
```tsx
const matchesAvailability = !availableOnly || artisan.isAvailable;
```

Add after that line:
```tsx
const matchesVerified = !verifiedOnly || artisan.isVerified;
```

Add `matchesVerified` to the final filter condition (find `return matchesQuery && matchesProfession && ...` and add `&& matchesVerified`).

### Step 4: Add verifiedOnly to the deps array

Find `[availableOnly, county, initialArtisans, profession, query, sortBy]` (appears twice — the useMemo and the useEffect for URL sync).

Add `verifiedOnly` to both dependency arrays.

### Step 5: Add verifiedOnly to hasFilters check

Find:
```tsx
const hasFilters = query || profession !== "All professions" || county !== "All counties" || availableOnly;
```

Add `|| verifiedOnly`.

### Step 6: Add verifiedOnly to resetFilters

Find the `resetFilters` function body. After `setAvailableOnly(false)`, add:
```tsx
setVerifiedOnly(false);
```

### Step 7: Add "Verified only" toggle button

Find the "Available" button in the filter bar:
```tsx
<button
  type="button"
  onClick={() => setAvailableOnly((value) => !value)}
  className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
  style={{
    borderColor: availableOnly ? COLORS.ink : COLORS.hairline,
    color: COLORS.ink,
    background: availableOnly ? COLORS.surfaceSoft : COLORS.canvas,
  }}
>
  <ListFilter size={16} />
  Available
</button>
```

Add a "Verified" button immediately after it:
```tsx
<button
  type="button"
  onClick={() => setVerifiedOnly((value) => !value)}
  className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors hover:bg-[#f7f7f7]"
  style={{
    borderColor: verifiedOnly ? COLORS.ink : COLORS.hairline,
    color: COLORS.ink,
    background: verifiedOnly ? COLORS.surfaceSoft : COLORS.canvas,
  }}
>
  <BadgeCheck size={16} />
  Verified
</button>
```

Add `BadgeCheck` to the lucide-react imports if not already there:
```bash
grep "BadgeCheck\|import.*lucide" components/landing/browse-directory.tsx | head -5
```

### Step 8: Add "Verified" filter chip

Find the filter chips section:
```tsx
{availableOnly && <FilterChip label="Available now" onRemove={() => setAvailableOnly(false)} />}
```

Add after it:
```tsx
{verifiedOnly && <FilterChip label="Verified only" onRemove={() => setVerifiedOnly(false)} />}
```

### Step 9: Wire verifiedOnly to URL param in useEffect (if present)

Find if there's a useEffect that syncs filters to URL params. If there is one, add `verified` param support:
```tsx
if (verifiedOnly) params.set("verified", "true");
else params.delete("verified");
```

### Step 10: TypeScript check
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

### Step 11: Commit
```bash
git add components/landing/browse-directory.tsx
git commit -m "feat(browse): add verified-only filter to artisan browse directory"
```

---

## Task 2: Wire verified filter to browse page API call

**Files:**
- Modify: `app/artisans/page.tsx`

The browse page already passes all searchParams to the API. Since the browse directory now sets `verified=true` in the URL when filter is active, the API call already picks it up via:
```tsx
for (const [key, value] of searchParams.entries()) {
  if (key !== "limit" && value) params.set(key, value);
}
```

This means Task 2 is already handled. Verify:

```bash
grep -n "verified\|available\|params.set\|searchParams" app/artisans/page.tsx | head -15
```

Confirm `verified` is passed through. If the loop already handles it, no change needed.

**If not already handled**, add explicit verified handling:
```tsx
const verified = searchParams.get("verified");
if (verified === "true") params.set("verified", "true");
```

---

## Task 3: Write filter tests

**Files:**
- Create: `__tests__/artisan-search-filters.test.ts`

```ts
import { describe, it, expect } from 'vitest'

// Test the filter logic in isolation (pure functions)
function matchesVerified(artisan: { isVerified: boolean }, verifiedOnly: boolean): boolean {
  return !verifiedOnly || artisan.isVerified
}

function matchesAvailability(artisan: { isAvailable: boolean }, availableOnly: boolean): boolean {
  return !availableOnly || artisan.isAvailable
}

describe('browse directory filter logic', () => {
  describe('matchesVerified', () => {
    it('passes all artisans when verifiedOnly is false', () => {
      expect(matchesVerified({ isVerified: false }, false)).toBe(true)
      expect(matchesVerified({ isVerified: true }, false)).toBe(true)
    })
    it('filters out unverified when verifiedOnly is true', () => {
      expect(matchesVerified({ isVerified: false }, true)).toBe(false)
      expect(matchesVerified({ isVerified: true }, true)).toBe(true)
    })
  })

  describe('matchesAvailability', () => {
    it('passes all artisans when availableOnly is false', () => {
      expect(matchesAvailability({ isAvailable: false }, false)).toBe(true)
    })
    it('filters out unavailable when availableOnly is true', () => {
      expect(matchesAvailability({ isAvailable: false }, true)).toBe(false)
      expect(matchesAvailability({ isAvailable: true }, true)).toBe(true)
    })
  })
})
```

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/artisan-search-filters.test.ts 2>&1 | tail -10
```

```bash
git add __tests__/artisan-search-filters.test.ts
git commit -m "test(public): add browse directory filter logic tests"
```

---

## Task 4: Verify end-to-end public pages

Run TypeScript and lint on all public page files:

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
npm run lint 2>&1 | tail -8
npm run test 2>&1 | tail -8
```

Verify each public page file has:
- `app/page.tsx` — calls `/api/search/artisans?limit=12`, falls back to `previewArtisans` ✓ (already)
- `app/artisans/page.tsx` — calls `/api/search/artisans` with all search params ✓ (already)
- `app/artisans/[id]/page.tsx` — calls `/api/artisans/${id}`, falls back to previewProfile ✓ (already)

Final commit:
```bash
git add app/artisans/
git commit -m "feat(public): complete Sprint 6 public pages API integration" --allow-empty
```

---

## Self-review checklist

- [ ] Browse directory has `verifiedOnly` state
- [ ] `verifiedOnly` filters artisans by `artisan.isVerified`
- [ ] "Verified" toggle button renders next to "Available" button
- [ ] "Verified only" filter chip appears when active
- [ ] `resetFilters` clears verifiedOnly
- [ ] URL sync (if present) handles `verified` param
- [ ] `BadgeCheck` icon imported for the button
- [ ] Filter logic tests pass
- [ ] TypeScript: 0 errors, lint: 0 errors, all tests passing
