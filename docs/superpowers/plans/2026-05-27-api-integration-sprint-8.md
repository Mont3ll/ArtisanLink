# API Integration — Sprint 8: Security Hardening + QA Cutover

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan.

**Goal:** Add rate limiting to sensitive API mutations, add client-side Zod validation to key forms in the redesign, create the missing invite page, and verify the proxy routes correctly for the new `/artisan/*`, `/client/*`, `/admin/*` route trees.

**Architecture:** Four independent tasks that touch separate files — ideal for parallel execution. Tasks 1 and 2 touch the backend (main project). Tasks 3 and 4 touch the redesign worktree.

---

## File map

| File | Action | Task |
| --- | --- | --- |
| `app/api/admin/verification/process/route.ts` | MODIFY — add rate limiting | Task 1 |
| `app/api/admin/invites/route.ts` | MODIFY — add rate limiting | Task 1 |
| `app/api/artisan/verification/resubmit/route.ts` | MODIFY — add rate limiting | Task 1 |
| `app/api/artisan/jobs/[id]/quote/route.ts` | MODIFY — add rate limiting | Task 1 |
| `app/api/artisan/portfolio/route.ts` | MODIFY — add rate limiting | Task 1 |
| `app/api/payments/mpesa/initiate/route.ts` | MODIFY — add rate limiting (verify existing) | Task 1 |
| `.worktrees/frontend-redesign/app/invite/[token]/page.tsx` | CREATE — missing invite page | Task 2 |
| `.worktrees/frontend-redesign/app/invite/demo-token/page.tsx` | CREATE — demo token page | Task 2 |
| `.worktrees/frontend-redesign/proxy.ts` | MODIFY — add /artisan/* and /client/* to protected routes | Task 3 |
| `__tests__/api/rate-limiting.test.ts` | CREATE — rate limit tests | Task 1 |
| `.worktrees/frontend-redesign/__tests__/invite-page.test.tsx` | CREATE — invite page tests | Task 2 |
| `.worktrees/frontend-redesign/docs/cutover-checklist.md` | CREATE — cutover readiness doc | Task 4 |

---

## Task 1: Rate limit sensitive API mutation routes

**Working directory:** `/home/mel/Documents/Projects/ArtisanLink-main`

The pattern (from `app/api/search/artisans/route.ts`):
```ts
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const rateLimitResult = rateLimit(request, 'endpoint-name', RATE_LIMITS.STRICT)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }
  // ...rest of handler
}
```

Apply to each route's relevant HTTP method at the very top of the handler, before auth checks.

### Routes to rate limit

| Route file | Method | Limit | Key |
| --- | --- | --- | --- |
| `app/api/admin/verification/process/route.ts` | POST | STRICT | `admin/verification/process` |
| `app/api/admin/invites/route.ts` | POST | STRICT | `admin/invites/send` |
| `app/api/admin/moderation/[id]/route.ts` | POST/PATCH | NORMAL | `admin/moderation/action` |
| `app/api/admin/payouts/[id]/route.ts` | POST/PATCH | STRICT | `admin/payouts/action` |
| `app/api/artisan/verification/resubmit/route.ts` | POST | STRICT | `artisan/verification/resubmit` |
| `app/api/artisan/jobs/[id]/quote/route.ts` | POST | NORMAL | `artisan/jobs/quote` |
| `app/api/artisan/portfolio/route.ts` | POST | NORMAL | `artisan/portfolio/create` |
| `app/api/artisan/profile/route.ts` | PATCH | NORMAL | `artisan/profile/update` |
| `app/api/payments/mpesa/initiate/route.ts` | POST | STRICT (if not already) | `payments/mpesa/initiate` |

### Test file

Create `__tests__/api/rate-limiting.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'

// Test the rate limit utility directly
describe('rate limiting utility', () => {
  it('imports without error', async () => {
    const { rateLimit, RATE_LIMITS } = await import('@/lib/rate-limit')
    expect(rateLimit).toBeDefined()
    expect(RATE_LIMITS.STRICT).toBeDefined()
    expect(RATE_LIMITS.NORMAL).toBeDefined()
    expect(RATE_LIMITS.STRICT.requests).toBeLessThan(RATE_LIMITS.NORMAL.requests)
  })

  it('STRICT is stricter than NORMAL', async () => {
    const { RATE_LIMITS } = await import('@/lib/rate-limit')
    expect(RATE_LIMITS.STRICT.requests).toBe(10)
    expect(RATE_LIMITS.NORMAL.requests).toBe(60)
  })

  it('UPLOAD has a longer window', async () => {
    const { RATE_LIMITS } = await import('@/lib/rate-limit')
    expect(RATE_LIMITS.UPLOAD.windowMs).toBeGreaterThan(RATE_LIMITS.NORMAL.windowMs)
  })
})
```

### Steps

- [ ] **Step 1:** Read each target route file to find the correct function signature
- [ ] **Step 2:** Add `import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'` to each file (verify it's not already imported)
- [ ] **Step 3:** Add rate limit check at the top of each mutation handler
- [ ] **Step 4:** Create test file
- [ ] **Step 5:** Run TypeScript check in main project
  ```bash
  cd /home/mel/Documents/Projects/ArtisanLink-main
  npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
  ```
- [ ] **Step 6:** Run tests
  ```bash
  npm run test 2>&1 | tail -8
  ```
- [ ] **Step 7:** Commit
  ```bash
  git add app/api/ __tests__/api/
  git commit -m "security: add rate limiting to sensitive admin and artisan API mutation routes"
  ```

---

## Task 2: Create missing invite page in redesign worktree

**Working directory:** `/home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign`

The cross-system audit found `/invite/demo-token` page is missing. The source preview already handles `inviteToken` in `AuthPreviewSection`. Create the missing page.

- [ ] **Step 1:** Create directory and page files

`app/invite/[token]/page.tsx`:
```tsx
import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";

export default function InviteTokenPage() {
  return <SourceAdminPreview initialRoute="/sign-up?invite=demo-token&role=artisan" />;
}
```

`app/invite/demo-token/page.tsx`:
```tsx
import SourceAdminPreview from "@/components/dashboard2/admin/source-admin-preview";

export default function InviteDemoTokenPage() {
  return <SourceAdminPreview initialRoute="/sign-up?invite=demo-token&role=artisan" />;
}
```

- [ ] **Step 2:** Add `/invite/demo-token` and `/sign-up?invite=demo-token&role=artisan` to the valid AppRoute list in source-admin-preview.tsx

```bash
grep -n "demo-token\|invite.*demo\|/invite/" components/dashboard2/admin/source-admin-preview.tsx | head -5
```

Check if `/invite/demo-token` is already in the valid routes list. If not, it already handles this path via the `sign-up?invite` pattern — no change needed to AppRoute.

- [ ] **Step 3:** Create test

`__tests__/invite-page.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import InviteDemoTokenPage from '../app/invite/demo-token/page'

vi.mock('@/components/dashboard2/admin/source-admin-preview', () => ({
  default: ({ initialRoute }: { initialRoute: string }) => (
    <div data-testid="source-preview" data-route={initialRoute} />
  ),
}))

describe('InviteDemoTokenPage', () => {
  it('renders source preview with invite route', () => {
    render(<InviteDemoTokenPage />)
    const el = screen.getByTestId('source-preview')
    expect(el).toBeInTheDocument()
    expect(el.getAttribute('data-route')).toContain('invite=demo-token')
  })
})
```

- [ ] **Step 4:** TypeScript + tests
  ```bash
  cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
  npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
  npx vitest run __tests__/invite-page.test.tsx 2>&1 | tail -10
  npm run test 2>&1 | tail -6
  ```

- [ ] **Step 5:** Commit
  ```bash
  git add app/invite/ __tests__/invite-page.test.tsx
  git commit -m "feat(invite): add missing invite token and demo-token pages to redesign"
  ```

---

## Task 3: Update proxy.ts to recognize new route trees

**Working directory:** `/home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign`

The proxy currently only protects `/artisan-dashboard`, `/admin-dashboard`, `/client-dashboard`. The new routes `/artisan/*`, `/admin/*`, `/client/*` need to be added so the proxy enforces role-based access on them too.

- [ ] **Step 1:** Read current proxy.ts
  ```bash
  cat proxy.ts
  ```

- [ ] **Step 2:** Update `isProtectedRoute` matcher

Find:
```ts
const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/client-dashboard(.*)",
  "/artisan-dashboard(.*)",
  "/admin-dashboard(.*)",
]);
```

Replace with:
```ts
const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/client-dashboard(.*)",
  "/artisan-dashboard(.*)",
  "/admin-dashboard(.*)",
  "/artisan(.*)",
  "/admin(.*)",
  "/client(.*)",
]);
```

- [ ] **Step 3:** Update role redirect logic

Find the admin/artisan/client redirects:
```ts
if (role === "admin") {
  if (!url.pathname.startsWith("/admin-dashboard")) {
    url.pathname = "/admin-dashboard";
    return NextResponse.redirect(url);
  }
}
```

Update each to also accept the new route trees:
```ts
if (role === "admin") {
  if (!url.pathname.startsWith("/admin-dashboard") && !url.pathname.startsWith("/admin")) {
    url.pathname = "/admin-dashboard";
    return NextResponse.redirect(url);
  }
}

if (role === "artisan") {
  if (!url.pathname.startsWith("/artisan-dashboard") && !url.pathname.startsWith("/artisan")) {
    url.pathname = "/artisan-dashboard";
    return NextResponse.redirect(url);
  }
}

if (role === "client") {
  if (!url.pathname.startsWith("/client-dashboard") && !url.pathname.startsWith("/client")) {
    url.pathname = "/client-dashboard";
    return NextResponse.redirect(url);
  }
}
```

- [ ] **Step 4:** Also update sign-in page buttons to use the correct routes

Check if the sign-in page has "Continue as artisan preview" button pointing to `/artisan-dashboard`:
```bash
grep -n "artisan.*preview\|artisan-dashboard\|admin.*preview\|admin-dashboard\|client.*preview" \
  app/'(auth)'/sign-in/[[...sign-in]]/page.tsx | head -10
```

Add "Continue as artisan preview" button if not present (matching the existing admin preview pattern).

- [ ] **Step 5:** TypeScript check
  ```bash
  npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
  ```

- [ ] **Step 6:** Commit
  ```bash
  git add proxy.ts app/'(auth)'/
  git commit -m "security: extend proxy to protect /artisan/*, /admin/*, /client/* route trees"
  ```

---

## Task 4: Create cutover readiness checklist

**Working directory:** `/home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign`

Create a comprehensive document summarizing what's done, what still needs backend wiring, and the steps to cut over from the existing frontend to the redesign.

- [ ] **Step 1:** Create `docs/cutover-checklist.md`

The document should cover:

1. **API integration completeness per sprint** (Sprints 1–7 summary)
2. **What works in the redesign today** (production-ready)
3. **What still needs backend work** (mock/staged only)
4. **Cutover steps** (proxy change + route verification)
5. **Rollback plan**

- [ ] **Step 2:** Run final checks on worktree
  ```bash
  cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
  npm run lint 2>&1 | grep " error\b" | head -5
  npm run test 2>&1 | tail -6
  npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -5
  git log --oneline -10
  ```

- [ ] **Step 3:** Commit
  ```bash
  git add docs/cutover-checklist.md
  git commit -m "docs: add cutover readiness checklist for frontend redesign"
  ```

---

## Self-review checklist

- [ ] 8 API routes now have rate limiting
- [ ] `/invite/demo-token` page created and tested
- [ ] Proxy protects new `/artisan/*`, `/admin/*`, `/client/*` route trees
- [ ] Role redirects accept both old and new route trees
- [ ] Cutover checklist written
- [ ] TypeScript: 0 errors in both main project and worktree
- [ ] All tests passing
