# ArtisanLink

A digital marketplace connecting clients with skilled artisans in Kenya.

## Tech Stack

- **Framework**: Next.js 16.1 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: PostgreSQL 15 via Prisma 7
- **Auth**: Clerk
- **Payments**: M-Pesa Daraja API
- **Maps**: Mapbox GL JS
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (recommended) or PostgreSQL 15+
- Clerk account
- M-Pesa Daraja API credentials (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mont3ll/ArtisanLink.git
   cd ArtisanLink
   git checkout updated-version
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and fill in your values. Required variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
   - `CLERK_SECRET_KEY` - From Clerk dashboard

4. Set up the database (see [Database Setup](#database-setup) below)

5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

### Option A: Using Docker (Recommended)

The easiest way to set up PostgreSQL is with Docker:

```bash
docker compose up -d
```

This starts a PostgreSQL 15 container with the correct credentials pre-configured. The database persists in a Docker volume.

To stop the database:
```bash
docker compose down        # Stop container (data persists)
docker compose down -v     # Stop and delete all data
```

### Option B: Manual PostgreSQL Setup

If you prefer a local PostgreSQL installation:

```bash
# Using psql
psql -U postgres
CREATE DATABASE artisanlink_db;
CREATE USER artisan_user WITH PASSWORD 'artisan_password';
GRANT ALL PRIVILEGES ON DATABASE artisanlink_db TO artisan_user;
\q
```

### Configure Database URL

Update your `.env` file:
```env
DATABASE_URL="postgresql://artisan_user:artisan_password@localhost:5432/artisanlink_db"
```

### Generate Prisma Client & Push Schema

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
```

### Seed the Database (Recommended)

The seed script creates comprehensive mock data for development:

```bash
npm run db:seed
```

This creates:
- 2 admin users
- 40 client users
- 150 artisans (across 15 professions)
- Reviews, conversations, payments, and more

#### Seed Options

```bash
npm run db:seed -- --small      # Smaller dataset for faster seeding
npm run db:seed -- --no-clear   # Keep existing data, add new records
npm run db:reset                # Clear all data and reseed
```

## Clerk Authentication Setup

### 1. Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your API keys to `.env`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

### 2. Create Test Users (Development)

To test all three dashboards with seeded mock data, create test users in Clerk that link to the seeded database records:

#### Step 1: Create Users in Clerk Dashboard

Go to **Clerk Dashboard > Users > Create User** and create three users:

| Email | publicMetadata |
|-------|----------------|
| `admin@artisanlink.co.ke` | `{ "role": "admin" }` |
| `client@artisanlink.co.ke` | `{ "role": "client" }` |
| `artisan@artisanlink.co.ke` | `{ "role": "artisan" }` |

To set `publicMetadata`:
1. After creating the user, click on them
2. Scroll to "Public metadata"
3. Click "Edit" and add the JSON object

#### Step 2: Copy Clerk User IDs

After creating each user, copy their Clerk User ID (format: `user_xxxxx`).

#### Step 3: Add IDs to Environment

Add these to your `.env` file:

```env
# Seed Test Users (Development Only)
SEED_ADMIN_CLERK_ID=user_xxxxx
SEED_CLIENT_CLERK_ID=user_xxxxx
SEED_ARTISAN_CLERK_ID=user_xxxxx
```

#### Step 4: Reseed Database

```bash
npm run db:seed
```

#### Step 5: Test Login

Now you can login with any of the three test accounts:
- **Admin**: `admin@artisanlink.co.ke` - Access admin dashboard with platform analytics
- **Client**: `client@artisanlink.co.ke` - Browse artisans, view conversations, reviews
- **Artisan**: `artisan@artisanlink.co.ke` - Manage portfolio, view stats, subscription active

### User Role Sync

When users sign in, their role is automatically synced from Clerk's `publicMetadata.role` to the database. The sync happens on every page load via the `UserSyncProvider`.

Supported roles in `publicMetadata`:
- `admin` - Platform administrator
- `client` - Customer looking for artisans
- `artisan` - Service provider

## Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run lint             # Run ESLint

# Testing
npm run test             # Run all tests once
npm run test:watch       # Run tests in watch mode

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset and reseed database
```

## Project Structure

```
app/
  (admin-dashboard)/     # Admin route group
  (artisan-dashboard)/   # Artisan route group  
  (client-dashboard)/    # Client route group
  (auth)/                # Auth pages
  api/                   # API routes
components/
  ui/                    # shadcn/ui primitives
  landing/               # Landing page components
  dashboard/             # Dashboard components
  shared/                # Shared components
lib/
  hooks/                 # React Query hooks
  utils.ts               # Utility functions
  prisma.ts              # Prisma client
prisma/
  schema.prisma          # Database schema
  seed/                  # Modular seed scripts
```

## User Roles

- **Client** - Browse artisans, leave reviews, send messages
- **Artisan** - Manage portfolio, receive inquiries, subscribe for premium features
- **Admin** - Platform management, user verification, content moderation

## NixOS Users

If you're on NixOS, use the provided `flake.nix` for development:

```bash
nix develop
npm run dev
```

For commands requiring Prisma binaries (migrations, reset):
```bash
nix develop --command npm run db:reset
```

## Troubleshooting

### "User not found" or 403 errors on dashboard

This usually means the user exists in Clerk but not in the database, or the roles don't match.

1. Ensure `publicMetadata.role` is set correctly in Clerk
2. The user sync happens automatically on page load
3. Check browser console for sync errors

### Prisma binary errors on NixOS

Use `nix develop` to enter the development shell before running Prisma commands.

### Seed not using environment variables

Ensure `dotenv` is installed and the seed script loads it (already configured in `prisma/seed.ts`).

## License

Private - All rights reserved
