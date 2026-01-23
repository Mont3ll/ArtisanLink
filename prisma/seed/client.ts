import { PrismaClient } from '../../app/generated/prisma'

// Shared Prisma client instance for all seed modules
export const prisma = new PrismaClient({
  accelerateUrl: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
})

// Type for seed function results
export interface SeedResult {
  name: string
  count: number
  details?: Record<string, number>
}

// Batch size for database operations to avoid timeouts
export const BATCH_SIZE = 10
