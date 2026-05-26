# API Integration — Sprint 1: Auth + User Identity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded fixture identities in the dashboard redesign with real Clerk/API user data while keeping fixture fallbacks for unauthenticated preview.

**Architecture:** Create a React context (`DashboardRealDataContext`) that wraps each dashboard shell, injecting real user identity, notification count, and artisan verification status from existing hooks. The large source-preview file reads from context via a thin `useDashboardRealData()` hook; all fixture fallbacks remain intact so unauthenticated previews still render.

**Tech Stack:** Next.js 16, React 19, Clerk (`useUser`, `useAuth`), React Query (`useCurrentUser`, `useUnreadMessages`, `useArtisanDashboard`), TypeScript strict, Vitest + RTL

---

## File map

| File | Action | Responsibility |
| --- | --- | --- |
| `components/dashboard2/context/dashboard-real-data-context.tsx` | **CREATE** | React context + provider that injects real user, unread count, verification status |
| `components/dashboard2/admin/source-admin-preview.tsx` | **MODIFY** | `DashboardProfileButton` and `DashboardNotificationButton` read from context; artisan verification banner reads context status |
| `app/(artisan-dashboard)/artisan-dashboard/page.tsx` | **MODIFY** | Wrap with `DashboardRealDataProvider` |
| `app/(client-dashboard)/client-dashboard/page.tsx` | **MODIFY** | Wrap with `DashboardRealDataProvider` |
| `app/artisan/page.tsx` | **MODIFY** | Wrap with `DashboardRealDataProvider` |
| `app/client/page.tsx` | **MODIFY** | Wrap with `DashboardRealDataProvider` |
| `app/admin/page.tsx` | **MODIFY** | Wrap with `DashboardRealDataProvider` (role=admin) |
| `app/(admin-dashboard)/admin-dashboard/page.tsx` | **MODIFY** | Wrap with `DashboardRealDataProvider` (role=admin) |
| `__tests__/dashboard2/dashboard-real-data-context.test.tsx` | **CREATE** | Unit tests for context provider and hook |

---

### Task 1: Create `DashboardRealDataContext` with tests

**Files:**
- Create: `components/dashboard2/context/dashboard-real-data-context.tsx`
- Create: `__tests__/dashboard2/dashboard-real-data-context.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/dashboard2/dashboard-real-data-context.test.tsx`:

```tsx
import { renderHook } from '@testing-library/react'
import { DashboardRealDataProvider, useDashboardRealData } from '@/components/dashboard2/context/dashboard-real-data-context'

// Mock Clerk useUser
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'clerk-123',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      imageUrl: 'https://example.com/avatar.jpg',
    },
  }),
}))

// Mock React Query hooks
jest.mock('@/lib/hooks/use-current-user', () => ({
  useCurrentUser: () => ({
    data: { user: { id: 'db-456', role: 'ARTISAN' }, profile: { profileImage: null } },
    isLoading: false,
  }),
}))

jest.mock('@/lib/hooks/use-unread-messages', () => ({
  useUnreadMessages: () => ({ data: { total: 3 }, isLoading: false }),
}))

describe('DashboardRealDataContext', () => {
  it('provides user identity from Clerk and DB', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardRealDataProvider role="artisan">{children}</DashboardRealDataProvider>
    )
    const { result } = renderHook(() => useDashboardRealData(), { wrapper })
    expect(result.current.displayName).toBe('Grace Wanjiku')
    expect(result.current.role).toBe('ARTISAN')
  })

  it('provides unread message count', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardRealDataProvider role="artisan">{children}</DashboardRealDataProvider>
    )
    const { result } = renderHook(() => useDashboardRealData(), { wrapper })
    expect(result.current.unreadCount).toBe(3)
  })

  it('returns null displayName when not loaded', () => {
    // Override mock for this test
    jest.doMock('@clerk/nextjs', () => ({
      useUser: () => ({ isLoaded: false, user: null }),
    }))
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardRealDataProvider role="artisan">{children}</DashboardRealDataProvider>
    )
    const { result } = renderHook(() => useDashboardRealData(), { wrapper })
    // isLoading or null before data arrives
    expect(result.current.isLoading).toBe(true)
  })

  it('throws when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useDashboardRealData())).toThrow(
      'useDashboardRealData must be used inside DashboardRealDataProvider'
    )
    consoleError.mockRestore()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/dashboard-real-data-context.test.tsx 2>&1 | tail -30
```
Expected: FAIL with "Cannot find module" or similar.

- [ ] **Step 3: Create the context file**

Create `components/dashboard2/context/dashboard-real-data-context.tsx`:

```tsx
"use client";

import React, { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { useUnreadMessages } from "@/lib/hooks/use-unread-messages";
import { useArtisanDashboard } from "@/lib/hooks";

export type DashboardRole = "artisan" | "client" | "admin";

export interface DashboardRealData {
  isLoading: boolean;
  displayName: string | null;
  firstName: string | null;
  avatarUrl: string | null;
  role: string | null;
  unreadCount: number;
  /** Artisan-only: 'PENDING' | 'VERIFIED' | 'REJECTED' | null */
  verificationStatus: string | null;
  rejectionReason: string | null;
}

const DashboardRealDataContext = createContext<DashboardRealData | null>(null);

export function DashboardRealDataProvider({
  children,
  role,
}: {
  children: React.ReactNode;
  role: DashboardRole;
}) {
  const { isLoaded, user: clerkUser } = useUser();
  const { data: currentUserData, isLoading: userLoading } = useCurrentUser();
  const { data: unreadData } = useUnreadMessages();
  // Only call artisan dashboard hook when role is artisan
  const artisanDashData = useArtisanDashboardConditionally(role);

  const isLoading = !isLoaded || userLoading;

  const value: DashboardRealData = {
    isLoading,
    displayName:
      clerkUser
        ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null
        : null,
    firstName: clerkUser?.firstName ?? null,
    avatarUrl: clerkUser?.imageUrl ?? currentUserData?.profile?.profileImage ?? null,
    role: currentUserData?.user?.role ?? null,
    unreadCount: unreadData?.total ?? 0,
    verificationStatus: artisanDashData?.verificationStatus ?? null,
    rejectionReason: artisanDashData?.rejectionReason ?? null,
  };

  return (
    <DashboardRealDataContext.Provider value={value}>
      {children}
    </DashboardRealDataContext.Provider>
  );
}

export function useDashboardRealData(): DashboardRealData {
  const ctx = useContext(DashboardRealDataContext);
  if (ctx === null) {
    throw new Error("useDashboardRealData must be used inside DashboardRealDataProvider");
  }
  return ctx;
}

// Hook helper — conditionally fetches artisan dashboard data
function useArtisanDashboardConditionally(role: DashboardRole) {
  // Always call hook but skip if not artisan (rules of hooks)
  const { data } = useArtisanDashboard();
  if (role !== "artisan") return null;
  return {
    verificationStatus: (data as { artisanStatus?: string } | undefined)?.artisanStatus ?? null,
    rejectionReason: (data as { rejectionReason?: string } | undefined)?.rejectionReason ?? null,
  };
}
```

- [ ] **Step 4: Run tests again**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/dashboard-real-data-context.test.tsx 2>&1 | tail -30
```
Expected: Some tests pass, some may fail depending on mock resolution. Fix any import issues.

- [ ] **Step 5: Verify TypeScript**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx tsc --noEmit --pretty false 2>&1 | grep "error TS"
```
Expected: 0 type errors in the new file.

- [ ] **Step 6: Commit**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
git add components/dashboard2/context/ __tests__/dashboard2/
git commit -m "feat(dashboard2): add DashboardRealDataContext for real user identity injection"
```

---

### Task 2: Wire DashboardProfileButton to context

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx` — `DashboardProfileButton` function only

The `DashboardProfileButton` currently renders a hardcoded avatar. Wire it to `useDashboardRealData()` with a fixture fallback.

- [ ] **Step 1: Locate DashboardProfileButton**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
grep -n "function DashboardProfileButton" components/dashboard2/admin/source-admin-preview.tsx
```

- [ ] **Step 2: Read the current implementation**

Read lines ±50 around the found line number to understand its current render.

- [ ] **Step 3: Replace with context-aware version**

Find the `DashboardProfileButton` function in `source-admin-preview.tsx` and replace its `return` statement so it reads from `useDashboardRealData()`:

```tsx
function DashboardProfileButton({
  role,
}: {
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Try to read from real data context; fall back to fixture if not in provider
  let realData: { displayName: string | null; avatarUrl: string | null } = {
    displayName: null,
    avatarUrl: null,
  };
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useDashboardRealData();
    realData = { displayName: ctx.displayName, avatarUrl: ctx.avatarUrl };
  } catch {
    // Outside provider — use fixture fallback
  }

  const displayName =
    realData.displayName ??
    (role === "Admin" ? "Admin" : role === "Artisan" ? "Grace Wanjiku" : "Client");
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ... rest of existing dropdown implementation unchanged, just replace any
  // hardcoded name with `displayName` and hardcoded initials with `initials`
```

Note: The try/catch pattern is intentional for graceful degradation outside the provider.

- [ ] **Step 4: Verify TypeScript**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx tsc --noEmit --pretty false 2>&1 | grep "error TS"
```
Expected: 0 errors.

- [ ] **Step 5: Run existing tests**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npm run lint 2>&1 | tail -8
```
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): DashboardProfileButton reads real user from context"
```

---

### Task 3: Wire DashboardNotificationButton to context

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx` — `DashboardNotificationButton` function only

- [ ] **Step 1: Locate DashboardNotificationButton**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
grep -n "function DashboardNotificationButton" components/dashboard2/admin/source-admin-preview.tsx
```

- [ ] **Step 2: Update notification count from context**

In `DashboardNotificationButton`, replace the hardcoded `notifications` array length with `ctx.unreadCount`:

```tsx
function DashboardNotificationButton({
  role,
}: {
  role: "Artisan" | "Client" | "Admin" | "Studio";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  let unreadCount = 0;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useDashboardRealData();
    unreadCount = ctx.unreadCount;
  } catch {
    // Outside provider — default to 0
  }

  const notifications =
    role === "Admin"
      ? [
          "19 verification reviews pending",
          "Notification worker warning",
          "3 reported profiles need triage",
        ]
      : role === "Client"
        ? [
            "Amina sent a quote",
            "Peter replied to your message",
            "One completed job needs a review",
          ]
        : [
            "Miriam replied to your quote",
            "Verification is still pending",
            "Portfolio views are up 12%",
          ];

  // Replace hardcoded badge count with unreadCount (fall back to notifications.length for preview)
  const badgeCount = unreadCount > 0 ? unreadCount : notifications.length;
  // ... rest of implementation: replace all instances of `notifications.length` with `badgeCount`
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS"
```
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): DashboardNotificationButton reads real unread count from context"
```

---

### Task 4: Wire artisan verification banner to real status

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx` — `ArtisanDashboardCoreSection` verification banner

- [ ] **Step 1: Locate the verification banner in ArtisanDashboardCoreSection**

```bash
grep -n "verificationBannerDismissed\|Verification review pending" \
  components/dashboard2/admin/source-admin-preview.tsx | head -10
```

- [ ] **Step 2: Read the declaration block for verificationBannerDismissed state**

Read the function around the artisan verification banner to understand current state.

- [ ] **Step 3: Add context-read for verification status**

At the top of the `ArtisanDashboardCoreSection` render body, after existing `useState` declarations, add:

```tsx
  // Real verification status from context (graceful fallback to PENDING for preview)
  let realVerificationStatus: string | null = null;
  let realRejectionReason: string | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const realData = useDashboardRealData();
    realVerificationStatus = realData.verificationStatus;
    realRejectionReason = realData.rejectionReason;
  } catch {
    // Not in provider — prototype mode, treat as PENDING
  }

  // Use real status if available, otherwise show banner (preview mode)
  const showVerificationBanner =
    !verificationBannerDismissed &&
    (realVerificationStatus === null
      ? true // preview: always show
      : realVerificationStatus !== "VERIFIED");
  const verificationIsRejected = realVerificationStatus === "REJECTED";
```

- [ ] **Step 4: Update verification banner JSX condition**

Replace the existing banner condition:
```tsx
{!verificationBannerDismissed && (
```
with:
```tsx
{showVerificationBanner && (
```

And in the banner body, add a rejection state variant when `verificationIsRejected`:
```tsx
{verificationIsRejected && realRejectionReason && (
  <span className="mt-1 block text-[13px]" style={{ color: "#92400e" }}>
    Reason: {realRejectionReason}
  </span>
)}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS"
```

- [ ] **Step 6: Run lint**

```bash
npm run lint 2>&1 | tail -8
```

- [ ] **Step 7: Commit**

```bash
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): artisan verification banner reads real status from context"
```

---

### Task 5: Wrap dashboard route pages with DashboardRealDataProvider

**Files:**
- Modify: `app/(artisan-dashboard)/artisan-dashboard/page.tsx`
- Modify: `app/artisan/page.tsx`
- Modify: `app/(client-dashboard)/client-dashboard/page.tsx`
- Modify: `app/client/page.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/(admin-dashboard)/admin-dashboard/page.tsx`

Each of these is a one-line addition: wrap the rendered component with `<DashboardRealDataProvider role="...">`.

- [ ] **Step 1: Update artisan dashboard pages**

`app/(artisan-dashboard)/artisan-dashboard/page.tsx`:
```tsx
import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

export default function ArtisanSourcePageOverview() {
  return (
    <DashboardRealDataProvider role="artisan">
      <SourceAdminPreview initialRoute="/artisan/dashboard" />
    </DashboardRealDataProvider>
  );
}
```

Repeat identically for `app/artisan/page.tsx`.

- [ ] **Step 2: Update client dashboard pages**

`app/(client-dashboard)/client-dashboard/page.tsx`:
```tsx
import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

export default function ClientSourcePageOverview() {
  return (
    <DashboardRealDataProvider role="client">
      <SourceAdminPreview initialRoute="/client/dashboard" />
    </DashboardRealDataProvider>
  );
}
```

Repeat for `app/client/page.tsx`.

- [ ] **Step 3: Update admin pages**

`app/admin/page.tsx`:
```tsx
import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";
import { DashboardRealDataProvider } from "@/components/dashboard2/context/dashboard-real-data-context";

export default function AdminSourcePageOverview() {
  return (
    <DashboardRealDataProvider role="admin">
      <SourceAdminPreview initialRoute="/admin" />
    </DashboardRealDataProvider>
  );
}
```

Repeat for `app/(admin-dashboard)/admin-dashboard/page.tsx`.

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS"
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat(dashboard2): wrap dashboard pages with DashboardRealDataProvider"
```

---

### Task 6: Write integration smoke test

**Files:**
- Create: `__tests__/dashboard2/provider-integration.test.tsx`

This test verifies that pages wrapped with the provider can render without errors.

- [ ] **Step 1: Write the test**

```tsx
import { render, screen } from '@testing-library/react'
import { DashboardRealDataProvider } from '@/components/dashboard2/context/dashboard-real-data-context'

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    user: { id: 'u1', firstName: 'Test', lastName: 'User', imageUrl: '' },
  }),
}))

jest.mock('@/lib/hooks/use-current-user', () => ({
  useCurrentUser: () => ({
    data: { user: { id: 'db1', role: 'ARTISAN' }, profile: { profileImage: null } },
    isLoading: false,
  }),
}))

jest.mock('@/lib/hooks/use-unread-messages', () => ({
  useUnreadMessages: () => ({ data: { total: 2 }, isLoading: false }),
}))

jest.mock('@/lib/hooks', () => ({
  useArtisanDashboard: () => ({
    data: { artisanStatus: 'PENDING', rejectionReason: null },
  }),
}))

describe('DashboardRealDataProvider integration', () => {
  it('renders children without error', () => {
    render(
      <DashboardRealDataProvider role="artisan">
        <div data-testid="child">dashboard content</div>
      </DashboardRealDataProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run all tests**

```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npm run test 2>&1 | tail -20
```
Expected: All tests pass.

- [ ] **Step 3: Final lint + tsc**

```bash
npm run lint 2>&1 | grep "error" | grep -v warning
npx tsc --noEmit --pretty false 2>&1 | grep "error TS"
```
Expected: 0 errors in both.

- [ ] **Step 4: Final commit**

```bash
git add __tests__/dashboard2/
git commit -m "test(dashboard2): integration smoke test for DashboardRealDataProvider"
```

---

## Self-review checklist

- [ ] Context file exports `DashboardRealDataProvider`, `useDashboardRealData`, `DashboardRealData` type, `DashboardRole` type
- [ ] `DashboardProfileButton` uses real name with fixture fallback
- [ ] `DashboardNotificationButton` uses real unread count with fallback to `notifications.length`
- [ ] Artisan verification banner reacts to `VERIFIED`/`PENDING`/`REJECTED` status
- [ ] All 6 dashboard pages wrapped with correct role
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript: 0 errors
- [ ] Lint: 0 errors
- [ ] No `// @ts-ignore` or `any` without comment
