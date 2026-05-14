# ChapaWorks Rebranding + Feature Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebrand from ArtisanLink to ChapaWorks, disable client-artisan online payments (cash only for jobs), add public artisan browsing, add admin invite system, and fix known errors for user testing readiness.

**Architecture:** Sequential execution — rename first (touches everything), then independent features (cash payments, public listings, invite system) can be done in sequence, error fixes last.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma 7, Clerk auth, Tailwind CSS 4, shadcn/ui

---

## Task 1: Rename ArtisanLink → ChapaWorks

### Files to Modify:
- `package.json`
- `app/layout.tsx`
- `lib/email.ts`
- `lib/hooks/use-admin-settings.ts`
- `lib/hooks/use-artisan-payments.ts`
- `lib/mpesa/b2c.ts`
- `proxy.ts` (cookie name)
- `components/landing/header.tsx`
- `components/landing/footer.tsx`
- `components/landing/hero.tsx`
- `components/landing/faq.tsx`
- `components/landing/testimonials.tsx`
- `components/dashboard/admin/admin-sidebar.tsx`
- `components/dashboard/admin/admin-dashboard-header.tsx`
- `components/dashboard/client/client-sidebar.tsx`
- `components/dashboard/artisan/artisan-sidebar.tsx`
- `prisma/seed/01-users.ts`
- `lib/env.ts` (if referencing brand)
- Various comment-only files (lib/*.ts headers, docs, e2e tests)

## Task 2: Disable Online Job Payments (Cash Only)

### Files to Modify:
- `app/api/payments/job/initiate/route.ts` — Return 503 disabled
- `app/api/payments/job/callback/route.ts` — Return 503 disabled
- `app/api/payments/b2c/result/route.ts` — Return 503 disabled
- `app/api/payments/b2c/timeout/route.ts` — Return 503 disabled
- `app/api/cron/process-payouts/route.ts` — Return 503 disabled
- `lib/hooks/use-job-payments.ts` — Update to cash-only mode
- `app/(client-dashboard)/client-dashboard/jobs/[id]/page.tsx` — Replace payment UI with cash notice

## Task 3: Public Artisan Listings

### Files to Create/Modify:
- `app/artisans/page.tsx` — Public listing page
- `app/artisans/[id]/page.tsx` — Public artisan profile page
- `proxy.ts` — Allow /artisans routes without auth
- `components/landing/header.tsx` — Add "Browse Artisans" nav link

## Task 4: Admin Invite System

### Files to Create/Modify:
- `prisma/schema.prisma` — Add ArtisanInvite model
- `app/api/admin/invites/route.ts` — CRUD API
- `app/api/admin/invites/[token]/route.ts` — Validate token
- `lib/email.ts` — Add sendInviteEmail function
- `components/dashboard/admin/invite-artisans.tsx` — Admin UI panel
- `app/(admin-dashboard)/admin-dashboard/artisans/page.tsx` — Add invite section

## Task 5: Fix Known Errors

- TypeScript compilation errors
- Test suite failures
- Auth flow issues
- Route protection issues
