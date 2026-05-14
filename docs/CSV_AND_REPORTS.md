# CSV Export and Report Generation

This document details the implementation of CSV export and report generation features in ChapaWorks.

## Overview

ChapaWorks provides two main data export capabilities:

1. **Artisan Payment CSV Export** - Allows artisans to export their payment history
2. **Admin Report Generation** - Comprehensive reporting system for administrators

---

## 1. Artisan Payment CSV Export

### Purpose
Enables artisans to download their subscription payment history as a CSV file for record-keeping, accounting, or tax purposes.

### API Endpoint

**Route:** `GET /api/artisan/payments/export`

**File:** `app/api/artisan/payments/export/route.ts`

### Authentication & Authorization
- Requires Clerk authentication
- User must have `ARTISAN` role
- User must have an active subscription

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by payment status: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |
| `startDate` | ISO string | No | Filter payments from this date |
| `endDate` | ISO string | No | Filter payments until this date |

### CSV Output Structure

The generated CSV includes the following columns:

| Column | Description |
|--------|-------------|
| Transaction Date | Full datetime of the payment |
| Payment ID | Unique payment identifier |
| Amount (KES) | Payment amount in Kenyan Shillings |
| Method | Payment method (e.g., `MPESA`) |
| Status | Payment status |
| Description | Payment description |
| M-Pesa Receipt | M-Pesa transaction receipt number |
| Phone Number | Masked phone number (first 6 digits + `****`) |
| Paid At | Datetime when payment was completed |
| Failure Reason | Reason if payment failed |

### Implementation Details

```typescript
// Key features:
// 1. CSV field escaping for special characters
const escapeCSV = (value: string | null | undefined) => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// 2. Phone number masking for privacy
payment.phoneNumber ? payment.phoneNumber.substring(0, 6) + '****' : ''

// 3. Response headers for file download
return new NextResponse(csvContent, {
  status: 200,
  headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  },
})
```

### Client-Side Hook

**File:** `lib/hooks/use-artisan-payments.ts`

```typescript
export function useExportPayments() {
  return useMutation({
    mutationFn: (status?: string) => exportPayments(status),
    onSuccess: (blob) => {
      // Creates download link and triggers download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}
```

### UI Component

**File:** `app/(artisan-dashboard)/artisan-dashboard/payments/page.tsx`

The export button is located in the payments page header:

```tsx
<Button
  variant="outline"
  onClick={handleExport}
  disabled={exportMutation.isPending || payments.length === 0}
>
  <Download className={cn('mr-2 h-4 w-4', exportMutation.isPending && 'animate-pulse')} />
  {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
</Button>
```

---

## 2. Admin Report Generation

### Purpose
Provides administrators with comprehensive platform analytics and data export capabilities for business intelligence, compliance, and operational oversight.

### API Endpoint

**Route:** `POST /api/admin/reports/generate`

**File:** `app/api/admin/reports/generate/route.ts`

### Authentication & Authorization
- Requires Clerk authentication
- User must have `ADMIN` role

### Request Body Schema

```typescript
{
  type: 'users' | 'artisans' | 'reviews' | 'subscriptions' | 'payments' | 'activity' | 'overview',
  startDate?: string,  // ISO datetime
  endDate?: string,    // ISO datetime
  format?: 'json' | 'csv',  // Default: 'json'
  filters?: {
    role?: 'CLIENT' | 'ARTISAN' | 'ADMIN',
    status?: string,
    county?: string,
    profession?: string
  }
}
```

### Report Types

#### 1. Overview Report (`overview`)
Comprehensive platform summary including:
- Total users, artisans, clients
- Recent signups (last 30 days)
- Active subscriptions and total revenue
- Review statistics
- Top 10 counties by artisan count

#### 2. Users Report (`users`)
User data export with fields:
- ID, email, name, phone
- Role, status
- Profile info (city, county, profession)
- Created at, last login

**Filters:** `role`, `status`

#### 3. Artisans Report (`artisans`)
Artisan profile data including:
- Profession, experience, hourly rate
- Availability status, verification status
- Location (city, county)
- Rating and review statistics

**Filters:** `county`, `profession`, `status`

**Summary Stats:**
- Total artisans
- Verified/pending counts
- Available artisans
- Average rating
- Average hourly rate

#### 4. Reviews Report (`reviews`)
Review data including:
- Rating, comment, project details
- Approval and visibility status
- Artisan and client information

**Filters:** `status` (approved, pending, hidden)

**Summary Stats:**
- Total reviews
- Approved/pending/hidden counts
- Average rating
- Rating distribution (1-5 stars)

#### 5. Subscriptions Report (`subscriptions`)
Subscription data including:
- Plan type, status, amount
- Start and end dates
- Associated artisan info

**Filters:** `status`

**Summary Stats:**
- Total subscriptions
- Active/expired counts
- Monthly/annual breakdown
- Total revenue

#### 6. Payments Report (`payments`)
Payment transaction data including:
- Amount, currency, method
- Status, M-Pesa receipt
- Transaction timestamps
- Associated subscription info

**Filters:** `status`

**Summary Stats:**
- Total transactions
- Completed/pending/failed/refunded counts
- Total revenue
- Payment method breakdown

#### 7. Activity Log Report (`activity`)
Admin activity logs (limited to 1000 records):
- Action type
- Target information
- Timestamps

**Summary Stats:**
- Total actions
- Actions by type
- Unique admin count

### CSV Generation

When `format: 'csv'` is specified:

```typescript
// 1. Flatten nested objects
const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, string> => {
  // Recursively flattens nested objects with underscore-separated keys
  // e.g., { user: { name: 'John' } } becomes { user_name: 'John' }
}

// 2. Generate headers from all unique keys
const headers = [...new Set(flatData.flatMap(item => Object.keys(item)))]

// 3. Escape special characters
if (val.includes(',') || val.includes('"') || val.includes('\n')) {
  return `"${val.replace(/"/g, '""')}"`
}

// 4. Return as downloadable file
return new NextResponse(csvRows.join('\n'), {
  headers: {
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="${type}-report-${date}.csv"`
  }
})
```

### Activity Logging

All report generations are logged to `ActivityLog`:

```typescript
await prisma.activityLog.create({
  data: {
    adminId: admin.id,
    adminEmail: admin.email,
    action: 'REPORT_GENERATED',
    targetType: 'REPORT',
    targetId: type,
    description: `Generated ${type} report`,
    metadata: { type, startDate, endDate, format, recordCount }
  }
})
```

### Client-Side Hook

**File:** `lib/hooks/use-admin-reports.ts`

```typescript
export function useGenerateReport() {
  return useMutation({
    mutationFn: generateReport,
  })
}

// Utility for CSV download
export function downloadReportCSV(blob: Blob, type: ReportType): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
```

### UI Component

**File:** `app/(admin-dashboard)/admin-dashboard/reports/page.tsx`

Features:
- Report type selection buttons with icons
- Real-time report generation with loading states
- Summary display for generated reports
- Recent reports history (session-based)
- Quick export buttons for direct CSV download

---

## File Structure

```
app/
  api/
    artisan/
      payments/
        export/
          route.ts          # Artisan CSV export endpoint
    admin/
      reports/
        generate/
          route.ts          # Admin report generation endpoint
  (artisan-dashboard)/
    artisan-dashboard/
      payments/
        page.tsx            # Payments page with export button
  (admin-dashboard)/
    admin-dashboard/
      reports/
        page.tsx            # Admin reports dashboard

lib/
  hooks/
    use-artisan-payments.ts # useExportPayments hook
    use-admin-reports.ts    # useGenerateReport hook
```

---

## Security Considerations

1. **Authentication** - All endpoints require valid Clerk session
2. **Authorization** - Role-based access (ARTISAN for payments, ADMIN for reports)
3. **Data Masking** - Phone numbers are partially masked in exports
4. **Audit Trail** - Admin report generation is logged
5. **Query Limits** - Activity logs limited to 1000 records for performance

---

## Error Handling

### API Errors

| Status | Description |
|--------|-------------|
| 401 | Unauthorized - No valid session |
| 403 | Forbidden - Incorrect role |
| 404 | Not found - User/subscription not found |
| 400 | Bad request - Validation failed |
| 500 | Internal server error |

### Client-Side

Both hooks use TanStack Query mutations with:
- Loading states (`isPending`)
- Error states (`isError`, `error`)
- Success callbacks for automatic file download

---

## Usage Examples

### Artisan Export

```typescript
// In component
const exportMutation = useExportPayments()

// Export all payments
exportMutation.mutate()

// Export filtered by status
exportMutation.mutate('COMPLETED')
```

### Admin Report

```typescript
// In component
const reportMutation = useGenerateReport()

// Generate JSON report
const result = await reportMutation.mutateAsync({ 
  type: 'artisans',
  format: 'json'
})

// Generate and download CSV
const blob = await reportMutation.mutateAsync({ 
  type: 'payments',
  format: 'csv',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z'
})
downloadReportCSV(blob, 'payments')
```
