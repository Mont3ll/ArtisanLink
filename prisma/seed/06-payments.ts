import { 
  PaymentStatus, 
  PaymentMethod,
  SubscriptionPlan 
} from '../../app/generated/prisma'
import { prisma, SeedResult, BATCH_SIZE } from './client'
import { KENYAN_COUNTIES, PROFESSIONS } from './data'
import { 
  randomElement, 
  randomInt,
  randomDate,
  processBatch,
  log,
  logSuccess
} from './utils'

type ArtisanWithSubscription = {
  id: string
  phone: string | null
  profile: {
    id: string
    isAvailable: boolean | null
    subscription: {
      id: string
      plan: SubscriptionPlan
      amount: number
    } | null
  } | null
}

type Client = {
  id: string
}

// ============================================================================
// SEED PAYMENTS
// ============================================================================

export async function seedPayments(
  artisans: ArtisanWithSubscription[]
): Promise<SeedResult> {
  log('💳', 'Creating payment records...')
  
  const artisansWithSubscription = artisans.filter(a => a.profile?.subscription)
  
  const paymentData: Array<{
    subscriptionId: string
    amount: number
    plan: SubscriptionPlan
    phone: string
  }> = []
  
  for (const artisan of artisansWithSubscription) {
    const subscription = artisan.profile!.subscription!
    const numPayments = randomInt(1, 6)
    
    for (let i = 0; i < numPayments; i++) {
      paymentData.push({
        subscriptionId: subscription.id,
        amount: subscription.amount,
        plan: subscription.plan,
        phone: artisan.phone || '+254700000000'
      })
    }
  }
  
  const payments = await processBatch(
    paymentData,
    BATCH_SIZE,
    async (data) => {
      return prisma.payment.create({
        data: {
          subscriptionId: data.subscriptionId,
          amount: data.amount,
          currency: 'KES',
          method: PaymentMethod.MPESA,
          status: randomElement([PaymentStatus.COMPLETED, PaymentStatus.COMPLETED, PaymentStatus.COMPLETED, PaymentStatus.FAILED]),
          mpesaRequestId: `ws_CO_${randomInt(100000000, 999999999)}`,
          mpesaCheckoutId: `ws_CO_${randomInt(100000000, 999999999)}`,
          mpesaTransactionId: `OEI${randomInt(1000000, 9999999)}`,
          mpesaReceiptNumber: `OEI${randomInt(1000000, 9999999)}`,
          phoneNumber: data.phone,
          description: `${data.plan === SubscriptionPlan.MONTHLY ? 'Monthly' : 'Annual'} subscription payment`,
          createdAt: randomDate(365),
          paidAt: randomDate(365),
        }
      })
    }
  )
  
  logSuccess('Created payment records', payments.length)
  
  return {
    name: 'Payments',
    count: payments.length
  }
}

// ============================================================================
// SEED SAVED ARTISANS
// ============================================================================

export async function seedSavedArtisans(
  artisans: ArtisanWithSubscription[],
  clients: Client[]
): Promise<SeedResult> {
  log('💾', 'Creating saved artisans...')
  
  const availableArtisans = artisans.filter(a => a.profile?.isAvailable)
  
  const savedData: Array<{
    userId: string
    profileId: string
  }> = []
  
  for (const client of clients.slice(0, 30)) {
    const numSaved = randomInt(0, 8)
    const savedIds = new Set<string>()
    
    for (let i = 0; i < numSaved; i++) {
      const artisan = randomElement(availableArtisans)
      if (!artisan.profile || savedIds.has(artisan.profile.id)) continue
      savedIds.add(artisan.profile.id)
      
      savedData.push({
        userId: client.id,
        profileId: artisan.profile.id
      })
    }
  }
  
  const savedArtisans = await processBatch(
    savedData,
    BATCH_SIZE * 2,
    async (data) => {
      return prisma.savedArtisan.create({
        data: {
          userId: data.userId,
          profileId: data.profileId,
          createdAt: randomDate(90),
        }
      })
    }
  )
  
  logSuccess('Created saved artisans', savedArtisans.length)
  
  return {
    name: 'Saved Artisans',
    count: savedArtisans.length
  }
}

// ============================================================================
// SEED SEARCH HISTORY
// ============================================================================

export async function seedSearchHistory(
  clients: Client[]
): Promise<SeedResult> {
  log('🔍', 'Creating search history...')
  
  const searchData: Array<{
    userId: string
  }> = []
  
  for (const client of clients.slice(0, 25)) {
    const numSearches = randomInt(1, 10)
    
    for (let i = 0; i < numSearches; i++) {
      searchData.push({ userId: client.id })
    }
  }
  
  const searchHistory = await processBatch(
    searchData,
    BATCH_SIZE * 2,
    async (data) => {
      const profession = randomElement(PROFESSIONS)
      const county = randomElement(KENYAN_COUNTIES.slice(0, 20))
      
      return prisma.searchHistory.create({
        data: {
          userId: data.userId,
          query: Math.random() > 0.5 
            ? randomElement([profession.name.toLowerCase(), ...profession.specializations.map(s => s.toLowerCase())]) 
            : null,
          profession: Math.random() > 0.3 ? profession.name : null,
          location: Math.random() > 0.4 ? county.name : null,
          minRating: Math.random() > 0.6 ? randomInt(3, 4) : null,
          maxRadius: Math.random() > 0.5 ? randomInt(10, 50) : null,
          resultCount: randomInt(0, 50),
          latitude: Math.random() > 0.5 ? county.lat : null,
          longitude: Math.random() > 0.5 ? county.lng : null,
          createdAt: randomDate(60),
        }
      })
    }
  )
  
  logSuccess('Created search history entries', searchHistory.length)
  
  return {
    name: 'Search History',
    count: searchHistory.length
  }
}
