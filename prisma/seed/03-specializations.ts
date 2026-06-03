import { ArtisanStatus } from '../../app/generated/prisma'
import { prisma, SeedResult, BATCH_SIZE } from './client'
import { PROFESSIONS } from './data'
import { SEED_IMAGE_URLS } from './seed-image-urls'
import { 
  randomElement, 
  randomInt,
  randomDate,
  processBatch,
  log,
  logSuccess
} from './utils'

type ArtisanWithProfile = {
  id: string
  clerkId?: string
  profile: {
    id: string
    profession: string | null
    experience: number | null
    artisanStatus: ArtisanStatus | null
    city: string | null
  } | null
}

// ============================================================================
// SEED SPECIALIZATIONS
// ============================================================================

export async function seedSpecializations(
  artisans: ArtisanWithProfile[]
): Promise<SeedResult> {
  log('🎯', 'Creating specializations...')
  
  const specData: Array<{
    profileId: string
    spec: string
    profession: typeof PROFESSIONS[0]
    experience: number
  }> = []
  
  for (const artisan of artisans) {
    if (!artisan.profile) continue
    
    const profession = PROFESSIONS.find(p => p.name === artisan.profile!.profession)
    if (!profession) continue
    
    // Add 2-4 specializations per artisan
    const numSpecs = randomInt(2, 4)
    const selectedSpecs = [...profession.specializations]
      .sort(() => Math.random() - 0.5)
      .slice(0, numSpecs)
    
    for (const spec of selectedSpecs) {
      specData.push({
        profileId: artisan.profile.id,
        spec,
        profession,
        experience: artisan.profile.experience || 5
      })
    }
  }
  
  const specializations = await processBatch(
    specData,
    BATCH_SIZE * 2, // Specializations are simple, can do more at once
    async (data) => {
      return prisma.specialization.create({
        data: {
          profileId: data.profileId,
          name: data.spec,
          category: data.profession.name,
          skillLevel: randomInt(3, 5),
          yearsExp: randomInt(1, data.experience),
        }
      })
    }
  )
  
  logSuccess('Created specializations', specializations.length)
  
  return {
    name: 'Specializations',
    count: specializations.length
  }
}

// ============================================================================
// SEED PORTFOLIO ITEMS
// ============================================================================

export async function seedPortfolioItems(
  artisans: ArtisanWithProfile[]
): Promise<SeedResult> {
  log('🎨', 'Creating portfolio items...')
  
  const verifiedArtisans = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.VERIFIED)
  
  const portfolioData: Array<{
    profileId: string
    profession: typeof PROFESSIONS[0]
    city: string
    itemIndex: number
  }> = []
  
  for (const artisan of verifiedArtisans) {
    if (!artisan.profile) continue
    
    const profession = PROFESSIONS.find(p => p.name === artisan.profile!.profession)
    if (!profession) continue
    
    // Add 2-6 portfolio items per verified artisan
    const numItems = randomInt(2, 6)
    
    for (let i = 0; i < numItems; i++) {
      portfolioData.push({
        profileId: artisan.profile.id,
        profession,
        city: artisan.profile.city || 'Nairobi',
        itemIndex: i
      })
    }
  }
  
  const portfolioItems = await processBatch(
    portfolioData,
    BATCH_SIZE,
    async (data) => {
      const category = randomElement(data.profession.portfolioCategories)
      const projectTitles = [
        `${category} Project in ${data.city}`,
        `Custom ${category} Work`,
        `${category} Renovation`,
        `${data.profession.name} Services - ${category}`,
        `Complete ${category} Installation`,
      ]
      
const REAL_PORTFOLIO_IMAGES = [
  { imageUrl: SEED_IMAGE_URLS['seed-portfolio-1'], imageUrls: [SEED_IMAGE_URLS['seed-portfolio-2'], SEED_IMAGE_URLS['seed-portfolio-3']] },
  { imageUrl: SEED_IMAGE_URLS['seed-portfolio-2'], imageUrls: [SEED_IMAGE_URLS['seed-portfolio-1']] },
  { imageUrl: SEED_IMAGE_URLS['seed-portfolio-3'], imageUrls: [SEED_IMAGE_URLS['seed-portfolio-1'], SEED_IMAGE_URLS['seed-portfolio-2']] },
]

      return prisma.portfolioItem.create({
        data: {
          profileId: data.profileId,
          title: randomElement(projectTitles),
          description: `Professional ${data.profession.name.toLowerCase()} work completed for a satisfied client. ${randomElement([
            'This project showcases our attention to detail.',
            'Completed on time and within budget.',
            'Client was extremely pleased with the results.',
            'A challenging project that turned out beautifully.',
            'One of our favorite projects to date.',
          ])}`,
          ...(REAL_PORTFOLIO_IMAGES[data.itemIndex % 3]),
          category,
          tags: [data.profession.name.toLowerCase(), category.toLowerCase(), data.city.toLowerCase(), 'kenya'].filter(Boolean),
          completedAt: randomDate(365),
          duration: randomElement(['1 day', '2 days', '3 days', '1 week', '2 weeks', '3 weeks', '1 month']),
          cost: randomInt(5000, 200000),
          isPublic: true,
          isFeatured: Math.random() > 0.7,
        }
      })
    }
  )
  
  logSuccess('Created portfolio items', portfolioItems.length)
  
  return {
    name: 'Portfolio Items',
    count: portfolioItems.length
  }
}
