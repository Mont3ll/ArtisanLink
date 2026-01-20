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
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Clerk account
- M-Pesa Daraja API credentials (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/artisanlink.git
   cd artisanlink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed  # Optional: seed with sample data
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:reset     # Reset and reseed database
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
```

## Documentation

- [API Reference](docs/API.md) - Complete API documentation
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Environment Variables](docs/ENVIRONMENT.md) - Configuration reference
- [User Guide](docs/USER_GUIDE.md) - End-user documentation

## User Roles

- **Client** - Browse artisans, leave reviews, send messages
- **Artisan** - Manage portfolio, receive inquiries, subscribe for premium features
- **Admin** - Platform management, user verification, content moderation

## License

Private - All rights reserved
