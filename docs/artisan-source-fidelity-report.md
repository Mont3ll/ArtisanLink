# Artisan Source Fidelity Report

Source of truth: `/home/mel/Downloads/labs/chapaworks.tsx`
Current source bridge: `components/dashboard2/admin/source-admin-preview.tsx`

## Result

Artisan dashboard pages now render through the source-derived preview component to match the source `ArtisanDashboardCoreSection` at visual fidelity.

## Routes mapped

| Route | Source route/view |
| --- | --- |
| `/artisan/dashboard` | `/artisan/dashboard` → overview |
| `/artisan/jobs` | `/artisan/jobs` → jobs |
| `/artisan/messages` | `/artisan/messages` → messages |
| `/artisan/portfolio` | `/artisan/portfolio` → portfolio |
| `/artisan/earnings` | `/artisan/earnings` → earnings |
| `/artisan/subscription` | `/artisan/subscription` → subscription |
| `/artisan/settings` | `/artisan/settings` → settings |

Existing route-group pages were also mapped:

| Existing route | Source route/view |
| --- | --- |
| `/artisan-dashboard` | `/artisan/dashboard` |
| `/artisan-dashboard/jobs` | `/artisan/jobs` |
| `/artisan-dashboard/messages` | `/artisan/messages` |
| `/artisan-dashboard/portfolio` | `/artisan/portfolio` |
| `/artisan-dashboard/earnings` | `/artisan/earnings` |
| `/artisan-dashboard/subscription` | `/artisan/subscription` |
| `/artisan-dashboard/settings` | `/artisan/settings` |
| `/artisan-dashboard/analytics` | closest source overview |
| `/artisan-dashboard/payments` | closest source earnings |
| `/artisan-dashboard/reviews` | closest source overview |
| `/artisan-dashboard/help` | closest source settings |

Dynamic existing artisan-dashboard pages map to the closest source list view:

- `/artisan-dashboard/jobs/[id]` → source jobs view
- `/artisan-dashboard/messages/[id]` → source messages view
- `/artisan-dashboard/portfolio/[id]` → source portfolio view
- `/artisan-dashboard/portfolio/[id]/edit` → source portfolio view
- `/artisan-dashboard/portfolio/new` → source portfolio view

## Caveat

The source includes internal `job-detail` and `earning-detail` states, but it does not expose separate source routes for those states. Existing dynamic routes therefore map to the closest source list view unless/until we add explicit route controls for internal source detail state.
