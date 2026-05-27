# ArtisanLink Frontend Redesign — Progress

## Sprint 8 complete (2026-05-27)

### All 8 API integration sprints done

| Sprint | Done |
| --- | --- |
| 1 Auth + identity | ✅ |
| 2 Artisan data | ✅ |
| 3 Messaging | ✅ |
| 4 Admin data | ✅ |
| 5 Client data | ✅ |
| 6 Public pages | ✅ |
| 7 Payments | ✅ |
| 8 Security + QA | ✅ |

**Tests:** 919 passing, 40 test files, 0 TypeScript errors
**Worktree:** .worktrees/frontend-redesign (branch: frontend-redesign)

### Sprint 8 deliverables
- `proxy.ts` updated: /artisan/*, /admin/*, /client/* route trees protected
- Role redirects accept both old (/*-dashboard) and new (/*) route trees
- "Continue as artisan preview" button added to sign-in page
- Cutover checklist: docs/cutover-checklist.md
- Rate limiting applied to 8 sensitive mutation routes (separate commit by parallel worker)
- /invite/demo-token page created (separate commit by parallel worker)

### Next sprint (9): Backend mutation wiring
- Admin verification approve/reject → DB + email
- Portfolio image upload → Cloudinary
- Quote submission full lifecycle
- Client review submission
- Settings persist (location, notifications)

## Sprint 8 Task 1 — Rate Limiting (2026-05-27)

Added rate limiting to 8 sensitive API mutation routes:
- `app/api/admin/verification/process/route.ts` — STRICT (10/min)
- `app/api/admin/invites/route.ts` — STRICT
- `app/api/admin/payouts/[id]/route.ts` — STRICT
- `app/api/artisan/verification/resubmit/route.ts` — STRICT
- `app/api/artisan/jobs/[id]/quote/route.ts` — NORMAL (60/min)
- `app/api/artisan/portfolio/route.ts` — NORMAL
- `app/api/artisan/profile/route.ts` — NORMAL
- `app/api/payments/mpesa/initiate/route.ts` — STRICT

Tests: `__tests__/api/rate-limiting.test.ts` — 8 tests passing
Committed: b88c7aa
