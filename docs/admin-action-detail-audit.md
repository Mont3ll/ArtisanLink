# Admin Action and Detail Routing Audit

Source bridge inspected: `components/dashboard2/admin/source-admin-preview.tsx`

## Runtime fix

`ConversationQuoteCard` was referenced by the source preview but not defined in `chapaworks.tsx`. A local source-style `ConversationQuoteCard` has been added above `DashboardMessagesPane` so artisan/client messages render without `ReferenceError`.

## Full detail routing fix

The quick slideover primary action previously passed arbitrary quick-detail text to `openAdminFullDetail(...)`. Many quick detail records do not include type words such as `artisan`, `user`, or `verification`, so the route matcher returned `null` and fell back to the reused source modal.

`openAdminFullDetail(...)` now also uses the current admin `view` as routing context:

- verification → `/admin/verification/[slug]`
- artisans → `/admin/artisans/[slug]`
- users → `/admin/users/[slug]`
- invites → `/admin/invites/[slug]`
- moderation → `/admin/moderation/[slug]`
- monitoring → `/admin/monitoring/[slug]`
- locations → `/admin/locations/[slug]`

Analytics/settings still fall back to source modal unless a specific full-page route is warranted.

## Current source action coverage by admin view

| View | Quick detail triggers | Full detail triggers | Row click behavior | Explicit view behavior | Notes |
| --- | ---: | ---: | --- | --- | --- |
| Verification | 1 | 1 | Table row opens quick/detail-like review context through row button patterns | Review button routes to `/admin/verification/[id]` | Needs future exact button audit for approve/request/reject actions. |
| Artisans | 1 | 1 | `onRowClick` opens quick slideover | `onView` routes to `/admin/artisans/[id]` | Correct model. |
| Users | 1 | 1 | `onRowClick` opens quick slideover | `onView` routes to `/admin/users/[id]` | Correct model. |
| Invites | 1 | 0 direct | Invite inspect opens quick slideover | Quick primary now routes to `/admin/invites/[token]` by view context | Add direct token/detail action later if needed. |
| Moderation | 1 | 1 | `onRowClick` opens quick slideover | `onView` routes to `/admin/moderation/[id]` | Correct model. |
| Analytics | 3 | 0 | Insight cards open quick slideover | No full page currently | Modal is sufficient unless analytics drilldown pages are introduced. |
| Monitoring | 1 | 1 | `onRowClick` opens quick slideover | `onView` routes to `/admin/monitoring/[service]` | Correct model. |
| Locations | 2 | 1 | `onRowClick` opens quick slideover | `onView` routes to `/admin/locations/[id]` | Refresh button remains quick detail. |
| Settings | 1 | 1 through quick primary fallback | Settings audit quick detail opens slideover | Quick primary currently routes based on view only if mapped; settings intentionally not mapped | Full settings page detail not currently required. |

## Missing or future functional pages/modals

### Need whole pages

- Verification detail page: created.
- Artisan detail page: created.
- User detail page: created.
- Moderation detail page: created.
- Monitoring/service detail page: created.
- Location detail page: created.
- Payout detail page: created.
- Database/table detail page: created.

### Modal or optional full pages

- Invite token detail: page created, but source mostly uses quick detail. Direct row-level full-detail button can be added later.
- Subscription detail: page created, but modal may be sufficient.
- Report detail: page created, but modal/download may be sufficient.
- Search result detail: page created, but production should usually route to underlying entity.
- Analytics drilldown: currently quick modal only; future pages could be `/admin/analytics/[metric]`.
- Settings audit: currently quick modal only; future pages could be `/admin/settings/[section]`.

## Detail-page system consistency update

The routed detail pages now render inside `SourceAdminPreview` with `adminDetailContent`, so they use the exact same source-derived admin shell as the admin list pages: same sidebar links, same topbar, same dashboard route frame, and same active section behavior. The source admin sidebar is now collapsible with the same 260px → 88px animated grid behavior used by the dashboard sidebar system. The modular `AdminDashboardLayout` wrapper was removed from detail routes because its sidebar had extra links that did not match the source preview admin pages.

The top record card is page-specific by detail kind. Verification, artisan, user, invite, moderation, monitoring, location, payout, subscription, report, database, and search pages each have their own hero label, copy, accent color, and icon surface. The metrics are now compact inline stat tiles under the hero copy instead of a tall right-side column, removing the empty space below the title.

Dashboard route transitions now keep dashboard shells mounted by using stable shell keys for admin, artisan, client, and dashboard routes. Native `document.startViewTransition` is used when available; inside admin, the sidebar/topbar remain mounted while the content region animates between views.

## Button/action implementation status

The full detail pages provide functional frontend flows for every action listed below. Each action opens a type-aware modal, accepts a note or required destructive reason where appropriate, and records a local action timeline event. Export/download actions generate a local CSV. Copy actions write a URL to the clipboard. Open actions navigate to the related workspace/list where applicable.

Implemented frontend action groups:

- Verification: approve, request more information, reject, escalate. The source review modal is wired back into the verification queue: row click still opens quick detail, `Review` opens the document/checklist/decision modal, and quick-detail has a primary `Review verification documents` action while `Open full admin record` still routes to the detail page.
- Artisan: visibility update, portfolio inspection, verification review, moderation history.
- User: message, activity review, restrict/suspend, export audit.
- Invite: resend, revoke, copy token, export batch.
- Moderation: resolve, request context, escalate enforcement, dismiss report.
- Monitoring: open incident, annotate event, assign owner, view runbook.
- Locations: refresh index, update aliases, inspect map, export coverage.
- Payouts: retry payout, cancel payout, mark complete, add finance note.
- Database: refresh stats, inspect indexes, run consistency check, open logs.
- Subscriptions: review plan, retry payment, pause benefits, open artisan.
- Reports: download CSV, regenerate, share report, archive.
- Search: open source record, pin result, export match, audit query.

Remaining backend work: replace local timeline/export/navigation preview behavior with API-backed mutations, immutable audit logs, and real authorization checks.

## Verification note

The source did not include routed full detail pages. The created pages intentionally replace the reused review-heavy modal for full detail flows, while preserving quick row-click slidovers for preview inspection.
