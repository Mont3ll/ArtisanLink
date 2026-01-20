/**
 * ArtisanLink Database Seed Script
 * 
 * This is the main entry point for seeding the database.
 * The seed logic is organized into modular files in the prisma/seed/ directory.
 * 
 * Usage:
 *   npx prisma db seed          # Run full seed
 *   npx tsx prisma/seed.ts      # Run full seed directly
 * 
 * To run specific seed groups, import and call directly:
 *   import { seedUsersOnly } from './seed'
 *   import { seedArtisanDataOnly } from './seed'
 *   import { seedInteractionsOnly } from './seed'
 *   import { seedSystemDataOnly } from './seed'
 * 
 * Seed modules:
 *   - 00-clear.ts        : Clear existing data
 *   - 01-users.ts        : Admin and client users
 *   - 02-artisans.ts     : Artisan users with profiles and subscriptions
 *   - 03-specializations.ts : Specializations and portfolio items
 *   - 04-reviews.ts      : Client reviews
 *   - 05-conversations.ts : Conversations and messages
 *   - 06-payments.ts     : Payments, saved artisans, search history
 *   - 07-notifications.ts : Notifications and activity logs
 *   - 08-settings.ts     : System settings
 */

import { 
  seed, 
  prisma,
  seedUsersOnly,
  seedArtisanDataOnly,
  seedInteractionsOnly,
  seedSystemDataOnly,
  type SeedConfig 
} from './seed/index'

// Parse command line arguments for optional config
const args = process.argv.slice(2)
const config: SeedConfig = {}

// Support for command line options
if (args.includes('--no-clear')) {
  config.clearFirst = false
}

if (args.includes('--small')) {
  config.clients = 10
  config.artisansPerProfession = 3
  config.conversations = 20
  config.activityLogs = 30
}

// Check for specific seed group commands
const command = args[0]

async function main() {
  switch (command) {
    case 'users':
      await seedUsersOnly(config)
      break
    case 'artisan-data':
      await seedArtisanDataOnly()
      break
    case 'interactions':
      await seedInteractionsOnly()
      break
    case 'system':
      await seedSystemDataOnly()
      break
    default:
      await seed(config)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Export functions for programmatic use
export {
  seed,
  seedUsersOnly,
  seedArtisanDataOnly,
  seedInteractionsOnly,
  seedSystemDataOnly,
  type SeedConfig
}
