# Production Fidelity Plan — Final Gap Fixes

## Group 1: Critical Regressions (must fix first)
- CR1: QuoteWorkflowBuilder submit regression — refix async handler
- CR2: Client find/saved use real hooks inside source preview

## Group 2: Artisan data wiring
- A1: Overview unread count → `_verifCtx.unreadCount`
- A2: Overview portfolio views → real portfolio count
- A3: Earning-detail related job → real `selectedEarning.id` job
- A4: Subscription → fully use `_subPlanNames` / `_subPlanPrices`

## Group 3: Admin data wiring
- AD1: Invites list → `GET /api/admin/invites` (extend context with `adminInvites`)
- AD2: Overview moderation count → real `effectiveModerationRows.length`
- AD3: Analytics view → `useAdminAnalytics`
- AD4: Monitoring view → `useAdminMonitoring`
- AD5: Locations view → `useAdminLocations`
- AD6: Settings view → minor hardcoded values

## Group 4: SecondaryOps wiring
- S1: Earnings → `useAdminEarnings`
- S2: Payouts → `useAdminPayouts`
- S3: Subscriptions → `useAdminSubscriptions`
- S4: Monitoring (sec) → `useAdminMonitoring`
- S5: Locations (sec) → `useAdminLocations`

## Files touched
- `components/dashboard2/admin/source-admin-preview.tsx` (main)
- `lib/hooks/use-admin-data-adapter.ts` (extend with invites + analytics + monitoring + locations + earnings + payouts + subscriptions)
- `components/dashboard2/context/dashboard-real-data-context.tsx` (add new fields)
- `__tests__/dashboard2/*.test.tsx` (update mocks)
