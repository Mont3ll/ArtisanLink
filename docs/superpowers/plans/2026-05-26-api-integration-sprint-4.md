# API Integration — Sprint 4: Admin Data Wiring

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan.

**Goal:** Replace hardcoded admin fixture data with real API data from the 10 existing admin hooks, using the same adapter + context overlay pattern from Sprints 2–3.

**Architecture:** Phase 1 creates adapter files in parallel. Phase 2 extends DashboardRealDataContext with admin data. Phase 3 wires AdminOperationsSection.

**Tech Stack:** React Query (useAdminStats, useAdminVerification, useProcessVerification, useAdminArtisans, useUsers, useAdminModeration), TypeScript strict, Vitest

---

## Type mappings (source → real)

### VerificationRecord ← PendingArtisan
```
PendingArtisan.id → id
firstName + lastName → name
profile.profession → profession
profile.county → county
createdAt (relative) → submitted
profile.artisanStatus → status
["National ID"] (if idDocumentUrl) → documents
"Low" default → risk
```

### Source artisan (admin) ← AdminArtisan
```
AdminArtisan.id → id
AdminArtisan.name → name
AdminArtisan.profession → profession
AdminArtisan.location → location.city / location.county
AdminArtisan.status === 'VERIFIED' → isVerified
AdminArtisan.subscriptionStatus === 'ACTIVE' → isPremium
AdminArtisan.rating → rating
AdminArtisan.isAvailable → isAvailable
```

### InviteRow ← ArtisanInvite (from admin invites API)
```
invite.email → email
"Artisan" → role
invite.status → status (PENDING→PENDING, ACCEPTED→COMPLETED, EXPIRED→REVIEW)
invite.createdAt (relative) → sent
```

---

## File map

| File | Action | Phase |
| --- | --- | --- |
| `lib/hooks/use-admin-data-adapter.ts` | CREATE | Phase 1 |
| `__tests__/dashboard2/admin-data-adapter.test.ts` | CREATE | Phase 1 |
| `components/dashboard2/context/dashboard-real-data-context.tsx` | EXTEND | Phase 2 |
| `components/dashboard2/admin/source-admin-preview.tsx` | WIRE | Phase 3 |

---

## Phase 1 — Admin data adapter

### Task 1: `lib/hooks/use-admin-data-adapter.ts`

**Files:**
- Create: `lib/hooks/use-admin-data-adapter.ts`
- Create: `__tests__/dashboard2/admin-data-adapter.test.ts`

- [ ] **Step 1: Read the real hooks to understand exact types**

```bash
head -100 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-admin-verification.ts
head -80 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-admin-artisans.ts
head -60 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-admin-dashboard.ts
head -40 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-users.ts
head -80 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-admin-moderation.ts
```

- [ ] **Step 2: Write the failing tests**

Create `__tests__/dashboard2/admin-data-adapter.test.ts`:

```ts
import {
  mapPendingArtisanToVerificationRecord,
  mapAdminArtisanToSource,
  mapInviteToRow,
  mapAdminStatsToSource,
  relativeTime,
} from '@/lib/hooks/use-admin-data-adapter'

describe('relativeTime', () => {
  it('returns "Today" for same-day timestamps', () => {
    const today = new Date().toISOString()
    expect(relativeTime(today)).toContain('h ago')
  })
})

describe('mapPendingArtisanToVerificationRecord', () => {
  it('maps a pending artisan to verification record format', () => {
    const artisan = {
      id: 'art-1',
      firstName: 'Joseph',
      lastName: 'Njoroge',
      email: 'joseph@example.com',
      phone: null,
      createdAt: new Date().toISOString(),
      profile: {
        profession: 'Welder',
        county: 'Nairobi',
        artisanStatus: 'PENDING' as const,
        certificateUrl: 'https://cert.example.com/1.pdf',
        idDocumentUrl: 'https://id.example.com/1.jpg',
        idDocumentType: 'NATIONAL_ID',
      },
    }
    const result = mapPendingArtisanToVerificationRecord(artisan)
    expect(result.id).toBe('art-1')
    expect(result.name).toBe('Joseph Njoroge')
    expect(result.profession).toBe('Welder')
    expect(result.county).toBe('Nairobi')
    expect(result.status).toBe('PENDING')
    expect(result.documents).toContain('National ID')
    expect(result.documents).toContain('Certificate')
  })

  it('uses REVIEW status when artisanStatus is REJECTED', () => {
    const artisan = {
      id: 'art-2', firstName: 'A', lastName: 'B', email: '', phone: null,
      createdAt: new Date().toISOString(),
      profile: { artisanStatus: 'REJECTED' as const, profession: null, county: null,
        certificateUrl: null, idDocumentUrl: null, idDocumentType: null },
    }
    const result = mapPendingArtisanToVerificationRecord(artisan)
    expect(result.status).toBe('REVIEW')
  })
})

describe('mapAdminArtisanToSource', () => {
  it('maps an AdminArtisan to source format', () => {
    const artisan = {
      id: 'a1', name: 'Grace Wanjiku', email: 'g@example.com', phone: null,
      profession: 'Carpenter', location: 'Westlands, Nairobi',
      experience: 5, rating: 4.8, totalReviews: 24, portfolioItems: 8,
      status: 'VERIFIED' as const, isAvailable: true,
      joinDate: new Date().toISOString(), lastActive: new Date().toISOString(),
      subscriptionStatus: 'ACTIVE' as const, subscriptionPlan: 'MONTHLY' as const,
      subscriptionEndDate: null,
    }
    const result = mapAdminArtisanToSource(artisan)
    expect(result.id).toBe('a1')
    expect(result.name).toBe('Grace Wanjiku')
    expect(result.isVerified).toBe(true)
    expect(result.isPremium).toBe(true)
    expect(result.isAvailable).toBe(true)
    expect(result.rating).toBe(4.8)
  })
})

describe('mapInviteToRow', () => {
  it('maps PENDING invite to PENDING status', () => {
    const invite = { id: 'i1', email: 'jane@example.com', status: 'PENDING',
      createdAt: new Date().toISOString() }
    const result = mapInviteToRow(invite)
    expect(result.email).toBe('jane@example.com')
    expect(result.status).toBe('PENDING')
    expect(result.role).toBe('Artisan')
  })
  it('maps ACCEPTED invite to COMPLETED', () => {
    const invite = { id: 'i2', email: 'joe@example.com', status: 'ACCEPTED',
      createdAt: new Date().toISOString() }
    expect(mapInviteToRow(invite).status).toBe('COMPLETED')
  })
  it('maps EXPIRED invite to REVIEW', () => {
    const invite = { id: 'i3', email: 'x@example.com', status: 'EXPIRED',
      createdAt: new Date().toISOString() }
    expect(mapInviteToRow(invite).status).toBe('REVIEW')
  })
})

describe('mapAdminStatsToSource', () => {
  it('returns formatted stat strings', () => {
    const stats = {
      pendingVerifications: 19, totalArtisans: 312, activeSubscriptions: 156,
      systemUptime: 99.96, totalUsers: 2418, activeArtisans: 280,
      monthlyRevenue: 46800, monthlyGrowth: 12, totalReviews: 480,
    }
    const result = mapAdminStatsToSource(stats)
    expect(result.pendingVerification).toBe('19')
    expect(result.activeSubscriptions).toBe('156')
    expect(result.systemUptime).toBe('99.96%')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/admin-data-adapter.test.ts 2>&1 | tail -10
```

- [ ] **Step 4: Create the adapter**

Create `lib/hooks/use-admin-data-adapter.ts`:

```ts
/**
 * Admin Data Adapter
 * Maps real API types from admin hooks to the simplified types used
 * in source-admin-preview.tsx AdminOperationsSection.
 */
import { useAdminStats, useSystemTasks } from './use-admin-dashboard'
import { useAdminVerification } from './use-admin-verification'
import { useAdminArtisans } from './use-admin-artisans'
import { useUsers } from './use-users'

// ─── Helper ──────────────────────────────────────────────────────────────────

export function relativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(ms / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}

// ─── Verification Record ──────────────────────────────────────────────────────

export interface SourceVerificationRecord {
  id: string
  name: string
  profession: string
  county: string
  submitted: string
  status: 'PENDING' | 'REVIEW' | 'VERIFIED' | 'ACTIVE' | 'QUOTED' | 'COMPLETED'
  documents: string[]
  risk: 'Low' | 'Medium' | 'High'
}

export function mapPendingArtisanToVerificationRecord(
  artisan: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    createdAt: string
    profile?: {
      profession?: string | null
      county?: string | null
      artisanStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
      certificateUrl?: string | null
      idDocumentUrl?: string | null
      idDocumentType?: string | null
    } | null
  },
): SourceVerificationRecord {
  const docs: string[] = []
  if (artisan.profile?.idDocumentUrl) docs.push('National ID')
  if (artisan.profile?.certificateUrl) docs.push('Certificate')
  if (docs.length === 0) docs.push('Pending upload')

  const artisanStatus = artisan.profile?.artisanStatus ?? 'PENDING'

  return {
    id: artisan.id,
    name: `${artisan.firstName} ${artisan.lastName}`,
    profession: artisan.profile?.profession ?? 'Not specified',
    county: artisan.profile?.county ?? 'Unknown',
    submitted: relativeTime(artisan.createdAt),
    status: artisanStatus === 'REJECTED' ? 'REVIEW' : artisanStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
    documents: docs,
    risk: docs.length >= 2 ? 'Low' : docs.length === 1 ? 'Medium' : 'High',
  }
}

// ─── Admin Artisan ────────────────────────────────────────────────────────────

export interface SourceAdminArtisan {
  id: string
  name: string
  profession: string | null
  location: { city: string; county: string }
  isVerified: boolean
  isPremium: boolean
  isAvailable: boolean
  rating: number
  totalReviews: number
  portfolioItems: number
}

export function mapAdminArtisanToSource(
  artisan: {
    id: string
    name: string
    profession: string | null
    location: string | null
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
    isAvailable: boolean
    rating: number
    totalReviews: number
    portfolioItems: number
    subscriptionStatus: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
  },
): SourceAdminArtisan {
  const [city = '', county = ''] = (artisan.location ?? '').split(',').map((s) => s.trim())
  return {
    id: artisan.id,
    name: artisan.name,
    profession: artisan.profession,
    location: { city, county },
    isVerified: artisan.status === 'VERIFIED',
    isPremium: artisan.subscriptionStatus === 'ACTIVE',
    isAvailable: artisan.isAvailable,
    rating: artisan.rating,
    totalReviews: artisan.totalReviews,
    portfolioItems: artisan.portfolioItems,
  }
}

// ─── Invite Row ───────────────────────────────────────────────────────────────

export interface SourceInviteRow {
  email: string
  role: string
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REVIEW'
  sent: string
}

export function mapInviteToRow(invite: {
  id: string
  email: string
  status: string
  createdAt: string
}): SourceInviteRow {
  const statusMap: Record<string, SourceInviteRow['status']> = {
    PENDING: 'PENDING',
    ACCEPTED: 'COMPLETED',
    EXPIRED: 'REVIEW',
    REVOKED: 'REVIEW',
  }
  return {
    email: invite.email,
    role: 'Artisan',
    status: statusMap[invite.status] ?? 'PENDING',
    sent: relativeTime(invite.createdAt),
  }
}

// ─── Admin Stats ─────────────────────────────────────────────────────────────

export interface SourceAdminStats {
  pendingVerification: string
  openModeration: string
  activeSubscriptions: string
  systemUptime: string
}

export function mapAdminStatsToSource(stats: {
  pendingVerifications: number
  activeSubscriptions: number
  systemUptime: number
  [key: string]: number
}): SourceAdminStats {
  return {
    pendingVerification: String(stats.pendingVerifications ?? 0),
    openModeration: '0',
    activeSubscriptions: String(stats.activeSubscriptions ?? 0),
    systemUptime: `${(stats.systemUptime ?? 0).toFixed(2)}%`,
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminDataAdapter() {
  const { data: statsData, isLoading: statsLoading } = useAdminStats()
  const { data: verificationData, isLoading: verLoading } = useAdminVerification()
  const { data: artisansData, isLoading: artLoading } = useAdminArtisans()
  const { data: usersData, isLoading: usersLoading } = useUsers()

  const verificationQueue: SourceVerificationRecord[] = (
    verificationData?.pendingArtisans ?? []
  ).map(mapPendingArtisanToVerificationRecord)

  const adminArtisans: SourceAdminArtisan[] = (artisansData?.artisans ?? []).map(
    mapAdminArtisanToSource,
  )

  const stats = statsData ? mapAdminStatsToSource(statsData as Parameters<typeof mapAdminStatsToSource>[0]) : null

  return {
    verificationQueue,
    adminArtisans,
    users: usersData?.users ?? [],
    stats,
    isLoading: statsLoading || verLoading || artLoading || usersLoading,
  }
}
```

**Note:** After reading the real hook files, adjust field names to match actual exported types.

- [ ] **Step 5: Run tests**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/admin-data-adapter.test.ts 2>&1 | tail -15
```

- [ ] **Step 6: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

- [ ] **Step 7: Commit**
```bash
git add lib/hooks/use-admin-data-adapter.ts __tests__/dashboard2/admin-data-adapter.test.ts
git commit -m "feat(adapters): add admin data adapter for source-preview integration"
```

---

## Phase 2 — Extend DashboardRealDataContext with admin data

### Task 2: Extend context

**Files:**
- Modify: `components/dashboard2/context/dashboard-real-data-context.tsx`

- [ ] **Step 1: Add admin fields to DashboardRealData interface**

```tsx
import type { SourceVerificationRecord, SourceAdminArtisan, SourceAdminStats } from '@/lib/hooks/use-admin-data-adapter'
import { useAdminDataAdapter } from '@/lib/hooks/use-admin-data-adapter'

// New interface fields:
adminVerificationQueue: SourceVerificationRecord[] | null
adminArtisans: SourceAdminArtisan[] | null
adminStats: SourceAdminStats | null
```

- [ ] **Step 2: Call useAdminDataAdapter in the admin provider variant**

The context currently has ArtisanProvider and NonArtisanProvider. NonArtisanProvider handles both admin and client. To keep hook call counts stable, call `useAdminDataAdapter()` unconditionally in BOTH inner providers, but only set admin fields on the value when `role === 'admin'`.

```tsx
// In both inner providers (rules-of-hooks: always call):
const { verificationQueue, adminArtisans, stats } = useAdminDataAdapter()

// In value object:
adminVerificationQueue: role === 'admin' ? verificationQueue : null,
adminArtisans: role === 'admin' ? adminArtisans : null,
adminStats: role === 'admin' ? stats : null,
```

- [ ] **Step 3: Update test mocks**

Add to `__tests__/dashboard2/dashboard-real-data-context.test.tsx` and `provider-integration.test.tsx`:
```ts
vi.mock('@/lib/hooks/use-admin-data-adapter', () => ({
  useAdminDataAdapter: () => ({
    verificationQueue: [], adminArtisans: [], users: [], stats: null, isLoading: false
  }),
}))
```

- [ ] **Step 4: TypeScript + tests**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
npm run test 2>&1 | tail -8
```

- [ ] **Step 5: Commit**
```bash
git add components/dashboard2/context/dashboard-real-data-context.tsx __tests__/dashboard2/
git commit -m "feat(context): extend DashboardRealDataContext with admin data fields"
```

---

## Phase 3 — Wire AdminOperationsSection to real data

### Task 3: Wire source-admin-preview.tsx

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx`

- [ ] **Step 1: Find where verificationQueue and artisans are used in AdminOperationsSection**

```bash
grep -n "verificationQueue\|inviteRows\|moderationRows" \
  components/dashboard2/admin/source-admin-preview.tsx | head -20
```

- [ ] **Step 2: Find where AdminOperationsSection declares its state/data**

```bash
grep -n "function AdminOperationsSection\|const verificationQueue\|const inviteRows\|const moderationRows" \
  components/dashboard2/admin/source-admin-preview.tsx | head -10
```

Read ~30 lines after `function AdminOperationsSection(` to find the state declarations.

- [ ] **Step 3: Add context read and data overlays to AdminOperationsSection**

After existing state declarations in `AdminOperationsSection`, add:

```tsx
  // Real admin data from context (overlay pattern)
  const _adminCtx = useOptionalDashboardRealData()
  const hasRealAdminData = Boolean(
    _adminCtx && !_adminCtx.isLoading && _adminCtx.adminVerificationQueue !== null
  )

  // Override fixture data with real data when available
  const effectiveVerificationQueue = hasRealAdminData
    ? (_adminCtx!.adminVerificationQueue as unknown as typeof verificationQueue)
    : verificationQueue

  const effectiveArtisans = hasRealAdminData && _adminCtx!.adminArtisans?.length
    ? (_adminCtx!.adminArtisans as unknown as typeof artisans)
    : artisans
```

- [ ] **Step 4: Replace verificationQueue usage in admin views**

There are multiple places in the admin views where `verificationQueue` is used:
- Overview stat cards: `verificationQueue.filter(...).length`
- Verification view: `verificationQueue.map(...)` and bulk action

Find all occurrences with:
```bash
grep -n "verificationQueue" components/dashboard2/admin/source-admin-preview.tsx | head -20
```

Replace each occurrence of `verificationQueue` with `effectiveVerificationQueue`.

Replace each occurrence of `artisans` (in admin context — the artisans DashboardDataList) with `effectiveArtisans`.

**Important:** `artisans` is a large fixture used across multiple sections (public pages AND admin). Only replace inside `AdminOperationsSection` scope. Check the line numbers carefully.

- [ ] **Step 5: Wire overview stat cards to real admin stats**

Find the admin overview DashboardStatCards:
- "Pending verification" — replace `"19"` with `_adminCtx?.adminStats?.pendingVerification ?? "19"`
- "Active subscriptions" — replace `"312"` with `_adminCtx?.adminStats?.activeSubscriptions ?? "312"`
- "System health" — replace `"99.96%"` with `_adminCtx?.adminStats?.systemUptime ?? "99.96%"`

```bash
grep -n '"19"\|"312"\|"99.96%"\|Pending verification\|Active subscriptions\|System health' \
  components/dashboard2/admin/source-admin-preview.tsx | head -15
```

- [ ] **Step 6: Wire admin users view to real user data**

Find the admin users view. It shows hardcoded stats ("2,418", "1,746", etc.). Replace with:
```tsx
value={String(_adminCtx?.adminVerificationQueue?.length ?? verificationQueue.length + " pending")}
```

For the users DashboardDataList, the admin users view may use a separate users fixture. Check what `userRows` or similar it uses and overlay with `_adminCtx` data.

- [ ] **Step 7: TypeScript check and fix**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -20
```

Fix errors. Use `as unknown as typeof verificationQueue` for type casts.

- [ ] **Step 8: Run lint + tests**
```bash
npm run lint 2>&1 | tail -8
npm run test 2>&1 | tail -8
```

- [ ] **Step 9: Commit**
```bash
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): wire AdminOperationsSection to real admin data via context"
```

---

## Self-review checklist

- [ ] Adapter file created: `lib/hooks/use-admin-data-adapter.ts`
- [ ] `mapPendingArtisanToVerificationRecord`, `mapAdminArtisanToSource`, `mapInviteToRow`, `mapAdminStatsToSource` all present and tested
- [ ] `useAdminDataAdapter()` hook present
- [ ] Context has `adminVerificationQueue`, `adminArtisans`, `adminStats` fields
- [ ] `AdminOperationsSection` uses `effectiveVerificationQueue` and `effectiveArtisans`
- [ ] Overview stat cards wire to real stats when available
- [ ] All test mocks updated with `useAdminDataAdapter` stub
- [ ] TypeScript: 0 errors, lint: 0 errors, all tests passing
