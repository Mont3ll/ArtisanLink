# API Integration — Sprint 2: Artisan Data Wiring

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all fixture data in `ArtisanDashboardCoreSection` with real API data from existing React Query hooks, while keeping fixture fallbacks for preview/loading states.

**Architecture:** Use the Adapter Pattern — create thin adapter files (`lib/hooks/use-artisan-*-adapter.ts`) that map real API types to the simplified types expected by `source-admin-preview.tsx`. Then wire the adapters into `ArtisanDashboardCoreSection` via an extended `DashboardRealDataContext`. Phase 1 creates all adapter files in parallel (separate files, no conflicts). Phase 2 performs the sequential wire-in to the monolith source file.

**Tech Stack:** Next.js 16, React 19, React Query (`useArtisanDashboard`, `useArtisanJobs`, `usePortfolio`, `useArtisanEarnings`, `useArtisanSubscription`, `useArtisanSettings`), TypeScript strict, Vitest

**Source type reference:** `source-admin-preview.tsx` defines `ArtisanJob`, `ArtisanEarningRow`, `ArtisanPortfolioProject` as simplified types. Adapters map real API types → these simplified types.

---

## Type mapping reference (needed by all adapter tasks)

### Real API `ArtisanJob` → Source `ArtisanJob`
```
real.id         → source.id
real.title      → source.title
real.client.name → source.client
real.status     → source.status (REQUESTED→PENDING, IN_PROGRESS→ACTIVE, PAID→COMPLETED)
real.clientBudget → source.budget ("KES " + amount)
real.latestQuote.amount → source.quote (or "Not sent")
real.location   → source.location
real.description → source.description
```

### Real API `PortfolioItem` → Source `ArtisanPortfolioProject`
```
real.id         → source.id
real.title      → source.title
real.category   → source.category ("Uncategorized" if null)
real.isPublic   → source.status ("Published" | "Draft")
real.isFeatured → source.featured
real.duration   → source.duration ("")
real.cost       → source.cost ("KES " + amount or "")
real.description → source.description ("")
real.tags       → source.tags
"linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 42%, #047857 100%)" → source.gradient (default)
```

### Real API `EarningsPayout` → Source `ArtisanEarningRow`
```
real.id         → source.id
real.job.title  → source.item
real.job.client.firstName + lastName → source.client
real.grossAmount → source.amount ("KES " + amount)
real.commission → source.commission ("KES " + amount)
real.netAmount  → source.net ("KES " + amount)
real.status     → source.status ("COMPLETED" | "PENDING")
real.completedAt → source.date ("Today" or date string)
```

---

## File map

| File | Action | Phase |
| --- | --- | --- |
| `lib/hooks/use-artisan-jobs-adapter.ts` | CREATE | Phase 1 (parallel) |
| `lib/hooks/use-artisan-portfolio-adapter.ts` | CREATE | Phase 1 (parallel) |
| `lib/hooks/use-artisan-earnings-adapter.ts` | CREATE | Phase 1 (parallel) |
| `lib/hooks/use-artisan-settings-adapter.ts` | CREATE | Phase 1 (parallel) |
| `components/dashboard2/context/dashboard-real-data-context.tsx` | EXTEND | Phase 2 (sequential) |
| `components/dashboard2/admin/source-admin-preview.tsx` | WIRE | Phase 2 (sequential) |
| `__tests__/dashboard2/artisan-adapters.test.ts` | CREATE | Phase 1 (parallel, any worker) |

---

## Phase 1 — Parallel adapter creation

### Task 1A: Jobs adapter (`lib/hooks/use-artisan-jobs-adapter.ts`)

**Files:**
- Create: `lib/hooks/use-artisan-jobs-adapter.ts`

- [ ] **Step 1: Write the test first**

Create `__tests__/dashboard2/artisan-jobs-adapter.test.ts`:

```ts
import { mapApiJobToSourceJob, mapStatusToSourceStatus } from '@/lib/hooks/use-artisan-jobs-adapter'

describe('mapApiJobToSourceJob', () => {
  it('maps a real API job to source format', () => {
    const apiJob = {
      id: 'job-1',
      title: 'Fix sink',
      description: 'Leaking tap',
      location: 'Nairobi',
      status: 'QUOTED',
      clientBudget: 6000,
      agreedPrice: null,
      client: { id: 'c1', name: 'Jane Doe', email: 'j@example.com', profileImage: null },
      latestQuote: { id: 'q1', amount: 4800, status: 'SENT', description: '', round: 1,
        estimatedDuration: null, paymentTerms: null, validUntil: null,
        clientResponse: null, requestedDepositPercent: null, lineItems: [], createdAt: '' },
    }
    const result = mapApiJobToSourceJob(apiJob as Parameters<typeof mapApiJobToSourceJob>[0])
    expect(result.id).toBe('job-1')
    expect(result.title).toBe('Fix sink')
    expect(result.client).toBe('Jane Doe')
    expect(result.status).toBe('QUOTED')
    expect(result.budget).toBe('KES 6,000')
    expect(result.quote).toBe('KES 4,800')
    expect(result.location).toBe('Nairobi')
  })

  it('maps REQUESTED status to PENDING', () => {
    expect(mapStatusToSourceStatus('REQUESTED')).toBe('PENDING')
  })
  it('maps IN_PROGRESS to ACTIVE', () => {
    expect(mapStatusToSourceStatus('IN_PROGRESS')).toBe('ACTIVE')
  })
  it('maps PAID to COMPLETED', () => {
    expect(mapStatusToSourceStatus('PAID')).toBe('COMPLETED')
  })
  it('returns Not sent when no quote', () => {
    const apiJob = {
      id: 'j2', title: 'T', description: '', location: null, status: 'REQUESTED',
      clientBudget: 3000, agreedPrice: null,
      client: { id: 'c2', name: 'Bob', email: '', profileImage: null },
      latestQuote: null,
    }
    const result = mapApiJobToSourceJob(apiJob as Parameters<typeof mapApiJobToSourceJob>[0])
    expect(result.quote).toBe('Not sent')
    expect(result.status).toBe('PENDING')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/artisan-jobs-adapter.test.ts 2>&1 | tail -15
```
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Create the adapter**

Create `lib/hooks/use-artisan-jobs-adapter.ts`:

```ts
/**
 * Artisan Jobs Adapter
 * Maps real API ArtisanJob (from use-artisan-jobs.ts) to the simplified
 * ArtisanJob type used in source-admin-preview.tsx.
 */
import { useArtisanJobs } from './use-artisan-jobs'
import type { ArtisanJob as ApiJob } from './use-artisan-jobs'

/** Source-preview simplified ArtisanJob type (subset safe to share) */
export interface SourceArtisanJob {
  id: string
  title: string
  client: string
  status: 'PENDING' | 'QUOTED' | 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'VERIFIED'
  budget: string
  quote: string
  location: string
  description: string
}

/** Maps real API job status to the 6-value source-preview status */
export function mapStatusToSourceStatus(
  status: string,
): SourceArtisanJob['status'] {
  switch (status) {
    case 'REQUESTED': return 'PENDING'
    case 'QUOTED': return 'QUOTED'
    case 'ACCEPTED':
    case 'DEPOSIT_PAID':
    case 'IN_PROGRESS': return 'ACTIVE'
    case 'COMPLETED':
    case 'PAID': return 'COMPLETED'
    case 'DISPUTED': return 'REVIEW'
    default: return 'PENDING'
  }
}

/** Formats a number as KES currency string */
function formatKes(amount: number | null | undefined): string {
  if (amount == null) return ''
  return `KES ${amount.toLocaleString('en-KE')}`
}

/** Maps a single real API job to source-preview format */
export function mapApiJobToSourceJob(job: ApiJob): SourceArtisanJob {
  return {
    id: job.id,
    title: job.title,
    client: job.client.name,
    status: mapStatusToSourceStatus(job.status),
    budget: formatKes(job.clientBudget ?? job.agreedPrice),
    quote: job.latestQuote ? formatKes(job.latestQuote.amount) : 'Not sent',
    location: job.location ?? 'Kenya',
    description: job.description,
  }
}

/**
 * React Query hook that returns artisan jobs adapted to source-preview format.
 * Returns `{ jobs, isLoading, error, statusCounts, setJobStatus }`
 */
export function useArtisanJobsAdapter(statusFilter: string | null = null) {
  const { data, isLoading, error } = useArtisanJobs(statusFilter)
  
  const jobs: SourceArtisanJob[] = (data?.jobs ?? []).map(mapApiJobToSourceJob)
  
  const statusCounts = data?.statusCounts ?? {
    REQUESTED: 0, QUOTED: 0, ACCEPTED: 0, DEPOSIT_PAID: 0,
    IN_PROGRESS: 0, COMPLETED: 0, PAID: 0, CANCELLED: 0, DECLINED: 0, total: 0,
  }

  return { jobs, isLoading, error, statusCounts }
}
```

- [ ] **Step 4: Run tests**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/artisan-jobs-adapter.test.ts 2>&1 | tail -15
```
Expected: All tests pass.

- [ ] **Step 5: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```
Expected: 0 errors.

- [ ] **Step 6: Commit**
```bash
git add lib/hooks/use-artisan-jobs-adapter.ts __tests__/dashboard2/artisan-jobs-adapter.test.ts
git commit -m "feat(adapters): add artisan jobs adapter for source-preview integration"
```

---

### Task 1B: Portfolio adapter (`lib/hooks/use-artisan-portfolio-adapter.ts`)

**Files:**
- Create: `lib/hooks/use-artisan-portfolio-adapter.ts`

- [ ] **Step 1: Write the test**

Create `__tests__/dashboard2/artisan-portfolio-adapter.test.ts`:

```ts
import { mapApiPortfolioItemToSource } from '@/lib/hooks/use-artisan-portfolio-adapter'

describe('mapApiPortfolioItemToSource', () => {
  it('maps a public portfolio item correctly', () => {
    const item = {
      id: 'p1', title: 'Kitchen remodel', description: 'Full redesign',
      imageUrl: 'https://img.example.com/1.jpg', imageUrls: [],
      category: 'Carpentry', tags: ['wood', 'cabinets'],
      completedAt: null, duration: '3 days', cost: 45000,
      isPublic: true, isFeatured: true, createdAt: '', updatedAt: '',
    }
    const result = mapApiPortfolioItemToSource(item)
    expect(result.id).toBe('p1')
    expect(result.title).toBe('Kitchen remodel')
    expect(result.status).toBe('Published')
    expect(result.featured).toBe(true)
    expect(result.cost).toBe('KES 45,000')
    expect(result.category).toBe('Carpentry')
  })

  it('maps a private item to Draft status', () => {
    const item = {
      id: 'p2', title: 'Draft project', description: null,
      imageUrl: '', imageUrls: [], category: null, tags: [],
      completedAt: null, duration: null, cost: null,
      isPublic: false, isFeatured: false, createdAt: '', updatedAt: '',
    }
    const result = mapApiPortfolioItemToSource(item)
    expect(result.status).toBe('Draft')
    expect(result.category).toBe('Uncategorized')
    expect(result.cost).toBe('')
  })
})
```

- [ ] **Step 2: Verify test fails**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/artisan-portfolio-adapter.test.ts 2>&1 | tail -10
```

- [ ] **Step 3: Create adapter**

Create `lib/hooks/use-artisan-portfolio-adapter.ts`:

```ts
/**
 * Artisan Portfolio Adapter
 * Maps real API PortfolioItem (from use-portfolio.ts) to the simplified
 * ArtisanPortfolioProject type used in source-admin-preview.tsx.
 */
import { usePortfolio } from './use-portfolio'
import type { PortfolioItem } from './use-portfolio'

export interface SourcePortfolioProject {
  id: string
  title: string
  category: string
  status: 'Published' | 'Draft' | 'Hidden'
  featured: boolean
  duration: string
  cost: string
  location: string
  description: string
  tags: string[]
  gradient: string
}

const DEFAULT_GRADIENT =
  'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 42%, #047857 100%)'

const GRADIENT_MAP: Record<string, string> = {
  Carpentry: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 42%, #d97706 100%)',
  Plumbing: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 42%, #2563eb 100%)',
  Painting: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 42%, #db2777 100%)',
  Electrical: 'linear-gradient(135deg, #fefce8 0%, #fde047 42%, #ca8a04 100%)',
}

export function mapApiPortfolioItemToSource(
  item: PortfolioItem,
): SourcePortfolioProject {
  const cat = item.category ?? 'Uncategorized'
  return {
    id: item.id,
    title: item.title,
    category: cat,
    status: item.isPublic ? 'Published' : 'Draft',
    featured: item.isFeatured,
    duration: item.duration ?? '',
    cost: item.cost ? `KES ${item.cost.toLocaleString('en-KE')}` : '',
    location: '',
    description: item.description ?? '',
    tags: item.tags,
    gradient: GRADIENT_MAP[cat] ?? DEFAULT_GRADIENT,
  }
}

export function useArtisanPortfolioAdapter(page = 1) {
  const { data, isLoading, error } = usePortfolio({ page, limit: 20 })
  const projects: SourcePortfolioProject[] = (data?.items ?? []).map(
    mapApiPortfolioItemToSource,
  )
  return { projects, isLoading, error, total: data?.pagination.total ?? 0 }
}
```

- [ ] **Step 4: Run tests + TypeScript**
```bash
npx vitest run __tests__/dashboard2/artisan-portfolio-adapter.test.ts 2>&1 | tail -10
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

- [ ] **Step 5: Commit**
```bash
git add lib/hooks/use-artisan-portfolio-adapter.ts __tests__/dashboard2/artisan-portfolio-adapter.test.ts
git commit -m "feat(adapters): add artisan portfolio adapter for source-preview integration"
```

---

### Task 1C: Earnings adapter (`lib/hooks/use-artisan-earnings-adapter.ts`)

**Files:**
- Create: `lib/hooks/use-artisan-earnings-adapter.ts`

- [ ] **Step 1: Write test**

Create `__tests__/dashboard2/artisan-earnings-adapter.test.ts`:

```ts
import { mapPayoutToEarningRow } from '@/lib/hooks/use-artisan-earnings-adapter'

describe('mapPayoutToEarningRow', () => {
  it('maps a completed payout to earning row', () => {
    const payout = {
      id: 'pay-1',
      type: 'FINAL_PAYMENT' as const,
      grossAmount: 10000,
      commission: 800,
      netAmount: 9200,
      status: 'COMPLETED' as const,
      phoneNumber: '+254700000000',
      mpesaReceiptNumber: 'ABC123',
      mpesaTransactionId: null,
      failureReason: null,
      createdAt: '2026-05-01T10:00:00Z',
      completedAt: '2026-05-01T11:00:00Z',
      job: { id: 'j1', title: 'Fix sink', agreedPrice: 10000,
             client: { firstName: 'Jane', lastName: 'Doe' } },
    }
    const result = mapPayoutToEarningRow(payout)
    expect(result.id).toBe('pay-1')
    expect(result.item).toBe('Fix sink')
    expect(result.client).toBe('Jane Doe')
    expect(result.amount).toBe('KES 10,000')
    expect(result.commission).toBe('KES 800')
    expect(result.net).toBe('KES 9,200')
    expect(result.status).toBe('COMPLETED')
  })

  it('handles a payout with no job', () => {
    const payout = {
      id: 'pay-2', type: 'DEPOSIT_SHARE' as const,
      grossAmount: 5000, commission: 400, netAmount: 4600,
      status: 'PENDING' as const, phoneNumber: '+254700000001',
      mpesaReceiptNumber: null, mpesaTransactionId: null,
      failureReason: null, createdAt: '', completedAt: null, job: null,
    }
    const result = mapPayoutToEarningRow(payout)
    expect(result.item).toBe('Payout')
    expect(result.client).toBe('—')
    expect(result.status).toBe('PENDING')
  })
})
```

- [ ] **Step 2: Verify test fails**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/artisan-earnings-adapter.test.ts 2>&1 | tail -10
```

- [ ] **Step 3: Read the earnings hook response shape**

Read `/home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-artisan-earnings.ts` fully to understand the `EarningsData` response type before writing the adapter.

- [ ] **Step 4: Create adapter**

Create `lib/hooks/use-artisan-earnings-adapter.ts`:

```ts
/**
 * Artisan Earnings Adapter
 * Maps real API EarningsPayout (from use-artisan-earnings.ts) to the
 * simplified ArtisanEarningRow type used in source-admin-preview.tsx.
 */
import { useArtisanEarnings } from './use-artisan-earnings'
import type { EarningsPayout } from './use-artisan-earnings'

export interface SourceEarningRow {
  id: string
  item: string
  client: string
  amount: string
  commission: string
  net: string
  status: 'COMPLETED' | 'PENDING' | 'ACTIVE' | 'REVIEW' | 'QUOTED' | 'VERIFIED'
  date: string
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Pending'
  const date = new Date(dateStr)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Today'
  return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
}

export function mapPayoutToEarningRow(payout: EarningsPayout): SourceEarningRow {
  return {
    id: payout.id,
    item: payout.job?.title ?? 'Payout',
    client: payout.job
      ? `${payout.job.client.firstName} ${payout.job.client.lastName}`
      : '—',
    amount: formatKes(payout.grossAmount),
    commission: formatKes(payout.commission),
    net: formatKes(payout.netAmount),
    status: payout.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
    date: formatDate(payout.completedAt),
  }
}

export function useArtisanEarningsAdapter() {
  const { data, isLoading, error } = useArtisanEarnings()
  
  // The earnings hook returns payouts — map to source rows
  const payouts = data?.payouts ?? data?.recentPayouts ?? []
  const earningRows: SourceEarningRow[] = (payouts as EarningsPayout[]).map(
    mapPayoutToEarningRow,
  )

  const totalEarned = data?.totalEarned ?? data?.summary?.totalEarned ?? 0
  const totalCommission = data?.totalCommission ?? data?.summary?.totalCommission ?? 0
  const pendingPayout = data?.pendingPayout ?? data?.summary?.pendingPayout ?? 0

  return { earningRows, isLoading, error, totalEarned, totalCommission, pendingPayout }
}
```

**Note:** After reading `use-artisan-earnings.ts`, adjust the field names (`payouts`, `totalEarned`, etc.) to match what the hook actually returns.

- [ ] **Step 5: Run tests + TypeScript**
```bash
npx vitest run __tests__/dashboard2/artisan-earnings-adapter.test.ts 2>&1 | tail -10
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

- [ ] **Step 6: Commit**
```bash
git add lib/hooks/use-artisan-earnings-adapter.ts __tests__/dashboard2/artisan-earnings-adapter.test.ts
git commit -m "feat(adapters): add artisan earnings adapter for source-preview integration"
```

---

### Task 1D: Settings adapter + overview stats adapter (`lib/hooks/use-artisan-settings-adapter.ts`)

**Files:**
- Create: `lib/hooks/use-artisan-settings-adapter.ts`

- [ ] **Step 1: Write tests**

Create `__tests__/dashboard2/artisan-settings-adapter.test.ts`:

```ts
import {
  buildProfileCompletionPct,
  KENYAN_COUNTIES,
} from '@/lib/hooks/use-artisan-settings-adapter'

describe('buildProfileCompletionPct', () => {
  it('returns 50 for a bare profile', () => {
    expect(buildProfileCompletionPct({
      bio: null, profession: null, county: null,
      hourlyRate: null, certificateUrl: null,
      artisanStatus: null, portfolioCount: 0, specializationCount: 0,
    })).toBe(50)
  })

  it('adds points for bio', () => {
    const result = buildProfileCompletionPct({
      bio: 'I am a carpenter', profession: null, county: null,
      hourlyRate: null, certificateUrl: null,
      artisanStatus: null, portfolioCount: 0, specializationCount: 0,
    })
    expect(result).toBeGreaterThan(50)
  })

  it('returns 100 for a fully complete profile', () => {
    expect(buildProfileCompletionPct({
      bio: 'Professional carpenter', profession: 'Carpenter',
      county: 'Nairobi', hourlyRate: 2600, certificateUrl: 'https://cert.example.com/1.pdf',
      artisanStatus: 'VERIFIED', portfolioCount: 3, specializationCount: 2,
    })).toBe(100)
  })
})

describe('KENYAN_COUNTIES', () => {
  it('contains 47 counties', () => {
    expect(KENYAN_COUNTIES.length).toBe(47)
  })
  it('includes Nairobi', () => {
    expect(KENYAN_COUNTIES).toContain('Nairobi')
  })
})
```

- [ ] **Step 2: Verify test fails**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/artisan-settings-adapter.test.ts 2>&1 | tail -10
```

- [ ] **Step 3: Create adapter**

Create `lib/hooks/use-artisan-settings-adapter.ts`:

```ts
/**
 * Artisan Settings Adapter
 * Adapts artisan settings hooks and provides the 47 Kenyan counties list
 * used in the location settings tab.
 */
import { useArtisanSettings, useArtisanSpecializations } from './use-artisan-settings'

export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
] as const

export type KenyanCounty = (typeof KENYAN_COUNTIES)[number]

export interface ProfileCompletionInputs {
  bio: string | null
  profession: string | null
  county: string | null
  hourlyRate: number | null
  certificateUrl: string | null
  artisanStatus: string | null
  portfolioCount: number
  specializationCount: number
}

/** Computes profile completion % from real profile fields (0–100) */
export function buildProfileCompletionPct(inputs: ProfileCompletionInputs): number {
  let pct = 50 // base: account exists
  if (inputs.bio) pct += 5
  if (inputs.profession) pct += 5
  if (inputs.county) pct += 5
  if (inputs.hourlyRate) pct += 5
  if (inputs.certificateUrl) pct += 10
  if (inputs.artisanStatus === 'VERIFIED') pct += 10
  if (inputs.portfolioCount >= 2) pct += 10
  else if (inputs.portfolioCount === 1) pct += 5
  if (inputs.specializationCount >= 1) pct += 10
  return Math.min(100, pct)
}

/** Hook that returns artisan profile + specializations + computed completion */
export function useArtisanSettingsAdapter() {
  const { data: settingsData, isLoading: settingsLoading, updateProfile, updateLocation } =
    useArtisanSettings()
  const { data: specData, isLoading: specLoading, addSpecialization, deleteSpecialization } =
    useArtisanSpecializations()

  const profile = settingsData?.profile ?? null
  const specializations = specData?.specializations ?? []

  const completionPct = buildProfileCompletionPct({
    bio: profile?.bio ?? null,
    profession: profile?.profession ?? null,
    county: profile?.county ?? null,
    hourlyRate: profile?.hourlyRate ?? null,
    certificateUrl: profile?.certificateUrl ?? null,
    artisanStatus: profile?.artisanStatus ?? null,
    portfolioCount: 0, // passed in separately from portfolio adapter
    specializationCount: specializations.length,
  })

  return {
    profile,
    specializations,
    completionPct,
    isLoading: settingsLoading || specLoading,
    updateProfile,
    updateLocation,
    addSpecialization,
    deleteSpecialization,
    counties: KENYAN_COUNTIES as unknown as string[],
  }
}
```

**Note:** Read `use-artisan-settings.ts` fully to verify the exported function names (`useArtisanSettings`, `useArtisanSpecializations`) before implementing. Adjust if different.

- [ ] **Step 4: Run tests + TypeScript**
```bash
npx vitest run __tests__/dashboard2/artisan-settings-adapter.test.ts 2>&1 | tail -15
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

- [ ] **Step 5: Commit**
```bash
git add lib/hooks/use-artisan-settings-adapter.ts __tests__/dashboard2/artisan-settings-adapter.test.ts
git commit -m "feat(adapters): add artisan settings adapter with profile completion and county list"
```

---

## Phase 2 — Sequential wire-in to source-admin-preview.tsx

### Task 2A: Extend DashboardRealDataContext with artisan adapter data

**Files:**
- Modify: `components/dashboard2/context/dashboard-real-data-context.tsx`

- [ ] **Step 1: Read current context file to understand its shape**
```bash
cat /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign/components/dashboard2/context/dashboard-real-data-context.tsx
```

- [ ] **Step 2: Add artisan data fields to the interface and provider**

Extend `DashboardRealData` interface:
```tsx
  // Artisan-specific data for dashboard section wire-in
  artisanJobs: import('@/lib/hooks/use-artisan-jobs-adapter').SourceArtisanJob[] | null
  artisanPortfolio: import('@/lib/hooks/use-artisan-portfolio-adapter').SourcePortfolioProject[] | null
  artisanEarnings: import('@/lib/hooks/use-artisan-earnings-adapter').SourceEarningRow[] | null
  artisanProfile: import('@/lib/hooks/use-artisan-settings-adapter').ProfileCompletionInputs | null
  artisanCompletionPct: number | null
```

In `ArtisanProvider`, import and call the new adapters:
```tsx
import { useArtisanJobsAdapter } from '@/lib/hooks/use-artisan-jobs-adapter'
import { useArtisanPortfolioAdapter } from '@/lib/hooks/use-artisan-portfolio-adapter'
import { useArtisanEarningsAdapter } from '@/lib/hooks/use-artisan-earnings-adapter'
import { useArtisanSettingsAdapter } from '@/lib/hooks/use-artisan-settings-adapter'
```

Add to ArtisanProvider component:
```tsx
const { jobs: artisanJobs } = useArtisanJobsAdapter()
const { projects: artisanPortfolio } = useArtisanPortfolioAdapter()
const { earningRows: artisanEarnings } = useArtisanEarningsAdapter()
const { profile, completionPct } = useArtisanSettingsAdapter()
```

- [ ] **Step 3: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

- [ ] **Step 4: Run all tests**
```bash
npm run test 2>&1 | tail -10
```

- [ ] **Step 5: Commit**
```bash
git add components/dashboard2/context/dashboard-real-data-context.tsx
git commit -m "feat(context): extend DashboardRealDataContext with artisan adapter data fields"
```

---

### Task 2B: Wire artisan section to real data in source-admin-preview.tsx

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx`

This is the main wiring task. At the top of `ArtisanDashboardCoreSection`, after the existing `useState` declarations, read from context and use real data:

- [ ] **Step 1: Find the mock resource declarations**
```bash
grep -n "useMockResource\|artisanDataFixtures\|artisanJobRows\|portfolioRows\|earningRows" \
  components/dashboard2/admin/source-admin-preview.tsx | head -20
```

- [ ] **Step 2: Replace mock resource calls with adapter data**

After `const [addJobModalOpen, setAddJobModalOpen] = useState(false)` and `const [verificationBannerDismissed` declarations, add:

```tsx
  // Real data from context (graceful fallback to mock resources for preview)
  const _artisanCtx = useOptionalDashboardRealData()
  const hasRealArtisanData = Boolean(
    _artisanCtx && !_artisanCtx.isLoading && _artisanCtx.artisanJobs !== null
  )
```

Then replace:
```tsx
const jobsResource = useMockResource(artisanDataFixtures.jobs)
const portfolioResource = useMockResource(artisanDataFixtures.portfolioProjects)
const earningsResource = useMockResource(artisanDataFixtures.earnings)
const artisanJobRows = jobsResource.data
const setArtisanJobRows = jobsResource.setData
const portfolioRows = portfolioResource.data
const setPortfolioRows = portfolioResource.setData
const earningRows = earningsResource.data
const setEarningRows = earningsResource.setData
const artisanDataLoading = jobsResource.loading || portfolioResource.loading || earningsResource.loading
```

With:
```tsx
  // Jobs: use real data when available, fall back to mock resource for preview
  const jobsResource = useMockResource(artisanDataFixtures.jobs)
  const portfolioResource = useMockResource(artisanDataFixtures.portfolioProjects)
  const earningsResource = useMockResource(artisanDataFixtures.earnings)

  // Real data overlays — replace mock data when context has real API data
  const artisanJobRows = hasRealArtisanData
    ? ((_artisanCtx?.artisanJobs ?? []) as typeof jobsResource.data)
    : jobsResource.data
  const setArtisanJobRows = jobsResource.setData // mutations still use local state; real mutations added in sprint 3
  const portfolioRows = hasRealArtisanData
    ? ((_artisanCtx?.artisanPortfolio ?? []) as typeof portfolioResource.data)
    : portfolioResource.data
  const setPortfolioRows = portfolioResource.setData
  const earningRows = hasRealArtisanData
    ? ((_artisanCtx?.artisanEarnings ?? []) as typeof earningsResource.data)
    : earningsResource.data
  const setEarningRows = earningsResource.setData
  const artisanDataLoading =
    hasRealArtisanData ? false : (jobsResource.loading || portfolioResource.loading || earningsResource.loading)
```

- [ ] **Step 3: Wire profile completion percentage**

Find `profileCompletionPct` variable declaration in `ArtisanDashboardCoreSection`. Replace the computed formula with:

```tsx
  const profileCompletionPct = hasRealArtisanData && _artisanCtx?.artisanCompletionPct != null
    ? _artisanCtx.artisanCompletionPct
    : Math.min(100,
        50
        + (portfolioRows.length >= 2 ? 20 : portfolioRows.length * 10)
        + (artisanJobRows.length > 0 ? 10 : 0)
        + (earningRows.length > 0 ? 10 : 0)
        + 5
        + 5
      )
```

- [ ] **Step 4: Wire overview stat cards to real data**

Find the overview stat cards in `ArtisanDashboardCoreSection` (the `DashboardStatCard` components for pending/quoted/active/earnings). These currently use `artisanJobRows.filter(...)` which will now use real job rows automatically since we replaced `artisanJobRows`. No additional changes needed.

- [ ] **Step 5: Wire settings profile tab to real data**

Find `settingsTab === "profile"` section. The inputs currently use `defaultValue`. Replace with controlled values using the profile from context:

```tsx
// At top of settings rendering section, after existing code:
const _profile = _artisanCtx?.artisanProfile
```

Replace the 4 profile inputs (`defaultValue="Grace Wanjiku"`, `defaultValue="Carpenter"`, `defaultValue="KES 2,600"`, the bio textarea) with:
```tsx
// Display name input
defaultValue={_profile ? `${_profile.bio ? 'Grace Wanjiku' : 'Grace Wanjiku'}` : "Grace Wanjiku"}
// NOTE: profile name comes from Clerk (displayName in context), not profile API
// Use _artisanCtx?.displayName for the name field

// For profession:
defaultValue={(_profile as { profession?: string | null } | null)?.profession ?? "Carpenter"}

// For hourly rate:
defaultValue={(_profile as { hourlyRate?: number | null } | null)?.hourlyRate
  ? `KES ${(_profile as { hourlyRate?: number | null }).hourlyRate?.toLocaleString('en-KE') ?? '2,600'}`
  : "KES 2,600"}

// For bio textarea:
defaultValue={(_profile as { bio?: string | null } | null)?.bio ?? "Carpenter focused on cabinets..."}
```

- [ ] **Step 6: Wire settings location tab to real data + county dropdown**

Find `settingsTab === "location"` section. Replace the static text inputs with real data and a proper county `<select>`:

```tsx
// County field — replace <input defaultValue="Kiambu" ...> with:
<select
  defaultValue={(_profile as { county?: string | null } | null)?.county ?? "Kiambu"}
  className="h-11 min-w-0 cursor-pointer rounded-lg border bg-white px-3 text-[14px] outline-none"
  style={{ borderColor: COLORS.hairline }}
>
  {/* Use the KENYAN_COUNTIES constant that will be imported from the adapter */}
  {/* For now, show the top counties as options */}
  {["Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa",
    "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
    "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu",
    "Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa",
    "Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua",
    "Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi",
    "Trans-Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"
  ].map((county) => (
    <option key={county} value={county}>{county}</option>
  ))}
</select>
```

Also wire city/town fields to real data similarly.

- [ ] **Step 7: TypeScript check**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -20
```
Fix all errors. Common issues:
- Type mismatch between `SourceArtisanJob` and internal `ArtisanJob` — use `as unknown as typeof jobsResource.data` cast
- Missing fields on the profile type assertions

- [ ] **Step 8: Run lint**
```bash
npm run lint 2>&1 | tail -10
```

- [ ] **Step 9: Run all tests**
```bash
npm run test 2>&1 | tail -15
```

- [ ] **Step 10: Commit**
```bash
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): wire ArtisanDashboardCoreSection to real API data via adapters"
```

---

## Self-review checklist

- [ ] All 4 adapter files created and tested
- [ ] Context extended with artisan adapter data
- [ ] `artisanJobRows` uses real jobs when context has data
- [ ] `portfolioRows` uses real portfolio when context has data
- [ ] `earningRows` uses real earnings when context has data
- [ ] `profileCompletionPct` uses real profile fields
- [ ] Settings location tab has county `<select>` with all 47 Kenyan counties
- [ ] Fixture fallback still works when context data is null (preview mode)
- [ ] TypeScript: 0 errors
- [ ] Lint: 0 errors
- [ ] All tests passing
