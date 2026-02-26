# ArtisanLink System Workflows

This document describes the key workflows and processes in the ArtisanLink platform.

## Table of Contents

1. [User Registration](#user-registration)
2. [Artisan Onboarding & Verification](#artisan-onboarding--verification)
3. [Job Request Workflow](#job-request-workflow)
4. [Payment Flow](#payment-flow)
5. [Payout Processing](#payout-processing)
6. [Subscription Management](#subscription-management)

---

## User Registration

### Flow Overview

```
User visits site → Clicks Sign Up → Clerk Authentication → User sync to DB → Role Assignment → Dashboard Redirect
```

### Detailed Steps

1. **Initial Registration (Clerk)**
   - User clicks "Sign Up" button
   - Clerk handles authentication (email/password, Google, or phone)
   - Email/phone verification completed

2. **User Sync**
   - On first sign-in, webhook or proxy triggers user sync
   - API route: `POST /api/user/sync`
   - Creates User record in database with Clerk ID
   - Default role: `CLIENT`

3. **Profile Completion**
   - User redirected to appropriate dashboard
   - Prompted to complete profile (name, phone, location)

### Database Models Involved
- `User` - Core user record
- Clerk handles authentication tokens/sessions

---

## Artisan Onboarding & Verification

### Flow Overview

```
User signs up as Artisan → Profile created → Submits certificate/ID for Verification → Admin Reviews → Approved/Rejected
```

### Detailed Steps

#### 1. Application Submission

**User Actions:**
- Navigate to Settings → "Become an Artisan"
- Fill application form:
  - Business name
  - Profession (e.g., Carpenter, Plumber)
  - Years of experience
  - Service area (county, city)
  - Hourly rate
  - Bio/description
  - Profile photo

**API Route:** `PATCH /api/artisan/profile`

**Database Changes:**
- `Profile` updated with `artisanStatus: PENDING`
- `User.role` is set to `ARTISAN` at sign-up via Clerk `publicMetadata`
- Artisan does **not** appear in search results until `artisanStatus: VERIFIED`

#### 2. Verification Queue

**Admin Dashboard:**
- New applications appear in "Artisan Verification" section
- Shows: Name, Profession, Experience, Application Date

**API Route:** `GET /api/admin/verification/pending`

#### 3. Admin Review

**Admin Actions:**
- Review submitted information
- Check for:
  - Complete and accurate information
  - Valid profession/trade
  - Reasonable pricing
  - Appropriate bio content
- Add internal notes if needed

**Decision Options:**
- **Approve** - Grants verified status
- **Reject** - Denies with reason provided

**API Route:** `POST /api/admin/verification/process`

**Request Body:**
```json
{
  "artisanId": "<user-id>",
  "action": "APPROVE" | "REJECT",
  "rejectionReason": "...",
  "adminNotes": "..."
}
```

#### 4. Status Update

**On Approval:**
- `Profile.artisanStatus` → `VERIFIED`
- Email notification sent to user
- Artisan profile appears in search results

**On Rejection:**
- `Profile.artisanStatus` → `REJECTED`
- Rejection reason stored
- Email notification with feedback
- User can reapply with corrections

### Database Models Involved
- `User` - Role updated on approval
- `Profile` - Verification status (`artisanStatus`) and professional details
- `VerificationHistory` (if implemented) - Audit trail

---

## Job Request Workflow

### Flow Overview

```
Client sends inquiry → Artisan receives → Creates Quote → Client reviews → Accepts Quote → Deposit Payment → Job Starts → Job Completes → Final Payment → Review
```

### Detailed Steps

#### 1. Initial Contact

**Client Actions:**
- Finds artisan via search
- Views profile and portfolio
- Clicks "Contact" or "Send Message"
- Describes project requirements

**System Actions:**
- Checks artisan's subscription status (must be ACTIVE with valid `endDate`)
- If subscription inactive/expired, returns 403 error
- Creates `Conversation` between client and artisan
- Sends notification to artisan

#### 2. Job Request Creation

**Client Actions (optional formal request):**
- After initial discussion, creates formal job request
- Fills in:
  - Title/description
  - Preferred dates
  - Location
  - Budget (if any)

**API Route:** `POST /api/client/jobs`

**Database Changes:**
- `Job` created with `status: REQUESTED`

#### 3. Artisan Quote

**Prerequisites:**
- Artisan must have an active subscription (status `ACTIVE` with valid `endDate`)
- If subscription is inactive or expired, the artisan receives a 403 error and must subscribe before quoting

**Artisan Actions:**
- Reviews job request
- Creates detailed quote with:
  - Line items (labor, materials)
  - Total price
  - Estimated duration
  - Valid until date
  - Terms/notes

**API Route:** `POST /api/artisan/jobs/[id]/quote`

**Database Changes:**
- `Quote` created with line items
- `Job.status` → `QUOTED`

#### 4. Quote Review

**Client Actions:**
- Reviews quote details
- Options:
  - **Accept** - Proceed with quoted price
  - **Decline** - Reject quote (can request revision)
  - **Negotiate** - Request changes via messaging

#### 5. Quote Acceptance

**API Route:** `POST /api/client/jobs/[id]/accept`

**Database Changes:**
- `Job.status` → `ACCEPTED`
- `Job.agreedPrice` set from quote total
- `Job.depositAmount` calculated (typically 50%)

#### 6. Deposit Payment

See [Payment Flow](#payment-flow) for details.

**After Successful Deposit:**
- `Job.status` → `DEPOSIT_PAID`
- `Job.depositPaidAt` timestamp set
- 80% of deposit → Artisan payout created
- 20% held in escrow

#### 7. Job Execution

**Artisan Actions:**
- Starts work after deposit confirmed
- Can update status to `IN_PROGRESS`

**API Route:** `PATCH /api/artisan/jobs/[id]` with `action: 'start'`

#### 8. Job Completion

**Artisan Actions:**
- Marks job as complete
- Optionally uploads completion photos

**API Route:** `PATCH /api/artisan/jobs/[id]` with `action: 'complete'`

**Database Changes:**
- `Job.status` → `PENDING_FINAL_PAYMENT`

#### 9. Final Payment

**Client Actions:**
- Reviews completed work
- Initiates final payment (remaining 50%)

See [Payment Flow](#payment-flow) for details.

**After Successful Payment:**
- `Job.status` → `COMPLETED`
- `Job.completedAt` timestamp set
- Final payout created for artisan (remaining amount minus commission)
- Platform earning recorded

#### 10. Review

**Client Actions:**
- Prompted to leave review
- Rates 1-5 stars
- Writes feedback

**Database Changes:**
- `Review` created with `status: PENDING`
- Admin reviews before publishing

### Job Status Flow

```
REQUESTED → QUOTED → ACCEPTED → DEPOSIT_PAID → IN_PROGRESS → PENDING_FINAL_PAYMENT → COMPLETED
                  ↓
              DECLINED/CANCELLED
```

### Database Models Involved
- `Job` - Main job record
- `Quote` - Quote details
- `QuoteLineItem` - Individual quote items
- `Payment` - Payment records
- `ArtisanPayout` - Payout records
- `Review` - Post-job review

---

## Payment Flow

### Overview

ArtisanLink uses M-Pesa STK Push for payments. Clients pay the platform, and artisans receive automatic payouts via M-Pesa B2C.

### Deposit Payment Flow

```
Client initiates → STK Push to phone → Client enters PIN → Callback received → Artisan payout created
```

#### 1. Initiate Payment

**Client Actions:**
- On job page, clicks "Pay Deposit"
- Confirms phone number

**API Route:** `POST /api/payments/job/initiate`

**Request:**
```json
{
  "jobId": "job_123",
  "paymentType": "DEPOSIT",
  "phoneNumber": "254712345678"
}
```

**System Actions:**
- Validates job status (must be `ACCEPTED`)
- Creates `Payment` record with `status: INITIATED`
- Calls M-Pesa STK Push API
- Returns checkout request ID

#### 2. M-Pesa STK Push

**User Experience:**
- Push notification appears on phone
- Displays: Business name, Amount
- User enters M-Pesa PIN

**Possible Outcomes:**
- **Success** - Payment processed
- **Cancelled** - User cancelled/timeout
- **Failed** - Insufficient funds, wrong PIN, etc.

#### 3. Callback Processing

**M-Pesa sends callback to:** `POST /api/payments/job/callback`

**On Success:**
- `Payment.status` → `COMPLETED`
- `Payment.mpesaReceiptNumber` stored
- `Job.status` → `DEPOSIT_PAID`
- `Job.depositPaidAt` set

**Payment Distribution (Deposit):**
```
Client pays: KES 10,000 (50% deposit)
├── 80% (KES 8,000) → ArtisanPayout created (PENDING)
└── 20% (KES 2,000) → Job.heldAmount (escrow)
```

**On Failure:**
- `Payment.status` → `FAILED`
- `Payment.failureReason` stored
- Client notified, can retry

### Final Payment Flow

Same process as deposit, with different distribution:

**Payment Distribution (Final):**
```
Client pays: KES 10,000 (remaining 50%)
Total job value: KES 20,000

Commission calculation:
├── If promotional (first 5 jobs): 5% of KES 20,000 = KES 1,000
└── If standard: 10% of KES 20,000 = KES 2,000

Artisan receives (with 10% commission):
├── Final payment: KES 10,000
├── Plus held amount: KES 2,000
├── Minus commission: KES 2,000
└── Net payout: KES 10,000

Platform records:
├── ArtisanPayout: KES 10,000
└── PlatformEarning: KES 2,000
```

### Payment Statuses

| Status | Description |
|--------|-------------|
| INITIATED | STK Push sent, awaiting user |
| COMPLETED | Payment successful |
| FAILED | Payment failed |
| CANCELLED | User cancelled |

### Database Models Involved
- `Payment` - Payment transaction record
- `Job` - Job payment status fields
- `ArtisanPayout` - Created after successful payment
- `PlatformEarning` - Commission record (final payment only)

---

## Payout Processing

### Overview

Artisan payouts are processed via M-Pesa B2C (Business to Customer). Payouts are queued and processed in batches by a cron job.

### Payout Creation

Payouts are created automatically when:
1. **Deposit paid** - 80% of deposit amount
2. **Final payment** - Remaining balance minus commission

### Payout Processing Flow

```
Payout created (PENDING) → Cron job picks up → B2C initiated (PROCESSING) → Callback received → COMPLETED/FAILED
```

#### 1. Cron Job

**Runs:** Hourly (or configurable)
**API Route:** `GET /api/cron/process-payouts`

**Actions:**
- Fetches PENDING payouts where `nextRetryAt <= now`
- Initiates B2C for each
- Updates status to PROCESSING

#### 2. B2C Processing

**For each payout:**
- Generate unique request ID
- Call M-Pesa B2C API
- Send to artisan's registered phone

**B2C Request includes:**
- Amount
- Phone number
- Remarks (job reference)

#### 3. Callback Handling

**M-Pesa sends callback to:** `POST /api/payments/b2c/result`

**On Success:**
- `ArtisanPayout.status` → `COMPLETED`
- `ArtisanPayout.mpesaReceiptNumber` stored
- `ArtisanPayout.completedAt` set
- If final payment: `User.completedJobCount` incremented

**On Failure:**
- `ArtisanPayout.status` → `FAILED`
- `ArtisanPayout.failureReason` stored
- `ArtisanPayout.retryCount` incremented
- `ArtisanPayout.nextRetryAt` calculated

### Retry Strategy

| Retry | Delay |
|-------|-------|
| 1 | 5 minutes |
| 2 | 30 minutes |
| 3 | 2 hours |
| >3 | Manual review required |

**After 3 failures:**
- `requiresManualReview` → `true`
- Admin notified
- Appears in admin payout dashboard

### Admin Payout Management

**Admin Dashboard:** `/admin-dashboard/payouts`

**Actions available:**
- **Retry** - Reset for immediate retry
- **Cancel** - Cancel payout
- **Mark Complete** - Manual completion (external payment)
- **Add Notes** - Record information

**Use cases for manual intervention:**
- Wrong phone number → Admin updates, retries
- M-Pesa system issues → Wait and retry
- Fraudulent activity → Cancel with notes

### Payout Statuses

| Status | Description |
|--------|-------------|
| PENDING | Awaiting processing |
| PROCESSING | B2C initiated |
| COMPLETED | Successfully sent |
| FAILED | Send failed |
| CANCELLED | Cancelled by admin |

### Database Models Involved
- `ArtisanPayout` - Payout record with retry tracking
- `PlatformEarning` - Commission records

---

## Subscription Management

### Overview

Artisans can subscribe to premium plans for enhanced features. Subscriptions are processed via M-Pesa STK Push.

### Subscription Flow

```
Artisan selects plan → Initiates payment → STK Push → Payment confirmed → Subscription activated
```

### Plans

| Plan | Price | Duration | Features |
|------|-------|----------|----------|
| Monthly | KES 500 | 30 days | All premium features |
| Annual | KES 5,000 | 365 days | All premium + 17% discount |

### Premium Features
- Featured placement in search
- Unlimited portfolio items
- Priority search ranking
- Advanced analytics
- Verified badge eligibility

### Payment Processing

**API Route:** `POST /api/payments/mpesa/initiate`

**Process:**
1. Artisan selects plan
2. Enters/confirms phone number
3. STK Push sent
4. Artisan enters PIN
5. Callback received

**On Success:**
- `Subscription` created/extended
- `Subscription.startDate` set
- `Subscription.endDate` calculated
- `Subscription.status` → `ACTIVE`

### Subscription Statuses

| Status | Description |
|--------|-------------|
| ACTIVE | Currently valid |
| EXPIRED | Past end date |
| CANCELLED | Manually cancelled |

### Renewal Handling

- No automatic renewal (user must manually renew)
- Email reminder sent before expiry (7 days, 1 day)
- Grace period: 3 days after expiry
- After grace period: Features disabled

### Database Models Involved
- `Subscription` - Subscription record
- `Payment` - Payment history

---

## Commission Structure

### Rates

| Type | Rate | Applies To |
|------|------|-----------|
| Promotional | 5% | First 5 completed jobs per artisan |
| Standard | 10% | All jobs after promotional period |

### Calculation

Commission is calculated on the total job value (deposit + final payment).

**Example (KES 20,000 job with standard 10%):**
```
Total job value: KES 20,000
Commission: KES 2,000
Artisan receives: KES 18,000

Breakdown:
├── Deposit (50%): KES 10,000
│   ├── To artisan: KES 8,000 (80%)
│   └── Held: KES 2,000 (20%)
│
└── Final (50%): KES 10,000
    ├── Plus held: KES 2,000
    ├── Total available: KES 12,000
    ├── Commission: KES 2,000
    └── Net to artisan: KES 10,000

Total to artisan: KES 8,000 + KES 10,000 = KES 18,000
```

### Tracking

**For Artisans:**
- Earnings dashboard shows:
  - Total earnings
  - Current commission rate
  - Jobs until standard rate
  - Payout history

**For Admins:**
- Platform earnings dashboard shows:
  - Total commission collected
  - Promotional vs standard breakdown
  - Daily/monthly trends

---

## Error Handling

### Payment Failures

| Error | User Action | System Action |
|-------|-------------|---------------|
| Insufficient funds | Add funds, retry | Show error, allow retry |
| Wrong PIN | Retry | Auto-cancel after 3 attempts |
| Timeout | Retry | Show timeout message |
| M-Pesa down | Wait, retry later | Queue for retry |

### Payout Failures

| Error | Admin Action | System Action |
|-------|--------------|---------------|
| Invalid phone | Update phone, retry | Flag for review |
| Recipient limit | Wait, retry | Schedule next day |
| B2C system error | Wait, retry | Auto-retry with backoff |

---

## Security Considerations

1. **Payment Callbacks**
   - Validate callback origin (IP whitelist)
   - Verify transaction details match initiated request
   - Use HTTPS only

2. **Payout Authorization**
   - Admin-only manual actions
   - Audit trail for all payout actions
   - Rate limiting on B2C calls

3. **Data Protection**
   - Phone numbers encrypted at rest
   - PCI compliance for payment data
   - GDPR-compliant data handling
