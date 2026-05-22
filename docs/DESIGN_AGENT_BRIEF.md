# ChapaWorks — Page & Data Inventory Report
**For:** Design Agent  
**Purpose:** Full redesign specification — all pages, data contracts, and schema  
**Date:** 2026-05-22  
**Stack:** Next.js 16 (App Router), TypeScript, Prisma 7, PostgreSQL, Clerk Auth, shadcn/ui

---

## Design System Foundation

### Brand Tokens (ChapaWorks / Airbnb-derived)
| Token | Value | Use |
|---|---|---|
| Primary (our "Rausch") | `#047857` (emerald-700) | CTAs, search orb, active states, verified badges, links |
| Primary Hover | `#065f46` (emerald-800) | Press/hover on primary |
| Canvas | `#ffffff` | Default page floor |
| Surface Soft | `#f7f7f7` | Hover backgrounds, filter bands, skeleton fills |
| Surface Strong | `#f2f2f2` | Card fills, skeleton states |
| Ink | `#222222` | Headlines, nav labels, strong text |
| Body | `#3f3f3f` | Running body copy |
| Muted | `#6a6a6a` | Captions, secondary labels |
| Muted Soft | `#929292` | Placeholders, disabled text |
| Hairline | `#dddddd` | Borders, dividers, search bar segments |
| Hairline Soft | `#ebebeb` | Subtle separators |
| Destructive | `#c13515` | Error text, rejection actions |

### Typography (Geist Sans — Inter equivalent)
| Role | Size | Weight | Use |
|---|---|---|---|
| Display XL | 28px | 600 | Page headlines |
| Display LG | 22px | 500 | Section headings |
| Title MD | 16px | 600 | Card titles, nav labels |
| Body MD | 16px | 400 | Running text |
| Body SM | 14px | 400 | Card meta, prices, dates |
| Caption | 14px | 500 | Search segment labels (uppercase) |
| Caption SM | 13px | 400 | Footer legal |
| Badge | 11px | 600 | Floating badges |
| Serif Accent | font-serif 600 | — | Logo wordmark, section headings on public pages |

### Shape & Elevation
- **Buttons:** `border-radius: 8px` (rounded-lg)
- **Cards:** `border-radius: 12px` (rounded-xl)
- **Pills / Search / Tags:** `border-radius: 9999px` (rounded-full)
- **Single shadow tier:** `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.10) 0 4px 8px`
- **Flat:** 95% of all surfaces — no shadow at rest

### Breakpoints
| Name | Width | Notes |
|---|---|---|
| Mobile | < 744px | Single column, hamburger nav, collapsed pill |
| Tablet | 744–1128px | 2-col cards, side-by-side content |
| Desktop | 1128–1440px | 4-col cards, full nav |
| Wide | > 1440px | Max-width 1440px, gutters absorb |

---

## Navigation Components (Shared)

### PublicNav (`components/layout/public-nav.tsx`)
Used on: `/`, `/artisans`, `/artisans/[id]`, `/pricing`, `/for-artisans`, `/sign-in`, `/sign-up`
- **Left:** Logo (tesseract SVG + "ChapaWorks" serif wordmark)
- **Center:** Browse Artisans | Pricing | For Artisans
- **Right:** Sign In (text) + Get Started (pill button) — or Dashboard (when signed in)
- **Mobile:** Hamburger → full-width sheet with same links
- **Behaviour:** Sticky top-0, white background, single bottom hairline on scroll

### ArtisansBrowseHeader (special case on `/artisans`)
Single `StickySearchPill` component that morphs from 64px segmented form → 44px compact pill as it scrolls into the nav zone via IntersectionObserver + CSS transitions.

---

## Public Pages

---

### P1: Homepage — `/`
**Route:** `app/page.tsx`  
**Auth:** None required (public)  
**Purpose:** Marketplace entry point. Search-first, artisan grid, how-it-works.

#### Data fetched
| Endpoint | Method | Returns |
|---|---|---|
| `/api/search/artisans?limit=8&sortBy=rating&profession=<category>` | GET | Artisan cards for homepage grid |

#### Data Shape: Artisan (Homepage Card)
```typescript
{
  id: string                        // DB user ID
  name: string                      // firstName + lastName
  profession: string | null
  profileImage: string | null       // Cloudinary URL
  portfolioThumbnail: string | null // First public portfolio image
  location: { city: string | null; county: string | null }
  hourlyRate: number | null         // KES
  isAvailable: boolean
  isVerified: boolean               // artisanStatus === VERIFIED
  isPremium: boolean                // active subscription
  rating: { average: number; total: number }
  specializations: Array<{ name: string }>
}
```

#### Page Sections
1. **PublicNav** (sticky)
2. **Hero** — heading + segmented pill search (`What` | `Where` | Search orb)
3. **Category strip** — horizontal scroll tabs: All | Carpenter | Electrician | Plumber | Painter | Mason | Tailor | Welder | Mechanic | Photographer
4. **Artisan Grid** — 4-col desktop, photo-first cards (4:3 aspect ratio)
   - Loading: 8 skeleton cards (same structure)
   - Empty: "Be the first artisan" CTA
5. **How It Works** — 3 steps (Browse, Message+Quote, Hire)
6. **Artisan CTA Band** — "Are you a skilled artisan?" → `/for-artisans`
7. **Footer** — Logo, nav links, copyright

---

### P2: Browse Artisans — `/artisans`
**Route:** `app/artisans/page.tsx`  
**Auth:** None required (public, sign-in encouraged for messaging)  
**Purpose:** Filterable artisan directory with morphing search pill.

#### Data fetched
| Endpoint | Method | Parameters | Returns |
|---|---|---|---|
| `/api/search/artisans` | GET | q, profession, county, sortBy, page, limit | Artisan cards + facets + pagination |

#### Request Parameters
```typescript
{
  q?: string          // Full-text search
  profession?: string // Filter by profession (exact DB value: "Carpenter")
  county?: string     // Filter by county
  sortBy?: "rating" | "reviews" | "rate" | "recent"
  page?: number       // Default 1
  limit?: number      // Default 12, max 50
  available?: "true"  // Filter available only
  lat?: number        // Geospatial
  lng?: number
  radius?: number     // km, default 50
}
```

#### Response Shape
```typescript
{
  artisans: ArtisanCard[]     // Same shape as homepage
  facets: {
    professions: Array<{ name: string; count: number }>
    counties: Array<{ name: string; count: number }>
    specializations: Array<{ name: string; count: number }>
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

#### Page Layout
1. **PublicNav** (unchanged)
2. **Page hero** — "Discover skilled professionals" heading
3. **StickySearchPill** — 3 segments: Profession | County | Sort By + search orb
   - Expanded (64px): All three segments + facet data populates County select
   - Compact (stuck in nav, 44px): Single search input
   - Active filter chips below pill when filters set
4. **Category strip** — same as homepage (drives profession filter)
5. **Results count** + "Sign in to message" nudge
6. **Artisan Grid** — 4-col desktop, same card as homepage
   - Loading: 8 animate-pulse skeletons matching card shape
   - Empty: search refinement CTA
7. **Pagination** — Previous / Page N of M / Next
8. **Sign-up CTA** banner at bottom

---

### P3: Artisan Profile — `/artisans/[id]`
**Route:** `app/artisans/[id]/page.tsx`  
**Auth:** None required (view only; message/save requires sign-in)  
**Purpose:** Full public artisan profile with portfolio and CTAs.

#### Data fetched
| Endpoint | Method | Returns |
|---|---|---|
| `/api/artisans/${id}` | GET | Full artisan profile |

#### Response Shape
```typescript
{
  id: string
  name: string
  profession: string | null
  bio: string | null
  profileImage: string | null
  location: { city: string | null; county: string | null; country: string }
  experience: number | null      // years
  hourlyRate: number | null      // KES
  isAvailable: boolean
  isVerified: boolean
  isPremium: boolean
  website: string | null
  rating: { average: number; total: number }
  specializations: Array<{ name: string; skillLevel: string }>
  portfolio: Array<{
    id: string
    title: string
    description: string | null
    imageUrl: string
    imageUrls: string[]
    category: string | null
    tags: string[]
    completedAt: string | null
  }>
  memberSince: string   // ISO date
}
```

#### Page Layout
1. **PublicNav**
2. **Back link** → /artisans
3. **Profile Header Card** — avatar + name + verified badge + availability + profession + location + hourlyRate + CTA panel (Save / Message → requires sign-in)
4. **Main (2/3 width)**
   - Bio section
   - Portfolio grid (2×3) → lightbox on click (image carousel)
5. **Sidebar (1/3 width)**
   - Skills tags
   - Details (location, website, member since)
   - Hire CTA card (emerald bg → sign-up prompt)
6. **Loading state:** Full structural skeleton matching 2-col layout

---

### P4: Pricing — `/pricing`
**Route:** `app/pricing/page.tsx`  
**Auth:** None required  
**Data fetched:** None (static content)

#### Page Layout
1. **PublicNav**
2. **Hero** — "Simple, transparent pricing"
3. **3-column pricing cards:** Free (clients) | Monthly KES 150 | Annual KES 1,500
4. **Commission explanation** — 10% standard, 5% subscribers
5. **FAQ link** → `/#faq`
6. **Footer**

---

### P5: For Artisans — `/for-artisans`
**Route:** `app/for-artisans/page.tsx`  
**Auth:** None required  
**Data fetched:** None (static marketing content)

#### Page Layout
1. **PublicNav**
2. **Hero** — Headline + stats (15.8K artisans, 127K jobs, KES 2.3B paid)
3. **Benefits grid** — 6 cards
4. **How it works** — 4 numbered steps
5. **Testimonials** — 3 artisan quotes
6. **Pricing section** — Free | KES 150/mo | KES 1,500/yr
7. **Final CTA** — "Create Your Artisan Profile" → `/sign-up?role=artisan`
8. **Footer**

---

## Authentication Pages

---

### A1: Sign Up — `/sign-up`
**Route:** `app/(auth)/sign-up/[[...sign-up]]/page.tsx`  
**Auth:** Unauthenticated only  
**Data fetched:** 
- `GET /api/admin/invites/[token]` — validates invite token if `?invite=TOKEN` in URL

#### URL Parameters
- `?role=artisan` — pre-sets role to artisan (no role selector shown)
- `?invite=TOKEN` — validates invite, forces artisan role, shows invite banner
- Default (no params): client role

#### Page Layout
1. **Minimal nav** — Logo only + "Already have an account? Sign in"
2. **Role badge** — "Signing up as artisan/client"
3. **Headline** — "Join as an Artisan" or "Create Your Account"
4. **White card panel:**
   - Invite banner (if invite token valid)
   - Google OAuth button
   - Divider
   - Email + Password inputs
   - CAPTCHA slot
   - Submit button
5. **Switch role link** — "Are you an artisan?" ↔ "Looking to hire?"
6. **Verification step** — OTP code input (separate step)

---

### A2: Sign In — `/sign-in`
**Route:** `app/(auth)/sign-in/[[...sign-in]]/page.tsx`  
**Auth:** Unauthenticated only  
**Data fetched:** None (Clerk handles auth)

#### Page Layout
1. **Minimal nav** — Logo + "New here? Create account"
2. **"Welcome back"** heading
3. **White card panel:**
   - Google OAuth button
   - Divider
   - Email identifier input
   - Continue button
4. **Steps:** choose-strategy | password | email-code OTP
5. **"Sign up free" link** below card

---

## Artisan Dashboard Pages

All artisan dashboard pages:
- **Route prefix:** `/artisan-dashboard/*`
- **Auth:** Clerk session, role = ARTISAN
- **Layout:** Shadcn sidebar (collapsed offcanvas on mobile) + main content area
- **Sidebar:** TesseractLogo + "ChapaWorks Studio" + nav items

---

### AD1: Artisan Dashboard Home — `/artisan-dashboard`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/artisan/stats?range=30d` | Stats + recent activity |

#### Stats Shape
```typescript
{
  stats: {
    totalProjects: number        // portfolio items in range
    totalReviews: number         // range-filtered reviews
    averageRating: number        // all-time
    unreadMessages: number
    totalConversations: number
    newConversationsThisMonth: number
    subscriptionStatus: "INACTIVE" | "ACTIVE" | "EXPIRED" | "SUSPENDED"
    subscriptionEndDate: string | null
    isVerified: boolean
    isAvailable: boolean
    totalSpecializations: number
  }
  recentActivity: Array<{
    id: string
    type: "message" | "review" | "portfolio" | "conversation"
    title: string
    description: string
    timestamp: string
    icon: string
  }>
  profile: {
    id: string; firstName: string; lastName: string
    profession: string | null; profileImage: string | null
    artisanStatus: string; averageRating: number; totalReviews: number
  }
}
```

#### Banner States
- `artisanStatus === PENDING`: "Verification Pending" amber banner → `/artisan-dashboard/settings?tab=verification`
- `artisanStatus === REJECTED`: "Verification Rejected" red banner → same link
- Profile completion: shows % completion card with missing steps

---

### AD2: Artisan Jobs — `/artisan-dashboard/jobs`
**Data fetched:**
| Endpoint | Parameters | Returns |
|---|---|---|
| `GET /api/artisan/jobs` | status, page, limit | Jobs list + pagination |

#### Job Shape (list)
```typescript
{
  id: string; title: string; description: string
  status: JobStatus   // REQUESTED|QUOTED|ACCEPTED|DEPOSIT_PAID|IN_PROGRESS|COMPLETED|PAID|CANCELLED|DECLINED|DISPUTED
  clientBudget: number | null
  agreedPrice: number | null
  createdAt: string
  client: { id: string; firstName: string; lastName: string; profileImage: string | null }
  conversationId: string | null
  quotes: Array<{ id: string; amount: number; status: QuoteStatus }>
}
```

---

### AD3: Artisan Job Detail — `/artisan-dashboard/jobs/[id]`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/artisan/jobs/${id}` | Full job detail |
| `GET /api/artisan/jobs/${id}/quote` | Quotes for this job |

#### Full Job Shape
```typescript
{
  // All Job fields plus:
  client: { id, firstName, lastName, phone, email, profileImage }
  payments: JobPayment[]
  quotes: Quote[]     // includes QuoteLineItem[]
  conversation: { id: string } | null
  // Computed:
  canCreateQuote: boolean
  canStartJob: boolean
  canCompleteJob: boolean
}
```

---

### AD4: Artisan Messages — `/artisan-dashboard/messages`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/conversations?role=artisan` | Conversation list |
| `GET /api/conversations/unread` | Unread count |

#### Conversation Shape
```typescript
{
  id: string; status: "ACTIVE" | "ARCHIVED" | "BLOCKED"
  subject: string | null
  lastMessageAt: string | null; createdAt: string
  client: { id, firstName, lastName, profileImage }
  lastMessage: { content: string; createdAt: string; senderId: string } | null
  unreadCount: number
  jobCount: number
}
```

---

### AD5: Artisan Message Thread — `/artisan-dashboard/messages/[id]`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/conversations/${id}` | Conversation detail |
| `GET /api/conversations/${id}/messages?limit=50` | Messages |

#### Message Shape
```typescript
{
  id: string; content: string; createdAt: string
  senderId: string; receiverId: string
  status: "SENT" | "DELIVERED" | "READ"
  sender: { firstName, lastName, profileImage }
}
```

---

### AD6: Artisan Portfolio — `/artisan-dashboard/portfolio`
**Data fetched:** `GET /api/artisan/portfolio` → PortfolioItem[]

#### PortfolioItem Shape
```typescript
{
  id: string; title: string; description: string | null
  imageUrl: string; imageUrls: string[]
  category: string | null; tags: string[]
  isPublic: boolean
  completedAt: string | null; duration: string | null
  createdAt: string
}
```

---

### AD7: Artisan Settings — `/artisan-dashboard/settings`
**Tabs:** Profile | Specializations | Location | Verification | Notifications

**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/artisan/profile` | Full profile + specializations + verificationHistory |
| `GET /api/artisan/specializations` | Specializations list |
| `GET /api/user/notification-preferences` | Notification prefs |

#### Profile Shape (settings)
```typescript
{
  // Profile fields: bio, profession, experience, hourlyRate
  // profileImage, coverImage
  // isAvailable, maxConcurrentJobs
  // certificateUrl, idDocumentUrl, idDocumentType
  // artisanStatus, rejectionReason, resubmissionCount
  // averageRating, totalReviews
  // Location: city, county, address, latitude, longitude
  specializations: Specialization[]
  verificationHistory: VerificationHistory[]
  counties: string[]           // All Kenyan counties (static)
  idDocumentTypes: string[]    // NATIONAL_ID | PASSPORT | DRIVING_LICENSE | ALIEN_ID
}
```

---

### AD8: Artisan Subscription — `/artisan-dashboard/subscription`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/artisan/profile` | Profile with subscription |

#### Subscription Shape
```typescript
{
  plan: "MONTHLY" | "ANNUAL"
  status: "INACTIVE" | "ACTIVE" | "EXPIRED" | "SUSPENDED"
  endDate: string | null
  startDate: string | null
}
```
**Plans:** Monthly KES 150 | Annual KES 1,500

---

### AD9: Artisan Analytics — `/artisan-dashboard/analytics`
**Data fetched:** `GET /api/artisan/stats?range=<7d|30d|90d|1y>`

---

### AD10: Artisan Earnings — `/artisan-dashboard/earnings`
**Data fetched:** Uses `useArtisanEarnings` hook → `GET /api/artisan/payments`

#### ArtisanPayout Shape
```typescript
{
  id: string; amount: number; netAmount: number
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
  type: "JOB_PAYMENT" | "REFUND" | "ADJUSTMENT"
  jobTitle: string | null; jobId: string | null
  createdAt: string; processedAt: string | null
  retryCount: number; failureReason: string | null
  mpesaTransactionId: string | null
}
```
**Note:** Cash-only mode active during testing. Payouts not processed.

---

### AD11: Artisan Reviews — `/artisan-dashboard/reviews`
**Data fetched:** Uses `useArtisanReviews` hook → profile reviews

---

## Client Dashboard Pages

All client dashboard pages:
- **Route prefix:** `/client-dashboard/*`
- **Auth:** Clerk session, role = CLIENT
- **Layout:** Shadcn sidebar + main content

---

### CD1: Client Dashboard Home — `/client-dashboard`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/client/stats` | Stats summary |

#### Stats Shape
```typescript
{
  totalJobs: number; activeJobs: number; completedJobs: number
  totalReviews: number; totalSavedArtisans: number
  recentActivity: Array<{ type, title, description, timestamp, icon }>
}
```

---

### CD2: Client Find Artisans — `/client-dashboard/find-artisans`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `/api/search/artisans` | Same as public browse |
| `GET /api/client/saved-artisans?limit=3` | Recently saved artisans |
| `GET /api/client/search-history?limit=3` | Recent searches |

---

### CD3: Client Jobs — `/client-dashboard/jobs`
**Data fetched:** `GET /api/client/jobs?status=<filter>&page=N`

#### Job List Shape (client view)
```typescript
{
  id: string; title: string; status: JobStatus
  artisan: { id, firstName, lastName, profession, profileImage, rating }
  createdAt: string; agreedPrice: number | null
  depositPaid: boolean; finalPaid: boolean
  conversationId: string | null
  latestQuote: { amount: number; status: QuoteStatus } | null
}
```

---

### CD4: Client Job Detail — `/client-dashboard/jobs/[id]`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/client/jobs/${id}` | Full job + quotes + payments |

#### Key states driving UI
- `QUOTED` → Accept / Decline quote buttons
- `ACCEPTED` → Cash deposit info card (cash-only mode)
- `COMPLETED` → Cash final payment info card
- **Quote revision flow:** Artisan can revise, client can request revision

---

### CD5: Client Messages & Thread
Same structure as artisan messages but from client perspective.

---

### CD6: Client Saved Artisans — `/client-dashboard/saved`
**Data fetched:** `GET /api/client/saved-artisans?limit=100`

#### SavedArtisan Shape
```typescript
{
  profileId: string
  artisan: {
    userId: string; name: string; profession: string | null
    profileImage: string | null; city: string | null; county: string | null
    averageRating: number; totalReviews: number; isAvailable: boolean
    artisanStatus: string
  }
  savedAt: string
}
```

---

### CD7: Client Analytics — `/client-dashboard/analytics`
**Data fetched:** `GET /api/client/analytics?range=<7d|30d|90d|1y>`

---

### CD8: Client Map — `/client-dashboard/map`
**Data fetched:** `/api/search/artisans` with geospatial params (lat/lng/radius)

---

### CD9: Client Reviews — `/client-dashboard/reviews`
**Data fetched:** Client's submitted reviews via profile

---

### CD10: Client Settings — `/client-dashboard/settings`
**Data fetched:** `GET /api/user/me` + `GET /api/user/notification-preferences`

---

## Admin Dashboard Pages

All admin pages:
- **Route prefix:** `/admin-dashboard/*`
- **Auth:** Clerk session, role = ADMIN
- **Layout:** Shadcn sidebar + main content

---

### ADM1: Admin Dashboard Home — `/admin-dashboard`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/admin/stats` | Platform-wide KPIs |
| `GET /api/admin/tasks` | Pending tasks (verifications, alerts) |
| `GET /api/admin/users` | Latest 5 users |
| `GET /api/admin/system/monitoring` | System health |

#### Stats Shape
```typescript
{
  totalUsers: number; totalArtisans: number; activeSubscriptions: number
  monthlyRevenue: number; pendingVerifications: number
  systemUptime: number; monthlyGrowth: number
}
```

---

### ADM2: Admin Artisans — `/admin-dashboard/artisans`
**Tabs:** All | Verified | Pending | Subscribed | Invites

**Data fetched:**
| Endpoint | Parameters | Returns |
|---|---|---|
| `GET /api/admin/artisans` | status, subscriptionStatus, search, page, limit | Artisans + stats |
| `GET /api/admin/invites` | — | Invite list |

#### AdminArtisan Shape
```typescript
{
  id: string; name: string; email: string; phone: string | null
  profession: string | null; location: string | null
  experience: number; rating: number; totalReviews: number; portfolioItems: number
  status: "PENDING" | "VERIFIED" | "REJECTED"
  isAvailable: boolean; joinDate: string; lastActive: string
  subscriptionStatus: "INACTIVE" | "ACTIVE" | "EXPIRED" | "SUSPENDED"
  subscriptionPlan: "MONTHLY" | "ANNUAL" | null
  subscriptionEndDate: string | null
}
```

#### ArtisanInvite Shape
```typescript
{
  id: string; token: string; email: string; name: string | null
  phone: string | null; message: string | null; invitedBy: string
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  createdAt: string; expiresAt: string; usedAt: string | null
}
```

---

### ADM3: Admin Verification — `/admin-dashboard/verification`
**Data fetched:** `GET /api/admin/verification/pending`

#### PendingArtisan Shape
```typescript
{
  id: string; firstName: string; lastName: string
  email: string; phone: string | null
  profile: {
    profession: string | null; experience: number | null; bio: string | null
    city: string | null; certificateUrl: string | null
    idDocumentUrl: string | null; idDocumentType: string | null
    artisanStatus: "PENDING" | "VERIFIED" | "REJECTED"
    rejectionReason: string | null; resubmissionCount: number
    verificationNotes: string | null
  }
  submittedAt: string
}
```

#### Actions
- **Approve:** `POST /api/admin/verification/process` `{ artisanId, action: "APPROVE", adminNotes? }`
- **Reject:** Opens sub-modal → `POST /api/admin/verification/process` `{ artisanId, action: "REJECT", reason, adminNotes? }`

---

### ADM4: Admin Users — `/admin-dashboard/users`
**Data fetched:**
| Endpoint | Returns |
|---|---|
| `GET /api/admin/users/all` | Paginated user list |
| `GET /api/admin/users/stats` | Role/status counts |

#### User Shape (admin)
```typescript
{
  id: string; clerkId: string; firstName: string; lastName: string
  email: string; phone: string | null; role: "CLIENT" | "ARTISAN" | "ADMIN"
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED"
  createdAt: string; lastLoginAt: string | null
  profile: { city: string | null; profession: string | null; profileImage: string | null } | null
}
```
**Actions:** Suspend → `POST /api/admin/moderation/[id]` `{ action: "suspend" }` | Activate → `{ action: "unsuspend" }`

---

### ADM5: Admin Analytics — `/admin-dashboard/analytics`
**Data fetched:** `GET /api/admin/analytics/overview`

#### Analytics Shape
```typescript
{
  userGrowth: Array<{ role: string; count: number }>
  projectStats: { total: number; completed: number; completionRate: number; avgBudget: number }
  revenueData: Array<{ month: string; revenue: number }>  // last 6 months
  metrics: { totalUsers, totalPortfolioItems, activeSubscriptions, completionRate, averageBudget }
}
```

---

### ADM6: Admin Subscriptions — `/admin-dashboard/subscriptions`
**Data fetched:** `GET /api/admin/subscriptions`

#### Subscription Shape (admin view)
```typescript
{
  id: string; plan: "MONTHLY" | "ANNUAL"; status: SubscriptionStatus
  amount: number; createdAt: string
  profile: {
    user: { id, firstName, lastName, email }
  }
}
```

---

### ADM7: Admin Payouts — `/admin-dashboard/payouts`
**Data fetched:** Uses `useAdminPayouts` hook → `GET /api/admin/payouts`
**Note:** Payouts disabled (cash-only mode). UI shows records only.

---

### ADM8: Admin Earnings — `/admin-dashboard/earnings`
**Data fetched:** `GET /api/admin/earnings`  
Tracks platform commission from completed jobs.

---

### ADM9: Admin Moderation — `/admin-dashboard/moderation`
**Data fetched:** `GET /api/admin/moderation?status=<filter>`  
User reports, content flags, account status actions.

---

### ADM10: Admin Monitoring — `/admin-dashboard/monitoring`
**Data fetched:** `GET /api/admin/system/monitoring`

#### MonitoringData Shape
```typescript
{
  systemHealth: {
    database: { status: string; responseTime: number; connections: number }
    api: { status: string; responseTime: number; requestsPerMinute: number }
    server: { status: string; cpuUsage: number; memoryUsage: number; uptime: number }
  }
  systemLogs: Array<{ id, level, message, timestamp, service }>
  performanceMetrics: Array<{ time, cpu, memory, requests }>
}
```

---

### ADM11: Admin System — `/admin-dashboard/system`
**Data fetched:** `GET /api/admin/system/monitoring` (same as monitoring)

---

### ADM12: Admin Locations — `/admin-dashboard/locations`
**Data fetched:** `GET /api/admin/locations/stats`

---

### ADM13: Admin Reports — `/admin-dashboard/reports`
**Data fetched:** `GET /api/admin/reports/generate` (POST to generate)

---

### ADM14: Admin Search — `/admin-dashboard/search`
**Data fetched:** `GET /api/admin/search?q=<query>&type=<users|artisans|jobs>`

---

### ADM15: Admin Settings — `/admin-dashboard/settings`
**Data fetched:** `GET /api/admin/settings`

#### Settings Shape
```typescript
{
  siteName: string; siteDescription: string
  maxFileUploadSizeMB: number; allowRegistrations: boolean
  maintenanceMode: boolean; platformCommissionRate: number
  emailNotifications: boolean; smsNotifications: boolean
  // ... other config keys
}
```

---

### ADM16: Admin Database — `/admin-dashboard/database`
**Data fetched:** `GET /api/admin/database/stats`

---

### ADM17: Admin Help — `/admin-dashboard/help`
**Data fetched:** None (static reference content)

---

## Database Schema Summary

### Core Models

```
User              id, clerkId, email, firstName, lastName, phone
                  role: CLIENT|ARTISAN|ADMIN
                  status: PENDING|ACTIVE|SUSPENDED|BANNED
                  createdAt, updatedAt, lastLoginAt, emailVerifiedAt

Profile           id, userId (1:1 User)
                  bio, profileImage, coverImage, website
                  latitude, longitude, address, city, county, country
                  profession, experience, hourlyRate, isAvailable
                  artisanStatus: PENDING|VERIFIED|REJECTED
                  maxConcurrentJobs, currentJobCount
                  certificateUrl, idDocumentUrl, idDocumentType
                  rejectionReason, resubmissionCount, verificationNotes
                  averageRating, totalReviews
                  → PortfolioItem[], Specialization[], Subscription?
                     SavedArtisan[], VerificationHistory[]

PortfolioItem     id, profileId, title, description
                  imageUrl, imageUrls[], category, tags[]
                  isPublic, completedAt, duration

Specialization    id, profileId, name, category
                  skillLevel: 1-5, yearsExp

Subscription      id, profileId (1:1)
                  plan: MONTHLY|ANNUAL
                  status: INACTIVE|ACTIVE|EXPIRED|SUSPENDED
                  startDate, endDate
                  → Payment[]

Payment           id, subscriptionId, amount, currency, status
                  mpesaRequestId, mpesaCheckoutId, mpesaTransactionId
                  phoneNumber, paidAt

Conversation      id, clientId, artisanId
                  status: ACTIVE|ARCHIVED|BLOCKED
                  subject, lastMessageAt
                  → Message[], Job[]

Message           id, conversationId, senderId, receiverId
                  content, status: SENT|DELIVERED|READ

Review            id, profileId, clientId
                  rating: 1-5, title, content, isApproved
                  response, respondedAt

SavedArtisan      id, userId, profileId, savedAt

Job               id, clientId, artisanId, conversationId?
                  title, description, category, location
                  status: REQUESTED|QUOTED|ACCEPTED|DEPOSIT_PAID|
                          IN_PROGRESS|COMPLETED|PAID|CANCELLED|DECLINED|DISPUTED
                  clientBudget, agreedPrice, depositAmount (30%)
                  depositPaid, depositPaidAt, finalPaid, finalPaidAt
                  requestedStartDate, scheduledStartDate, completedAt
                  → Quote[], JobPayment[], ArtisanPayout[]

Quote             id, jobId, artisanId
                  amount, description, notes
                  status: PENDING|ACCEPTED|REJECTED|REVISED|EXPIRED
                  estimatedStartDate, estimatedEndDate, estimatedDuration
                  validUntil, materialsIncluded, materialsCost
                  → QuoteLineItem[]

QuoteLineItem     id, quoteId, description, quantity, unitPrice, totalPrice

JobPayment        id, jobId, type: DEPOSIT|FINAL
                  amount, currency, status
                  mpesaRequestId, mpesaCheckoutId, mpesaReceiptNumber
                  phoneNumber, paidAt
                  [NOTE: disabled in testing phase — cash only]

ArtisanPayout     id, artisanId, jobId?
                  amount, netAmount, currency
                  status: PENDING|PROCESSING|COMPLETED|FAILED|CANCELLED
                  type: JOB_PAYMENT|REFUND|ADJUSTMENT
                  mpesaTransactionId, mpesaOriginatorId
                  retryCount, maxRetries, nextRetryAt
                  [NOTE: disabled in testing phase — cash only]

PlatformEarning   id, jobId, artisanId
                  grossAmount, commissionAmount, commissionRate
                  isPromotional, payoutId
                  [NOTE: disabled in testing phase]

ActivityLog       id, adminId, adminEmail, action, targetType, targetId
                  description, metadata

Notification      id, userId, type, title, message
                  isRead, readAt, link, metadata

Setting           id, key, value, description, updatedAt, updatedBy

ArtisanInvite     id, token (unique cuid), email, name?, phone?, message?
                  invitedBy (admin userId), status: PENDING|ACCEPTED|EXPIRED|REVOKED
                  usedAt, usedByUserId, createdAt, expiresAt (7 days)

VerificationHistory  id, profileId, certificateUrl?, idDocumentUrl?
                     idDocumentType?, status, processedBy?, processedAt?
                     rejectionReason?, adminNotes?, submittedAt
```

---

## API Endpoint Inventory

### Public (no auth)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/search/artisans` | Browse artisans with filters/facets/pagination |
| GET | `/api/artisans/[id]` | Public artisan profile |
| GET | `/api/artisans/[id]/reviews` | Public artisan reviews |
| GET | `/api/admin/invites/[token]` | Validate invite token (for sign-up page) |

### Auth — User Sync
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/user/sync` | Sync Clerk user to DB on login |
| GET | `/api/user/me` | Current user basic info |
| PATCH | `/api/user/profile` | Update name/phone |
| GET/PATCH | `/api/user/notification-preferences` | Notification settings |

### Auth — Artisan
| Method | Endpoint | Purpose |
|---|---|---|
| GET/PATCH | `/api/artisan/profile` | Profile with specializations/verificationHistory |
| GET | `/api/artisan/stats` | Dashboard KPIs |
| GET/POST | `/api/artisan/portfolio` | Portfolio items |
| GET/PUT/DELETE | `/api/artisan/portfolio/[id]` | Portfolio item CRUD |
| GET/POST | `/api/artisan/specializations` | Specializations |
| PUT/DELETE | `/api/artisan/specializations/[id]` | Edit/delete specialization |
| GET | `/api/artisan/jobs` | Job list |
| GET | `/api/artisan/jobs/[id]` | Job detail |
| GET/POST | `/api/artisan/jobs/[id]/quote` | Quotes for job |
| GET | `/api/artisan/payments` | Payout records |
| GET | `/api/artisan/earnings` | Earnings data |

### Auth — Client
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/client/stats` | Dashboard KPIs |
| GET | `/api/client/jobs` | Jobs list |
| GET | `/api/client/jobs/[id]` | Job detail |
| POST | `/api/client/jobs` | Create job request |
| GET/POST | `/api/client/saved-artisans` | Saved artisans |
| DELETE | `/api/client/saved-artisans/[id]` | Remove saved |
| GET/POST | `/api/client/search-history` | Search history |
| GET | `/api/client/analytics` | Client analytics |

### Auth — Shared (Client + Artisan)
| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/api/conversations` | Conversation list / create |
| GET | `/api/conversations/[id]` | Conversation detail |
| GET/POST | `/api/conversations/[id]/messages` | Messages |
| GET | `/api/conversations/unread` | Unread count |
| GET/POST | `/api/reviews` | Reviews |
| GET/PATCH | `/api/reviews/[id]` | Review detail |
| GET/PATCH | `/api/notifications` | Notifications |
| POST | `/api/upload/image` | Cloudinary upload |

### Auth — Admin
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Platform KPIs |
| GET | `/api/admin/artisans` | Artisan list |
| GET | `/api/admin/users` | Recent users |
| GET | `/api/admin/users/all` | All users |
| GET | `/api/admin/users/stats` | User counts by role |
| GET | `/api/admin/verification/pending` | Pending verifications |
| POST | `/api/admin/verification/process` | Approve / Reject |
| GET | `/api/admin/subscriptions` | Subscription list |
| GET | `/api/admin/analytics/overview` | Analytics data |
| GET | `/api/admin/earnings` | Platform earnings |
| GET | `/api/admin/payouts` | Payout records |
| GET | `/api/admin/moderation` | Moderation queue |
| POST | `/api/admin/moderation/[id]` | Suspend/activate user |
| GET | `/api/admin/settings` | Platform settings |
| POST | `/api/admin/settings` | Update settings |
| GET | `/api/admin/system/monitoring` | System health |
| GET | `/api/admin/database/stats` | DB statistics |
| GET | `/api/admin/locations/stats` | Location analytics |
| GET | `/api/admin/search` | Global search |
| GET | `/api/admin/reports/generate` | Generate report |
| GET/POST | `/api/admin/invites` | Invite management |
| GET/DELETE | `/api/admin/invites/[token]` | Token validation/revoke |
| GET | `/api/admin/activity-logs` | Activity log |
| GET | `/api/admin/tasks` | System tasks |

---

## User Flow Summary

### Flow 1: Client Hires Artisan
```
Homepage (search) → Browse /artisans → Artisan Profile /artisans/[id]
→ Sign up as CLIENT → Client Dashboard → Find Artisans
→ Message artisan → Job request in chat
→ Artisan creates quote → Client reviews quote
→ Client can: Accept | Decline | Request Revision
→ Accepted → Artisan starts work → Artisan marks complete
→ Client confirms → Cash payment → Client leaves review
```

### Flow 2: Artisan Joins via Invite
```
Admin → /admin-dashboard/artisans → Invites tab
→ Send invite (email) → Email with /sign-up?invite=TOKEN&role=artisan
→ Artisan signs up → auto-set ARTISAN role → invite marked ACCEPTED
→ Artisan Dashboard → Complete profile (bio, profession, certificate)
→ Settings → Verification tab → Upload certificate + ID
→ Admin → /admin-dashboard/verification → Review → Approve
→ Artisan status = VERIFIED → Appears in public search
→ Artisan subscribes (M-Pesa) → Priority listing
→ Receives client message → Quote → Job → Completion
```

### Flow 3: Admin Manages Platform
```
Sign up with meluseno@gmail.com → auto-promoted to ADMIN (ADMIN_BOOTSTRAP_EMAILS)
→ /admin-dashboard → overview KPIs
→ Artisans → Pending tab → Review verification → Approve/Reject
→ Users → Manage user status
→ Subscriptions → Monitor active plans
→ Analytics → Growth metrics
```

---

## Key Business Rules for Designer

1. **Cash-only payments during testing** — All job payment UI shows info cards, not M-Pesa buttons. Subscription payments via M-Pesa still active.
2. **Artisan verification gate** — Artisans must be VERIFIED to appear in search results. PENDING artisans see a banner but can complete their profile.
3. **Profile completion** — Dashboard shows % completion card until: bio (50+ chars), profession, profile photo, 2+ specializations, 3+ portfolio items, location, certificate uploaded.
4. **Quote revision flow** — Client can request revisions, artisan can submit revised quotes. Accept/Decline/Request Revision at `QUOTED` status.
5. **Invite system** — Admin sends invite → 7-day expiry → artisan signs up → auto-ARTISAN role → invite marked ACCEPTED.
6. **Role-based routing** — `/after-sign-in` routes to: admin→`/admin-dashboard`, artisan→`/artisan-dashboard`, client→`/client-dashboard`.
7. **Public artisan visibility** — Only VERIFIED artisans with ACTIVE status appear in public search. All can be viewed at `/artisans/[id]` if status=ACTIVE and artisanStatus=VERIFIED.

---

*Report generated from live codebase. All API shapes reflect current Prisma schema v7.2.0.*
