# ChapaWorks Frontend Redesign — Comprehensive Progress Audit

**Date:** 2026-05-29  
**Test suite:** 927 passing · 41 test files · 0 TypeScript errors · 0 lint errors  
**Codebase:** `github.com/ArtisanLink-main` (main branch, worktree merged)

---

## Architecture overview

| Layer | Technology | Status |
| --- | --- | --- |
| Public pages | Next.js App Router + React 19 + source-preview components | ✅ Complete |
| Dashboard shell | `SourceAdminPreview` (source-fidelity monolith) | ✅ Deployed |
| Data layer | `DashboardRealDataContext` + 8 adapter hooks | ✅ Wired |
| API layer | 75 routes, 43 React Query hooks | ✅ Existing |
| Auth | Clerk (sign-in/sign-up, role routing, sign-out) | ✅ Working |
| Storage | Cloudinary (upload endpoint) | ✅ Wired |
| Payments | M-Pesa STK Push + polling | ✅ Wired |
| Routing | `/admin/*`, `/artisan/*`, `/client/*` canonical | ✅ Clean |

---

## ✅ Completed — What works today

### Identity & Auth
- Clerk sign-in, sign-up (client + artisan roles), invite-based artisan onboarding
- `after-sign-in` routes to correct persona (`/admin`, `/artisan/dashboard`, `/client/dashboard`)
- `after-sign-up` creates DB user and routes to dashboard
- Sign-out calls `Clerk.signOut()` → redirects to `/`
- Auth pages (`/sign-in`, `/sign-up`) show real logo, home link, role-specific copy

### Route structure
- **Canonical routes:** `/admin/*`, `/artisan/*`, `/client/*` — all functional
- **Legacy redirects:** `/admin-dashboard/*`, `/artisan-dashboard/*`, `/client-dashboard/*` all 302-redirect to canonical
- **Proxy:** `/artisan(.*)` no longer incorrectly matches `/artisans`; public pages bypass role-based redirects

### Admin dashboard (`/admin`)
| View | Status | Real data |
| --- | --- | --- |
| Overview stat cards | ✅ | Pending verifications, active subscriptions, system uptime from `useAdminStats` |
| Verification queue | ✅ | `useAdminVerification` — real pending artisans |
| Artisans directory | ✅ | `useAdminArtisans` — real artisan list with DashboardDataList |
| Verification review modal | ✅ | `POST /api/admin/verification/process` — approves/rejects with email |
| Invite send form | ✅ | `POST /api/admin/invites` with email delivery |
| Users view | ❌ | Hardcoded stats (2,418 / 1,746 / 672) — `useUsers` not wired |
| Moderation view | ❌ | `moderationRows` fixture — `useAdminModeration` not wired |
| Analytics/Monitoring/Locations | 🟡 | Chart data is source fixture; real endpoint exists but not wired |
| Admin detail pages (12 kinds) | 🟡 | Frontend functional with staged actions; most API calls staged locally |

### Artisan dashboard (`/artisan/*`)
| Feature | Status | Real data |
| --- | --- | --- |
| Overview stats | ✅ | Reactive from `artisanJobRows` (wired to adapter) |
| Verification banner | ✅ | Real `artisanStatus` from `useArtisanDashboard` via context |
| Jobs list + stat cards | ✅ | `useArtisanJobsAdapter` → `/api/artisan/jobs` |
| Job status transitions (start/complete) | ✅ | `PATCH /api/artisan/jobs/[id]` with action |
| QuoteWorkflowBuilder submit | ✅ | `POST /api/artisan/jobs/[id]/quote` with line items |
| Portfolio list | ✅ | `useArtisanPortfolioAdapter` → `/api/artisan/portfolio` |
| Portfolio save/edit | ✅ | `POST/PATCH /api/artisan/portfolio/[id]` |
| Portfolio delete | 🟡 | Delete button in modal is `useDeletePortfolioItem` — check if wired |
| Earnings list + totals | ✅ | `useArtisanEarningsAdapter` → `/api/artisan/earnings` |
| Subscription display | ✅ | `useArtisanSubscription` → real plan name, renew date |
| M-Pesa subscription payment | ✅ | `useInitiatePayment` + `usePaymentStatusPolling` |
| Settings/Profile tab | ✅ | Controlled inputs; save calls `PATCH /api/artisan/profile` |
| Settings/Location tab | ✅ | Controlled county/city; save calls `PATCH /api/artisan/profile` |
| Settings/Specializations tab | ✅ | `useArtisanSettingsAdapter` — add/remove skills |
| Settings/Verification tab | ✅ | File upload → Cloudinary → `/api/artisan/profile`; resubmit button |
| Settings/Notifications tab | ✅ | Save calls `PATCH /api/user/notification-preferences` |
| Messages — thread list | ✅ | Real conversations via `useConversationsAdapter` |
| Messages — send message | ❌ | `sendMessage` uses local `sentMessages` state only — NOT calling `/api/conversations/[id]/messages` |
| Reviews | ✅ | Jobs from real data; star rating + submit calls `POST /api/reviews` |
| Profile completion % | ✅ | Computed from real profile fields |

### Client dashboard (`/client/*`)
| Feature | Status | Real data |
| --- | --- | --- |
| Overview stats | ✅ | `useClientJobs` + `useSavedArtisansPage` |
| Find artisans | ✅ | `useArtisanSearch` — real search with query/profession/county |
| Save/unsave artisan | ✅ | `useToggleSaveArtisan` → `/api/client/saved-artisans` |
| Saved artisans list | ✅ | `useSavedArtisansPage` with remove |
| Jobs list | ✅ | `useClientJobs` with tabs |
| Accept quote | ✅ | `useAcceptQuote` → `PATCH /api/client/jobs/[id]` |
| Decline quote | ✅ | `useDeclineQuote` → `PATCH /api/client/jobs/[id]` |
| Cancel job | ✅ | `useCancelJob` with required reason |
| Leave review | ✅ | Calls `POST /api/reviews` with `profileId` from real job data |
| Messages (conversation list) | ✅ | Real conversations via context |
| Messages (send) | ❌ | Same as artisan — `sendMessage` is local state only |
| Job creation from profile | ✅ | "Message" button creates conversation via `POST /api/conversations` |

### Public pages
| Page | Status |
| --- | --- |
| `/` (home) | ✅ `GET /api/search/artisans`, fallback to preview fixtures |
| `/artisans` (browse) | ✅ Real search with verified/available filters, profession/county facets |
| `/artisans/[id]` (profile) | ✅ `GET /api/artisans/[id]`; portfolio modal; save/unsave; message/hire CTA |
| `/for-artisans` | ✅ Links fixed to `/artisan/dashboard` |
| `/pricing` | ✅ CTAs route to correct sign-up role |
| `/sign-in`, `/sign-up` | ✅ Real Clerk auth; home link; role-aware redirect |
| `/invite/[token]` | ✅ Routes to artisan sign-up with token |

### Security
- Rate limiting on 8 sensitive mutation routes
- Proxy protects all new route trees
- Clerk JWT auth on all dashboard routes
- `useAuth` guards on public page action buttons

---

## ❌ Remaining work — Prioritised

### Critical (blocks core user flows)

**C1 — Message send not persisted (both artisan + client)**
- `DashboardMessagesPane.sendMessage` adds to local `sentMessages` state only
- Does NOT call `POST /api/conversations/[id]/messages`
- Fix: Add `onSendMessage` prop wiring in both artisan and client messages views
- `useSendMessage` hook already exists at `lib/hooks/use-conversation-messages.ts`
- **Impact:** Users think they sent a message, but it disappears on refresh

**C2 — Admin users view hardcoded**
- Stats: "2,418 total users", "1,746 clients", "672 artisans" are static
- Users DashboardDataList uses fixture `userRows`
- `useUsers` and `useUserStats` hooks exist and are ready
- Fix: wire in same pattern as artisans/verification

**C3 — Admin moderation view fixture**
- `moderationRows` = 4 hardcoded cases
- `useAdminModeration` hook exists
- Fix: extend `DashboardRealDataContext` with moderation data + wire

### High priority (important for realistic testing)

**H1 — Admin analytics real data**
- Overview/Growth/Revenue charts use hardcoded `analyticsData` fixture
- `useAdminAnalytics` hook exists
- Fix: Wire chart data to real API in `SecondaryOperationsSection`

**H2 — Admin monitoring/locations real data**
- Monitoring shows fixture service rows; `useAdminMonitoring` exists
- Locations shows fixture city rows; `useAdminLocations` exists

**H3 — Job deposit + M-Pesa payment flow (client side)**
- After accepting quote, client needs to pay deposit
- `useInitiateJobPayment` hook exists
- Currently no deposit payment CTA in client job detail view
- **Impact:** Job lifecycle halts at ACCEPTED — can't progress to DEPOSIT_PAID → IN_PROGRESS

**H4 — Portfolio image upload (actual Cloudinary)**
- `PortfolioProjectModal` edit form uploads to Cloudinary via `/api/upload/image`
- But there's no `<input type="file">` in the image section of the edit form
- The save API call uses `project.gradient` as `imageUrl` (fallback only)
- Fix: Add file input to edit form for project image upload

### Medium priority

**M1 — Admin users CRUD actions**
- Suspend, message, export audit buttons in admin users view are staged only
- Need to wire to real user management endpoints

**M2 — Admin invite revoke/resend**
- Invite detail page actions are staged locally
- `/api/admin/invites/[token]` PATCH/DELETE routes exist

**M3 — Artisan earnings payout request**
- "Request payout" in earnings detail is staged
- `/api/artisan/payments/export` and payout flow exists

**M4 — Conversation unread badge dynamic update**
- `useUnreadMessages` polls every 30s — correct
- But badge resets to 0 when messages are read — no `mark-as-read` call

**M5 — Client job creation form**
- No explicit "Request a job" flow from the client dashboard
- Clients currently message first, then artisan creates a quote
- `useCreateJobRequest` hook exists but no UI entry point in client dashboard

### Low priority / Nice-to-have

- Admin payouts/subscriptions/reports/database/search views still use SecondaryOperationsSection fixture data
- Artisan analytics view (portfolio views, profile impressions) is still hardcoded
- Real-time message updates (WebSocket / SSE) — currently polls every 5s via `useConversationMessages`
- Review responses/editing
- Dark mode text contrast issues on some components
- Mobile messages layout (thread list / conversation switching on small screens)

---

## Test coverage summary

| Area | Tests | Coverage |
| --- | --- | --- |
| Dashboard context | 19 | Context, adapters, integration smoke |
| Admin adapters | 16 | Verification, artisans, stats mapping |
| Artisan adapters | 32 | Jobs, portfolio, earnings, settings |
| Client adapters | 17 | Jobs, stats mapping |
| Conversations adapter | 13 | Thread mapping, contact name, status |
| Filter logic | 11 | Browse directory filter functions |
| Auth flow | ~30 | Sign-in/sign-up/after-sign-in routing |
| API integration | ~30 | Rate limiting, M-Pesa, verification |
| UI components | ~20 | Header, hero, roles |
| **Total** | **927** | All passing |

---

## Recommended next steps (in order)

1. **C1 — Wire `sendMessage` to real API** (~2h) — Highest value per effort
2. **C2 — Admin users real data** (~2h) — Needed for admin to manage users
3. **H3 — Job deposit payment CTA** (~3h) — Completes the hire lifecycle
4. **H4 — Portfolio image upload** (~2h) — Artisans need actual images
5. **C3 — Admin moderation real data** (~2h) — Trust & Safety queue
6. **H1/H2 — Admin analytics/monitoring** (~3h) — Secondary ops views
7. **M5 — Client job creation form** (~4h) — Closes the client hire loop
