import { 
  UserRole, 
  UserStatus, 
  ArtisanStatus, 
  SubscriptionStatus, 
  SubscriptionPlan 
} from '../../app/generated/prisma'
import { prisma, SeedResult, BATCH_SIZE } from './client'
import { KENYAN_COUNTIES, PROFESSIONS, KENYAN_FIRST_NAMES, KENYAN_LAST_NAMES } from './data'
import { SEED_IMAGE_URLS } from './seed-image-urls'
import { 
  randomElement, 
  randomInt,
  randomDate, 
  generatePhone, 
  generateEmail, 
  addCoordinateJitter,
  processBatch,
  log,
  logSuccess
} from './utils'

// ============================================================================
// TEST USER CLERK ID (from environment variable)
// ============================================================================
// This allows linking the first seeded artisan to a real Clerk account for testing
// Set this in .env to use actual Clerk user ID after creating test user

const SEED_ARTISAN_CLERK_ID = process.env.SEED_ARTISAN_CLERK_ID || 'clerk_artisan_001'

// ============================================================================
// SEED ARTISANS
// ============================================================================

export async function seedArtisans(
  adminId: string,
  artisansPerProfession = 10
): Promise<{ artisans: Awaited<ReturnType<typeof prisma.user.create>>[] } & SeedResult> {
  log('🔨', `Creating ${PROFESSIONS.length * artisansPerProfession} artisan users...`)
  
  // Prepare artisan data
  const artisanData: Array<{
    profIndex: number
    artisanIndex: number
    profession: typeof PROFESSIONS[0]
    firstName: string
    lastName: string
    county: typeof KENYAN_COUNTIES[0]
    city: string
    coords: { lat: number; lng: number }
    experience: number
    hourlyRate: number
    artisanStatus: ArtisanStatus
    hasSubscription: boolean
    isAvailable: boolean
    artisanId: number
    isTestArtisan: boolean
  }> = []
  
  for (let profIndex = 0; profIndex < PROFESSIONS.length; profIndex++) {
    const profession = PROFESSIONS[profIndex]
    
    for (let i = 0; i < artisansPerProfession; i++) {
      const isFemale = Math.random() > 0.65
      const firstName = randomElement(isFemale ? KENYAN_FIRST_NAMES.female : KENYAN_FIRST_NAMES.male)
      const lastName = randomElement(KENYAN_LAST_NAMES)
      const county = randomElement(KENYAN_COUNTIES.slice(0, 35))
      const city = randomElement(county.cities)
      const coords = addCoordinateJitter(county.lat, county.lng)
      
      const experience = randomInt(1, 20)
      const hourlyRate = randomInt(profession.hourlyRateRange[0], profession.hourlyRateRange[1])
      
      const artisanId = profIndex * artisansPerProfession + i + 1
      const isTestArtisan = artisanId === 1 // First artisan is the test user
      
      // Determine artisan status distribution
      // First artisan (test user) is always VERIFIED with active subscription
      let artisanStatus: ArtisanStatus
      let hasSubscription = false
      let isAvailable = false
      
      if (isTestArtisan) {
        // Test artisan: guaranteed VERIFIED, has subscription, is available
        artisanStatus = ArtisanStatus.VERIFIED
        hasSubscription = true
        isAvailable = true
      } else {
        const statusRoll = Math.random()
        if (statusRoll < 0.65) {
          artisanStatus = ArtisanStatus.VERIFIED
          hasSubscription = Math.random() > 0.2
          isAvailable = hasSubscription && Math.random() > 0.15
        } else if (statusRoll < 0.85) {
          artisanStatus = ArtisanStatus.PENDING
        } else {
          artisanStatus = ArtisanStatus.REJECTED
        }
      }
      
      artisanData.push({
        profIndex,
        artisanIndex: i,
        profession,
        firstName,
        lastName,
        county,
        city,
        coords,
        experience,
        hourlyRate,
        artisanStatus,
        hasSubscription,
        isAvailable,
        artisanId,
        isTestArtisan
      })
    }
  }
  
  const artisans = await processBatch(
    artisanData,
    BATCH_SIZE,
    async (data) => {
      // Use env var Clerk ID for test artisan (artisanId 1), placeholder for rest
      const clerkId = data.isTestArtisan 
        ? SEED_ARTISAN_CLERK_ID 
        : `clerk_artisan_${String(data.artisanId).padStart(3, '0')}`
      
      return prisma.user.create({
        data: {
          clerkId,
          email: data.isTestArtisan ? 'artisan@chapaworks.co.ke' : generateEmail(data.firstName, data.lastName),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: generatePhone(),
          role: UserRole.ARTISAN,
          status: data.artisanStatus === ArtisanStatus.REJECTED ? UserStatus.SUSPENDED : UserStatus.ACTIVE,
          emailVerifiedAt: randomDate(365),
          lastLoginAt: data.isAvailable ? randomDate(7) : randomDate(30),
          profile: {
            create: {
              bio: data.isTestArtisan
                ? 'Experienced carpenter based in Nairobi specialising in custom furniture, shelving, and home renovations. Verified professional with 8 years of field experience and a portfolio of completed residential and commercial projects.'
                : `Experienced ${data.profession.name.toLowerCase()} with ${data.experience} years of expertise. ${randomElement([
                'Committed to quality and customer satisfaction.',
                'Specializing in both residential and commercial projects.',
                'Known for attention to detail and timely delivery.',
                'Passionate about craftsmanship and innovation.',
                'Serving clients across the region with dedication.',
              ])}`,
              profession: data.profession.name,
              experience: data.experience,
              hourlyRate: data.hourlyRate,
              isAvailable: data.isAvailable,
              artisanStatus: data.artisanStatus,
              city: data.isTestArtisan ? 'Nairobi' : data.city,
              county: data.isTestArtisan ? 'Nairobi' : data.county.name,
              country: 'Kenya',
              latitude: data.coords.lat,
              longitude: data.coords.lng,
              address: data.isTestArtisan ? 'Westlands, Nairobi' : `${randomElement(['Plot', 'House', 'Shop', 'Building'])} ${randomInt(1, 500)}, ${data.city}`,
              profileImage: data.isTestArtisan ? SEED_IMAGE_URLS['seed-artisan-profile'] : null,
              averageRating: data.isTestArtisan ? 4.9 : 0,
              totalReviews: data.isTestArtisan ? 12 : 0,
              idDocumentUrl: data.isTestArtisan ? SEED_IMAGE_URLS['seed-artisan-id'] : null,
              certificateUrl: data.isTestArtisan
                ? SEED_IMAGE_URLS['seed-artisan-cert']
                : (data.artisanStatus !== ArtisanStatus.PENDING ? `https://certificates.chapaworks.co.ke/${data.artisanId}.pdf` : null),
              certificateUploadedAt: randomDate(180),
              verifiedAt: data.artisanStatus === ArtisanStatus.VERIFIED ? randomDate(90) : null,
              verifiedBy: data.artisanStatus === ArtisanStatus.VERIFIED ? adminId : null,
              ...(data.hasSubscription && {
                subscription: {
                  create: {
                    plan: data.isTestArtisan ? SubscriptionPlan.MONTHLY : (Math.random() > 0.4 ? SubscriptionPlan.MONTHLY : SubscriptionPlan.ANNUAL),
                    status: data.isTestArtisan ? SubscriptionStatus.ACTIVE : (Math.random() > 0.1 ? SubscriptionStatus.ACTIVE : SubscriptionStatus.EXPIRED),
                    startDate: randomDate(365),
                    endDate: data.isTestArtisan 
                      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Test artisan: 30 days from now
                      : new Date(Date.now() + randomInt(-30, 365) * 24 * 60 * 60 * 1000),
                    amount: Math.random() > 0.4 ? 499 : 4999,
                    currency: 'KES',
                    mpesaRequestId: `ws_CO_${randomInt(100000000, 999999999)}`,
                    mpesaTransactionId: `OEI${randomInt(1000000, 9999999)}`,
                  }
                }
              })
            }
          },
          notificationPreferences: {
            create: {
              emailNotifications: Math.random() > 0.15,
              pushNotifications: Math.random() > 0.2,
              smsNotifications: Math.random() > 0.6,
              messageNotifications: true,
              reviewNotifications: true,
              verificationNotifications: true,
              systemNotifications: true,
              promotionNotifications: Math.random() > 0.4,
              bookingNotifications: true,
            }
          }
        },
        include: { 
          profile: { 
            include: { subscription: true } 
          } 
        }
      })
    },
    200 // Longer delay for artisans due to more complex data
  )
  
  const verifiedCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.VERIFIED).length
  const pendingCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.PENDING).length
  const rejectedCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.REJECTED).length
  
  logSuccess('Created artisan users', artisans.length)
  
  return {
    artisans,
    name: 'Artisans',
    count: artisans.length,
    details: {
      verified: verifiedCount,
      pending: pendingCount,
      rejected: rejectedCount
    }
  }
}
