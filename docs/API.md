# ChapaWorks API Documentation

This document provides comprehensive documentation for all ChapaWorks API endpoints.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

## Authentication

ChapaWorks uses [Clerk](https://clerk.com) for authentication. Most endpoints require authentication via a valid Clerk session.

### Authentication Headers

Authenticated requests must include a valid Clerk session. The session is automatically handled by the Clerk SDK when using the frontend application. For direct API access, include the Clerk session token:

```
Authorization: Bearer <clerk_session_token>
```

### User Roles

- **CLIENT** - Default role for new users. Can browse artisans, leave reviews, and message artisans.
- **ARTISAN** - Skilled workers offering services. Can manage portfolio, receive messages, and subscribe.
- **ADMIN** - Platform administrators with full access to management features.

---

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": { ... }  // Optional validation details
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (resource already exists) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Rate Limiting

API endpoints are rate limited to prevent abuse. Rate limits vary by endpoint:

| Endpoint Type | Authenticated | Anonymous |
|--------------|---------------|-----------|
| Search | 60 req/min | 20 req/min |
| General API | 100 req/min | 30 req/min |
| Auth endpoints | 10 req/min | 5 req/min |

When rate limited, you'll receive a `429` response with headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640000000
Retry-After: 30
```

---

## Endpoints

### Health Check

#### GET /api/health

Check API and service health status.

**Authentication**: None required

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| verbose | boolean | Include detailed stats (default: false) |

**Response**:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": {
    "seconds": 86400,
    "formatted": "1d 0h 0m"
  },
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 15
    },
    "cache": {
      "status": "active",
      "size": 150,
      "maxSize": 1000
    },
    "rateLimit": {
      "status": "active",
      "size": 45
    },
    "monitoring": {
      "sentryEnabled": true,
      "sentryConfigured": true
    }
  },
  "stats": {
    "totalUsers": 1250,
    "adminUsers": 3,
    "artisanUsers": 450,
    "clientUsers": 797
  }
}
```

#### HEAD /api/health

Simple uptime check returning only status code.

**Response**: `200 OK` or `503 Service Unavailable`

---

### User Management

#### POST /api/user/sync

Sync Clerk user to database. Called after authentication to ensure user exists in the database.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clxxxxxxxxxx",
    "clerkId": "user_xxxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CLIENT",
    "status": "ACTIVE"
  }
}
```

#### GET /api/user/me

Get current authenticated user details.

**Authentication**: Required

**Response**:
```json
{
  "id": "clxxxxxxxxxx",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CLIENT",
  "status": "ACTIVE",
  "profile": {
    "id": "clxxxxxxxxxx",
    "bio": "...",
    "profileImage": "https://...",
    "city": "Nairobi",
    "county": "Nairobi"
  }
}
```

#### POST /api/user/promote-admin

Promote user to admin role. Requires existing admin authorization OR secret key for first admin bootstrap.

**Authentication**: Required (Admin role or ADMIN_PROMOTION_SECRET)

**Request Body**:
```json
{
  "userId": "clxxxxxxxxxx",
  "secretKey": "your_secret_key"  // Only for first admin bootstrap
}
```

---

### Artisan Search

#### GET /api/search/artisans

Search and filter artisans. Public endpoint with rate limiting.

**Authentication**: None required

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| q / query | string | Search term (matches profession, bio, name) |
| profession | string | Filter by profession |
| county | string | Filter by county |
| city | string | Filter by city |
| minRating | number | Minimum rating (1-5) |
| minRate | number | Minimum hourly rate |
| maxRate | number | Maximum hourly rate |
| available | boolean | Only available artisans |
| verified | boolean | Only verified artisans |
| specialization | string | Filter by specialization |
| lat | number | Latitude for distance search |
| lng | number | Longitude for distance search |
| radius | number | Search radius in km (default: 50) |
| sortBy | string | Sort field: rating, reviews, rate, distance, recent |
| sortOrder | string | asc or desc (default: desc) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (max: 50, default: 20) |

**Note**: Only verified artisans (`artisanStatus: VERIFIED`) appear in search results. Artisans with an active subscription (`isPremium: true`) are boosted to the top of results. Facet counts reflect only verified artisans.

**Response**:
```json
{
  "artisans": [
    {
      "id": "clxxxxxxxxxx",
      "profileId": "clxxxxxxxxxx",
      "name": "John Doe",
      "profession": "Carpenter",
      "bio": "Experienced carpenter...",
      "profileImage": "https://...",
      "location": {
        "city": "Nairobi",
        "county": "Nairobi",
        "latitude": -1.2921,
        "longitude": 36.8219
      },
      "experience": 5,
      "hourlyRate": 500,
      "isAvailable": true,
      "isVerified": true,
      "isPremium": false,
      "rating": {
        "average": 4.8,
        "total": 25
      },
      "specializations": [
        { "name": "Furniture Making", "skillLevel": "EXPERT" }
      ],
      "memberSince": "2023-01-15T00:00:00.000Z",
      "distance": 5.2
    }
  ],
  "facets": {
    "professions": [
      { "name": "Carpenter", "count": 45 }
    ],
    "counties": [
      { "name": "Nairobi", "count": 120 }
    ],
    "specializations": [
      { "name": "Furniture Making", "count": 30 }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "searchParams": {
    "query": "carpenter",
    "profession": null,
    "county": "Nairobi",
    "sortBy": "rating",
    "sortOrder": "desc"
  }
}
```

---

### Artisan Portfolio

#### GET /api/artisan/portfolio

List portfolio items for authenticated artisan.

**Authentication**: Required (Artisan role)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page (max: 50) |
| category | string | Filter by category |
| featured | boolean | Only featured items |

**Response**:
```json
{
  "items": [
    {
      "id": "clxxxxxxxxxx",
      "title": "Custom Dining Table",
      "description": "Handcrafted oak dining table...",
      "imageUrl": "https://...",
      "imageUrls": ["https://..."],
      "category": "Furniture",
      "tags": ["oak", "dining", "custom"],
      "completedAt": "2023-12-01T00:00:00.000Z",
      "duration": "2 weeks",
      "cost": 25000,
      "isPublic": true,
      "isFeatured": true,
      "createdAt": "2023-12-15T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

#### POST /api/artisan/portfolio

Create new portfolio item.

**Authentication**: Required (Artisan role)

**Request Body**:
```json
{
  "title": "Custom Dining Table",
  "description": "Handcrafted oak dining table...",
  "imageUrl": "https://...",
  "imageUrls": ["https://..."],
  "category": "Furniture",
  "tags": ["oak", "dining"],
  "completedAt": "2023-12-01T00:00:00.000Z",
  "duration": "2 weeks",
  "cost": 25000,
  "isPublic": true,
  "isFeatured": false
}
```

#### GET /api/artisan/portfolio/[id]

Get single portfolio item.

#### PUT /api/artisan/portfolio/[id]

Update portfolio item.

#### DELETE /api/artisan/portfolio/[id]

Delete portfolio item.

---

### Reviews

#### GET /api/reviews

List reviews. Admins see all; clients see their own.

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | pending, approved, or all (admin only) |

#### POST /api/reviews

Create a new review for an artisan.

**Authentication**: Required (Client role)

**Request Body**:
```json
{
  "profileId": "clxxxxxxxxxx",
  "rating": 5,
  "comment": "Excellent work!",
  "projectTitle": "Kitchen Renovation",
  "projectCost": 50000
}
```

**Note**: Reviews require admin approval before appearing publicly.

#### GET /api/artisans/[id]/reviews

Get public reviews for an artisan (approved only).

**Authentication**: None required

---

### Conversations & Messages

#### GET /api/conversations

List conversations for authenticated user.

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | ACTIVE, ARCHIVED, or BLOCKED |
| page | number | Page number |
| limit | number | Items per page |

**Response**:
```json
{
  "conversations": [
    {
      "id": "clxxxxxxxxxx",
      "client": {
        "id": "...",
        "firstName": "Jane",
        "lastName": "Doe",
        "profile": { "profileImage": "..." }
      },
      "artisan": {
        "id": "...",
        "firstName": "John",
        "lastName": "Smith",
        "profile": { "profileImage": "...", "profession": "Carpenter" }
      },
      "subject": "Kitchen Cabinets",
      "status": "ACTIVE",
      "lastMessage": {
        "id": "...",
        "content": "When can you start?",
        "createdAt": "...",
        "senderId": "...",
        "status": "DELIVERED"
      },
      "lastMessageAt": "..."
    }
  ],
  "unreadCount": 3,
  "pagination": { ... }
}
```

#### POST /api/conversations

Start a new conversation with an artisan.

**Authentication**: Required (Client role)

**Note**: The artisan must be verified (artisanStatus: `VERIFIED`). Returns `403 Forbidden` if not verified.

**Request Body**:
```json
{
  "artisanId": "clxxxxxxxxxx",
  "subject": "Kitchen Cabinets Inquiry",
  "initialMessage": "Hello, I'm interested in custom kitchen cabinets..."
}
```

#### GET /api/conversations/[id]/messages

Get messages in a conversation.

#### POST /api/conversations/[id]/messages

Send a message in a conversation.

**Request Body**:
```json
{
  "content": "Your message here...",
  "attachmentUrls": ["https://res.cloudinary.com/..."]  // optional
}
```

**Note**: `attachmentUrls` is an optional array of Cloudinary URLs for file attachments (images or PDFs, up to 5 MB each). Upload files first via `POST /api/upload/image` with folder `message-attachments`.

#### GET /api/conversations/unread

Get unread message count.

---

### Notifications

#### GET /api/notifications

List notifications for current user.

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| unread | boolean | Only unread notifications |
| type | string | Filter by notification type |

**Notification Types**: `MESSAGE`, `REVIEW`, `VERIFICATION`, `SUBSCRIPTION`, `SYSTEM`, `PAYMENT`

**Response**:
```json
{
  "items": [
    {
      "id": "clxxxxxxxxxx",
      "type": "MESSAGE",
      "title": "New Message",
      "message": "You have a new message from Jane Doe",
      "data": { "conversationId": "..." },
      "linkUrl": "/messages/xxx",
      "isRead": false,
      "createdAt": "...",
      "readAt": null
    }
  ],
  "pagination": { ... },
  "unreadCount": 5
}
```

#### POST /api/notifications

Create notification (Admin or self only).

#### PATCH /api/notifications/[id]

Mark notification as read.

#### POST /api/notifications/read-all

Mark all notifications as read.

---

### M-Pesa Payments

#### POST /api/payments/mpesa/initiate

Initiate M-Pesa STK Push for subscription payment.

**Authentication**: Required (Artisan role)

**Request Body**:
```json
{
  "phoneNumber": "0712345678",
  "plan": "MONTHLY"
}
```

**Plans**:
- `MONTHLY` - Monthly subscription
- `ANNUAL` - Annual subscription (discounted)

**Response**:
```json
{
  "message": "Payment initiated. Check your phone for the M-Pesa prompt.",
  "checkoutRequestId": "ws_CO_xxxxx",
  "merchantRequestId": "xxxxx",
  "paymentId": "clxxxxxxxxxx",
  "subscriptionId": "clxxxxxxxxxx",
  "plan": "MONTHLY",
  "amount": 500,
  "currency": "KES"
}
```

#### GET /api/payments/mpesa/status

Check payment status.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| checkoutRequestId | string | M-Pesa checkout request ID |

#### POST /api/payments/mpesa/callback

M-Pesa callback endpoint (called by Safaricom).

**Authentication**: None (validated by M-Pesa signature)

---

### Admin Endpoints

All admin endpoints require authentication with ADMIN role.

#### GET /api/admin/stats

Get platform statistics.

**Response**:
```json
{
  "totalUsers": 1250,
  "totalArtisans": 450,
  "activeArtisans": 380,
  "pendingVerifications": 12,
  "activeSubscriptions": 200,
  "monthlyRevenue": 100000,
  "userGrowth": 15.5,
  "revenueGrowth": 22.3,
  "monthlyGrowth": 18.9,
  "totalReviews": 890,
  "period": {
    "currentMonth": "2024-01-01T00:00:00.000Z",
    "usersThisMonth": 45,
    "usersLastMonth": 39
  }
}
```

#### GET /api/admin/users

Get recent users list.

#### GET /api/admin/users/all

Get all users with pagination and filtering.

#### GET /api/admin/users/stats

Get detailed user statistics.

#### GET /api/admin/verification/pending

Get pending artisan verifications.

#### POST /api/admin/verification/process

Process artisan verification.

**Request Body**:
```json
{
  "profileId": "clxxxxxxxxxx",
  "action": "APPROVE",
  "notes": "Documents verified"
}
```

#### GET /api/admin/moderation

Get content pending moderation.

#### PATCH /api/admin/moderation/[id]

Moderate content (approve/reject review).

#### GET /api/admin/subscriptions

List all subscriptions.

#### GET /api/admin/activity-logs

Get system activity logs.

#### GET /api/admin/reports/generate

Generate platform reports.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Report type: users, revenue, activity |
| startDate | string | Start date (ISO) |
| endDate | string | End date (ISO) |
| format | string | csv or json |

#### GET /api/admin/database/stats

Get database statistics.

#### GET /api/admin/locations/stats

Get user distribution by location.

#### GET /api/admin/chart-data

Get data for admin dashboard charts.

#### GET /api/admin/analytics/overview

Get analytics overview.

#### GET /api/admin/settings

Get/update platform settings.

#### GET /api/admin/system/monitoring

Get system monitoring data.

#### GET /api/admin/tasks

Get admin task queue.

#### GET /api/admin/search

Search across all platform entities.

---

### Client Endpoints

#### GET /api/client/stats

Get client dashboard statistics.

**Authentication**: Required (Client role)

#### GET /api/client/saved-artisans

List saved/favorited artisans.

#### POST /api/client/saved-artisans

Save an artisan.

**Request Body**:
```json
{
  "artisanId": "clxxxxxxxxxx"
}
```

#### DELETE /api/client/saved-artisans/[id]

Remove saved artisan.

#### GET /api/client/search-history

Get search history.

---

### Artisan Stats & Payments

#### GET /api/artisan/stats

Get artisan dashboard statistics.

**Authentication**: Required (Artisan role)

#### GET /api/artisan/payments

List payment history.

#### GET /api/artisan/payments/[id]

Get payment details.

#### GET /api/artisan/payments/export

Export payment history.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | csv or pdf |
| startDate | string | Start date |
| endDate | string | End date |

---

### Artisan Specializations

#### GET /api/artisan/specializations

List artisan's specializations.

#### POST /api/artisan/specializations

Add specialization.

**Request Body**:
```json
{
  "name": "Furniture Making",
  "skillLevel": "EXPERT",
  "yearsExperience": 5,
  "description": "Specializing in custom furniture..."
}
```

#### DELETE /api/artisan/specializations/[id]

Remove specialization.

---

### Artisan Jobs

#### POST /api/artisan/jobs/[id]/quote

Submit a quote for a job request.

**Authentication**: Required (Artisan role, verified status)

**Note**: The artisan must be verified (artisanStatus: `VERIFIED`). Returns `403 Forbidden` if not verified.

---

### Client Artisan Profile

#### GET /api/client/artisans/[id]

Get a specific artisan's public profile with portfolio items.

**Authentication**: Required (Client role)

**Response** includes up to 12 public portfolio items:
```json
{
  "artisan": {
    "id": "clxxxxxxxxxx",
    "profile": {
      "profession": "Carpenter",
      "bio": "...",
      "portfolioItems": [
        {
          "id": "clxxxxxxxxxx",
          "title": "Custom Dining Table",
          "description": "Handcrafted oak dining table...",
          "imageUrl": "https://...",
          "imageUrls": ["https://..."],
          "category": "Furniture",
          "tags": ["oak", "dining"],
          "completedAt": "2023-12-01T00:00:00.000Z",
          "duration": "2 weeks",
          "isFeatured": true,
          "createdAt": "2023-12-15T00:00:00.000Z"
        }
      ]
    }
  }
}
```

**Note**: Only public portfolio items (`isPublic: true`) are returned, ordered by most recent, limited to 12 items.

---

### Image Upload

#### POST /api/upload/image

Upload an image to Cloudinary.

**Authentication**: Required

**Supported Folders**:
- `portfolio` - Portfolio images
- `certificates` - Verification certificates
- `id-documents` - ID verification documents
- `profile-images` - Profile photos
- `message-attachments` - Message file attachments (images and PDFs, up to 5 MB)

---

### Cron Jobs

#### POST /api/cron/subscriptions

Process subscription renewals and expirations.

**Authentication**: Requires `CRON_SECRET` header

```
Authorization: Bearer <CRON_SECRET>
```

#### POST /api/cron/process-payouts

Process pending artisan payouts via M-Pesa B2C. Runs hourly.

**Authentication**: Requires `CRON_SECRET` header

```
Authorization: Bearer <CRON_SECRET>
```

**Process**:
1. Queries PENDING payouts and FAILED payouts with `nextRetryAt <= now`
2. Filters payouts meeting minimum amount (KES 10)
3. Initiates B2C transfer for each eligible payout
4. Updates status to PROCESSING
5. Handles failures with exponential backoff (5min, 30min, 2hr)
6. Flags for manual review after 3 retries

**Response**:
```json
{
  "message": "Payout processing completed",
  "processed": 5,
  "successful": 4,
  "failed": 1,
  "skipped": 0
}
```

---

### M-Pesa B2C Payouts

#### POST /api/payments/b2c/result

M-Pesa B2C result callback (called by Safaricom on success/failure).

**Authentication**: None (validated by M-Pesa)

**Process**:
- Updates `ArtisanPayout` status based on result
- On success: marks COMPLETED, records transaction details
- On failure: increments retry count, schedules next retry or flags for review

#### POST /api/payments/b2c/timeout

M-Pesa B2C timeout callback (called if B2C request times out).

**Authentication**: None (validated by M-Pesa)

**Process**:
- Marks payout as FAILED with timeout reason
- Schedules retry with exponential backoff

---

### Artisan Earnings

#### GET /api/artisan/earnings

Get artisan's earnings summary and payout history.

**Authentication**: Required (Artisan role)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 50) |
| status | string | Filter by payout status |
| startDate | string | Start date filter (ISO) |
| endDate | string | End date filter (ISO) |

**Response**:
```json
{
  "summary": {
    "totalEarnings": 125000,
    "thisMonth": 45000,
    "pendingPayouts": 8000,
    "completedPayouts": 117000,
    "commissionRate": 0.05,
    "completedJobCount": 3,
    "promotionalJobsRemaining": 2
  },
  "payouts": [
    {
      "id": "clxxxxxxxxxx",
      "amount": 8000,
      "type": "DEPOSIT_SHARE",
      "status": "COMPLETED",
      "jobId": "clxxxxxxxxxx",
      "jobTitle": "Kitchen Renovation",
      "mpesaReceiptNumber": "QHJ7X8Y9Z0",
      "completedAt": "2026-01-20T14:30:00.000Z",
      "createdAt": "2026-01-20T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### Admin Payouts Management

#### GET /api/admin/payouts

List all artisan payouts with filters.

**Authentication**: Required (Admin role)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED) |
| type | string | Filter by type (DEPOSIT_SHARE, FINAL_PAYMENT, REFUND, ADJUSTMENT) |
| artisanId | string | Filter by artisan |
| requiresReview | boolean | Only payouts needing manual review |
| startDate | string | Start date filter |
| endDate | string | End date filter |
| search | string | Search by artisan name or job title |

**Response**:
```json
{
  "payouts": [
    {
      "id": "clxxxxxxxxxx",
      "amount": 8000,
      "type": "DEPOSIT_SHARE",
      "status": "PENDING",
      "artisan": {
        "id": "clxxxxxxxxxx",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+254712345678",
        "profile": {
          "profession": "Carpenter"
        }
      },
      "job": {
        "id": "clxxxxxxxxxx",
        "title": "Kitchen Cabinets",
        "totalAmount": 25000
      },
      "mpesaReceiptNumber": null,
      "retryCount": 0,
      "requiresManualReview": false,
      "lastError": null,
      "adminNotes": null,
      "createdAt": "2026-01-23T10:00:00.000Z"
    }
  ],
  "summary": {
    "totalPaid": 500000,
    "pendingAmount": 45000,
    "failedAmount": 8000,
    "requiresReviewCount": 2
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET /api/admin/payouts/[id]

Get single payout details.

**Authentication**: Required (Admin role)

**Response**:
```json
{
  "payout": {
    "id": "clxxxxxxxxxx",
    "amount": 8000,
    "type": "DEPOSIT_SHARE",
    "status": "FAILED",
    "artisan": { ... },
    "job": { ... },
    "mpesaConversationId": "AG_xxxxx",
    "mpesaReceiptNumber": null,
    "retryCount": 2,
    "nextRetryAt": "2026-01-23T12:00:00.000Z",
    "requiresManualReview": false,
    "lastError": "Insufficient funds in B2C account",
    "adminNotes": null,
    "createdAt": "2026-01-23T10:00:00.000Z",
    "updatedAt": "2026-01-23T11:30:00.000Z",
    "completedAt": null
  }
}
```

#### PATCH /api/admin/payouts/[id]

Update payout (retry, cancel, mark complete, add notes).

**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "action": "retry"  // or "cancel", "markComplete", "addNotes"
}
```

**Actions**:
- `retry` - Reset retry count and schedule immediate retry
- `cancel` - Cancel payout (cannot be undone)
- `markComplete` - Manually mark as completed (requires `mpesaReceiptNumber`)
- `addNotes` - Add admin notes (requires `notes` field)

**Request Body for markComplete**:
```json
{
  "action": "markComplete",
  "mpesaReceiptNumber": "QHJ7X8Y9Z0"
}
```

**Request Body for addNotes**:
```json
{
  "action": "addNotes",
  "notes": "Contacted artisan, confirmed phone number is correct"
}
```

---

### Admin Platform Earnings

#### GET /api/admin/earnings

Get platform earnings summary and history.

**Authentication**: Required (Admin role)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| startDate | string | Start date filter (ISO) |
| endDate | string | End date filter (ISO) |
| groupBy | string | Group by: day, week, month (default: day) |

**Response**:
```json
{
  "summary": {
    "totalCommission": 250000,
    "totalJobValue": 2500000,
    "effectiveRate": 0.10,
    "promotionalEarnings": 50000,
    "standardEarnings": 200000,
    "averageJobValue": 25000,
    "jobCount": 100
  },
  "daily": [
    {
      "date": "2026-01-23",
      "commission": 15000,
      "jobValue": 150000,
      "jobCount": 6,
      "promotionalCommission": 2500,
      "standardCommission": 12500
    }
  ],
  "earnings": [
    {
      "id": "clxxxxxxxxxx",
      "amount": 2500,
      "commissionRate": 0.10,
      "job": {
        "id": "clxxxxxxxxxx",
        "title": "Kitchen Renovation",
        "totalAmount": 25000
      },
      "artisan": {
        "id": "clxxxxxxxxxx",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2026-01-23T14:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Error Handling

All endpoints follow consistent error handling:

```json
{
  "error": "Human-readable error message",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"]
    },
    "formErrors": []
  }
}
```

## Pagination

Paginated endpoints accept:
- `page` - Page number (1-indexed)
- `limit` - Items per page (max varies by endpoint, typically 50)

And return:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Caching

Some endpoints return cached responses with HTTP cache headers:

```
Cache-Control: public, max-age=300, stale-while-revalidate=60
```

Cached endpoints include:
- `/api/health` - 1 minute
- `/api/search/artisans` - 5 minutes
- `/api/artisans/[id]/reviews` - 5 minutes

---

## Webhooks

ChapaWorks supports webhooks for:
- M-Pesa payment callbacks
- Clerk user events (via Clerk dashboard)

Configure webhook URLs in your environment variables and Clerk dashboard.
