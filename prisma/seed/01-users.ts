import { UserRole, UserStatus } from '../../app/generated/prisma'
import { prisma, SeedResult, BATCH_SIZE } from './client'
import { KENYAN_COUNTIES } from './data'
import { 
  randomElement, 
  randomDate, 
  generatePhone, 
  generateEmail, 
  addCoordinateJitter,
  generateKenyanName,
  processBatch,
  log,
  logSuccess
} from './utils'

// ============================================================================
// TEST USER CLERK IDS (from environment variables)
// ============================================================================
// These allow linking seeded database users to real Clerk accounts for testing
// Set these in .env to use actual Clerk user IDs after creating test users

const SEED_ADMIN_CLERK_ID = process.env.SEED_ADMIN_CLERK_ID || 'clerk_admin_001'
const SEED_CLIENT_CLERK_ID = process.env.SEED_CLIENT_CLERK_ID || 'clerk_client_001'

// ============================================================================
// SEED ADMINS
// ============================================================================

export async function seedAdmins(): Promise<{ admins: Awaited<ReturnType<typeof prisma.user.create>>[] } & SeedResult> {
  log('👑', 'Creating admin users...')
  
  const admins = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: SEED_ADMIN_CLERK_ID,
        email: process.env.SEED_ADMIN_EMAIL || 'meluseno@gmail.com',
        firstName: 'Mel',
        lastName: 'Useno',
        phone: '+254700000001',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
        profile: {
          create: {
            bio: 'System administrator for ChapaWorks platform',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya',
            latitude: -1.2921,
            longitude: 36.8219,
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        clerkId: 'clerk_admin_002',
        email: 'support@chapaworks.co.ke',
        firstName: 'Customer',
        lastName: 'Support',
        phone: '+254700000002',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        lastLoginAt: randomDate(7),
        profile: {
          create: {
            bio: 'Customer support specialist',
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya',
            latitude: -1.2864,
            longitude: 36.8172,
          }
        }
      }
    }),
  ])
  
  logSuccess('Created admin users', admins.length)
  
  return {
    admins,
    name: 'Admins',
    count: admins.length
  }
}

// ============================================================================
// SEED CLIENTS
// ============================================================================

export async function seedClients(count = 40): Promise<{ clients: Awaited<ReturnType<typeof prisma.user.create>>[] } & SeedResult> {
  log('👥', `Creating ${count} client users...`)
  
  const clientData = Array.from({ length: count }, (_, i) => {
    const { firstName, lastName } = generateKenyanName()
    const county = randomElement(KENYAN_COUNTIES.slice(0, 25)) // Focus on more populated counties
    const city = randomElement(county.cities)
    const coords = addCoordinateJitter(county.lat, county.lng)
    
    return {
      index: i,
      firstName,
      lastName,
      county,
      city,
      coords
    }
  })
  
  const clients = await processBatch(
    clientData,
    BATCH_SIZE,
    async (data) => {
      // Use env var Clerk ID for first client (index 0), placeholder for rest
      const clerkId = data.index === 0 
        ? SEED_CLIENT_CLERK_ID 
        : `clerk_client_${String(data.index + 1).padStart(3, '0')}`
      
      return prisma.user.create({
        data: {
          clerkId,
          email: data.index === 0 ? 'client@chapaworks.co.ke' : generateEmail(data.firstName, data.lastName),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: generatePhone(),
          role: UserRole.CLIENT,
          status: data.index < 35 ? UserStatus.ACTIVE : UserStatus.PENDING,
          emailVerifiedAt: data.index < 35 ? randomDate(180) : null,
          lastLoginAt: data.index < 30 ? randomDate(14) : null,
          profile: {
            create: {
              bio: randomElement([
                'Looking for quality craftsmanship for my home projects',
                'Business owner seeking reliable artisans',
                'Interior design enthusiast looking for skilled professionals',
                'Property developer needing various artisan services',
                'Homeowner interested in renovation projects',
                null
              ]),
              city: data.city,
              county: data.county.name,
              country: 'Kenya',
              latitude: data.coords.lat,
              longitude: data.coords.lng,
            }
          },
          notificationPreferences: {
            create: {
              emailNotifications: Math.random() > 0.2,
              pushNotifications: Math.random() > 0.3,
              smsNotifications: Math.random() > 0.7,
              messageNotifications: true,
              reviewNotifications: true,
              verificationNotifications: true,
              systemNotifications: Math.random() > 0.1,
              promotionNotifications: Math.random() > 0.5,
              bookingNotifications: true,
            }
          }
        },
        include: { profile: true }
      })
    }
  )
  
  logSuccess('Created client users', clients.length)
  
  return {
    clients,
    name: 'Clients',
    count: clients.length
  }
}
