/**
 * Migration: Create artisan_invites table and InviteStatus enum
 * Run with: npx tsx prisma/migrate-invites.ts
 */
import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient({
  accelerateUrl: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
} as ConstructorParameters<typeof PrismaClient>[0])

async function migrate() {
  console.log('🚀 Running invite migration...')

  try {
    // Create InviteStatus enum if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('✓ InviteStatus enum ready')

    // Create artisan_invites table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "artisan_invites" (
        "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "token"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "email"        TEXT NOT NULL,
        "name"         TEXT,
        "phone"        TEXT,
        "message"      TEXT,
        "invitedBy"    TEXT NOT NULL,
        "status"       "InviteStatus" NOT NULL DEFAULT 'PENDING',
        "usedAt"       TIMESTAMP(3),
        "usedByUserId" TEXT,
        "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt"    TIMESTAMP(3) NOT NULL,
        CONSTRAINT "artisan_invites_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✓ artisan_invites table created')

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "artisan_invites_token_key" ON "artisan_invites"("token");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "artisan_invites_email_idx" ON "artisan_invites"("email");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "artisan_invites_token_idx" ON "artisan_invites"("token");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "artisan_invites_status_idx" ON "artisan_invites"("status");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "artisan_invites_invitedBy_idx" ON "artisan_invites"("invitedBy");
    `)
    console.log('✓ Indexes created')

    console.log('\n✅ Migration complete! artisan_invites table is ready.')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
