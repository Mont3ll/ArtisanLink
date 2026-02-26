import { ArtisanStatus } from '../../app/generated/prisma'
import { prisma, SeedResult } from './client'
import { KENYAN_COUNTIES, PROFESSIONS } from './data'
import { logSection } from './utils'

// Import seed modules (static/structural data only)
import { clearDatabase } from './00-clear'
import { seedAdmins, seedClients } from './01-users'
import { seedArtisans } from './02-artisans'
import { seedSpecializations, seedPortfolioItems } from './03-specializations'
import { seedSettings } from './08-settings'

// ============================================================================
// SEED CONFIGURATION
// ============================================================================

export interface SeedConfig {
  clearFirst?: boolean
  clients?: number
  artisansPerProfession?: number
}

const DEFAULT_CONFIG: SeedConfig = {
  clearFirst: true,
  clients: 40,
  artisansPerProfession: 10,
}

// ============================================================================
// MAIN SEED ORCHESTRATOR
// Seeds only static/structural data. All operational data (reviews, messages,
// jobs, payments, notifications, etc.) is created through manual testing.
// ============================================================================

export async function seed(config: SeedConfig = {}): Promise<SeedResult[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const results: SeedResult[] = []
  
  console.log('🌱 Starting database seeding (static data only)...')
  console.log('================================================\n')
  
  try {
    // Step 0: Clear existing data
    if (cfg.clearFirst) {
      await clearDatabase()
    }
    
    // Step 1: Create users
    logSection('STEP 1: Creating Users')
    
    const { admins } = await seedAdmins()
    results.push({ name: 'Admins', count: admins.length })
    
    const { clients } = await seedClients(cfg.clients)
    results.push({ name: 'Clients', count: clients.length })
    
    const { artisans, details: artisanDetails } = await seedArtisans(admins[0].id, cfg.artisansPerProfession)
    results.push({ name: 'Artisans', count: artisans.length, details: artisanDetails })
    
    // Step 2: Create artisan content (specializations + portfolio)
    logSection('STEP 2: Creating Artisan Content')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const specResult = await seedSpecializations(artisans as any)
    results.push(specResult)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portfolioResult = await seedPortfolioItems(artisans as any)
    results.push(portfolioResult)
    
    // Step 3: Create system settings
    logSection('STEP 3: Creating System Settings')
    
    const settingsResult = await seedSettings()
    results.push(settingsResult)
    
    // Print summary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    printSummary(results, artisans as any)
    
    return results
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

// ============================================================================
// SUMMARY
// ============================================================================

type ArtisanForSummary = {
  profile: {
    artisanStatus: ArtisanStatus | null
    subscription: unknown | null
    isAvailable: boolean | null
  } | null
}

function printSummary(
  results: SeedResult[], 
  artisans: ArtisanForSummary[]
): void {
  const verifiedCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.VERIFIED).length
  const pendingCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.PENDING).length
  const rejectedCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.REJECTED).length
  const subscribedCount = artisans.filter(a => a.profile?.subscription).length
  const availableCount = artisans.filter(a => a.profile?.isAvailable).length
  
  console.log('\n================================================')
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!')
  console.log('================================================\n')
  console.log('📊 SEEDING SUMMARY (Static Data Only):')
  console.log('─────────────────────────────────────────────────')
  
  for (const result of results) {
    const emoji = getEmoji(result.name)
    console.log(`${emoji} ${result.name.padEnd(20)} ${result.count}`)
  }
  
  console.log('─────────────────────────────────────────────────')
  console.log(`🔨 Artisan Breakdown:`)
  console.log(`   ├─ Verified:          ${verifiedCount}`)
  console.log(`   ├─ Pending:           ${pendingCount}`)
  console.log(`   ├─ Rejected:          ${rejectedCount}`)
  console.log(`   ├─ With Subscription: ${subscribedCount}`)
  console.log(`   └─ Available:         ${availableCount}`)
  console.log('─────────────────────────────────────────────────')
  console.log(`🌍 Counties Covered:     ${KENYAN_COUNTIES.length}`)
  console.log(`🛠️  Professions:          ${PROFESSIONS.length}`)
  console.log('─────────────────────────────────────────────────')
  console.log('\n📝 Operational data (reviews, messages, jobs, payments,')
  console.log('   notifications, etc.) should be created through manual testing.')
  console.log('\n🚀 You can now start the application and explore!')
  console.log('   Run: bun dev\n')
}

function getEmoji(name: string): string {
  const emojis: Record<string, string> = {
    'Admins': '👑',
    'Clients': '👥',
    'Artisans': '🔨',
    'Specializations': '🎯',
    'Portfolio Items': '🎨',
    'Settings': '⚙️',
  }
  return emojis[name] || '•'
}

// ============================================================================
// INDIVIDUAL SEED RUNNERS (for running specific groups)
// ============================================================================

export async function seedUsersOnly(config?: Partial<SeedConfig>): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  
  console.log('🌱 Seeding users only...\n')
  
  if (cfg.clearFirst) {
    await clearDatabase()
  }
  
  const { admins } = await seedAdmins()
  await seedClients(cfg.clients)
  await seedArtisans(admins[0].id, cfg.artisansPerProfession)
  
  console.log('\n✅ Users seeding completed!')
}

export async function seedArtisanDataOnly(): Promise<void> {
  console.log('🌱 Seeding artisan data only (requires existing users)...\n')
  
  const artisans = await prisma.user.findMany({
    where: { role: 'ARTISAN' },
    include: { profile: true }
  })
  
  if (artisans.length === 0) {
    throw new Error('No artisans found. Run seedUsersOnly first.')
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await seedSpecializations(artisans as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await seedPortfolioItems(artisans as any)
  
  console.log('\n✅ Artisan data seeding completed!')
}

export async function seedSettingsOnly(): Promise<void> {
  console.log('🌱 Seeding system settings only...\n')
  
  await seedSettings()
  
  console.log('\n✅ System settings seeding completed!')
}

// Export prisma for cleanup
export { prisma }
