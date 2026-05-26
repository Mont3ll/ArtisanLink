# Cross-System Flow Audit — Admin + Artisan + Client + Public

**Source**: `/home/mel/Downloads/labs/chapaworks.tsx`
**Bridge**: `components/dashboard2/admin/source-admin-preview.tsx`
**Date**: 2026-05-26
**Scope**: All key user flows across every persona — route coverage, component status, and known gaps.

---

## Flow 1 — Invitation flow (Admin → Artisan)

### Admin side
| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Send invite form (email + role + note) | `/admin/invites` | ✅ UI complete | Input fields present, Send button renders — not wired to backend send |
| Invite history table with status chips | `/admin/invites` | ✅ UI complete | Checkbox select, row click → quick detail slideover |
| Bulk resend/revoke/export via BulkActionPanel | `/admin/invites` | ✅ UI complete | Staged action modal, CSV export works locally |
| Quick detail slideover for invite row | `/admin/invites` | ✅ Works | Shows token, role, expiry, resend/revoke actions |
| Invite detail page | `/admin/invites/[token]` | ✅ Routed | Full page with actions: resend, revoke, copy, export |
| Resend invite action | `/admin/invites/[token]` | ⚠️ Staged only | Frontend action modal — no backend email send |
| Revoke token action | `/admin/invites/[token]` | ⚠️ Staged only | Frontend action modal — no DB token invalidation |
| Copy invite link | `/admin/invites/[token]` | ✅ Works | Writes preview URL to clipboard |

### Artisan side (receiving invite)
| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Invite sign-up page | `/sign-up?invite=TOKEN&role=artisan` | ✅ Works | Invite banner shown, role locked to artisan, OTP verification step present |
| Invite demo token redirect | `/invite/demo-token` | ❌ Page missing | `app/invite/demo-token/page.tsx` does not exist |
| Invite context preserved in AuthPreviewSection | `/sign-up` | ✅ Works | `inviteToken` prop passed, role locked, banner shown |
| OTP verification step | `/sign-up` | ✅ UI rendered | `AuthPreviewStep = "form" | "otp"` — OTP step renders but `step` never advances in source preview (always stays "form") |

### Gap summary
- **Critical**: `/invite/demo-token` page missing
- **Critical**: OTP step never triggered in preview (step always "form")
- Backend: invite send, resend, revoke all staged only

---

## Flow 2 — Authentication (sign-in / sign-up natural + invite)

| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Sign-in form | `/sign-in` | ✅ Works (Clerk) | Email + password, Google OAuth, loading states |
| Sign-up form (client) | `/sign-up` | ✅ Works (Clerk) | Email + password + captcha placeholder |
| Sign-up form (artisan) | `/sign-up?role=artisan` | ✅ Works | Role locked, artisan-specific CTA |
| Email OTP verification | `/sign-up` (verifications step) | ✅ Works (Clerk) | OTP input renders, autosubmit |
| Sign-up from invite | `/sign-up?invite=TOKEN` | ✅ Works | Invite banner + role lock |
| AuthPreviewSection (source preview) | Source routes `/sign-in`, `/sign-up` | ✅ Works | Renders both forms, invite-aware, OTP step defined but not triggered in preview |
| Sign-up role switch links | `/sign-up` | ✅ Works | "Sign up as artisan" / "Sign up as client" links present |
| Auth preview shell branding | All auth pages | ✅ Works | `AuthPreviewShell` shows brand, feature list, role-aware copy |

### Gap summary
- OTP step in source preview never advances (`step` always `"form"`) — low risk, real Clerk handles it
- No password reset / forgot-password flow in source preview (not a source priority)

---

## Flow 3 — Artisan profile completion alert and settings tabs

| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Verification pending banner | `/artisan/dashboard` | ✅ Present | Yellow alert, "Review documents" button → settings/verification, dismiss button |
| Verification banner persistent dismiss | `/artisan/dashboard` | ✅ localStorage | Dismissal saved to `artisan-vb-dismissed` key |
| Profile completion banner | `/artisan/dashboard` | ✅ Present | Green banner with progress bar |
| Profile completion % computed | `/artisan/dashboard` | ✅ Computed | `profileCompletionPct` from portfolio count, jobs, earnings, base |
| Profile banner "Improve portfolio" link | `/artisan/dashboard` | ✅ Works | `selectView("portfolio")` |
| Profile banner auto-dismissal when 100% | `/artisan/dashboard` | ⚠️ Partial | `profileCompletionPct < 100 &&` condition present — will hide when 100% |
| Settings → Profile tab | `/artisan/settings` | ✅ Works | 4 inputs (name, craft, rate, availability), bio, save button + toast |
| Settings → Specializations tab | `/artisan/settings` | ✅ Works | Skill chips, remove skill, AddSkillModal (category + evidence note) |
| Settings → Location tab | `/artisan/settings` | ✅ Rendered | 4 inputs (county, city, radius, coordinates) — static `defaultValue`, no save handler |
| Settings → Verification tab | `/artisan/settings` | ✅ Rendered | Pending status banner with "Upload" button and upload instructions |
| Settings → Notifications tab | `/artisan/settings` | ✅ Rendered | 6 notification toggles (checkbox), email input — `defaultChecked`, no save handler |
| Verification banner → settings/verification deep-link | `/artisan/dashboard` | ✅ Works | "Review documents" → `setSettingsTab("verification"); selectView("settings")` |
| FluidPillTabs for settings navigation | `/artisan/settings` | ✅ Works | All 5 tabs navigate |

### Gap summary
- Location tab and notifications tab: inputs use `defaultValue`/`defaultChecked` — changes not persisted locally (no controlled state + save)
- Profile completion% misses location and verification state as inputs
- Profile banner: no full auto-dismissal after all fields filled (would need controlled inputs)

---

## Flow 4 — Admin verification → artisan acceptance and visibility toggle

| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Verification queue table | `/admin/verification` | ✅ Works | Stat cards, BulkActionPanel, table with checkboxes, row click → quick detail |
| Row click → quick detail slideover | `/admin/verification` | ✅ Works | `QuickDetailSlideover` with "Review verification documents" primary action |
| "Review verification documents" → review modal | `/admin/verification` | ✅ Works | Opens `FullDetailViewModal` with documents, checklist, decision panel |
| Verification checklist (5 checks) | Review modal | ✅ Works | All 5 checkboxes required before approve is enabled |
| Approve decision + audit | Review modal | ✅ Works locally | Decision staged, audit timeline entry recorded — no DB write |
| Reject with required reason | Review modal | ✅ Works locally | Requires reason text, staged to timeline |
| Request more information | Review modal | ✅ Works locally | Staged to timeline, no artisan notification |
| Escalate review | Review modal | ✅ Works locally | Staged to timeline |
| Verification detail page (full) | `/admin/verification/[id]` | ✅ Routed | Full page with evidence packet, operations rail, audit timeline |
| Admin artisans list after verification | `/admin/artisans` | ✅ Lists | `isVerified` shown in DashboardDataList row |
| Admin artisans "Update visibility" action | `/admin/artisans` | ⚠️ Staged only | `openAdminFullDetail` → routes to artisan detail page — no DB visibility flag update |
| Artisan detail page visibility toggle | `/admin/artisans/[id]` | ⚠️ Staged | Action modal, local timeline — no DB update |

### Missing: Live visibility toggle
- No state in prototype bridges `admin verification → artisan.isVerified` across the component tree
- Admin and artisan sections are separate React trees (different `SourceAdminPreview` instances per route)
- The artisan verification banner does not clear after admin approves in the same session

### Gap summary
- **Intra-session**: If admin approves in the same source preview session (e.g., `/admin` source preview), the approval is local — the artisan session at `/artisan` is a separate component instance and won't see it
- **DB**: Approval writes nothing to DB
- **Notification**: No artisan notification of approval staged

---

## Flow 5 — Artisan public visibility and searchability

| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Artisan cards on home page | `/` | ✅ Works | Category filter, show all, skeleton loading, cards with portfolio button |
| Browse directory | `/artisans` | ✅ Works | Search input, profession filter tabs, artisan cards grid |
| Artisan profile page | `/artisans/[id]` | ✅ Works | Full profile with map, portfolio, services, reviews, hire/message buttons |
| Artisan card shows verified badge | Browse/home | ✅ Rendered | Badge chip on cards from artisan fixture data |
| Artisan card shows premium badge | Browse/home | ✅ Rendered | Premium badge shown for `isPremium: true` artisans |
| Browse search by name/location/craft | `/artisans` | ✅ Works locally | Client-side search across artisan fixture data |
| Filter by verified only | `/artisans` | ❌ Not present | No verified-only filter toggle in browse |
| Artisan availability filter | `/artisans` | ❌ Not present | No availability filter in browse |
| Artisan rating display | Profile + cards | ✅ Works | Star rating rendered from fixture data |
| Hire/Request from public profile | `/artisans/[id]` | ✅ Navigates | "Hire" → `/sign-in` or `/sign-up?role=client` |
| Message from public profile | `/artisans/[id]` | ✅ Navigates | "Message" → `/sign-in` |
| Public artisan portfolio preview | `/artisans/[id]` | ✅ Works | `CustomerPortfolioPreviewModal` opens on portfolio card click |

### Gap summary
- No verified-only filter in browse directory
- No availability filter
- Visibility is based on fixture data (`isVerified`, `isPremium`) — not DB-driven
- No artisan appears/disappears in public pages based on admin verification state in prototype

---

## Flow 6 — Artisan messaging flows

| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Message thread list | `/artisan/messages` | ✅ Works | Thread list with unread indicator, new message highlight, quote status pills |
| Select conversation | `/artisan/messages` | ✅ Works | Click thread → active conversation pane |
| Compose and send message | `/artisan/messages` | ✅ Works | Draft textarea, send adds bubble to thread visibly, clears draft |
| Attach file/image | `/artisan/messages` | ✅ Works locally | Attachment chips added, show in pre-send area, cleared on send |
| Generate quote in conversation | `/artisan/messages` | ✅ Works | "Generate quote" button → inline quote composer panel |
| Quote composer (artisan) | `/artisan/messages` | ✅ Works | Suggested total, deposit, duration, attach and send quote |
| Quote revision flow | `/artisan/messages` | ✅ Works | Revision request → artisan revises → resubmits |
| `ConversationQuoteCard` (accept/reject/revise) | `/artisan/messages` | ✅ Works | Client-side accept/reject/revision transitions on card |
| "Start job" from accepted quote | `/artisan/messages` | ✅ Works | Creates job in jobs list, shows system message in thread |
| Client messages | `/client/messages` | ✅ Works | Same `DashboardMessagesPane` with `role="client"` |
| Unread badge in artisan nav | Sidebar | ✅ Dynamic | Active job count (replaces hardcoded 14) |

### Gap summary
- Messages are entirely local state — no persistence, no real send
- File attachments are in-memory only (name/type stored, not uploaded)
- `DashboardMessagesPane` re-initializes `sentMessages` on component mount — thread history clears on nav away and back

---

## Flow 7 — Artisan quote workflow → job workflow

| Component / Step | Route | Status | Notes |
| --- | --- | --- | --- |
| Job request appears in list | `/artisan/jobs` | ✅ Works | PENDING status, appears in "Requested" tab |
| Job quick detail slideover | `/artisan/jobs` | ✅ Works | Row click → `QuickDetailSlideover` with "Create quote" and "Message client" actions |
| Open job detail from quick detail | `/artisan/jobs` | ✅ Works | Primary action → `job-detail` view |
| Back to jobs breadcrumb | Job detail | ✅ Works | `← Jobs / Job title` breadcrumb added |
| Job detail tabs (overview + quote workflow) | Job detail | ✅ Works | FluidPillTabs switches between summary and quote builder |
| QuoteWorkflowBuilder — itemized quote | Job detail | ✅ Works | Line items, categories, deposit %, totals, sub-items |
| Quote submission updates job | Job detail | ✅ Works | `onSubmit` updates job.quote + sets status QUOTED in jobs list |
| Stats cards update after quote | `/artisan/jobs` | ✅ Works | Projected value and quoted count re-compute from live data |
| Client accepts quote → ACTIVE | Messages (client role) | ✅ Works | Accept on `ConversationQuoteCard` → `upsertQuote("accepted")` |
| "Start job" button (artisan) | Messages | ✅ Works | `upsertQuote("job_started")` → creates/updates job, shows system message |
| Job status → ACTIVE | Jobs list | ✅ Works | `updateJobStatus` propagates status change |
| Mark job complete | Job detail | ✅ Works | Status button → `updateJobStatus("COMPLETED")` |
| Completed job → earning row | Earnings | ✅ Works | Auto-creates `ArtisanEarningRow` with gross/commission/net |
| Earning in ledger with stat update | `/artisan/earnings` | ✅ Works | Stats recalculate, row appears, quick detail slideover |
| Earning detail page | Earning detail | ✅ Works | Back breadcrumb, breakdown, status |
| Review prompt after job | Client review view | ✅ Rendered | Star rating + review textarea in client reviews |

### Gap summary
- Quote not transmitted to client (no backend)
- Job acceptance by client (ConversationQuoteCard) requires both artisan and client to be in the same source preview session
- No automated review request notification after job completion

---

## Flow 8 — Supporting components audit

### Public pages
| Component | Route | Status | Notes |
| --- | --- | --- | --- |
| Header with search pill | All public | ✅ Works | Tab switcher, search pill animation, auth/dashboard links |
| HeroBand | `/` | ✅ Works | Category filter, job type tabs, hero copy |
| CategoryStrip | `/` | ✅ Works | Animated profession filter |
| ArtisanPreviewCard | `/` and `/artisans` | ✅ Works | Portfolio preview button, view profile button |
| ArtisanCardSkeleton | `/` | ✅ Works | Loading skeleton in AnimatePresence |
| HowItWorksSection | `/` | ✅ Works | 3-step illustration |
| ForArtisansLandingPage | `/for-artisans` | ✅ Works | Full landing with CTA buttons |
| Pricing page | `/pricing` | ✅ Works | Rebuilt with source tokens |
| Footer | Public pages | ✅ Works | Links, branding |

### Admin components
| Component | Status | Notes |
| --- | --- | --- |
| DashboardSidebar with sections (Operations / Trust & Safety / System) | ✅ Done | Sections wired |
| AdminOperationsSection | ✅ Works | All 10 admin views with full content |
| SecondaryOperationsSection | ✅ Works | Earnings/subscriptions/payouts/reports/database/monitoring/locations/help/settings |
| VerificationQueue table + bulk | ✅ Works | Select, bulk action, row click, review button |
| FullDetailViewModal (verification review) | ✅ Wired | Documents, checklist, decisions, audit timeline |
| QuickDetailSlideover | ✅ Works | All admin list views wire row click |
| Admin detail pages (12 kinds) | ✅ Routed | Full pages with evidence packet, operations rail, audit timeline, action modals |
| Action modals + portal (full viewport) | ✅ Works | `createPortal(modal, document.body)` — covers sidebar/topbar |

### Artisan components
| Component | Status | Notes |
| --- | --- | --- |
| DashboardAppShell with collapsible sidebar | ✅ Works | 260px → 88px animated |
| Nav sections: Workspace / Finance / Account | ✅ Done | |
| AddArtisanJobModal | ✅ Works | 10 inputs, client invite, related job/quote, creates job |
| PortfolioProjectModal | ✅ Works | Detail + edit + create modes, saves to list |
| AddSkillModal | ✅ Works | Category + evidence note, adds to specializations |
| UpdatePaymentMethodModal | ✅ Works locally | Form-only, no backend mutation |
| CustomerPortfolioPreviewModal | ✅ Works | Read-only portfolio preview |
| QuoteWorkflowBuilder | ✅ Works | Line items, categories, deposit, sub-items, submit updates job |
| DashboardMessagesPane | ✅ Works | Full message UX with send/attach/quote |

### Client components
| Component | Route | Status | Notes |
| --- | --- | --- | --- |
| ClientDashboardCoreSection | `/client/*` | ✅ Wired | All pages now render source client dashboard |
| Client nav sections: Discover / Work | Sidebar | ✅ Done | |
| Client overview | `/client/dashboard` | ✅ Works | Stats, quick actions |
| Find Artisans view | `/client/find` | ✅ Works | ArtisanPreviewCard grid, category filter |
| Saved artisans | `/client/saved` | ✅ Works | Saved cards grid |
| Client jobs list | `/client/jobs` | ✅ Works | Status tabs, row click → quick detail |
| Client job detail | Client job-detail view | ✅ Works | Status, quote card, message link |
| Client messages | `/client/messages` | ✅ Works | Same DashboardMessagesPane with client role |
| Client reviews | `/client/reviews` | ✅ Works | Leave review form, review list, star ratings |

---

## Priority gap matrix for next sprint

### P0 — Cross-system correctness blockers
| Gap | Affects flow | Fix |
| --- | --- | --- |
| `/invite/demo-token` page missing | Flow 1 | Create page routing to `AuthPreviewSection` with invite token |
| Admin verification approval doesn't update artisan.isVerified across sessions | Flow 4 | Add shared prototype state (context/localStorage bridge) or DB backend |
| OTP step in source preview never advances | Flow 2 | Not critical — real Clerk handles it; prototype note only |
| Client-side quote accept doesn't auto-update artisan job status across sessions | Flow 7 | Backend or shared session state |

### P1 — Prototype flow completeness
| Gap | Affects flow | Fix |
| --- | --- | --- |
| Location tab and notifications tab: uncontrolled inputs (changes not persisted locally) | Flow 3 | Convert to controlled inputs + localStorage save |
| Messages thread history clears on nav away | Flow 6 | Lift `sentMessages` state up to artisan section so it persists across views |
| No verified-only or availability filter in browse | Flow 5 | Add filter chips to BrowseDirectorySection |
| Quote not transmitted to client (local-only) | Flow 7 | Add shared thread state or stub API |
| Admin invite send not triggering email | Flow 1 | Backend / email service |

### P2 — Artisan settings completeness
| Gap | Fix |
| --- | --- |
| Profile completion% doesn't include location/verification state | Add location coordinates check + verification approval check to `profileCompletionPct` formula |
| Profile banner auto-dismissal after 100% | Already conditional on `profileCompletionPct < 100` — just needs real inputs |
| Verification tab: "Upload" button doesn't open file picker | Add file input with local preview |

### P3 — Admin flow gaps
| Gap | Fix |
| --- | --- |
| Verification approval doesn't set artisan to "Verified" in artisans list | Add shared artisan verification state between admin views |
| Artisan visibility toggle (admin artisans view) doesn't update browse directory | Shared state or DB |
| All 12 admin detail page actions are staged only | DB backend in next sprint |

### P4 — Client audit (same session as next artisan sprint)
| Gap | Fix |
| --- | --- |
| Client settings view is source overview (no source client settings) | Source has settings in client section — audit separately |
| Client job creation flow (hire from public profile → job appears in client jobs) | Wire public profile "Hire" → client job creation |
| Client map/analytics/help pages fall back to overview | Not source routes — mark as stub or create placeholder views |
