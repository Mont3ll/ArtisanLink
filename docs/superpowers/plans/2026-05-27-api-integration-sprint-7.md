# API Integration — Sprint 7: Payments & Subscriptions

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan.

**Goal:** Wire the artisan subscription page to real subscription data and the payment modal to the real M-Pesa STK Push flow. Wire artisan earnings to use the subscription adapter's real data.

**Architecture:** Three independent tasks. Task 1: subscription view wired via context. Task 2: UpdatePaymentMethodModal wired to `useInitiatePayment` + `usePaymentStatusPolling`. Task 3: earnings summary stat cards use real totals from the adapter.

**Tech Stack:** `useArtisanSubscription`, `useInitiatePayment`, `usePaymentStatusPolling`, `SUBSCRIPTION_PLANS`, TypeScript strict

---

## File map

| File | Action |
| --- | --- |
| `components/dashboard2/context/dashboard-real-data-context.tsx` | EXTEND — add subscription data fields |
| `components/dashboard2/admin/source-admin-preview.tsx` | WIRE — subscription view + payment modal + earnings stat cards |
| `__tests__/dashboard2/subscription-wiring.test.ts` | CREATE |

---

## Task 1: Extend context with subscription data

**Files:**
- Modify: `components/dashboard2/context/dashboard-real-data-context.tsx`

- [ ] **Step 1: Read the subscription hook**
```bash
head -160 /home/mel/Documents/Projects/ArtisanLink-main/lib/hooks/use-artisan-subscription.ts
```

Note the exact types: `SubscriptionData`, `useArtisanSubscription()` returns `{ data: { subscription: SubscriptionData | null }, isLoading }`, `SUBSCRIPTION_PLANS` constant.

- [ ] **Step 2: Add subscription fields to DashboardRealData interface**

```tsx
import {
  useArtisanSubscription,
  isSubscriptionActive,
  getDaysRemaining,
  SUBSCRIPTION_PLANS,
} from '@/lib/hooks/use-artisan-subscription'
import type { SubscriptionData } from '@/lib/hooks/use-artisan-subscription'

// Add to interface:
artisanSubscription: SubscriptionData | null
artisanSubscriptionActive: boolean
```

- [ ] **Step 3: Call useArtisanSubscription in both inner providers**

In BOTH providers (rules-of-hooks), call unconditionally:
```tsx
const { data: subData } = useArtisanSubscription()
```

In value object:
```tsx
artisanSubscription: role === 'artisan' ? (subData?.subscription ?? null) : null,
artisanSubscriptionActive: role === 'artisan' ? isSubscriptionActive(subData?.subscription ?? null) : false,
```

- [ ] **Step 4: Update test mocks**

In both test files in `__tests__/dashboard2/`, add:
```ts
vi.mock('@/lib/hooks/use-artisan-subscription', () => ({
  useArtisanSubscription: () => ({ data: { subscription: null }, isLoading: false }),
  isSubscriptionActive: () => false,
  getDaysRemaining: () => 30,
  SUBSCRIPTION_PLANS: {
    MONTHLY: { name: 'Monthly', price: 150 },
    ANNUAL: { name: 'Annual', price: 1500 },
  },
}))
```

- [ ] **Step 5: TypeScript + tests**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
npm run test 2>&1 | tail -8
```

- [ ] **Step 6: Commit**
```bash
git add components/dashboard2/context/dashboard-real-data-context.tsx __tests__/dashboard2/
git commit -m "feat(context): extend DashboardRealDataContext with artisan subscription data"
```

---

## Task 2: Wire subscription view to real data

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx`

### Part A: Subscription view stat wiring

- [ ] **Step 1: Find subscription view in ArtisanDashboardCoreSection**
```bash
grep -n '{view === "subscription"' components/dashboard2/admin/source-admin-preview.tsx | head -3
```

- [ ] **Step 2: Read the subscription view block**

Read ~60 lines from the view start to find hardcoded values.

- [ ] **Step 3: Add subscription overlay at top of ArtisanDashboardCoreSection**

After existing `_verifCtx` / `_hasReal` declarations, add:

```tsx
  // Real subscription data from context
  const _subActive = _verifCtx?.artisanSubscriptionActive ?? false
  const _sub = _verifCtx?.artisanSubscription
  const _subPlan = (_sub?.plan ?? 'MONTHLY') as 'MONTHLY' | 'ANNUAL'
  const _planInfo = { MONTHLY: { name: 'Monthly', price: 150 }, ANNUAL: { name: 'Annual', price: 1500 } }[_subPlan]
  const _subRenewDate = _sub?.endDate
    ? new Date(_sub.endDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
    : 'Jun 01'
```

- [ ] **Step 4: Replace hardcoded subscription values**

Find the subscription view and replace:

1. **Plan name** — "Premium Artisan" → use context or fixture fallback:
```tsx
// Find: Premium Artisan
// Replace with:
{_sub ? (_subActive ? `${_planInfo.name} Artisan` : 'No active plan') : 'Premium Artisan'}
```

2. **Renew date** — "Renews Jun 01" → `Renews {_subRenewDate}`

3. **Monthly fee** — "KES 150" → `KES {_planInfo.price}`

4. **Active/Inactive badge** — the status chip should reflect `_subActive`:
Find the StatusChip or badge and use `_subActive ? "ACTIVE" : "PENDING"`.

Look at the actual source to find the exact strings:
```bash
grep -n '"Premium Artisan"\|"Renews Jun 01"\|"KES 150"\|"INACTIVE"\|subscriptionStatus' \
  components/dashboard2/admin/source-admin-preview.tsx | head -15
```

### Part B: UpdatePaymentMethodModal — real M-Pesa STK Push

- [ ] **Step 5: Find the UpdatePaymentMethodModal function**
```bash
grep -n "function UpdatePaymentMethodModal" components/dashboard2/admin/source-admin-preview.tsx
```

- [ ] **Step 6: Read the modal's current implementation**

Read ~145 lines from the function start.

- [ ] **Step 7: Wire STK Push flow to the modal**

The modal currently has a static phone input. Replace the submit button handler with a real M-Pesa initiation:

Find the existing phone input and submit button in the modal. Replace the submit button's onClick with:

```tsx
import { useInitiatePayment, usePaymentStatusPolling, SUBSCRIPTION_PLANS } from '@/lib/hooks/use-artisan-subscription'
```

Inside `UpdatePaymentMethodModal`, add the hooks and state:
```tsx
function UpdatePaymentMethodModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [plan, setPlan] = useState<"MONTHLY" | "ANNUAL">("MONTHLY")
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const initiateMutation = useInitiatePayment()
  const { paymentStatus, reset } = usePaymentStatusPolling(checkoutId)

  const handleSubmit = async () => {
    if (!phone.trim()) return
    try {
      const result = await initiateMutation.mutateAsync({ plan, phoneNumber: phone })
      setCheckoutId(result.checkoutRequestId)
    } catch {
      // Error handled by mutation
    }
  }

  // Auto-close on successful payment
  useEffect(() => {
    if (paymentStatus?.status === "COMPLETED") {
      const timer = window.setTimeout(() => onClose(), 2000)
      return () => window.clearTimeout(timer)
    }
  }, [paymentStatus?.status, onClose])
  // ...rest of modal JSX
```

**Important:** The modal is large (~143 lines). Do NOT rewrite the entire modal. Make targeted additions:
1. Import the hooks at the top of the file (they're already imported via `@/lib/hooks/...` pattern if the file is "use client")
2. Add the state hooks at the top of the `UpdatePaymentMethodModal` function
3. Change the static "Submit" button to call `handleSubmit`
4. Add a payment status display when `paymentStatus !== null`

**Find the submit/confirm button:**
```bash
grep -n "Subscribe\|Confirm\|Submit.*payment\|onClick.*onClose" components/dashboard2/admin/source-admin-preview.tsx | head -10
```

**Pragmatic approach:** Since the modal already has a `useEffect` import in the source, we can add hooks. If `useEffect` isn't imported at the top of the file, check:
```bash
grep -n "^import.*useEffect\|from 'react'" components/dashboard2/admin/source-admin-preview.tsx | head -3
```

The file is already "use client" and uses React hooks throughout. Add new imports for `useInitiatePayment` and `usePaymentStatusPolling` at the top of the file after existing imports.

- [ ] **Step 8: Add imports at top of source-admin-preview.tsx**

```tsx
import {
  useInitiatePayment,
  usePaymentStatusPolling,
  SUBSCRIPTION_PLANS as MPESA_SUBSCRIPTION_PLANS,
} from "@/lib/hooks/use-artisan-subscription"
```

- [ ] **Step 9: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -20
```

- [ ] **Step 10: Commit**
```bash
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): wire subscription view and UpdatePaymentMethodModal to real M-Pesa flow"
```

---

## Task 3: Wire earnings summary stat cards

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx`

- [ ] **Step 1: Find earnings stat cards**
```bash
grep -n '"Total earned"\|"Commission"\|"Net pay"\|"Pending pay"\|totalEarned\|totalCommission\|pendingPayout' \
  components/dashboard2/admin/source-admin-preview.tsx | head -15
```

- [ ] **Step 2: Extend DashboardRealDataContext with earnings totals**

The earnings adapter already returns `totalEarned`, `totalCommission`, `pendingPayout`. These are already set in `ArtisanProvider` but may not be on the context interface. Check:

```bash
grep "totalEarned\|totalCommission\|pendingPayout" \
  components/dashboard2/context/dashboard-real-data-context.tsx | head -5
```

If not present, add to context:
```tsx
// In DashboardRealData:
artisanTotalEarned: number | null
artisanTotalCommission: number | null
artisanPendingPayout: number | null
```

And in ArtisanProvider:
```tsx
const { earningRows, totalEarned, totalCommission, pendingPayout } = useArtisanEarningsAdapter()
// In value:
artisanTotalEarned: totalEarned,
artisanTotalCommission: totalCommission,
artisanPendingPayout: pendingPayout,
```

- [ ] **Step 3: Wire earnings stat cards in source-admin-preview.tsx**

Replace hardcoded earnings stat values with context-aware values:
- Total earned → `_verifCtx?.artisanTotalEarned != null ? formatKes(_verifCtx.artisanTotalEarned) : "KES 62,400"`
- Commission → `_verifCtx?.artisanTotalCommission != null ? formatKes(_verifCtx.artisanTotalCommission) : "KES 4,992"`
- Pending payout → `_verifCtx?.artisanPendingPayout != null ? formatKes(_verifCtx.artisanPendingPayout) : "KES 18,000"`

- [ ] **Step 4: TypeScript check + all tests**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
npm run test 2>&1 | tail -8
```

- [ ] **Step 5: Commit**
```bash
git add components/dashboard2/context/dashboard-real-data-context.tsx \
        components/dashboard2/admin/source-admin-preview.tsx __tests__/dashboard2/
git commit -m "feat(dashboard2): wire artisan earnings stat cards to real totals from adapter"
```

---

## Self-review checklist

- [ ] `artisanSubscription` and `artisanSubscriptionActive` in context
- [ ] Subscription view uses real plan name, renew date, monthly fee
- [ ] UpdatePaymentMethodModal uses `useInitiatePayment` + `usePaymentStatusPolling`
- [ ] STK Push initiated on submit, status polled every 3s
- [ ] Auto-close on COMPLETED payment
- [ ] Earnings stat cards use real totals when context has data
- [ ] All test mocks updated
- [ ] TypeScript: 0 errors, lint: 0 errors, all tests passing
