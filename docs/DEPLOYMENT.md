# ArtisanLink Deployment Guide

This guide covers deploying ArtisanLink to production environments.

## Prerequisites

- Node.js 20+ (LTS recommended)
- PostgreSQL 15+ database
- Clerk account for authentication
- M-Pesa Daraja API credentials (for payments)
- Domain with SSL certificate

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments, edge functions, and built-in CDN.

#### Steps

1. **Connect Repository**
   ```bash
   # Push your code to GitHub/GitLab/Bitbucket
   git remote add origin https://github.com/your-org/artisanlink.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Configure project settings

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Project → Settings → Environment Variables:
   
   ```
   DATABASE_URL=postgresql://user:password@host:5432/artisanlink
   CLERK_SECRET_KEY=sk_live_xxxxx
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/after-sign-in
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/after-sign-up
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   MPESA_CONSUMER_KEY=xxxxx
   MPESA_CONSUMER_SECRET=xxxxx
   MPESA_PASSKEY=xxxxx
   MPESA_SHORT_CODE=xxxxx
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
   MPESA_ENVIRONMENT=production
   CRON_SECRET=xxxxx
   ```

4. **Configure Build Settings**
   
   Build Command: `npm run build`
   Output Directory: `.next`
   Install Command: `npm ci`

5. **Set Up Database**
   
   Run migrations after first deployment:
   ```bash
   npx vercel env pull .env.local  # Pull env vars locally
   npx prisma migrate deploy       # Run migrations
   npx prisma db seed              # Optional: seed data
   ```

6. **Configure Cron Jobs**
   
   Create `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/subscriptions",
         "schedule": "0 0 * * *"
       },
       {
         "path": "/api/cron/process-payouts",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```
   
   **Cron Schedule Reference**:
   - `/api/cron/subscriptions` - Daily at midnight (subscription renewals/expirations)
   - `/api/cron/process-payouts` - Hourly (artisan B2C payouts)

7. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Railway

Railway offers simple PostgreSQL hosting alongside your application.

#### Steps

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

3. **Configure Environment Variables**
   - Add all required environment variables in Railway dashboard

4. **Deploy**
   - Railway auto-deploys on push to main branch

5. **Run Migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

### Option 3: Docker (Self-Hosted)

For complete control over infrastructure.

#### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://artisan:password@db:5432/artisanlink
      # Add other environment variables
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: artisan
      POSTGRES_PASSWORD: password
      POSTGRES_DB: artisanlink
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U artisan -d artisanlink"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database (optional)
docker-compose exec app npx prisma db seed
```

---

## Database Setup

### Managed PostgreSQL Providers

Recommended providers for production:

1. **Supabase** - Free tier available, great developer experience
2. **Neon** - Serverless PostgreSQL, auto-scaling
3. **Railway** - Simple setup, integrated with deployment
4. **PlanetScale** - MySQL-compatible (requires schema changes)
5. **AWS RDS** - Enterprise-grade, more configuration needed

### Database Migration

```bash
# Generate migration from schema changes
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (CAUTION: destroys data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Connection Pooling

For serverless environments, use connection pooling:

```
# Supabase example with pgBouncer
DATABASE_URL=postgresql://user:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true

# Direct connection for migrations
DIRECT_URL=postgresql://user:password@db.xxxxx.supabase.co:5432/postgres
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Clerk Configuration

### Production Setup

1. **Create Production Instance**
   - In Clerk Dashboard, create a production instance
   - Copy production API keys

2. **Configure Domains**
   - Add your production domain in Clerk Dashboard
   - Configure allowed redirect URLs

3. **Webhook Setup**
   - Set up webhooks for user events
   - URL: `https://yourdomain.com/api/webhooks/clerk`

4. **Social Login**
   - Configure OAuth providers (Google, Facebook, etc.)
   - Add production OAuth credentials

---

## M-Pesa Configuration

### STK Push Setup (Client Payments)

1. **Go Live on Safaricom**
   - Apply for production credentials at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Complete Go Live checklist
   - Get production consumer key/secret

2. **Configure Callback URL**
   - Must be HTTPS
   - Must be publicly accessible
   - URL: `https://yourdomain.com/api/payments/mpesa/callback`

3. **Test Production Flow**
   - Use small amounts for testing
   - Verify callback handling
   - Monitor payment logs

### B2C Setup (Artisan Payouts)

B2C (Business to Customer) enables automatic payouts to artisans.

1. **Apply for B2C API Access**
   - Log in to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Apply for B2C API access for your app
   - Complete B2C onboarding requirements

2. **Download Safaricom Certificates**
   - Download certificates from Safaricom Developer Portal
   - Sandbox: `SandboxCertificate.cer`
   - Production: `ProductionCertificate.cer`
   - Place in `lib/mpesa/certificates/` directory

3. **Configure B2C Environment Variables**
   ```
   MPESA_B2C_SHORTCODE=your_b2c_shortcode
   MPESA_B2C_INITIATOR_NAME=your_initiator_name
   MPESA_B2C_INITIATOR_PASSWORD=your_initiator_password
   MPESA_B2C_RESULT_URL=https://yourdomain.com/api/payments/b2c/result
   MPESA_B2C_TIMEOUT_URL=https://yourdomain.com/api/payments/b2c/timeout
   ENABLE_B2C_PAYOUTS=true
   ```

4. **Configure Commission Settings**
   ```
   PLATFORM_COMMISSION_RATE=0.10
   PROMOTIONAL_COMMISSION_RATE=0.05
   PROMOTIONAL_JOB_COUNT=5
   ARTISAN_DEPOSIT_SHARE=0.80
   MINIMUM_PAYOUT_AMOUNT=10
   ```

5. **Test B2C Flow in Sandbox**
   - Use sandbox credentials first
   - Test with small amounts
   - Verify callbacks are received
   - Check payout status updates

6. **B2C Security Notes**
   - Initiator password is RSA encrypted before sending
   - Callback URLs must be HTTPS
   - Store certificates securely (not in version control)
   - Rotate credentials periodically

---

## Security Checklist

Before going live:

- [ ] All environment variables set (no defaults)
- [ ] HTTPS enforced (redirect HTTP -> HTTPS)
- [ ] CORS configured for your domain only
- [ ] Rate limiting enabled
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Database access restricted (no public access)
- [ ] Clerk production keys used
- [ ] M-Pesa STK Push production credentials used
- [ ] M-Pesa B2C production credentials used
- [ ] B2C callback URLs configured and accessible
- [ ] Safaricom certificates stored securely
- [ ] Error tracking configured (Sentry)
- [ ] Logs don't expose sensitive data
- [ ] ADMIN_PROMOTION_SECRET removed or empty
- [ ] CRON_SECRET is strong and unique
- [ ] Payout cron job configured and tested

---

## Monitoring Setup

### Sentry (Error Tracking)

1. Create project at [sentry.io](https://sentry.io)
2. Add DSN to environment:
   ```
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) (free tier)
- [Better Uptime](https://betteruptime.com)
- [Pingdom](https://pingdom.com)

Monitor endpoint: `GET /api/health`

### Analytics

Add Google Analytics:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Performance Optimization

### Next.js Configuration

Ensure `next.config.ts` has:
```typescript
const config = {
  output: 'standalone',  // For Docker
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: 'img.clerk.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}
```

### CDN Configuration

Vercel automatically provides CDN. For self-hosted:
- Use Cloudflare for CDN and DDoS protection
- Configure caching headers
- Enable Brotli compression

---

## Backup Strategy

### Database Backups

1. **Automated Backups**
   - Most managed databases include automated backups
   - Configure retention period (30 days recommended)

2. **Manual Backups**
   ```bash
   # Export database
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   
   # Restore database
   psql $DATABASE_URL < backup_20240115.sql
   ```

3. **Point-in-Time Recovery**
   - Enable WAL archiving for PITR
   - Available on most managed services

### File Backups

For uploaded images (if using local storage):
- Sync to cloud storage (S3, GCS)
- Use Cloudinary for automatic backup

---

## Scaling Considerations

### Horizontal Scaling

- Next.js is stateless - scale horizontally easily
- Use managed PostgreSQL with read replicas
- Implement Redis for shared caching (replace in-memory cache)

### Database Scaling

```bash
# Monitor slow queries
EXPLAIN ANALYZE SELECT ...

# Add indexes for common queries (already done in schema)
```

### Rate Limiting at Scale

Replace in-memory rate limiting with Redis:
```typescript
// lib/rate-limit.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `DATABASE_URL` format
   - Verify database is accessible from deployment
   - Check connection pooling settings

2. **Clerk Authentication Errors**
   - Verify API keys match environment
   - Check domain configuration
   - Ensure cookies are set correctly

3. **M-Pesa Callback Issues**
   - Verify callback URL is HTTPS
   - Check URL is publicly accessible
   - Review M-Pesa logs in Safaricom portal

4. **Build Failures**
   - Run `npm run build` locally first
   - Check for TypeScript errors
   - Verify all environment variables are set

### Logs

```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker-compose logs -f app
```

---

## Rollback Procedure

### Vercel

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Docker

```bash
# Tag releases
docker tag artisanlink:latest artisanlink:v1.0.0

# Rollback
docker-compose down
docker tag artisanlink:v1.0.0 artisanlink:latest
docker-compose up -d
```

### Database Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back migration_name

# Or restore from backup
psql $DATABASE_URL < backup.sql
```

---

## Go-Live Checklist

- [ ] All tests passing
- [ ] Production environment variables set
- [ ] Database migrated and seeded
- [ ] Clerk production instance configured
- [ ] M-Pesa STK Push production credentials configured
- [ ] M-Pesa B2C production credentials configured
- [ ] B2C certificates downloaded and stored
- [ ] Payout cron job configured (hourly)
- [ ] SSL certificate valid
- [ ] DNS configured correctly
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] First admin account created
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] B2C payout flow tested end-to-end
