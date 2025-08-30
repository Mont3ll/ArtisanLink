# Database Setup and Seeding

This document explains how to set up and seed the ArtisanLink database.

## Prerequisites

1. PostgreSQL database running locally or remotely
2. Database connection string configured in `.env` file
3. Prisma dependencies installed

## Database Schema

The schema includes the following main models:
- **User**: Core user authentication and profile data
- **Profile**: Extended profile information for artisans and clients
- **PortfolioItem**: Artisan work showcase items
- **Subscription**: M-Pesa subscription management
- **Conversation/Message**: In-app messaging system
- **Review**: Client reviews of artisan work
- **ActivityLog**: Admin activity tracking
- **Setting**: System configuration

## Setup Commands

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Create Database Migration
```bash
npm run db:migrate
```

### 3. Seed the Database
```bash
npm run db:seed
```

### 4. Reset Database (Development Only)
```bash
npm run db:reset
```

## Seed Data

The seed file creates:
- 1 Admin user
- 2 Client users
- 5 Artisan users (3 verified, 1 pending, 1 with subscription)
- 4 Portfolio items with realistic project data
- Specializations and skills for artisans
- Sample conversations and messages
- Reviews and ratings
- System settings

### Sample Users

**Admin:**
- Email: admin@artisanlink.ke
- Role: ADMIN

**Clients:**
- john.doe@gmail.com (Nairobi)
- sarah.wilson@yahoo.com (Mombasa)

**Artisans:**
- james.carpenter@gmail.com (Carpenter, Nairobi) - Verified & Subscribed
- mary.metalworks@gmail.com (Metalworker, Nakuru) - Verified & Subscribed
- peter.tailor@gmail.com (Tailor, Kisumu) - Pending Verification
- david.electric@gmail.com (Electrician, Mombasa) - Verified & Subscribed
- grace.plumber@gmail.com (Plumber, Eldoret) - Verified & Subscribed

## Database Scripts

Available in `package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset && npm run db:seed"
  }
}
```

## Environment Variables

Make sure your `.env` file contains:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/artisanlink_db"
```

## Troubleshooting

### Common Issues:

1. **Database connection failed**: Check your DATABASE_URL in `.env`
2. **Migration conflicts**: Use `npm run db:reset` in development
3. **Seed data conflicts**: Clear existing data before seeding
4. **Permission issues**: Ensure database user has CREATE/INSERT permissions

### Development Tips:

- Use `npx prisma studio` to view and edit data in a GUI
- Use `npx prisma db push` for quick schema changes without migrations
- Check logs with `npx prisma generate --verbose` for detailed output

## Production Considerations

- Never run `db:reset` in production
- Use proper migration workflow for schema changes
- Backup database before major updates
- Use environment-specific seed data
