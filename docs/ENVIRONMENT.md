# ArtisanLink Environment Variables

This document provides detailed documentation for all environment variables used by ArtisanLink.

## Quick Start

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Fill in required values (marked with **Required**)

3. For production, ensure all security-related variables are properly set

---

## Variable Reference

### Database

#### DATABASE_URL

**Required** | String

PostgreSQL connection string for the application database.

```bash
# Local development
DATABASE_URL="postgresql://artisan_user:artisan_password@localhost:5432/artisanlink_db"

# Production (Supabase example)
DATABASE_URL="postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres"

# With connection pooling (serverless)
DATABASE_URL="postgresql://postgres:[password]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true"
```

**Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

**Notes**:
- For serverless deployments, use connection pooling (port 6543 for Supabase/pgBouncer)
- Never commit this value to version control
- Use strong, unique passwords in production

#### DIRECT_URL

Optional | String

Direct database connection for Prisma migrations (bypasses connection pooler).

```bash
DIRECT_URL="postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres"
```

**Notes**:
- Only needed when using connection pooling
- Used by `prisma migrate` commands

---

### Clerk Authentication

#### NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

**Required** | String

Clerk publishable key for frontend authentication.

```bash
# Development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

**How to get**: [Clerk Dashboard](https://dashboard.clerk.com) → API Keys

**Notes**:
- Safe to expose in browser (public key)
- Use `pk_test_` for development, `pk_live_` for production

#### CLERK_SECRET_KEY

**Required** | String

Clerk secret key for backend authentication.

```bash
# Development
CLERK_SECRET_KEY=sk_test_xxxxx

# Production
CLERK_SECRET_KEY=sk_live_xxxxx
```

**How to get**: [Clerk Dashboard](https://dashboard.clerk.com) → API Keys

**Notes**:
- **Never expose in browser or commit to version control**
- Use `sk_test_` for development, `sk_live_` for production

#### NEXT_PUBLIC_CLERK_SIGN_IN_URL

**Required** | String

Path to sign-in page.

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
```

#### NEXT_PUBLIC_CLERK_SIGN_UP_URL

**Required** | String

Path to sign-up page.

```bash
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL

**Required** | String

Redirect path after successful sign-in.

```bash
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/after-sign-in
```

#### NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

**Required** | String

Redirect path after successful sign-up.

```bash
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/after-sign-up
```

---

### M-Pesa Daraja API

These are required for payment processing in Kenya.

#### MPESA_CONSUMER_KEY

**Required for payments** | String

M-Pesa API consumer key.

```bash
MPESA_CONSUMER_KEY=your_consumer_key
```

**How to get**: [Safaricom Developer Portal](https://developer.safaricom.co.ke) → My Apps → Your App

#### MPESA_CONSUMER_SECRET

**Required for payments** | String

M-Pesa API consumer secret.

```bash
MPESA_CONSUMER_SECRET=your_consumer_secret
```

**How to get**: [Safaricom Developer Portal](https://developer.safaricom.co.ke) → My Apps → Your App

**Notes**:
- **Never expose or commit to version control**

#### MPESA_PASSKEY

**Required for payments** | String

Lipa Na M-Pesa Online passkey for STK Push.

```bash
MPESA_PASSKEY=your_passkey
```

**How to get**: Provided by Safaricom after Go Live approval

#### MPESA_SHORT_CODE

**Required for payments** | String

Business short code (Paybill or Till number).

```bash
MPESA_SHORT_CODE=174379  # Sandbox
MPESA_SHORT_CODE=123456  # Production
```

**How to get**: Your registered business short code from Safaricom

#### MPESA_CALLBACK_URL

**Required for payments** | String

Public URL for M-Pesa payment callbacks.

```bash
# Development (use ngrok or similar)
MPESA_CALLBACK_URL=https://xxxx.ngrok.io/api/payments/mpesa/callback

# Production
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
```

**Requirements**:
- Must be HTTPS
- Must be publicly accessible
- Must respond within 30 seconds

#### MPESA_ENVIRONMENT

**Required for payments** | String

M-Pesa API environment.

```bash
# Testing
MPESA_ENVIRONMENT=sandbox

# Production
MPESA_ENVIRONMENT=production
```

**Values**: `sandbox` or `production`

---

### M-Pesa B2C (Artisan Payouts)

These are required for automatic artisan payouts.

#### MPESA_B2C_SHORTCODE

**Required for B2C payouts** | String

M-Pesa B2C business shortcode.

```bash
MPESA_B2C_SHORTCODE=600000  # Sandbox
MPESA_B2C_SHORTCODE=123456  # Production
```

**How to get**: Apply for B2C API access on Safaricom Developer Portal

#### MPESA_B2C_INITIATOR_NAME

**Required for B2C payouts** | String

B2C initiator username registered with Safaricom.

```bash
MPESA_B2C_INITIATOR_NAME=testapi
```

**How to get**: Provided by Safaricom during B2C onboarding

#### MPESA_B2C_INITIATOR_PASSWORD

**Required for B2C payouts** | String

B2C initiator password (encrypted using Safaricom certificate).

```bash
MPESA_B2C_INITIATOR_PASSWORD=your_initiator_password
```

**Notes**:
- **Never expose or commit to version control**
- Password is RSA encrypted before sending to M-Pesa API

#### MPESA_B2C_RESULT_URL

**Required for B2C payouts** | String

Callback URL for B2C payment results.

```bash
# Development (use ngrok or similar)
MPESA_B2C_RESULT_URL=https://xxxx.ngrok.io/api/payments/b2c/result

# Production
MPESA_B2C_RESULT_URL=https://yourdomain.com/api/payments/b2c/result
```

**Requirements**:
- Must be HTTPS
- Must be publicly accessible
- Must respond within 30 seconds

#### MPESA_B2C_TIMEOUT_URL

**Required for B2C payouts** | String

Callback URL for B2C timeout notifications.

```bash
# Development
MPESA_B2C_TIMEOUT_URL=https://xxxx.ngrok.io/api/payments/b2c/timeout

# Production
MPESA_B2C_TIMEOUT_URL=https://yourdomain.com/api/payments/b2c/timeout
```

#### ENABLE_B2C_PAYOUTS

Optional | Boolean

Enable/disable B2C payout processing.

```bash
ENABLE_B2C_PAYOUTS=false  # Development
ENABLE_B2C_PAYOUTS=true   # Production
```

**Default**: `false`

**Notes**:
- Set to `true` only when B2C credentials are configured
- When `false`, payouts are created but not processed

---

### Commission & Payout Settings

Configuration for platform commission and payout processing.

#### PLATFORM_COMMISSION_RATE

Optional | Number

Standard platform commission rate (decimal).

```bash
PLATFORM_COMMISSION_RATE=0.10  # 10%
```

**Default**: `0.10` (10%)

#### PROMOTIONAL_COMMISSION_RATE

Optional | Number

Promotional commission rate for new artisans (decimal).

```bash
PROMOTIONAL_COMMISSION_RATE=0.05  # 5%
```

**Default**: `0.05` (5%)

#### PROMOTIONAL_JOB_COUNT

Optional | Number

Number of jobs at promotional rate before switching to standard rate.

```bash
PROMOTIONAL_JOB_COUNT=5
```

**Default**: `5`

**Notes**:
- Artisans get 5% commission on their first 5 completed jobs
- After 5 jobs, commission increases to 10%

#### ARTISAN_DEPOSIT_SHARE

Optional | Number

Percentage of deposit paid immediately to artisan (decimal).

```bash
ARTISAN_DEPOSIT_SHARE=0.80  # 80%
```

**Default**: `0.80` (80%)

**Notes**:
- 80% of deposit goes to artisan immediately for materials
- 20% held as escrow until job completion

#### MINIMUM_PAYOUT_AMOUNT

Optional | Number

Minimum payout amount in KES (M-Pesa minimum).

```bash
MINIMUM_PAYOUT_AMOUNT=10
```

**Default**: `10` (KES 10)

**Notes**:
- Payouts below this amount are held until they accumulate
- KES 10 is M-Pesa's minimum transfer amount

#### PAYOUT_MAX_RETRIES

Optional | Number

Maximum retry attempts for failed payouts before manual review.

```bash
PAYOUT_MAX_RETRIES=3
```

**Default**: `3`

**Notes**:
- Retries use exponential backoff: 5min, 30min, 2hr
- After max retries, payout is flagged for admin review

#### PAYOUT_BATCH_SIZE

Optional | Number

Maximum payouts to process per cron run.

```bash
PAYOUT_BATCH_SIZE=10
```

**Default**: `10`

**Notes**:
- Prevents timeout on large batches
- Cron runs hourly, so large backlogs process over time

#### PAYOUT_ADMIN_EMAIL

Optional | String

Email address for payout failure notifications.

```bash
PAYOUT_ADMIN_EMAIL=admin@artisanlink.co.ke
```

**Notes**:
- Receives alerts when payouts require manual review
- Leave empty to disable email notifications

---

### Application Settings

#### NEXT_PUBLIC_APP_URL

**Required** | String

Base URL of your application.

```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Notes**:
- Used for generating absolute URLs
- No trailing slash

#### NEXTAUTH_SECRET

Recommended | String

Secret for signing tokens and sessions.

```bash
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_random_secret_here
```

**Notes**:
- Should be at least 32 characters
- Use cryptographically secure random value

#### LOG_LEVEL

Optional | String

Logging verbosity level.

```bash
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

**Values**: `debug`, `info`, `warn`, `error`

**Default**: `info`

---

### File Upload (Cloudinary)

Optional - for image uploads.

#### CLOUDINARY_CLOUD_NAME

Optional | String

Cloudinary cloud name.

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**How to get**: [Cloudinary Console](https://cloudinary.com/console)

#### CLOUDINARY_API_KEY

Optional | String

Cloudinary API key.

```bash
CLOUDINARY_API_KEY=123456789012345
```

#### CLOUDINARY_API_SECRET

Optional | String

Cloudinary API secret.

```bash
CLOUDINARY_API_SECRET=your_api_secret
```

**Notes**:
- **Never expose or commit to version control**

#### MAX_UPLOAD_SIZE

Optional | Number

Maximum file upload size in bytes.

```bash
MAX_UPLOAD_SIZE=5242880  # 5MB
```

**Default**: 5242880 (5MB)

---

### Email Service

Optional - for email notifications.

#### EMAIL_SERVER_HOST

Optional | String

SMTP server hostname.

```bash
EMAIL_SERVER_HOST=smtp.gmail.com
```

#### EMAIL_SERVER_PORT

Optional | Number

SMTP server port.

```bash
EMAIL_SERVER_PORT=587
```

**Common ports**: 587 (TLS), 465 (SSL), 25 (unencrypted)

#### EMAIL_SERVER_USER

Optional | String

SMTP authentication username.

```bash
EMAIL_SERVER_USER=your_email@gmail.com
```

#### EMAIL_SERVER_PASSWORD

Optional | String

SMTP authentication password.

```bash
EMAIL_SERVER_PASSWORD=your_app_password
```

**Notes**:
- For Gmail, use App Password (not your account password)
- **Never commit to version control**

#### EMAIL_FROM

Optional | String

Default "from" address for outgoing emails.

```bash
EMAIL_FROM=noreply@artisanlink.co.ke
```

---

### Feature Flags

Toggle features on/off.

#### ENABLE_EMAIL_NOTIFICATIONS

Optional | Boolean

Enable email notification system.

```bash
ENABLE_EMAIL_NOTIFICATIONS=false
```

**Default**: `false`

#### ENABLE_SMS_NOTIFICATIONS

Optional | Boolean

Enable SMS notifications via Africa's Talking.

```bash
ENABLE_SMS_NOTIFICATIONS=false
```

**Default**: `false`

#### ENABLE_MPESA_PAYMENTS

Optional | Boolean

Enable M-Pesa payment processing.

```bash
ENABLE_MPESA_PAYMENTS=false
```

**Default**: `false`

**Notes**:
- Set to `true` only when M-Pesa credentials are configured
- Prevents payment errors when M-Pesa is not set up

---

### Africa's Talking (SMS)

Optional - for SMS notifications.

#### AFRICASTALKING_USERNAME

Optional | String

Africa's Talking username.

```bash
AFRICASTALKING_USERNAME=sandbox  # Testing
AFRICASTALKING_USERNAME=your_username  # Production
```

**How to get**: [Africa's Talking](https://account.africastalking.com)

#### AFRICASTALKING_API_KEY

Optional | String

Africa's Talking API key.

```bash
AFRICASTALKING_API_KEY=your_api_key
```

#### AFRICASTALKING_SENDER_ID

Optional | String

SMS sender ID (must be registered).

```bash
AFRICASTALKING_SENDER_ID=ArtisanLink
```

---

### Mapbox

For map visualization.

#### NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

Optional | String

Mapbox public access token.

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxxxx
```

**How to get**: [Mapbox Account](https://account.mapbox.com/access-tokens/)

**Notes**:
- Use scoped token with minimal permissions
- Safe to expose in browser

---

### Monitoring & Analytics

#### SENTRY_DSN

Optional | String

Sentry Data Source Name for error tracking.

```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**How to get**: [Sentry](https://sentry.io) → Project Settings → Client Keys

**Notes**:
- Leave empty to disable Sentry
- Application works fine without Sentry

#### NEXT_PUBLIC_GA_MEASUREMENT_ID

Optional | String

Google Analytics 4 Measurement ID.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**How to get**: Google Analytics → Admin → Data Streams → Your Stream

---

### Rate Limiting

#### RATE_LIMIT_AUTHENTICATED

Optional | Number

Requests per minute for authenticated users.

```bash
RATE_LIMIT_AUTHENTICATED=100
```

**Default**: 100

#### RATE_LIMIT_ANONYMOUS

Optional | Number

Requests per minute for anonymous users.

```bash
RATE_LIMIT_ANONYMOUS=20
```

**Default**: 20

---

### Cron Jobs

#### CRON_SECRET

**Required for cron** | String

Secret key for authenticating cron job requests.

```bash
# Generate with: openssl rand -base64 32
CRON_SECRET=your_cron_secret_here
```

**Usage**:
- Passed as Authorization header to `/api/cron/*` endpoints
- Prevents unauthorized execution of scheduled tasks

---

### Admin Setup

#### ADMIN_PROMOTION_SECRET

Optional | String

Secret key for bootstrapping the first admin user.

```bash
# Generate with: openssl rand -base64 32
ADMIN_PROMOTION_SECRET=your_bootstrap_secret
```

**Usage**:
- Used ONLY for creating the first admin when no admins exist
- Call POST `/api/user/promote-admin` with this secret

**Security**:
- **Remove or leave empty after first admin is created**
- Only works when database has zero admin users
- Should never be used in production after initial setup

---

## Environment-Specific Configurations

### Development (.env.local)

```bash
# Database
DATABASE_URL="postgresql://artisan_user:artisan_password@localhost:5432/artisanlink_db"

# Clerk (test keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/after-sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/after-sign-up

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug

# Payments (sandbox)
MPESA_ENVIRONMENT=sandbox
ENABLE_MPESA_PAYMENTS=false

# Admin bootstrap (development only)
ADMIN_PROMOTION_SECRET=dev_secret_for_first_admin
```

### Production (.env.production)

```bash
# Database (with connection pooling)
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Clerk (live keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/after-sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/after-sign-up

# App
NEXT_PUBLIC_APP_URL=https://artisanlink.co.ke
LOG_LEVEL=info

# M-Pesa STK Push (production)
MPESA_CONSUMER_KEY=xxxxx
MPESA_CONSUMER_SECRET=xxxxx
MPESA_PASSKEY=xxxxx
MPESA_SHORT_CODE=xxxxx
MPESA_CALLBACK_URL=https://artisanlink.co.ke/api/payments/mpesa/callback
MPESA_ENVIRONMENT=production
ENABLE_MPESA_PAYMENTS=true

# M-Pesa B2C Payouts (production)
MPESA_B2C_SHORTCODE=xxxxx
MPESA_B2C_INITIATOR_NAME=xxxxx
MPESA_B2C_INITIATOR_PASSWORD=xxxxx
MPESA_B2C_RESULT_URL=https://artisanlink.co.ke/api/payments/b2c/result
MPESA_B2C_TIMEOUT_URL=https://artisanlink.co.ke/api/payments/b2c/timeout
ENABLE_B2C_PAYOUTS=true

# Commission Settings
PLATFORM_COMMISSION_RATE=0.10
PROMOTIONAL_COMMISSION_RATE=0.05
PROMOTIONAL_JOB_COUNT=5
ARTISAN_DEPOSIT_SHARE=0.80
MINIMUM_PAYOUT_AMOUNT=10

# Payout Processing
PAYOUT_MAX_RETRIES=3
PAYOUT_BATCH_SIZE=10
PAYOUT_ADMIN_EMAIL=admin@artisanlink.co.ke

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Cron
CRON_SECRET=xxxxx

# Admin (REMOVE after first admin created)
ADMIN_PROMOTION_SECRET=
```

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use different values per environment** - Dev, staging, production
3. **Rotate secrets regularly** - Especially after team changes
4. **Use secret managers** - Vercel, AWS Secrets Manager, etc.
5. **Minimal permissions** - Use scoped API keys where possible
6. **Audit access** - Track who has access to production secrets

---

## Troubleshooting

### Variable not loading

1. Restart the development server
2. Check variable name spelling (case-sensitive)
3. Ensure no spaces around `=` sign
4. Verify `.env` file is in project root

### NEXT_PUBLIC_ variables not in browser

- Must rebuild the application after changes
- Only `NEXT_PUBLIC_` prefixed variables are exposed to browser

### Database connection issues

- Check `DATABASE_URL` format
- Verify database server is running
- Check firewall/network access
- Try connection with `psql` directly
