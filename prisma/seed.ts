/**
 * ChapaWorks Database Seed Script
 * 
 * This is the main entry point for seeding the database.
 * The seed logic is organized into modular files in the prisma/seed/ directory.
 * 
 * Only static/structural data is seeded:
 *   - Users (admins, clients, artisans with profiles and subscriptions)
 *   - Artisan content (specializations, portfolio items)
 *   - System settings
 * 
 * All operational data (reviews, messages, jobs, payments, notifications, etc.)
 * should be created through manual testing.
 * 
 * Usage:
 *   npx prisma db seed          # Run full seed
 *   npx tsx prisma/seed.ts      # Run full seed directly
 * 
 * Seed modules:
 *   - 00-clear.ts           : Clear existing data
 *   - 01-users.ts           : Admin and client users
 *   - 02-artisans.ts        : Artisan users with profiles and subscriptions
 *   - 03-specializations.ts : Specializations and portfolio items
 *   - 08-settings.ts        : System settings
 */

// Load environment variables from .env file
import 'dotenv/config'

import { 
  seed, 
  prisma,
  seedUsersOnly,
  seedArtisanDataOnly,
  seedSettingsOnly,
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
    case 'settings':
      await seedSettingsOnly()
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
  seedSettingsOnly,
  type SeedConfig
}
