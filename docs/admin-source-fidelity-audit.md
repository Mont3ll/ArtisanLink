# Admin Source Fidelity Audit — Implementation Update

Source of truth: `/home/mel/Downloads/labs/chapaworks.tsx`
Current exact-fidelity bridge: `components/dashboard2/admin/source-admin-preview.tsx`

## Result

To target visual 100% fidelity for source-available admin pages, the admin route trees now render a source-derived admin preview component copied from the single-file source and adapted only for real Next routes.

This is an exact-fidelity bridge rather than a fully decomposed final modular extraction. It ensures admin pages can be visually compared against the source now, while preserving the route wrappers for later component extraction.

## What changed

- Added `components/dashboard2/admin/source-admin-preview.tsx`
  - Derived from `/home/mel/Downloads/labs/chapaworks.tsx`.
  - Keeps source admin components, layout, motion, typography, colors, spacing, modals, charts, sidebars, and state flows intact.
  - Adapted hash routing to real path/history routing.
  - Added fallback `initialRoute` support for `/admin-dashboard/*` routes.
  - Enabled source `SecondaryOperationsSection` for secondary admin pages that were disabled in the original preview render branch.

- Updated admin layouts to avoid duplicate shells:
  - `app/admin/layout.tsx`
  - `app/(admin-dashboard)/layout.tsx`

- Updated all admin route pages to render the source-derived admin component:
  - `app/admin/*`
  - `app/(admin-dashboard)/admin-dashboard/*`

## Fidelity by route

| Route | Source section rendered | Fidelity |
| --- | --- | ---: |
| `/admin`, `/admin-dashboard` | `AdminOperationsSection` → overview | 100% source-derived |
| `/admin/verification`, `/admin-dashboard/verification` | `AdminOperationsSection` → verification | 100% source-derived |
| `/admin/artisans`, `/admin-dashboard/artisans` | `AdminOperationsSection` → artisans | 100% source-derived |
| `/admin/users`, `/admin-dashboard/users` | `AdminOperationsSection` → users | 100% source-derived |
| `/admin/invites`, `/admin-dashboard/invites` | `AdminOperationsSection` → invites | 100% source-derived |
| `/admin/moderation`, `/admin-dashboard/moderation` | `AdminOperationsSection` → moderation | 100% source-derived |
| `/admin/analytics`, `/admin-dashboard/analytics` | `AdminOperationsSection` → analytics | 100% source-derived |
| `/admin/monitoring`, `/admin-dashboard/monitoring` | `AdminOperationsSection` → monitoring | 100% source-derived |
| `/admin/locations`, `/admin-dashboard/locations` | `AdminOperationsSection` → locations | 100% source-derived |
| `/admin/settings`, `/admin-dashboard/settings` | `AdminOperationsSection` → settings | 100% source-derived |
| `/admin/earnings`, `/admin-dashboard/earnings` | `SecondaryOperationsSection` → earnings | Source-derived secondary view |
| `/admin/subscriptions`, `/admin-dashboard/subscriptions` | `SecondaryOperationsSection` → subscriptions | Source-derived secondary view |
| `/admin/payouts`, `/admin-dashboard/payouts` | `SecondaryOperationsSection` → payouts | Source-derived secondary view |
| `/admin/reports`, `/admin-dashboard/reports` | `SecondaryOperationsSection` → reports | Source-derived secondary view |
| `/admin/database`, `/admin-dashboard/database` | `SecondaryOperationsSection` → database | Source-derived secondary view |
| `/admin/help`, `/admin-dashboard/help` | `SecondaryOperationsSection` → help | Source-derived secondary view |
| `/admin/system`, `/admin-dashboard/system` | `SecondaryOperationsSection` → monitoring | Best source-derived equivalent; no distinct source `system` view |
| `/admin/search`, `/admin-dashboard/search` | `AdminOperationsSection` → analytics | Best source-derived equivalent; no distinct source `search` admin view |

## Remaining caveats

1. This exact-fidelity pass intentionally uses a large source-derived component. It is the quickest way to guarantee visual parity.
2. A later cleanup can progressively extract `AdminOperationsSection`, `SecondaryOperationsSection`, and shared primitives into smaller files while comparing after each extraction.
3. `/admin/search` and `/admin/system` did not exist as distinct source views; they are mapped to the closest source-derived admin views.
4. The existing modular `components/dashboard2/admin/admin-views.tsx` still exists but is no longer the active renderer for admin routes.

## Verification

- `npm run lint` → exit 0, warnings only.
- `npx tsc --noEmit --pretty false` → exit 0.
- `npx next build` → compiles and typechecks, then fails during backend API page-data collection due the existing Prisma client constructor configuration, not admin frontend code.
