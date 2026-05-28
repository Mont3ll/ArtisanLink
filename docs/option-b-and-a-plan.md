# Option B + Option A Implementation Plan

**Date:** 2026-05-28

---

## Option B — Cutover Cleanup

### Goal
Make `/artisan/*`, `/admin/*`, `/client/*` the canonical routes. The legacy `/*-dashboard` route groups redirect to canonical routes, eliminating duplicate page maintenance.

### Success Criteria
- [ ] `GET /artisan-dashboard/jobs` → 302 → `/artisan/jobs`
- [ ] `GET /admin-dashboard/verification` → 302 → `/admin/verification`
- [ ] `GET /client-dashboard/messages` → 302 → `/client/messages`
- [ ] All `/*-dashboard` pages are redirect-only (no content rendering)
- [ ] TypeScript: 0 errors
- [ ] Tests: all passing
- [ ] No double-redirect loops (proxy accepts `/*-dashboard` → page redirects → proxy accepts `/*`)

### Task B1: Convert all `/*-dashboard` page files to redirects

**Files:** Every `app/(artisan-dashboard)/artisan-dashboard/*/page.tsx`, `app/(admin-dashboard)/admin-dashboard/*/page.tsx`, `app/(client-dashboard)/client-dashboard/*/page.tsx`

**Redirect map (artisan):**
- `/artisan-dashboard` → `/artisan/dashboard`
- `/artisan-dashboard/jobs` → `/artisan/jobs`
- `/artisan-dashboard/messages` → `/artisan/messages`
- `/artisan-dashboard/portfolio` → `/artisan/portfolio`
- `/artisan-dashboard/earnings` → `/artisan/earnings`
- `/artisan-dashboard/subscription` → `/artisan/subscription`
- `/artisan-dashboard/settings` → `/artisan/settings`
- `/artisan-dashboard/reviews` → `/artisan/reviews`

**Redirect map (admin):**
- `/admin-dashboard` → `/admin`
- `/admin-dashboard/verification` → `/admin/verification`
- `/admin-dashboard/artisans` → `/admin/artisans`
- `/admin-dashboard/users` → `/admin/users`
- `/admin-dashboard/invites` → `/admin/invites`
- `/admin-dashboard/moderation` → `/admin/moderation`
- `/admin-dashboard/analytics` → `/admin/analytics`
- `/admin-dashboard/monitoring` → `/admin/monitoring`
- `/admin-dashboard/locations` → `/admin/locations`
- `/admin-dashboard/settings` → `/admin/settings`
- `/admin-dashboard/earnings` → `/admin/earnings`
- `/admin-dashboard/payouts` → `/admin/payouts`
- `/admin-dashboard/subscriptions` → `/admin/subscriptions`
- `/admin-dashboard/reports` → `/admin/reports`
- `/admin-dashboard/search` → `/admin/search`
- `/admin-dashboard/database` → `/admin/database`
- `/admin-dashboard/system` → `/admin/system`
- `/admin-dashboard/help` → `/admin/help`

**Redirect map (client):**
- `/client-dashboard` → `/client/dashboard`
- `/client-dashboard/find-artisans` → `/client/find`
- `/client-dashboard/saved` → `/client/saved`
- `/client-dashboard/jobs` → `/client/jobs`
- `/client-dashboard/messages` → `/client/messages`
- `/client-dashboard/reviews` → `/client/reviews`
- `/client-dashboard/settings` → `/client/dashboard`
- `/client-dashboard/analytics` → `/client/dashboard`
- `/client-dashboard/map` → `/client/find`
- `/client-dashboard/help` → `/client/dashboard`

---

## Option A — P0: Wire remaining mock actions

### A1: QuoteWorkflowBuilder → real API

**Goal:** When artisan submits a quote in QuoteWorkflowBuilder, it POSTs to `/api/artisan/jobs/[id]/quote` with the line items.

**Success Criteria:**
- [ ] POST `/api/artisan/jobs/{id}/quote` is called on submit
- [ ] Request includes `{ amount, description, lineItems: [...], depositPercent }`
- [ ] On success: job quote field updates and job status transitions to QUOTED
- [ ] On error: error message shown in modal, local state rollback
- [ ] Rate limit (NORMAL, 60/min) tested/confirmed on the endpoint

**Files:**
- `components/dashboard2/admin/source-admin-preview.tsx` — `QuoteWorkflowBuilder` onSubmit + `ArtisanDashboardCoreSection` onSubmit handler

### A2: Client review submission → real API

**Goal:** When client submits a review, it POSTs to `/api/reviews`.

**Success Criteria:**
- [ ] `SourceClientJob` adapter extended with `artisanProfileId: string | null`
- [ ] POST `/api/reviews` called with `{ profileId, rating, comment, projectTitle }`
- [ ] On success: job added to `reviewedJobIds`, UI shows "✓ Review submitted"
- [ ] On API error: error shown inline, review NOT added to local state
- [ ] Only called when `artisanProfileId` is available (graceful fallback for fixture jobs)

**Files:**
- `lib/hooks/use-client-data-adapter.ts` — extend `SourceClientJob` + `mapRealClientJobToSource`
- `components/dashboard2/admin/source-admin-preview.tsx` — client reviews view `submitReview` function

### A3: Admin invite send → real API

**Goal:** Admin "Send invite" form POSTs to `/api/admin/invites`.

**Success Criteria:**
- [ ] POST `/api/admin/invites` called with `{ email, name?, message? }`
- [ ] On success: email field cleared, success toast shown
- [ ] On validation error (invalid email): error shown inline
- [ ] Rate limit (STRICT) already on endpoint

**Files:**
- `components/dashboard2/admin/source-admin-preview.tsx` — admin invites view send button

---

## Success Criteria Summary

| Task | Done when |
| --- | --- |
| B1 | All `/*-dashboard` pages 302-redirect; no SourceAdminPreview in those files |
| A1 | QuoteWorkflowBuilder submit calls real API; job status updates on success |
| A2 | Client review calls `/api/reviews`; `artisanProfileId` threaded through adapter |
| A3 | Admin invite form calls real API; success/error feedback visible |
| All | 0 TypeScript errors, all tests passing, no regressions |
