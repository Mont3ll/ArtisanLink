# Admin Detail Pages — Sprint 2 Functionality Audit

Source: `components/dashboard2/admin/admin-detail-pages.tsx`
Shell: `components/dashboard2/admin/source-admin-preview.tsx`
Date: 2026-05-26

---

## Fixed in this session

| Issue | Fix |
| --- | --- |
| Sidebar nav from detail page didn't navigate away | `selectView` in `AdminOperationsSection` now does `window.location.href` when `detailContent` is mounted, forcing a real Next.js route change |
| Sidebar had no sections | `DashboardNavItem` gained optional `section` prop; sidebar groups items with rendered section labels (Operations, Trust & Safety, System) |
| Modal backdrop didn't cover sidebar/topbar | Detail page action modal now rendered via `createPortal(modal, document.body)` — no longer clipped by Framer Motion transform stacking context |
| Detail page top card had empty space | Stats converted from tall right column to compact inline row under the hero body |
| Review modal was disconnected from verification | `Review` button in verification queue opens `FullDetailViewModal`; quick-detail primary action is now "Review verification documents" |

---

## Current modal/action status by detail kind

### Verification (`/admin/verification/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Approve and verify | Frontend staged — timeline event recorded | No backend mutation, no artisan notification, no real audit write |
| Request more information | Frontend staged | No backend message queued to artisan |
| Reject submission | Frontend staged with required reason | No backend rejection, no user-facing rejection message |
| Escalate review | Frontend staged | No routing to senior-review queue |
| Verification checklist | Renders and works locally | Not persisted per-reviewer or per-record |
| Document preview | Static preview card | No real file viewer, no real uploaded file |

### Artisan (`/admin/artisans/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Update visibility | Frontend staged | No DB update, no search index invalidation |
| Inspect portfolio | Frontend staged as open-workspace | No actual portfolio component opened |
| Review verification | Frontend staged | Doesn't open verification review modal for this artisan |
| Open moderation history | Frontend staged as open-workspace | No moderation history panel |
| Evidence packet items | Static placeholder tiles | Not loaded from DB |

### User (`/admin/users/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Message user | Frontend staged with message field | No inbox/admin message write |
| Review activity | Frontend staged as open-workspace | No activity log panel |
| Restrict account | Frontend staged with required reason | No DB restriction flag, no access revocation |
| Export audit | Downloads local preview CSV | No real audit log export from DB |

### Invite (`/admin/invites/[token]`)
| Action | Status | Gap |
| --- | --- | --- |
| Resend invite | Frontend staged | No email send, no resend counter increment |
| Revoke token | Frontend staged with required reason | No DB token invalidation |
| Copy invite | Copies preview URL to clipboard | URL is preview only, not real invite link |
| Export batch | Downloads local preview CSV | No real batch export |

### Moderation (`/admin/moderation/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Resolve case | Frontend staged | No case state update, no respondent notification |
| Request context | Frontend staged | No context request message queued |
| Escalate enforcement | Frontend staged with required reason | No escalation queue write |
| Dismiss report | Frontend staged with required reason | No dismissal record, no reporter notification |
| Evidence items | Static placeholder | Not loaded from DB |

### Monitoring (`/admin/monitoring/[service]`)
| Action | Status | Gap |
| --- | --- | --- |
| Open incident | Frontend staged | No incident record created, no on-call notification |
| Annotate event | Frontend staged with note and owner fields | No event annotation write |
| Assign owner | Frontend staged with owner field | No ownership assignment write |
| View runbook | Frontend staged as open-workspace | No runbook page/doc linked |
| Service health stats | Static placeholder | Not wired to real health/metrics endpoint |

### Location (`/admin/locations/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Refresh index | Frontend staged (queued) | No search index refresh triggered |
| Update aliases | Frontend staged with aliases field | No alias write to DB |
| Inspect map | Frontend staged as open-workspace | No map component opened |
| Export coverage | Downloads local preview CSV | No real coverage data |

### Payout (`/admin/payouts/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Retry payout | Frontend staged | No provider retry triggered |
| Cancel payout | Frontend staged with required reason | No provider cancellation |
| Mark complete | Frontend staged | No manual completion write |
| Add finance note | Frontend staged | No finance note persisted |
| Payout amount/provider data | Static placeholder | Not loaded from DB |

### Subscription (`/admin/subscriptions/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Review plan | Frontend staged | No plan detail panel |
| Retry payment | Frontend staged | No payment retry triggered |
| Pause benefits | Frontend staged with required reason | No benefits pause write |
| Open artisan | Navigates to artisan detail URL | Uses preview slug, not real artisan ID |

### Report (`/admin/reports/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Download CSV | Downloads local preview CSV with record label | No real report data |
| Regenerate | Frontend staged (queued) | No report regeneration job queued |
| Share report | Frontend staged with recipients field | No share link or email send |
| Archive | Frontend staged with required reason | No archive state write |

### Database (`/admin/database/[table]`)
| Action | Status | Gap |
| --- | --- | --- |
| Refresh stats | Frontend staged (queued) | No ANALYZE/stats refresh |
| Inspect indexes | Frontend staged as open-workspace | No index inspection panel |
| Run consistency check | Frontend staged (queued) | No check triggered |
| Open logs | Frontend staged as open-workspace | No log viewer |
| Table stats | Static placeholder | Not loaded from DB |

### Search (`/admin/search/[id]`)
| Action | Status | Gap |
| --- | --- | --- |
| Open source record | Navigates to backHref list | Should navigate to the matched entity |
| Pin result | Frontend staged | No pinned-result write |
| Export match | Downloads local preview CSV | No real match data |
| Audit query | Frontend staged | No query audit write |

---

## Sprint 2 priorities

### P0 — Correctness blockers
- [ ] Verification approval/rejection must write to DB and notify artisan
- [ ] Account restriction must actually revoke access
- [ ] Payout retry/cancel must call provider API

### P1 — Action fidelity
- [ ] Wire verification review modal checklist state to record in DB
- [ ] Artisan visibility update → update `isVisible`/`isSearchable` flag in DB
- [ ] Moderation case state transitions → DB write + reporter/respondent notification
- [ ] Invite resend → trigger email send, increment resend counter
- [ ] Invite revoke → invalidate token in DB

### P2 — Data loading
- [ ] Load real verification record by ID in verification detail page
- [ ] Load real artisan by ID in artisan detail page (profile, jobs, verification, portfolio counts)
- [ ] Load real user by ID in user detail page (activity, linked records)
- [ ] Load payout by ID (amount, provider status, retry count)
- [ ] Load subscription by ID (plan, renewal, MRR)
- [ ] Load moderation case by ID (evidence, severity, owner)

### P3 — Panel completeness
- [ ] Verification detail: open artisan portfolio panel
- [ ] Artisan detail: open moderation history panel
- [ ] Monitoring detail: link to runbook page/doc
- [ ] Search detail: route to matched entity (artisan/user/job)
- [ ] Location detail: embed map component with coverage overlay
- [ ] Database detail: embed index/table inspector component

### P4 — Export / reporting
- [ ] Replace all local preview CSV exports with real DB-backed exports
- [ ] Report regeneration should queue a background job
- [ ] Audit export should pull real event log by record ID

### P5 — UI polish
- [ ] Verification checklist persists per reviewer session (localStorage or DB)
- [ ] Seeded timeline entries replaced with real DB events once P2 lands
- [ ] Evidence packet items load from real record
- [ ] Toast messages after action staging should have undo/cancel option
