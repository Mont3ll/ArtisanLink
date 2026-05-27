# Artisan Dashboard — Prototype Completeness Audit

**Source of truth**: `/home/mel/Downloads/labs/chapaworks.tsx`  
**Bridge component**: `components/dashboard2/admin/source-admin-preview.tsx`  
**Route shell**: `SourceAdminPreview` with `initialRoute="/artisan/*"`  
**Date**: 2026-05-26

---

## Summary verdict

The artisan dashboard has **100% source fidelity at the line level** — every view block and modal component is an exact copy of the source. However the prototype has significant **functional gaps** when tested as a working product, and several important views are **unreachable via navigation** due to being internal state-driven sub-views with no nav link. The client dashboard exists in source but is not yet ported to routes at all.

---

## Route coverage

| Next.js route | Source initial route | Status |
| --- | --- | --- |
| `/artisan/dashboard` or `/artisan-dashboard` | `/artisan/dashboard` | ✅ Renders artisan overview |
| `/artisan/jobs` | `/artisan/jobs` | ✅ Renders jobs list |
| `/artisan/messages` | `/artisan/messages` | ✅ Renders full message threads |
| `/artisan/portfolio` | `/artisan/portfolio` | ✅ Renders portfolio grid |
| `/artisan/earnings` | `/artisan/earnings` | ✅ Renders earnings list |
| `/artisan/subscription` | `/artisan/subscription` | ✅ Renders subscription plan page |
| `/artisan/settings` | `/artisan/settings` | ✅ Renders settings with tabs |
| `/artisan/analytics` | fallback to `/artisan/dashboard` | ⚠️ No source route for analytics; renders overview |
| `/artisan/payments` | fallback | ⚠️ Not a source route; renders overview |
| `/artisan/reviews` | fallback | ⚠️ Not a source route; renders overview |
| `/artisan/help` | fallback | ⚠️ Not a source route; renders overview |

---

## View completeness: source vs bridge

All views match at 100% line-for-line fidelity.

| View | Source lines | Bridge lines | Fidelity | Reachable via nav |
| --- | ---: | ---: | ---: | --- |
| overview | 601 | 601 | 100% | ✅ |
| jobs | 151 | 151 | 100% | ✅ |
| job-detail | 204 | 204 | 100% | ⚠️ internal only (row click) |
| messages | 11+580 (pane) | 11+580 | 100% | ✅ |
| portfolio | 139 | 139 | 100% | ✅ |
| earnings | 137 | 137 | 100% | ✅ |
| earning-detail | 178 | 178 | 100% | ⚠️ internal only (row click) |
| subscription | 242 | 242 | 100% | ✅ |
| settings | 895 | 895 | 100% | ✅ |
| analytics | 547 | 547 | 100% | ❌ no nav link |
| reviews | 1092 | 1092 | 100% | ❌ no nav link |
| saved | 36 | 36 | 100% | ❌ no nav link |
| find | 35 | 35 | 100% | ❌ no nav link |
| artisans | 179 | 179 | 100% | ❌ no nav link |
| invites | 330 | 330 | 100% | ❌ no nav link |
| verification | 239 | 239 | 100% | ❌ no nav link (settings/verification tab absent too) |
| moderation | 172 | 172 | 100% | ❌ no nav link |
| monitoring | 187 | 187 | 100% | ❌ no nav link |
| locations | 200 | 200 | 100% | ❌ no nav link |
| users | 144 | 144 | 100% | ❌ no nav link |

**Note**: `analytics`, `reviews`, `saved`, `find`, `artisans`, `invites`, `locations`, `monitoring`, `moderation`, `users`, `verification` views are present in the artisan section because the source file shares the component tree with admin/client; they are effectively dead branches for the artisan persona and will never be reached unless wired.

---

## Modal completeness

All 7 modal/overlay components are 100% line-for-line copies of the source.

| Modal | Source lines | Bridge lines | Fidelity | Trigger wired | Functional |
| --- | ---: | ---: | ---: | --- | --- |
| `QuickDetailSlideover` | 144 | 144 | 100% | ✅ job row click, earnings row click | ✅ read-only slideover works |
| `AddArtisanJobModal` | 430 | 430 | 100% | ✅ "Add job" button in jobs view | ✅ form + create wired |
| `PortfolioProjectModal` | 364 | 364 | 100% | ✅ portfolio card click, edit button | ✅ detail + edit + save wired |
| `AddSkillModal` | 171 | 171 | 100% | ✅ settings/specializations tab | ✅ skill list + add wired |
| `UpdatePaymentMethodModal` | 143 | 143 | 100% | ✅ settings/profile pay button | ⚠️ form only, no real mutation |
| `CustomerPortfolioPreviewModal` | 118 | 118 | 100% | ✅ portfolio preview button | ✅ read-only preview works |
| `ConversationQuoteCard` | local impl | local impl | source-derived | ✅ messages pane | ✅ accept/reject/revision wired |
| `QuoteWorkflowBuilder` | 924 | 924 | 100% | ✅ job-detail quote tab | ✅ line-item builder functional |
| `FullDetailViewModal` | 768 | 768 | 100% | ❌ artisan-side not wired | ❌ not triggered from artisan views |
| `DashboardMessagesPane` | 580 | 580 | 100% | ✅ messages view | ✅ quote composer, attachments work |

---

## Settings tabs completeness

5 tabs defined (`profile`, `specializations`, `location`, `verification`, `notifications`), only 2 rendered in both source and bridge.

| Tab | In source | In bridge | Status |
| --- | --- | --- | --- |
| profile | ✅ rendered | ✅ rendered | ✅ 4 inputs, save button |
| specializations | ✅ rendered | ✅ rendered | ✅ skill list, add skill modal |
| location | ❌ not in source | ❌ not in bridge | ❌ tab defined but no content — shows empty |
| verification | ❌ not in source | ❌ not in bridge | ❌ tab defined but no content — shows empty |
| notifications | ❌ not in source | ❌ not in bridge | ❌ tab defined but no content — shows empty |

---

## Functional gap analysis

### Overview page
- ✅ Stats cards (pending/quoted/active/earnings)
- ✅ Verification pending banner with dismiss
- ✅ Profile completion banner with progress bar
- ✅ Job pipeline quick-action cards
- ✅ Navigate to jobs/messages/portfolio from overview
- ⚠️ Completion % is hardcoded at 82 — not computed from real profile state
- ⚠️ Verification status is hardcoded — not from DB

### Jobs page
- ✅ Stat cards update dynamically as job statuses change
- ✅ Tab filter (all/requested/quoted/active)
- ✅ DashboardDataList with search and row click
- ✅ Quick detail slideover from row click
- ✅ Job status change (mark active, mark complete) propagates to earnings
- ✅ Add job modal opens and creates a job in-memory
- ✅ Job navigates to job-detail (internal)
- ⚠️ Bulk actions (select/export/assign) — UI only, not functional
- ⚠️ No pagination — all jobs in memory

### Job detail (internal view)
- ✅ Status chip, job metadata
- ✅ Tab between "Job overview" and "Quote workflow"
- ✅ QuoteWorkflowBuilder — full itemized quote with categories, line items, deposit, totals
- ✅ Quote submission and revision flow
- ✅ Status action buttons (start job, complete job)
- ⚠️ Client contact info is static placeholder
- ⚠️ No back button to jobs list that feels natural
- ⚠️ Quote submission doesn't send to client (no backend)

### Messages page
- ✅ Conversation thread list with unread indicators
- ✅ Full message pane with attachments UI
- ✅ Quote composer panel (generate quote in conversation)
- ✅ Quote card with accept/reject/revision states
- ✅ "Start job" from accepted quote creates job in jobs list
- ⚠️ Only static message bubbles — no real send/receive
- ⚠️ Attachments are in-memory only
- ⚠️ 14 unread badge is hardcoded

### Portfolio page
- ✅ Project grid with stat cards
- ✅ Project card click opens PortfolioProjectModal (detail view)
- ✅ Edit button in modal opens edit view
- ✅ Save persists to in-memory portfolio list
- ✅ "New project" button opens create flow
- ✅ Customer preview button opens CustomerPortfolioPreviewModal
- ⚠️ Images are gradient placeholder — no actual image upload
- ⚠️ No image upload control in edit form (missing from source too)
- ⚠️ Draft/published status — no real publish action

### Earnings page
- ✅ Stat strip (total, commission, net, paid count)
- ✅ Earnings row list with search
- ✅ Row click opens QuickDetailSlideover
- ✅ Row double-click navigates to earning-detail (internal)
- ⚠️ Payout request button — UI only, no provider trigger
- ⚠️ Export button — no real export

### Earning detail (internal view)
- ✅ Full earnings breakdown with commission, net, status
- ✅ Back navigation to earnings list
- ✅ Mark as paid (status update in-memory)
- ⚠️ Finance note / payout button not wired

### Subscription page
- ✅ Current plan display (Premium Artisan)
- ✅ Plan features list
- ✅ Manage plan button → opens UpdatePaymentMethodModal
- ✅ Downgrade button (UI only)
- ⚠️ Plan is hardcoded — not loaded from DB
- ⚠️ Payment method modal fields are local state only

### Settings page (profile + specializations tabs only)
- ✅ Tab navigation (profile, specializations visible)
- ✅ Profile tab: name, bio, rate, phone inputs with save button
- ✅ Specializations tab: skill chips, add skill modal, remove skill
- ❌ Location tab: defined but empty
- ❌ Verification tab: defined but empty (critical for prototype — artisan can't view their verification status)
- ❌ Notifications tab: defined but empty

---

## Client dashboard status

The source contains a complete `ClientDashboardCoreSection` with:
- views: overview, find, saved, jobs, job-detail, messages, reviews
- modals: QuickDetailSlideover, PortfolioProjectModal, CustomerPortfolioPreviewModal

**No client dashboard routes exist in the Next.js app.** `/client/*` and `/client-dashboard/*` are completely missing.

---

## Sprint 2 — completed items

| Item | Status |
| --- | --- |
| Reviews added to artisan nav (Workspace section) | ✅ Done |
| Artisan nav sections: Workspace / Finance / Account | ✅ Done |
| `/artisan/reviews` route wired to reviews view | ✅ Done |
| Portfolio badge reactive to real portfolio row count | ✅ Done |
| Messages badge dynamic (active job count instead of hardcoded 14) | ✅ Done |
| Profile completion % computed from real portfolio/jobs/earnings state | ✅ Done |
| Verification banner persistent dismiss via localStorage | ✅ Done |
| Profile tab save button + toast | ✅ Done |
| Job detail breadcrumb back-nav to jobs list | ✅ Done |
| Earning detail breadcrumb back-nav to earnings list | ✅ Done |
| Messages send adds bubble to visible thread (sentMessages) | ✅ Done |
| QuoteWorkflowBuilder submit updates job.quote + sets status QUOTED | ✅ Done |

## Still open (P2/P3/P4/P5)

- Settings location/notifications tabs: content exists in source, rendering was confirmed — these are available but UI is static inputs (P2 — persist with local state)
- Specializations existing skills from fixture (P2)
- Client dashboard routes (P4 — `/client/*` and `/client-dashboard/*`)
- Image upload placeholder in portfolio edit (P1 — source also lacks this)
- Earning detail payout staged button (P1)

### P0 — Prototype blockers (can't test primary flows)
- [ ] Settings → Verification tab: render verification status, submitted documents, and pending/approved state so artisan can see what admin is reviewing
- [ ] Settings → Location tab: render location picker/map so artisan can set their service area
- [ ] Add artisan nav sections: **Workspace** (Overview, Jobs, Messages, Portfolio), **Finance** (Earnings, Subscription), **Account** (Settings)

### P1 — Core flow gaps
- [ ] Job detail: add "Back to jobs" nav that feels natural (breadcrumb or sidebar stays active)
- [ ] Earning detail: wire "Request payout" to staged UI with note and confirmation
- [ ] Messages: "Send" button should add the message to the conversation thread visibly (local state)
- [ ] Portfolio: add image placeholder upload control so edit form doesn't feel broken

### P2 — Settings completeness
- [ ] Settings → Notifications tab: render notification preference toggles (can be local state)
- [ ] Settings → Profile: save confirmation/toast after saving
- [ ] Settings → Specializations: show existing skills from artisan profile fixture

### P3 — Data realism
- [ ] Profile completion % should be computed from actual profile field state
- [ ] Verification banner should be dismissible persistently (localStorage)
- [ ] Unread message count badge (currently 14 hardcoded) should count real unread items

### P4 — Client dashboard
- [ ] Create `/client/*` and `/client-dashboard/*` routes wired to `ClientDashboardCoreSection`
- [ ] Client nav: Find artisans, Saved, Jobs, Messages, Reviews
- [ ] Wire client routes to `SourceAdminPreview` with `initialRoute="/client/*"`

### P5 — Polish
- [ ] Artisan sidebar: add nav sections (Workspace / Finance / Account) matching admin sections pattern
- [ ] Subscription: show real plan features from fixture data instead of hardcoded labels
- [ ] Portfolio: show real project count badge in sidebar nav item
- [ ] Job detail: QuoteWorkflowBuilder submission should update the job's quote field in the jobs list

---

## What works well as a prototype today

- Full job lifecycle: request → quote → active → complete → earning row created ✅
- Conversation quote flow: send quote → accept/reject/revision → start job from quote ✅
- Portfolio CRUD: create/edit/save/preview all work in-memory ✅
- Skill management: add skill modal with category/tag flow ✅
- Sidebar collapse/expand with animated grid ✅
- View transitions via `document.startViewTransition` ✅
- Stats cards update reactively as jobs change state ✅
- All 7 source modals present and correctly triggered ✅
