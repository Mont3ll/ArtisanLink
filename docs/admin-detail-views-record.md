# Admin Detail Views and Full Detail Page Record

Source of truth: `/home/mel/Downloads/labs/chapaworks.tsx`
Current source bridge: `components/dashboard2/admin/source-admin-preview.tsx`
Detail page component: `components/dashboard2/admin/admin-detail-pages.tsx`

## Answer: are the modals reused?

Yes. The source uses **one reused `FullDetailViewModal`** for multiple record types. It attempts to switch content using a derived `detailKind`, but the shell still contains common review/document/decision UI. That is why review-like elements can appear even when the entity is not a verification review.

This is source behavior, but it is not ideal production UX. To correct that while preserving row-click quick details, full detail actions now route to type-specific full detail pages.

## Interaction model now targeted

- Row/list click: quick `QuickDetailSlideover` remains the lightweight preview.
- Explicit `View` / `Inspect` / quick-detail primary action: routes to a full detail page where a full page is warranted.
- Modal-only records remain modal/quick-detail style unless production complexity justifies a page.

## Full detail pages added

| Route | Kind | Whole page or modal? | Reason |
| --- | --- | --- | --- |
| `/admin/verification/[id]` | Verification | Whole page | Evidence review, documents, checklist, decision note, audit history. |
| `/admin/artisans/[id]` | Artisan | Whole page | Profile, verification, portfolio, marketplace performance, moderation state. |
| `/admin/users/[id]` | User | Whole page | Account controls, role records, jobs/messages/reports, restrictions. |
| `/admin/moderation/[id]` | Moderation | Whole page | Evidence, enforcement decisions, safety audit. |
| `/admin/monitoring/[service]` | Monitoring | Whole page | Logs, latency, incident state, runbook/actions. |
| `/admin/locations/[id]` | Location | Whole page | Map/index/coverage/supply-density operations. |
| `/admin/payouts/[id]` | Payout | Whole page | Money movement requires finance notes, provider events, reconciliation. |
| `/admin/database/[table]` | Database | Whole page | Table metrics, consistency, migrations, maintenance operations. |
| `/admin/invites/[token]` | Invite | Modal usually sufficient; page added | Token audit/history may need a page. |
| `/admin/subscriptions/[id]` | Subscription | Modal usually sufficient; page added | Plan review can be modal unless billing history is deep. |
| `/admin/reports/[id]` | Report | Modal/download usually sufficient; page added | Useful if report preview/history grows. |
| `/admin/search/[id]` | Search result | Modal/redirect usually sufficient; page added | Usually should route to underlying entity. |

Equivalent `/admin-dashboard/...` detail routes were also added.

## Source bridge routing update

In `source-admin-preview.tsx`:

- `openAdminFullDetail(...)` now tries to route to a matching full detail page based on the record title/subtitle.
- If no matching page kind can be determined, it falls back to the source reused modal.
- Quick slideover remains available for row clicks.
- The quick slideover primary action now uses the same route-aware full detail handler.

## Remaining caveat

The detail pages are production-safe type-specific pages, but not exact source pages because the source did not include routed detail pages. They intentionally avoid the reused review modal problem.
