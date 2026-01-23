import { prisma } from './client'
import { log } from './utils'

// ============================================================================
// CLEAR DATABASE
// ============================================================================

export async function clearDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear database in production!')
  }
  
  log('🗑️', 'Clearing existing data...')
  
  // Delete in order of dependencies (child tables first)
  await prisma.notification.deleteMany()
  await prisma.notificationPreferences.deleteMany()
  await prisma.searchHistory.deleteMany()
  await prisma.savedArtisan.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.specialization.deleteMany()
  await prisma.portfolioItem.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
  
  log('✅', 'Existing data cleared\n')
}
