# API Integration Plan — Frontend Redesign to Full Test Coverage

**Date**: 2026-05-26  
**Worktree**: `.worktrees/frontend-redesign`  
**Existing frontend**: `app/(artisan-dashboard)`, `app/(admin-dashboard)`, `app/(client-dashboard)`, `components/dashboard/`  
**Redesign frontend**: `components/dashboard2/admin/source-admin-preview.tsx`

---

## Executive summary

The existing frontend is a **production-grade React Query + shadcn/ui frontend** with 75 API routes, 37 React Query hooks, Zod validation on every mutation, Clerk auth integration, rate limiting, Cloudinary image upload, M-Pesa payment integration, and Nodemailer email. It consumes real backend data.

The redesigned frontend is a **100%-fidelity source prototype** with a single large source file, hardcoded fixture data, local-state interactions, and no API calls. It is visually complete but dataless.

**The plan**: Wire the redesign to consume the same 75 API routes and 37 hooks that the existing frontend already exercises, while preserving the visual/UX improvements from the redesign. This is an API integration sprint, not a rebuild.

---

## Part 1 — API readiness audit

### 1.1 Available backend API surface

| Domain | Routes | Auth | Zod validation | Rate limiting | Notes |
| --- | --- | --- | --- | --- | --- |
| Admin stats/analytics | `/api/admin/stats`, `/api/admin/analytics/overview`, `/api/admin/chart-data` | Admin-only | Yes | No | Good |
| Admin verification | `/api/admin/verification/pending`, `/api/admin/verification/process` | Admin-only | Yes (process POST) | No | Email send on approve/reject |
| Admin users | `/api/admin/users`, `/api/admin/users/all`, `/api/admin/users/stats` | Admin-only | No | No | Needs pagination wiring |
| Admin artisans | `/api/admin/artisans` | Admin-only | Partial | No | Returns profile + user join |
| Admin invites | `/api/admin/invites`, `/api/admin/invites/[token]` | Admin-only | Zod schema | No | `sendInviteEmail` called on POST |
| Admin moderation | `/api/admin/moderation`, `/api/admin/moderation/[id]` | Admin-only | Partial | No | |
| Admin payouts | `/api/admin/payouts`, `/api/admin/payouts/[id]` | Admin-only | Partial | No | |
| Admin subscriptions | `/api/admin/subscriptions` | Admin-only | No | No | |
| Admin monitoring/database | `/api/admin/system/monitoring`, `/api/admin/database/stats` | Admin-only | No | No | |
| Admin reports/search/settings | `/api/admin/reports/generate`, `/api/admin/search`, `/api/admin/settings` | Admin-only | Partial | No | |
| Artisan jobs | `/api/artisan/jobs`, `/api/artisan/jobs/[id]`, `/api/artisan/jobs/[id]/quote` | Artisan-only | Yes | No | Full CRUD + quote |
| Artisan profile | `/api/artisan/profile` | Artisan-only | Zod (Kenyan county validation, URL validation) | No | Cloudinary upload required |
| Artisan portfolio | `/api/artisan/portfolio`, `/api/artisan/portfolio/[id]` | Artisan-only | Yes | No | Image upload, delete confirm |
| Artisan specializations | `/api/artisan/specializations`, `/api/artisan/specializations/[id]` | Artisan-only | Yes | No | |
| Artisan earnings | `/api/artisan/earnings` | Artisan-only | No | No | |
| Artisan payments | `/api/artisan/payments`, `/api/artisan/payments/[id]`, `/api/artisan/payments/export` | Artisan-only | Partial | No | |
| Artisan verification | `/api/artisan/verification/resubmit` | Artisan-only | Zod | No | Status must be REJECTED |
| Artisan stats | `/api/artisan/stats` | Artisan-only | No | No | |
| Client jobs | `/api/client/jobs`, `/api/client/jobs/[id]` | Client-only | Yes | No | Full CRUD |
| Client saved artisans | `/api/client/saved-artisans`, `/api/client/saved-artisans/[id]` | Client-only | No | No | Toggle save |
| Client analytics/stats | `/api/client/analytics`, `/api/client/stats` | Client-only | No | No | |
| Client artisan view | `/api/client/artisans/[id]` | Client-only | No | No | |
| Conversations | `/api/conversations`, `/api/conversations/[id]`, `/api/conversations/[id]/messages`, `/api/conversations/unread` | Auth | Yes | No | Full CRUD messages |
| Reviews | `/api/reviews`, `/api/reviews/[id]`, `/api/artisans/[id]/reviews` | Auth | Zod | No | Rating 1–5, comment optional |
| Public artisan search | `/api/search/artisans` | Public | No | Yes (30 req/min) | Full filter/geo/pagination |
| Public artisan profile | `/api/artisans/[id]` | Public | No | No | |
| Image upload | `/api/upload/image` | Auth | No (file validation only) | Yes (10/10min) | Cloudinary, base64 or FormData |
| Notifications | `/api/notifications`, `/api/notifications/[id]`, `/api/notifications/read-all` | Auth | No | No | |
| Notification prefs | `/api/user/notification-preferences` | Auth | Partial | No | |
| User profile | `/api/user/me`, `/api/user/profile`, `/api/user/sync` | Auth | Zod | No | |
| M-Pesa payments | `/api/payments/mpesa/initiate`, `/api/payments/mpesa/callback`, `/api/payments/mpesa/status` | Auth/webhook | Zod | No | STK Push, Kenya phone only |
| M-Pesa B2C | `/api/payments/b2c/result`, `/api/payments/b2c/timeout` | Webhook | No | Yes | Artisan payouts |
| Job payments | `/api/payments/job/initiate`, `/api/payments/job/callback` | Auth/webhook | Zod | No | Deposit + final payment |
| Health | `/api/health` | Public | No | No | |

### 1.2 React Query hooks ready to use

37 hooks in `lib/hooks/` covering all domains:

- `useArtisanDashboard`, `useArtisanJobs`, `useArtisanEarnings`, `useArtisanStats`, `useArtisanSettings`, `useArtisanSubscription`, `useArtisanAnalytics`, `useArtisanReviews`, `useArtisanPayments`
- `useClientStats`, `useClientJobs`, `useClientAnalytics`, `useClientReviews`, `useSavedArtisans`, `useToggleSaveArtisan`
- `useAdminStats`, `useAdminVerification`, `useAdminArtisans`, `useAdminSettings`, `useAdminAnalytics`, `useAdminEarnings`, `useAdminPayouts`, `useAdminReports`, `useAdminModeration`, `useAdminSearch`, `useAdminDatabase`, `useAdminMonitoring`, `useAdminLocations`, `useAdminSubscriptions`
- `useConversations`, `useConversationMessages`, `useCreateConversation`
- `useArtisanSearch`, `useSavedArtisanIds`, `useToggleSaveArtisan`, `useSearchHistory`
- `usePortfolio`, `useDeletePortfolioItem`
- `useCloudinaryUpload`
- `useUsers`, `useUserStats`

---

## Part 2 — Regression analysis: redesign vs existing frontend

### 2.1 Features present in existing frontend, absent in redesign

| Feature | Existing frontend | Redesign | Gap |
| --- | --- | --- | --- |
| Real job CRUD (create, quote, status transitions) | ✅ Full lifecycle via React Query hooks | ⚠️ Local state | Wire redesign to `useArtisanJobs`, `useClientJobs` |
| Job status machine (REQUESTED → QUOTED → DEPOSIT_PAID → IN_PROGRESS → COMPLETED → PAID) | ✅ 10-state machine with hint badges | ⚠️ 4-state simplified | Redesign state map needs DEPOSIT_PAID, IN_PROGRESS, PAID, DECLINED states |
| Quote line items with Zod validation | ✅ `useArtisanJobs` quote mutation with line item schema | ✅ Source QuoteWorkflowBuilder | Wire builder submit to `/api/artisan/jobs/[id]/quote` |
| Portfolio with image upload (Cloudinary) | ✅ `usePortfolio`, `useDeletePortfolioItem`, `useCloudinaryUpload` | ⚠️ Gradient placeholders | Wire PortfolioProjectModal to upload API |
| Real messages/conversations | ✅ `useConversations`, `useConversationMessages`, pagination | ⚠️ Static bubbles | Wire `DashboardMessagesPane` send to `/api/conversations/[id]/messages` |
| Verification status from DB (PENDING/VERIFIED/REJECTED/null) | ✅ `useArtisanDashboard` returns status + rejectionReason | ⚠️ Hardcoded PENDING | Wire verification banner to `useArtisanDashboard` |
| Verification resubmit with document upload | ✅ `/api/artisan/verification/resubmit` + Cloudinary | ⚠️ Upload button only | Wire settings/verification tab to upload + resubmit API |
| Admin verification with email notification | ✅ `/api/admin/verification/process` sends email | ⚠️ Staged locally | Wire review modal `submitDecision` to API |
| Profile completion % from real fields | ✅ Computed in `profile-completion.tsx` | ⚠️ Formula from portfolio/jobs counts | Keep redesign formula; add location/verification states |
| Invite with email delivery | ✅ `/api/admin/invites` POST calls `sendInviteEmail` | ⚠️ Send invite button non-functional | Wire admin invites form to API |
| M-Pesa subscription payments | ✅ STK Push, polling, callback handling | ⚠️ "Manage plan" opens modal only | Wire subscription page to `/api/payments/mpesa/initiate` |
| Saved artisans toggle | ✅ `useToggleSaveArtisan` optimistic mutation | ⚠️ Static saved grid | Wire find/saved views to toggle API |
| Real artisan search (geo, filters, profession) | ✅ `useArtisanSearch` with full filter set | ⚠️ Client-side fixture filter | Wire browse/find views to `/api/search/artisans` |
| Notifications | ✅ `/api/notifications`, bell, read-all | ⚠️ `DashboardNotificationButton` hardcodes 3 messages | Wire to `useNotifications` hook |
| Client review submission linked to job | ✅ `useClientReviews` with `profileId` + `jobId` | ⚠️ Local `reviewedJobIds` state | Wire reviews view to `/api/reviews` POST |
| Admin users list with real data | ✅ `useUsers`, pagination, stats | ⚠️ Fixture rows | Wire admin users view to `useUsers` hook |
| Artisan earnings from real payments | ✅ `useArtisanEarnings` from payment records | ⚠️ Auto-generated from local status change | Wire earnings view to earnings API |
| Settings notification preferences persist | ✅ `/api/user/notification-preferences` | ⚠️ `defaultChecked` only | Wire to notification prefs API |
| Settings location save | ✅ `/api/artisan/profile` PATCH | ⚠️ `defaultValue` only | Wire to profile PATCH API |

### 2.2 Features in redesign that improve on existing frontend

| Feature | Existing frontend | Redesign improvement |
| --- | --- | --- |
| Visual fidelity + design system | shadcn/ui cards | Source tokens, animated sidebars, dark mode |
| Admin verification review modal | No in-dashboard review modal | Full document/checklist/decision modal wired for verification |
| Admin type-specific detail pages | Not present | Full routed detail pages for 12 admin kinds |
| Client review flow | Separate review page | Inline review with job nudge banner + empty state |
| Quick detail slideover | Not present | Row click → quick preview across all list views |
| Client jobs stat cards + DataList | Card grid | DataList with search/sort/pagination |
| Artisan sidebar nav sections | Flat nav | Workspace/Finance/Account sections |
| Admin sidebar nav sections | Flat nav | Operations/Trust & Safety/System sections |
| Dark mode | No | Full CSS custom property dark theme |
| View transitions | No | `document.startViewTransition` on navigate |

---

## Part 3 — Security hardening gaps

| Gap | Severity | Fix |
| --- | --- | --- |
| Rate limiting not on most API routes | Medium | Apply `rateLimit(request, 'endpoint', RATE_LIMITS.NORMAL)` to all authenticated mutations |
| Admin detail page actions are local-only without RBAC check | High | Every API call must verify `user.role === 'ADMIN'` server-side (most routes do; detail page clients skip to local state) |
| Settings location/notifications use uncontrolled inputs | Medium | Use controlled + React Query mutation; add Zod validation client-side before submit |
| Verification document upload has no file-type check client-side | Medium | Add MIME type + size validation before calling `/api/upload/image` |
| M-Pesa webhook callbacks have no signature verification | High | Add Daraja callback IP allowlist or HMAC check on `/api/payments/mpesa/callback` |
| In-memory rate limiter resets on server restart | Low | Acceptable for preview; for production use Redis-backed rate limiting |
| No CSRF protection on state-mutation forms | Medium | Clerk JWT already provides protection; verify all mutations send `Authorization` header |
| Admin invite email contains no expiry display | Low | Show `expiresAt` in invite detail page |

---

## Part 4 — Form validation gaps

| Form / Action | Existing validation | Redesign validation | Gap |
| --- | --- | --- | --- |
| Send artisan invite | `z.email()` on backend | No client-side validation | Add client-side email + role validation before submit |
| Artisan profile (settings/profile tab) | `updateProfileSchema` (Zod) | `defaultValue` inputs | Add controlled inputs + client validation |
| Artisan location (settings/location tab) | Kenyan county enum validation | `defaultValue` | Add county dropdown with enum values |
| Portfolio project create/edit | `PortfolioProjectModal` (title, category, cost) | No field validation | Add required field check before save |
| Quote builder submit | Line item + amount validation (backend) | QuoteWorkflowBuilder local | Add min-amount check + at-least-one-item validation |
| Review submit | `z.number().min(1).max(5)`, `z.string().max(2000)` | Star rating + textarea | Add client-side rating > 0 check |
| Admin verification decision | `action` enum + `reason` required for REJECT | `required reason` enforced in UI | Correct; just wire to API |
| Job request creation (client) | `CreateJobSchema` (not in scope yet) | Not in redesign | Future: client job creation form |

---

## Part 5 — Responsiveness audit

| View | Mobile | Tablet | Desktop | Notes |
| --- | --- | --- | --- | --- |
| Admin sidebar (collapsed) | ✅ Mobile nav via `DashboardMobileNav` | ✅ | ✅ 260px→88px | |
| Artisan sidebar | ✅ | ✅ | ✅ | |
| Admin verification modal | ⚠️ Fixed max-w breaks on small screens | Acceptable | ✅ | Verify `p-2 md:p-4` sufficient on 320px |
| Admin detail pages | ✅ Grid collapses to single column | ✅ | ✅ | |
| Client job list (DataList) | ✅ Grid responsive via source | ✅ | ✅ | |
| Messages pane | ⚠️ Left thread list visible on mobile only via scroll | ⚠️ | ✅ `lg:grid-cols-[336px_1fr]` | Add mobile toggle to switch between thread list and conversation |
| QuoteWorkflowBuilder | ⚠️ 3-column price grid may overflow at 360px | ✅ | ✅ | Test on 360px |

---

## Part 6 — Implementation plan (sprint order)

### Sprint 1 — Auth + user identity wiring (3 days)

Goal: Remove hardcoded persona; redesign reads real user identity.

| Task | File(s) | API |
| --- | --- | --- |
| Pass real auth session to source preview shell | `SourceAdminPreview` | `useUser()` from Clerk |
| Replace hardcoded "Grace Wanjiku" / "Admin Console" with real user name/role | `ArtisanDashboardCoreSection`, `ClientDashboardCoreSection` | `/api/user/me` |
| Topbar profile button reads real avatar + name | `DashboardProfileButton` | `useUser()` |
| Topbar notification button reads real count | `DashboardNotificationButton` | `useNotifications` |
| After-sign-up role redirect confirmed working | `app/after-sign-up/page.tsx` | Clerk webhooks |

### Sprint 2 — Artisan data wiring (5 days)

Goal: All artisan views show real data.

| Task | Hook / API | Estimated complexity |
| --- | --- | --- |
| Overview stat cards from `useArtisanDashboard` | `useArtisanDashboard` | Low |
| Verification banner status from real profile | `useArtisanDashboard` | Low |
| Profile completion from real profile fields | `useArtisanDashboard` | Low |
| Jobs list from `useArtisanJobs` with full status machine | `useArtisanJobs` | Medium |
| Job status transitions (quote, start, complete) via API mutations | `useArtisanJobs` mutations | High |
| QuoteWorkflowBuilder submit → `/api/artisan/jobs/[id]/quote` | `useArtisanJobs` | High |
| Portfolio list from `usePortfolio` | `usePortfolio` | Low |
| Portfolio project save/delete via mutation + Cloudinary upload | `usePortfolio`, `useCloudinaryUpload` | High |
| Earnings list from `useArtisanEarnings` | `useArtisanEarnings` | Low |
| Subscription plan from `useArtisanSubscription` | `useArtisanSubscription` | Low |
| Settings profile PATCH → `/api/artisan/profile` | `useArtisanSettings` | Medium |
| Settings location PATCH with county dropdown | `useArtisanSettings` | Medium |
| Settings specializations from `useArtisanSettings` | `useArtisanSettings` | Low |
| Settings verification tab: upload docs + resubmit | `useCloudinaryUpload`, `/api/artisan/verification/resubmit` | High |
| Settings notifications PATCH | `/api/user/notification-preferences` | Low |

### Sprint 3 — Messaging wiring (3 days)

Goal: Real conversations and messages.

| Task | API |
| --- | --- |
| Load conversations list from `useConversations` | `useConversations` |
| Load conversation messages from `useConversationMessages` | `useConversationMessages` |
| Send message mutation → `/api/conversations/[id]/messages` POST | `useConversationMessages` |
| Create conversation (client → artisan) | `useCreateConversation` |
| Unread count in nav badge | `/api/conversations/unread` |
| Quote card actions: accept/reject/revision → job mutation | `useClientJobs` mutations |

### Sprint 4 — Admin data wiring (5 days)

Goal: Admin views show real data; verification actions reach DB.

| Task | Hook / API |
| --- | --- |
| Overview stats from `useAdminStats` | `useAdminStats` |
| Verification queue from `useAdminVerification` | `useAdminVerification` |
| Review modal "Approve/Reject" → `/api/admin/verification/process` | `/api/admin/verification/process` |
| Artisans list from `useAdminArtisans` | `useAdminArtisans` |
| Users list from `useUsers` | `useUsers` |
| Invites list + send invite → `/api/admin/invites` | `/api/admin/invites` |
| Moderation list from `useAdminModeration` | `useAdminModeration` |
| Analytics from `useAdminAnalytics` | `useAdminAnalytics` |
| Monitoring from `useAdminMonitoring` | `useAdminMonitoring` |
| Payouts from `useAdminPayouts` | `useAdminPayouts` |
| Subscriptions from `useAdminSubscriptions` | `useAdminSubscriptions` |
| Admin settings from `useAdminSettings` | `useAdminSettings` |

### Sprint 5 — Client data wiring (3 days)

Goal: Client views show real data.

| Task | Hook / API |
| --- | --- |
| Overview stats from `useClientStats` | `useClientStats` |
| Jobs list from `useClientJobs` with full status machine | `useClientJobs` |
| Job detail: accept/reject quote, mark complete | `useClientJobs` mutations |
| Find artisans from `useArtisanSearch` | `useArtisanSearch` |
| Saved artisans list + toggle | `useSavedArtisans`, `useToggleSaveArtisan` |
| Client reviews submit → `/api/reviews` POST | `useClientReviews` |
| Client reviews list from `useClientReviews` | `useClientReviews` |
| Client messages via conversations | `useConversations` |

### Sprint 6 — Public pages wiring (2 days)

| Task | API |
| --- | --- |
| Home page artisan cards from `/api/search/artisans` | `useArtisanSearch` |
| Browse directory from `/api/search/artisans` with filters | `useArtisanSearch` |
| Add verified-only and availability filter to browse | `/api/search/artisans?verified=true&available=true` |
| Artisan profile page from `/api/artisans/[id]` | Fetch in page |
| Portfolio preview from real portfolio items | `/api/artisan/portfolio` |

### Sprint 7 — Payments and subscriptions (3 days)

| Task | API |
| --- | --- |
| M-Pesa subscription payment in artisan subscription page | `/api/payments/mpesa/initiate` |
| M-Pesa subscription polling | `/api/payments/mpesa/status` |
| Job deposit + final payment flow | `/api/payments/job/initiate` |
| Artisan payout request (admin side) | `/api/admin/payouts` |
| Payment history in artisan earnings | `useArtisanPayments` |

### Sprint 8 — Security hardening + QA (2 days)

| Task |
| --- |
| Add rate limiting to admin mutation routes |
| Add MIME + size validation client-side for all uploads |
| Add Kenyan county dropdown to location tab |
| Add client-side Zod validation to all form submits |
| Verify M-Pesa webhook callback IP allowlist |
| Responsive testing on 360px, 768px, 1280px |
| Test dark mode on all views |
| E2E: invitation → signup → profile → verification → public visibility |
| E2E: client find → message → quote → job → review |

---

## Part 7 — Migration strategy

### Approach: Progressive replacement, not big-bang

1. **Phase 1** (Sprints 1–2): Wire artisan views only. Deploy redesign as `/artisan/*` alongside existing `/artisan-dashboard/*`. Verify data parity.
2. **Phase 2** (Sprint 3): Wire messages. Replace `/artisan-dashboard/messages` with redesign.
3. **Phase 3** (Sprint 4): Wire admin views. Admin-only, lower risk.
4. **Phase 4** (Sprint 5–6): Wire client + public. Client flows are last because they depend on artisan supply.
5. **Phase 5** (Sprint 7–8): Wire payments + harden. M-Pesa is high-risk; keep existing payment UI until fully tested.
6. **Cutover**: Once Sprint 8 passes E2E tests, switch `proxy.ts` to route `artisan-dashboard` → `artisan`, `admin-dashboard` → `admin`, `client-dashboard` → `client`. Remove old frontend components.

### Dual-run period

Keep `(artisan-dashboard)`, `(admin-dashboard)`, `(client-dashboard)` route groups active during the migration. Use feature flags or URL-based routing to A/B test specific pages.

---

## Part 8 — Known risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Source preview file size (~750KB) causes slow parsing | Medium | Medium | Split into per-section components during Sprint 1 refactor |
| Prisma engine NixOS issue blocks full build | High | Medium | Use `npm run db:generate` only when schema changes; skip `npx next build` on NixOS CI |
| M-Pesa sandbox tokens expire between test sessions | High | Low | Document token refresh steps in README |
| Dark mode CSS vars break with future Tailwind upgrades | Low | Low | Encapsulate all dark CSS in `app/globals.css` only |
| ConversationQuoteCard state is per-pane mount — resets on tab change | Medium | Medium | Lift conversation state to parent on Sprint 3 |
| Admin verification approval does not cross session boundary to artisan session | High | High | After backend wiring, both sessions read from DB — no longer an issue |
