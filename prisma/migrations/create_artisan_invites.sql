-- Migration: Create artisan_invites table for ChapaWorks invite system
-- Run this in your database console (Neon, Supabase, Prisma Console, or psql)
-- Generated: 2026-05-14

-- Step 1: Create InviteStatus enum
DO $$ BEGIN
  CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');
EXCEPTION
  WHEN duplicate_object THEN RAISE NOTICE 'InviteStatus enum already exists, skipping.';
END $$;

-- Step 2: Create artisan_invites table
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

-- Step 3: Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "artisan_invites_token_key"     ON "artisan_invites"("token");
CREATE INDEX        IF NOT EXISTS "artisan_invites_email_idx"      ON "artisan_invites"("email");
CREATE INDEX        IF NOT EXISTS "artisan_invites_token_idx"      ON "artisan_invites"("token");
CREATE INDEX        IF NOT EXISTS "artisan_invites_status_idx"     ON "artisan_invites"("status");
CREATE INDEX        IF NOT EXISTS "artisan_invites_invitedBy_idx"  ON "artisan_invites"("invitedBy");

-- Verify
SELECT 'artisan_invites table created successfully' AS result;
