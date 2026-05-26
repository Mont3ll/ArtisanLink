# API Integration — Sprint 5: Client Data Wiring

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan.

**Goal:** Replace client fixture data with real API data using the adapter + context overlay pattern from Sprints 2–4.

**Architecture:** Phase 1 creates a client data adapter (parallel with nothing else this sprint — single new file). Phase 2 extends context. Phase 3 wires ClientDashboardCoreSection.

**Tech Stack:** `useClientJobs`, `useClientStats`, `useClientReviews`, `useSavedArtisansPage`, `useArtisanSearch`, TypeScript strict, Vitest

---

## Type mappings

### Source `ClientJob` ← Real `ClientJob` (from `use-client-jobs.ts`)
```
real.id         → id
real.title      → title
real.artisan.name → artisan
real.artisan.profession → profession
mapStatus(real.status) → status  (same logic as artisan: REQUESTED→PENDING, IN_PROGRESS→ACTIVE, PAID→COMPLETED)
real.latestQuote?.amount → quote ("KES x,xxx" or "Not sent")
real.location   → location
real.description → description
```

### Source stats ← `ClientStats`
```
stats.activeProjects → "Active jobs"
stats.savedArtisans  → "Saved artisans"
stats.completedProjects → "Completed jobs"
```

---

## File map

| File | Action | Phase |
| --- | --- | --- |
| `lib/hooks/use-client-data-adapter.ts` | CREATE | Phase 1 |
| `__tests__/dashboard2/client-data-adapter.test.ts` | CREATE | Phase 1 |
| `components/dashboard2/context/dashboard-real-data-context.tsx` | EXTEND | Phase 2 |
| `components/dashboard2/admin/source-admin-preview.tsx` | WIRE | Phase 3 |

---

## Phase 1 — Client data adapter

### Task 1: `lib/hooks/use-client-data-adapter.ts`

**Files:**
- Create: `lib/hooks/use-client-data-adapter.ts`
- Create: `__tests__/dashboard2/client-data-adapter.test.ts`

- [ ] **Step 1: Read real hook types**
```bash
head -90 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-client-jobs.ts
head -50 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-client-dashboard.ts
head -60 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-client-reviews.ts
head -70 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-saved-artisans.ts
```

- [ ] **Step 2: Write the failing test**

Create `__tests__/dashboard2/client-data-adapter.test.ts`:

```ts
import {
  mapRealClientJobToSource,
  mapClientStatusToSource,
  mapClientStatsToSource,
} from '@/lib/hooks/use-client-data-adapter'

const makeRealJob = (overrides = {}) => ({
  id: 'cj-1', title: 'Paint living room', description: 'Two-room repaint',
  category: null, location: 'Westlands, Nairobi', status: 'QUOTED',
  clientBudget: 14000, agreedPrice: null, depositAmount: null, depositPercent: 30,
  depositPaid: false, depositPaidAt: null, finalPaid: false, finalPaidAt: null,
  startedAt: null, requestedStartDate: null, requestedEndDate: null,
  scheduledStartDate: null, scheduledEndDate: null, completedAt: null,
  declineReason: null, cancelReason: null, createdAt: '', updatedAt: '',
  artisan: { id: 'a1', name: 'Amina Hassan', email: '', profileImage: null,
    profession: 'Painter', phone: null, location: null, rating: 4.8, isAvailable: true },
  latestQuote: { id: 'q1', amount: 12000, description: '', estimatedDuration: null,
    paymentTerms: null, status: 'SENT', round: 1, validUntil: null,
    clientResponse: null, requestedDepositPercent: null, lineItems: [], createdAt: '' },
  payments: [],
  ...overrides,
})

describe('mapClientStatusToSource', () => {
  it('maps REQUESTED → PENDING', () => expect(mapClientStatusToSource('REQUESTED')).toBe('PENDING'))
  it('maps IN_PROGRESS → ACTIVE', () => expect(mapClientStatusToSource('IN_PROGRESS')).toBe('ACTIVE'))
  it('maps PAID → COMPLETED', () => expect(mapClientStatusToSource('PAID')).toBe('COMPLETED'))
  it('maps DISPUTED → REVIEW', () => expect(mapClientStatusToSource('DISPUTED')).toBe('REVIEW'))
  it('passes through QUOTED', () => expect(mapClientStatusToSource('QUOTED')).toBe('QUOTED'))
})

describe('mapRealClientJobToSource', () => {
  it('maps basic job fields', () => {
    const result = mapRealClientJobToSource(makeRealJob() as never)
    expect(result.id).toBe('cj-1')
    expect(result.title).toBe('Paint living room')
    expect(result.artisan).toBe('Amina Hassan')
    expect(result.profession).toBe('Painter')
    expect(result.status).toBe('QUOTED')
    expect(result.quote).toBe('KES 12,000')
    expect(result.location).toBe('Westlands, Nairobi')
  })
  it('returns "Not sent" when no quote', () => {
    const job = makeRealJob({ latestQuote: null })
    const result = mapRealClientJobToSource(job as never)
    expect(result.quote).toBe('Not sent')
  })
  it('maps COMPLETED status', () => {
    const job = makeRealJob({ status: 'COMPLETED' })
    const result = mapRealClientJobToSource(job as never)
    expect(result.status).toBe('COMPLETED')
  })
})

describe('mapClientStatsToSource', () => {
  it('returns formatted stat values', () => {
    const stats = { totalProjects: 20, activeProjects: 3, completedProjects: 17, savedArtisans: 12 }
    const result = mapClientStatsToSource(stats)
    expect(result.activeJobs).toBe('3')
    expect(result.savedArtisans).toBe('12')
    expect(result.completedJobs).toBe('17')
  })
  it('handles null/undefined gracefully', () => {
    const result = mapClientStatsToSource(null)
    expect(result.activeJobs).toBe('0')
    expect(result.savedArtisans).toBe('0')
    expect(result.completedJobs).toBe('0')
  })
})
```

- [ ] **Step 3: Verify test fails**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/client-data-adapter.test.ts 2>&1 | tail -8
```

- [ ] **Step 4: Create the adapter**

Create `lib/hooks/use-client-data-adapter.ts`:

```ts
/**
 * Client Data Adapter
 * Maps real API ClientJob (from use-client-jobs.ts) to the simplified
 * ClientJob type used in source-admin-preview.tsx ClientDashboardCoreSection.
 */
import { useClientJobs } from './use-client-jobs'
import type { ClientJob as RealClientJob } from './use-client-jobs'
import { useClientStats } from './use-client-dashboard'
import { useSavedArtisansPage } from './use-saved-artisans'

type SourceStatus = 'PENDING' | 'QUOTED' | 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'VERIFIED'

export interface SourceClientJob {
  id: string
  title: string
  artisan: string
  profession: string
  status: SourceStatus
  quote: string
  location: string
  description: string
}

export function mapClientStatusToSource(status: string): SourceStatus {
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

function formatKes(amount: number | null | undefined): string {
  if (amount == null) return ''
  return `KES ${amount.toLocaleString('en-KE')}`
}

export function mapRealClientJobToSource(job: RealClientJob): SourceClientJob {
  return {
    id: job.id,
    title: job.title,
    artisan: job.artisan.name,
    profession: job.artisan.profession ?? 'Artisan',
    status: mapClientStatusToSource(job.status),
    quote: job.latestQuote ? formatKes(job.latestQuote.amount) : 'Not sent',
    location: job.location ?? 'Kenya',
    description: job.description,
  }
}

export interface SourceClientStats {
  activeJobs: string
  savedArtisans: string
  completedJobs: string
  unreadMessages: string
}

export function mapClientStatsToSource(
  stats: { totalProjects: number; activeProjects: number; completedProjects: number; savedArtisans: number } | null | undefined,
): SourceClientStats {
  return {
    activeJobs: String(stats?.activeProjects ?? 0),
    savedArtisans: String(stats?.savedArtisans ?? 0),
    completedJobs: String(stats?.completedProjects ?? 0),
    unreadMessages: '0', // supplied by unreadCount from conversations context
  }
}

export function useClientDataAdapter() {
  const { data: jobsData, isLoading: jobsLoading } = useClientJobs()
  const { data: statsData, isLoading: statsLoading } = useClientStats()
  const { data: savedData, isLoading: savedLoading } = useSavedArtisansPage()

  const clientJobs: SourceClientJob[] = (jobsData?.jobs ?? []).map(mapRealClientJobToSource)
  const stats = mapClientStatsToSource(statsData ?? null)

  const savedArtisanIds = (savedData?.items ?? []).map((item) => item.artisan.id)

  return {
    clientJobs,
    stats,
    savedArtisanIds,
    savedCount: savedData?.pagination.total ?? 0,
    isLoading: jobsLoading || statsLoading || savedLoading,
  }
}
```

**Note:** After reading `use-client-dashboard.ts`, adjust `useClientStats` return type fields to match actual exported types.

- [ ] **Step 5: Run tests**
```bash
npx vitest run __tests__/dashboard2/client-data-adapter.test.ts 2>&1 | tail -15
```

- [ ] **Step 6: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

- [ ] **Step 7: Commit**
```bash
git add lib/hooks/use-client-data-adapter.ts __tests__/dashboard2/client-data-adapter.test.ts
git commit -m "feat(adapters): add client data adapter for job and stats integration"
```

---

## Phase 2 — Extend DashboardRealDataContext with client data

### Task 2: Extend context

**Files:**
- Modify: `components/dashboard2/context/dashboard-real-data-context.tsx`

- [ ] **Step 1: Read current context**
```bash
cat components/dashboard2/context/dashboard-real-data-context.tsx
```

- [ ] **Step 2: Add client data fields**

```tsx
import type { SourceClientJob, SourceClientStats } from '@/lib/hooks/use-client-data-adapter'
import { useClientDataAdapter } from '@/lib/hooks/use-client-data-adapter'

// Add to DashboardRealData interface:
clientJobs: SourceClientJob[] | null
clientStats: SourceClientStats | null
```

- [ ] **Step 3: Call useClientDataAdapter in both inner providers**

In BOTH inner providers (rules-of-hooks), call unconditionally:
```tsx
const { clientJobs, stats: clientStatsResult } = useClientDataAdapter()
```

In value object:
```tsx
clientJobs: role === 'client' ? clientJobs : null,
clientStats: role === 'client' ? clientStatsResult : null,
```

- [ ] **Step 4: Add missing mock to test files**

For both `__tests__/dashboard2/dashboard-real-data-context.test.tsx` and `provider-integration.test.tsx`, add:
```ts
vi.mock('@/lib/hooks/use-client-data-adapter', () => ({
  useClientDataAdapter: () => ({
    clientJobs: [], stats: { activeJobs: '0', savedArtisans: '0', completedJobs: '0', unreadMessages: '0' },
    savedArtisanIds: [], savedCount: 0, isLoading: false,
  }),
}))
```

- [ ] **Step 5: TypeScript + tests**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
npm run test 2>&1 | tail -8
```

- [ ] **Step 6: Commit**
```bash
git add components/dashboard2/context/dashboard-real-data-context.tsx __tests__/dashboard2/
git commit -m "feat(context): extend DashboardRealDataContext with client job and stats data"
```

---

## Phase 3 — Wire ClientDashboardCoreSection to real data

### Task 3: Wire source-admin-preview.tsx

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx`

- [ ] **Step 1: Find ClientDashboardCoreSection state declarations**
```bash
grep -n "function ClientDashboardCoreSection\|const initialClientJobs\|const \[clientJobs" \
  components/dashboard2/admin/source-admin-preview.tsx | head -10
```

- [ ] **Step 2: Read the state block**

Read ~50 lines after `function ClientDashboardCoreSection(` to see existing state.

- [ ] **Step 3: Add context read and data overlays**

After existing state declarations in `ClientDashboardCoreSection`, add:

```tsx
  // Real client data from context — overlay pattern
  const _clientRealCtx = useOptionalDashboardRealData()
  const hasRealClientData = Boolean(
    _clientRealCtx && !_clientRealCtx.isLoading && _clientRealCtx.clientJobs !== null
  )

  // Override fixture jobs with real jobs when available
  const effectiveClientJobs = hasRealClientData
    ? (_clientRealCtx!.clientJobs as unknown as typeof clientJobs)
    : clientJobs
```

**Note:** `_clientCtx` is already used in the section for conversations (from Sprint 3). Use a different variable name like `_clientRealCtx` to avoid conflicts.

- [ ] **Step 4: Replace clientJobs with effectiveClientJobs in key views**

Find all uses of `clientJobs` in `ClientDashboardCoreSection` views:
```bash
grep -n "\bclientJobs\b" components/dashboard2/admin/source-admin-preview.tsx | head -20
```

Replace usages that are inside `ClientDashboardCoreSection` views (NOT `DashboardMessagesPane` invocation which already uses `clientMessageJobs`):
- Jobs view: `rows={clientJobs}` → `rows={effectiveClientJobs}`
- Tab filter: `clientJobs.filter(...)` → `effectiveClientJobs.filter(...)`
- Stats computations: `clientJobs.filter(...).length` → `effectiveClientJobs.filter(...).length`

**DO NOT** replace `clientJobs` in:
- `const [clientJobs, setClientJobs] = useState(...)` declaration
- `clientMessageJobs` references (those use the conversations overlay already)

- [ ] **Step 5: Wire overview stat cards to real client stats**

Find the overview DashboardStatCards in the client overview view. They show hardcoded `value="3"`, `value="12"`, etc.

Replace with context-aware values:
```tsx
// Active jobs card (value="3"):
value={hasRealClientData ? (_clientRealCtx?.clientStats?.activeJobs ?? "3") : String(effectiveClientJobs.filter((j) => j.status === "ACTIVE").length)}

// Saved artisans card (value="12"):
value={hasRealClientData ? (_clientRealCtx?.clientStats?.savedArtisans ?? "12") : "12"}

// Completed jobs card (value="17"):
value={hasRealClientData ? (_clientRealCtx?.clientStats?.completedJobs ?? "17") : String(effectiveClientJobs.filter((j) => j.status === "COMPLETED").length)}

// Unread messages (value="8") — use unreadCount from base context:
value={String(_clientRealCtx?.unreadCount ?? 8)}
```

Find the exact lines:
```bash
grep -n '"Active jobs"\|"Saved artisans"\|"Unread messages"\|"Completed jobs"' \
  components/dashboard2/admin/source-admin-preview.tsx | head -10
```

- [ ] **Step 6: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -20
```

Fix errors. Use `as unknown as typeof clientJobs` for the cast.

- [ ] **Step 7: Run lint + tests**
```bash
npm run lint 2>&1 | tail -8
npm run test 2>&1 | tail -8
```

- [ ] **Step 8: Commit**
```bash
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): wire ClientDashboardCoreSection to real client data via context"
```

---

## Self-review checklist

- [ ] `use-client-data-adapter.ts` created with mapping functions + hook
- [ ] `mapClientStatusToSource` maps all statuses correctly (REQUESTED→PENDING, etc.)
- [ ] Context has `clientJobs` and `clientStats` fields
- [ ] `effectiveClientJobs` replaces key `clientJobs` usages (jobs view, stats computations)
- [ ] Overview stat cards wire to real stats
- [ ] All existing test mocks updated
- [ ] TypeScript: 0 errors, lint: 0 errors, all tests passing
