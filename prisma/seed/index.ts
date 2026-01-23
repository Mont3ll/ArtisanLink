import { ArtisanStatus } from '../../app/generated/prisma'
import { prisma, SeedResult } from './client'
import { KENYAN_COUNTIES, PROFESSIONS } from './data'
import { logSection } from './utils'

// Import all seed modules
import { clearDatabase } from './00-clear'
import { seedAdmins, seedClients } from './01-users'
import { seedArtisans } from './02-artisans'
import { seedSpecializations, seedPortfolioItems } from './03-specializations'
import { seedReviews } from './04-reviews'
import { seedConversations, seedMessages } from './05-conversations'
import { seedPayments, seedSavedArtisans, seedSearchHistory } from './06-payments'
import { seedNotifications, seedActivityLogs } from './07-notifications'
import { seedSettings } from './08-settings'

// ============================================================================
// SEED CONFIGURATION
// ============================================================================

export interface SeedConfig {
  clearFirst?: boolean
  clients?: number
  artisansPerProfession?: number
  conversations?: number
  activityLogs?: number
}

const DEFAULT_CONFIG: SeedConfig = {
  clearFirst: true,
  clients: 40,
  artisansPerProfession: 10,
  conversations: 80,
  activityLogs: 100
}

// ============================================================================
// MAIN SEED ORCHESTRATOR
// ============================================================================

export async function seed(config: SeedConfig = {}): Promise<SeedResult[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const results: SeedResult[] = []
  
  console.log('🌱 Starting comprehensive database seeding...')
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
    
    // Step 2: Create artisan-related data
    logSection('STEP 2: Creating Artisan Data')
    
    // Type assertions for seed functions - the actual data includes profile from seedArtisans
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const specResult = await seedSpecializations(artisans as any)
    results.push(specResult)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portfolioResult = await seedPortfolioItems(artisans as any)
    results.push(portfolioResult)
    
    // Step 3: Create reviews
    logSection('STEP 3: Creating Reviews')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewResult = await seedReviews(artisans as any, clients)
    results.push(reviewResult)
    
    // Step 4: Create conversations and messages
    logSection('STEP 4: Creating Conversations')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { conversations } = await seedConversations(artisans as any, clients as any, cfg.conversations)
    results.push({ name: 'Conversations', count: conversations.length })
    
    const messageResult = await seedMessages(conversations, artisans, clients)
    results.push(messageResult)
    
    // Step 5: Create payments and saved data
    logSection('STEP 5: Creating Payments & Saved Data')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentResult = await seedPayments(artisans as any)
    results.push(paymentResult)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const savedResult = await seedSavedArtisans(artisans as any, clients)
    results.push(savedResult)
    
    const searchResult = await seedSearchHistory(clients)
    results.push(searchResult)
    
    // Step 6: Create notifications and logs
    logSection('STEP 6: Creating Notifications & Logs')
    
    const notifResult = await seedNotifications(artisans, clients)
    results.push(notifResult)
    
    const logResult = await seedActivityLogs(admins, artisans, cfg.activityLogs)
    results.push(logResult)
    
    // Step 7: Create settings
    logSection('STEP 7: Creating System Settings')
    
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
  console.log('📊 SEEDING SUMMARY:')
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
  console.log('─────────────────────────────────────────────────\n')
  console.log('🚀 You can now start the application and explore!')
  console.log('   Run: npm run dev\n')
}

function getEmoji(name: string): string {
  const emojis: Record<string, string> = {
    'Admins': '👑',
    'Clients': '👥',
    'Artisans': '🔨',
    'Specializations': '🎯',
    'Portfolio Items': '🎨',
    'Reviews': '⭐',
    'Conversations': '💬',
    'Messages': '📨',
    'Payments': '💳',
    'Saved Artisans': '💾',
    'Search History': '🔍',
    'Notifications': '🔔',
    'Activity Logs': '📝',
    'Settings': '⚙️',
  }
  return emojis[name] || '•'
}

// ============================================================================
// INDIVIDUAL SEED RUNNERS (for running specific groups)
// These fetch users from DB so types are cast appropriately
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

export async function seedInteractionsOnly(): Promise<void> {
  console.log('🌱 Seeding interactions only (requires existing users)...\n')
  
  const [artisans, clients] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'ARTISAN' },
      include: { profile: { include: { subscription: true } } }
    }),
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: { profile: true }
    })
  ])
  
  if (artisans.length === 0 || clients.length === 0) {
    throw new Error('No users found. Run seedUsersOnly first.')
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await seedReviews(artisans as any, clients)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { conversations } = await seedConversations(artisans as any, clients as any)
  await seedMessages(conversations, artisans, clients)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await seedPayments(artisans as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await seedSavedArtisans(artisans as any, clients)
  await seedSearchHistory(clients)
  
  console.log('\n✅ Interactions seeding completed!')
}

export async function seedSystemDataOnly(): Promise<void> {
  console.log('🌱 Seeding system data only (requires existing users)...\n')
  
  const [admins, artisans, clients] = await Promise.all([
    prisma.user.findMany({ where: { role: 'ADMIN' } }),
    prisma.user.findMany({ where: { role: 'ARTISAN' } }),
    prisma.user.findMany({ where: { role: 'CLIENT' } })
  ])
  
  if (admins.length === 0) {
    throw new Error('No admins found. Run seedUsersOnly first.')
  }
  
  await seedNotifications(artisans, clients)
  await seedActivityLogs(admins, artisans)
  await seedSettings()
  
  console.log('\n✅ System data seeding completed!')
}

// Export prisma for cleanup
export { prisma }
