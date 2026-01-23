import { ArtisanStatus } from '../../app/generated/prisma'
import { prisma, SeedResult, BATCH_SIZE } from './client'
import { REVIEW_COMMENTS } from './data'
import { 
  randomElement, 
  randomInt,
  randomDate,
  processBatch,
  log,
  logSuccess
} from './utils'

type UserWithProfile = {
  id: string
  profile: {
    id: string
    artisanStatus: ArtisanStatus | null
  } | null
}

type Client = {
  id: string
}

// ============================================================================
// SEED REVIEWS
// ============================================================================

export async function seedReviews(
  artisans: UserWithProfile[],
  clients: Client[]
): Promise<SeedResult> {
  log('⭐', 'Creating reviews...')
  
  const verifiedArtisans = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.VERIFIED)
  
  const reviewData: Array<{
    profileId: string
    clientId: string
    rating: 1 | 2 | 3 | 4 | 5
  }> = []
  
  // Create reviews for verified artisans (limit to 100 for manageable data)
  for (const artisan of verifiedArtisans.slice(0, 100)) {
    if (!artisan.profile) continue
    
    const numReviews = randomInt(0, 8)
    const usedClients = new Set<string>()
    
    for (let i = 0; i < numReviews; i++) {
      // Get a random client that hasn't reviewed this artisan yet
      let client: Client | undefined
      let attempts = 0
      do {
        client = randomElement(clients)
        attempts++
      } while (usedClients.has(client.id) && attempts < 10)
      
      if (usedClients.has(client.id)) continue
      usedClients.add(client.id)
      
      const rating = randomInt(3, 5) as 1 | 2 | 3 | 4 | 5 // Bias towards positive reviews
      
      reviewData.push({
        profileId: artisan.profile.id,
        clientId: client.id,
        rating
      })
    }
  }
  
  const reviews = await processBatch(
    reviewData,
    BATCH_SIZE,
    async (data) => {
      return prisma.review.create({
        data: {
          profileId: data.profileId,
          clientId: data.clientId,
          rating: data.rating,
          comment: randomElement(REVIEW_COMMENTS[data.rating]),
          projectTitle: randomElement([
            'Home Renovation Project',
            'Office Installation',
            'Repair Work',
            'Custom Order',
            'Emergency Service',
            'Regular Maintenance',
          ]),
          projectCost: randomInt(5000, 150000),
          isApproved: Math.random() > 0.1,
          isHidden: Math.random() > 0.95,
          createdAt: randomDate(180),
        }
      })
    }
  )
  
  logSuccess('Created reviews', reviews.length)
  
  return {
    name: 'Reviews',
    count: reviews.length
  }
}
