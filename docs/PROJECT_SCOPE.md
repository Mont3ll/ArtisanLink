# ArtisanLink - Project Scope Document

## Overview

ArtisanLink is a Next.js 16 marketplace platform connecting clients with skilled artisans in Kenya. The platform facilitates service discovery, job requests, quoting, payments via M-Pesa, and artisan payouts.

## Business Model

### Revenue Streams
1. **Platform Commission** - 5-10% commission on completed jobs
   - Promotional rate (5%) for first 5 jobs per artisan
   - Standard rate (10%) for subsequent jobs
   - Subscriber rate (5%) for active subscription holders (permanently)
2. **Subscription Fees** - Optional Monthly/Annual plans for premium boost features (priority search, reduced commission, premium badge)

### User Roles

| Role | Description |
|------|-------------|
| **CLIENT** | Users seeking artisan services. Can browse, message, request jobs, make payments, and leave reviews. |
| **ARTISAN** | Service providers. Can receive job requests, send quotes, manage portfolio, receive payouts. |
| **ADMIN** | Platform administrators. Manage users, verify artisans, moderate reviews, handle disputes, view analytics. |

---

## Technology Stack

### Core Framework
- **Next.js 16.1.3** - App Router with Turbopack
- **React 19.2** - UI library
- **TypeScript 5** - Strict mode enabled

### Database & ORM
- **PostgreSQL 15** - Primary database
- **Prisma 7.2** - ORM with type-safe queries
- **Prisma Accelerate** - Connection pooling (optional)

### Authentication
- **Clerk** - Authentication and user management
  - Social logins (Google)
  - Email/password authentication
  - Phone number verification

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Component library (New York style)
- **Radix UI** - Headless accessible components
- **Lucide React** - Icon library
- **GSAP 3.13** - Animations

### Payments
- **M-Pesa STK Push** - C2B payments (client to platform)
- **M-Pesa B2C** - Artisan payouts (platform to artisan)

### Media & Storage
- **Cloudinary** - Image uploads and optimization
  - Profile photos
  - Portfolio images
  - Verification documents
  - Message attachments (images and PDFs, up to 5 MB)

### Maps & Geolocation
- **Mapbox GL** - Interactive maps
- **react-map-gl** - React wrapper for Mapbox

### State Management & Data Fetching
- **TanStack React Query** - Server state management
- **Custom React hooks** - Local state and API interactions

### Testing
- **Vitest 4** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

---

## Feature Summary

### Phase 1-5: Foundation
- [x] User authentication (Clerk)
- [x] User registration and sync
- [x] Role-based access control
- [x] Client and Artisan dashboards
- [x] Admin dashboard

### Phase 6: Artisan Profiles
- [x] Profile management (bio, location, rates)
- [x] Portfolio management with images
- [x] Specializations and skills
- [x] Availability toggle

### Phase 7: Discovery & Search
- [x] Artisan search with filters
- [x] Geolocation-based search
- [x] Map view with artisan pins
- [x] Saved artisans (favorites)
- [x] Search history

### Phase 8: Messaging
- [x] Conversation system
- [x] Real-time-like messaging
- [x] Message read receipts
- [x] File attachments

### Phase 9: Job Booking System
- [x] Job request creation
- [x] Quote system (draft, send, revise)
- [x] Itemized quote line items
- [x] Quote acceptance workflow
- [x] Deposit and final payments
- [x] Job status tracking
- [x] Capacity management

### Phase 10: Verification System
- [x] Certificate upload
- [x] ID document verification
- [x] Admin review queue
- [x] Verification history tracking
- [x] Resubmission workflow

### Phase 11: Payouts & Earnings
- [x] M-Pesa B2C integration
- [x] Artisan payout processing
- [x] Platform earnings tracking
- [x] Commission calculation
- [x] Payout status tracking
- [x] Admin payout management

### Phase 12: Notifications
- [x] In-app notifications
- [x] Notification preferences
- [x] Email notifications (via Nodemailer)
- [x] Notification types (message, review, job, payment, system)

### Phase 13: Reviews
- [x] Review creation (requires completed job)
- [x] Rating system (1-5 stars)
- [x] Review moderation
- [x] Artisan average rating calculation

### Phase 14: Subscriptions
- [x] Monthly/Annual plans
- [x] M-Pesa subscription payments
- [x] Auto-expiry handling
- [x] Admin subscription management
- [x] Subscription as optional boost (not mandatory gate)
- [x] Premium search placement for subscribers
- [x] Reduced commission rate for subscribers

### Phase 15: Admin Features
- [x] User management
- [x] Artisan verification
- [x] Review moderation
- [x] Analytics dashboard
- [x] Activity logs
- [x] System settings
- [x] Report generation

---

## Database Models

### Core Models
| Model | Purpose |
|-------|---------|
| `User` | Core user identity, linked to Clerk |
| `Profile` | Extended user information, artisan-specific fields |
| `Subscription` | Artisan subscription plans |
| `Payment` | Subscription payment records |

### Artisan Features
| Model | Purpose |
|-------|---------|
| `PortfolioItem` | Work samples and project showcase |
| `Specialization` | Skills and expertise areas |
| `VerificationHistory` | Track verification attempts |

### Communication
| Model | Purpose |
|-------|---------|
| `Conversation` | Thread between client and artisan |
| `Message` | Individual messages with attachments |
| `Notification` | User notifications |
| `NotificationPreferences` | Notification settings |

### Job System
| Model | Purpose |
|-------|---------|
| `Job` | Job request and lifecycle tracking |
| `Quote` | Artisan quotes for jobs |
| `QuoteLineItem` | Itemized quote breakdown |
| `JobPayment` | Job-related payments (deposit, final) |

### Payouts
| Model | Purpose |
|-------|---------|
| `ArtisanPayout` | M-Pesa B2C payout records |
| `PlatformEarning` | Commission earned per job |

### Reviews & Discovery
| Model | Purpose |
|-------|---------|
| `Review` | Client reviews for artisans |
| `SavedArtisan` | Client favorites |
| `SearchHistory` | Client search patterns |

### Admin
| Model | Purpose |
|-------|---------|
| `ActivityLog` | Admin action audit trail |
| `Setting` | System configuration |

---

## API Structure

### Public APIs
- `GET /api/search/artisans` - Search artisans (rate limited)
- `GET /api/artisans/[id]/reviews` - Public artisan reviews
- `GET /api/health` - Health check

### Client APIs (`/api/client/*`)
- Jobs management
- Saved artisans
- Search history
- Statistics

### Artisan APIs (`/api/artisan/*`)
- Profile management
- Portfolio management
- Specializations
- Jobs and quotes
- Earnings and payments

### Admin APIs (`/api/admin/*`)
- User management
- Verification processing
- Moderation
- Analytics
- Payouts
- Settings

### Payment APIs (`/api/payments/*`)
- M-Pesa STK Push initiation
- Payment callbacks
- B2C payout processing

---

## Security Considerations

### Authentication
- All protected routes require Clerk authentication
- Role-based access control enforced at API level
- Admin routes restricted to ADMIN role only

### Data Protection
- Phone numbers encrypted before B2C calls
- Sensitive credentials in environment variables
- No secrets committed to repository

### Rate Limiting
- Search endpoints rate limited
- Payment endpoints with request validation

---

## Deployment Requirements

### Environment Variables
See `docs/ENVIRONMENT.md` for complete list including:
- Database connection (PostgreSQL)
- Clerk credentials
- M-Pesa API credentials
- Cloudinary credentials
- Mapbox token

### Infrastructure
- Node.js 20+ runtime
- PostgreSQL 15+ database
- HTTPS required for M-Pesa callbacks

---

## Future Considerations

### Potential Enhancements
- Real-time messaging (WebSocket/SSE)
- Push notifications (mobile)
- Dispute resolution workflow
- Multi-language support (Swahili)
- Mobile app (React Native)
- SMS notifications via Africa's Talking

### Scalability
- Horizontal scaling with stateless API
- Database connection pooling (Prisma Accelerate)
- CDN for static assets and images
- Background job processing for payouts
