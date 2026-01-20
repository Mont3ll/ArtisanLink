import { 
  PrismaClient, 
  UserRole, 
  UserStatus, 
  ArtisanStatus, 
  SubscriptionStatus, 
  SubscriptionPlan, 
  ConversationStatus, 
  MessageStatus,
  PaymentStatus,
  PaymentMethod,
  NotificationType
} from '../app/generated/prisma'

// For seeding, use DIRECT_DATABASE_URL if available (bypasses Accelerate)
// Otherwise fall back to DATABASE_URL
const prisma = new PrismaClient({
  accelerateUrl: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
})

// ============================================================================
// KENYAN DATA - Counties with coordinates and major cities
// ============================================================================

const KENYAN_COUNTIES = [
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, cities: ['Nairobi CBD', 'Westlands', 'Karen', 'Langata', 'Kasarani', 'Embakasi', 'Ruaraka'] },
  { name: 'Mombasa', lat: -4.0435, lng: 39.6682, cities: ['Mombasa Island', 'Nyali', 'Bamburi', 'Likoni', 'Changamwe', 'Kisauni'] },
  { name: 'Kisumu', lat: -0.0917, lng: 34.7680, cities: ['Kisumu CBD', 'Milimani', 'Mamboleo', 'Kondele', 'Nyalenda'] },
  { name: 'Nakuru', lat: -0.3031, lng: 36.0800, cities: ['Nakuru Town', 'Milimani', 'Section 58', 'Lanet', 'Naivasha'] },
  { name: 'Uasin Gishu', lat: 0.5143, lng: 35.2697, cities: ['Eldoret', 'West Indies', 'Langas', 'Huruma', 'Kapseret'] },
  { name: 'Kiambu', lat: -1.1714, lng: 36.8356, cities: ['Thika', 'Ruiru', 'Juja', 'Kiambu Town', 'Limuru', 'Githunguri'] },
  { name: 'Machakos', lat: -1.5177, lng: 37.2634, cities: ['Machakos Town', 'Athi River', 'Syokimau', 'Mlolongo', 'Kangundo'] },
  { name: 'Kajiado', lat: -1.8500, lng: 36.7833, cities: ['Kajiado Town', 'Kitengela', 'Ongata Rongai', 'Ngong', 'Kiserian'] },
  { name: 'Kilifi', lat: -3.5107, lng: 39.9093, cities: ['Kilifi Town', 'Malindi', 'Watamu', 'Mtwapa', 'Mariakani'] },
  { name: 'Kakamega', lat: 0.2827, lng: 34.7519, cities: ['Kakamega Town', 'Mumias', 'Lurambi', 'Butere', 'Khayega'] },
  { name: 'Nyeri', lat: -0.4197, lng: 36.9553, cities: ['Nyeri Town', 'Karatina', 'Othaya', 'Mukurweini', 'Tetu'] },
  { name: 'Meru', lat: 0.0500, lng: 37.6500, cities: ['Meru Town', 'Nkubu', 'Maua', 'Timau', 'Mikinduri'] },
  { name: 'Bungoma', lat: 0.5635, lng: 34.5606, cities: ['Bungoma Town', 'Webuye', 'Kimilili', 'Chwele', 'Malakisi'] },
  { name: 'Kericho', lat: -0.3689, lng: 35.2863, cities: ['Kericho Town', 'Litein', 'Londiani', 'Kipkelion', 'Sosiot'] },
  { name: 'Trans Nzoia', lat: 1.0167, lng: 35.0000, cities: ['Kitale', 'Endebess', 'Saboti', 'Kwanza', 'Kiminini'] },
  { name: 'Nyandarua', lat: -0.1800, lng: 36.5200, cities: ['Ol Kalou', 'Engineer', 'Ndaragwa', 'Kinangop', 'Miharati'] },
  { name: 'Muranga', lat: -0.7839, lng: 37.0400, cities: ['Muranga Town', 'Kangema', 'Kandara', 'Maragua', 'Kigumo'] },
  { name: 'Kirinyaga', lat: -0.5000, lng: 37.2833, cities: ['Kerugoya', 'Kutus', 'Sagana', 'Kagio', 'Wang\'uru'] },
  { name: 'Embu', lat: -0.5375, lng: 37.4592, cities: ['Embu Town', 'Runyenjes', 'Siakago', 'Kiritiri', 'Ishiara'] },
  { name: 'Laikipia', lat: 0.4000, lng: 36.9000, cities: ['Nanyuki', 'Nyahururu', 'Rumuruti', 'Dol Dol', 'Kinamba'] },
  { name: 'Nandi', lat: 0.1833, lng: 35.1333, cities: ['Kapsabet', 'Nandi Hills', 'Mosoriot', 'Kabiyet', 'Kobujoi'] },
  { name: 'Bomet', lat: -0.7827, lng: 35.3428, cities: ['Bomet Town', 'Sotik', 'Longisa', 'Mulot', 'Sigor'] },
  { name: 'Narok', lat: -1.0833, lng: 35.8667, cities: ['Narok Town', 'Kilgoris', 'Nairagie Enkare', 'Ololulung\'a'] },
  { name: 'Kisii', lat: -0.6817, lng: 34.7667, cities: ['Kisii Town', 'Ogembo', 'Suneka', 'Keroka', 'Nyamache'] },
  { name: 'Nyamira', lat: -0.5633, lng: 34.9358, cities: ['Nyamira Town', 'Keroka', 'Ekerenyo', 'Nyansiongo'] },
  { name: 'Migori', lat: -1.0634, lng: 34.4731, cities: ['Migori Town', 'Rongo', 'Awendo', 'Isebania', 'Kehancha'] },
  { name: 'Homa Bay', lat: -0.5273, lng: 34.4571, cities: ['Homa Bay Town', 'Oyugis', 'Kendu Bay', 'Mbita', 'Rachuonyo'] },
  { name: 'Siaya', lat: -0.0607, lng: 34.2881, cities: ['Siaya Town', 'Bondo', 'Ugunja', 'Yala', 'Ukwala'] },
  { name: 'Vihiga', lat: 0.0833, lng: 34.7333, cities: ['Mbale', 'Luanda', 'Chavakali', 'Majengo', 'Hamisi'] },
  { name: 'Busia', lat: 0.4608, lng: 34.1108, cities: ['Busia Town', 'Malaba', 'Nambale', 'Funyula', 'Matayos'] },
  { name: 'Kwale', lat: -4.1737, lng: 39.4521, cities: ['Kwale Town', 'Ukunda', 'Diani', 'Msambweni', 'Kinango'] },
  { name: 'Taita Taveta', lat: -3.3167, lng: 38.3667, cities: ['Voi', 'Wundanyi', 'Taveta', 'Mwatate'] },
  { name: 'Tana River', lat: -1.5000, lng: 40.0333, cities: ['Hola', 'Garsen', 'Madogo', 'Kipini'] },
  { name: 'Lamu', lat: -2.2686, lng: 40.9020, cities: ['Lamu Town', 'Mokowe', 'Mpeketoni', 'Witu'] },
  { name: 'Garissa', lat: -0.4536, lng: 39.6401, cities: ['Garissa Town', 'Dadaab', 'Balambala', 'Ijara'] },
  { name: 'Wajir', lat: 1.7471, lng: 40.0573, cities: ['Wajir Town', 'Habaswein', 'Buna', 'Griftu'] },
  { name: 'Mandera', lat: 3.9373, lng: 41.8569, cities: ['Mandera Town', 'Elwak', 'Takaba', 'Banisa'] },
  { name: 'Marsabit', lat: 2.3333, lng: 37.9833, cities: ['Marsabit Town', 'Moyale', 'Sololo', 'Laisamis'] },
  { name: 'Isiolo', lat: 0.3556, lng: 37.5833, cities: ['Isiolo Town', 'Merti', 'Garbatulla', 'Kinna'] },
  { name: 'Samburu', lat: 1.1667, lng: 36.9000, cities: ['Maralal', 'Archer\'s Post', 'Wamba', 'Baragoi'] },
  { name: 'Turkana', lat: 3.1167, lng: 35.5833, cities: ['Lodwar', 'Kakuma', 'Lokichoggio', 'Lokichar'] },
  { name: 'West Pokot', lat: 1.6167, lng: 35.1167, cities: ['Kapenguria', 'Makutano', 'Chepareria', 'Ortum'] },
  { name: 'Baringo', lat: 0.4667, lng: 35.9667, cities: ['Kabarnet', 'Marigat', 'Eldama Ravine', 'Mogotio'] },
  { name: 'Elgeyo Marakwet', lat: 0.9667, lng: 35.5000, cities: ['Iten', 'Kapsowar', 'Tambach', 'Cheptongei'] },
  { name: 'Tharaka Nithi', lat: -0.3000, lng: 37.8000, cities: ['Chuka', 'Chogoria', 'Marimanti', 'Kathwana'] },
  { name: 'Makueni', lat: -1.8000, lng: 37.6167, cities: ['Wote', 'Makindu', 'Sultan Hamud', 'Emali', 'Mtito Andei'] },
  { name: 'Kitui', lat: -1.3667, lng: 38.0167, cities: ['Kitui Town', 'Mwingi', 'Mutomo', 'Ikutha'] },
]

// ============================================================================
// ARTISAN PROFESSIONS with related data
// ============================================================================

const PROFESSIONS = [
  {
    name: 'Carpenter',
    specializations: ['Custom Furniture', 'Kitchen Cabinets', 'Roofing', 'Door & Window Frames', 'Wood Flooring', 'Built-in Wardrobes'],
    portfolioCategories: ['Furniture', 'Kitchen', 'Bedroom', 'Living Room', 'Office'],
    hourlyRateRange: [800, 2500],
  },
  {
    name: 'Electrician',
    specializations: ['Residential Wiring', 'Commercial Installation', 'Solar Installation', 'Appliance Repair', 'Industrial Electrical', 'Smart Home Systems'],
    portfolioCategories: ['Residential', 'Commercial', 'Solar', 'Industrial'],
    hourlyRateRange: [1000, 3000],
  },
  {
    name: 'Plumber',
    specializations: ['Pipe Installation', 'Water Heater Installation', 'Drain Cleaning', 'Bathroom Renovation', 'Septic Systems', 'Water Tank Installation'],
    portfolioCategories: ['Bathroom', 'Kitchen', 'Commercial', 'Maintenance'],
    hourlyRateRange: [800, 2500],
  },
  {
    name: 'Mason',
    specializations: ['Brick Laying', 'Stone Work', 'Plastering', 'Tiling', 'Foundation Work', 'Fencing'],
    portfolioCategories: ['Construction', 'Renovation', 'Fencing', 'Flooring'],
    hourlyRateRange: [600, 2000],
  },
  {
    name: 'Painter',
    specializations: ['Interior Painting', 'Exterior Painting', 'Decorative Finishes', 'Spray Painting', 'Wallpaper Installation', 'Texture Coating'],
    portfolioCategories: ['Interior', 'Exterior', 'Commercial', 'Decorative'],
    hourlyRateRange: [500, 1800],
  },
  {
    name: 'Welder',
    specializations: ['Metal Fabrication', 'Security Gates', 'Burglar Proofing', 'Steel Structures', 'Aluminum Work', 'Artistic Metalwork'],
    portfolioCategories: ['Security', 'Structural', 'Decorative', 'Industrial'],
    hourlyRateRange: [800, 2500],
  },
  {
    name: 'Tailor',
    specializations: ['Men\'s Suits', 'Women\'s Wear', 'Traditional Attire', 'Alterations', 'Uniforms', 'Wedding Dresses'],
    portfolioCategories: ['Men\'s Wear', 'Women\'s Wear', 'Traditional', 'Formal', 'Casual'],
    hourlyRateRange: [400, 1500],
  },
  {
    name: 'Mechanic',
    specializations: ['Engine Repair', 'Brake Systems', 'Transmission', 'Electrical Systems', 'AC Repair', 'Diagnostics'],
    portfolioCategories: ['Engine Work', 'Body Work', 'Electrical', 'Maintenance'],
    hourlyRateRange: [800, 2500],
  },
  {
    name: 'Hair Stylist',
    specializations: ['Braiding', 'Weaving', 'Loc Maintenance', 'Barbering', 'Hair Coloring', 'Hair Treatment'],
    portfolioCategories: ['Braids', 'Weaves', 'Locs', 'Cuts', 'Color'],
    hourlyRateRange: [300, 1500],
  },
  {
    name: 'Photographer',
    specializations: ['Wedding Photography', 'Portrait Photography', 'Event Coverage', 'Product Photography', 'Video Production', 'Drone Photography'],
    portfolioCategories: ['Weddings', 'Portraits', 'Events', 'Commercial', 'Nature'],
    hourlyRateRange: [1500, 5000],
  },
  {
    name: 'Interior Designer',
    specializations: ['Residential Design', 'Commercial Design', 'Space Planning', 'Furniture Selection', 'Color Consultation', 'Renovation Design'],
    portfolioCategories: ['Living Rooms', 'Bedrooms', 'Offices', 'Restaurants', 'Hotels'],
    hourlyRateRange: [2000, 8000],
  },
  {
    name: 'Landscaper',
    specializations: ['Garden Design', 'Lawn Maintenance', 'Irrigation Systems', 'Tree Surgery', 'Hardscaping', 'Plant Installation'],
    portfolioCategories: ['Gardens', 'Lawns', 'Commercial', 'Residential'],
    hourlyRateRange: [600, 2000],
  },
  {
    name: 'HVAC Technician',
    specializations: ['AC Installation', 'AC Repair', 'Ventilation Systems', 'Refrigeration', 'Heating Systems', 'Duct Cleaning'],
    portfolioCategories: ['Residential', 'Commercial', 'Industrial'],
    hourlyRateRange: [1200, 3500],
  },
  {
    name: 'Tiler',
    specializations: ['Floor Tiling', 'Wall Tiling', 'Bathroom Tiling', 'Kitchen Backsplash', 'Outdoor Paving', 'Mosaic Work'],
    portfolioCategories: ['Bathrooms', 'Kitchens', 'Living Areas', 'Outdoor'],
    hourlyRateRange: [700, 2000],
  },
  {
    name: 'Roofer',
    specializations: ['Tile Roofing', 'Metal Roofing', 'Flat Roofing', 'Roof Repair', 'Gutter Installation', 'Waterproofing'],
    portfolioCategories: ['Residential', 'Commercial', 'Repairs', 'New Installation'],
    hourlyRateRange: [800, 2500],
  },
]

// ============================================================================
// KENYAN NAMES for realistic data
// ============================================================================

const KENYAN_FIRST_NAMES = {
  male: ['James', 'John', 'Peter', 'David', 'Michael', 'Joseph', 'Daniel', 'Samuel', 'Stephen', 'Patrick', 
         'Kennedy', 'Brian', 'Kevin', 'Dennis', 'George', 'Charles', 'Francis', 'Martin', 'Simon', 'Paul',
         'Onyango', 'Ochieng', 'Kipchoge', 'Kipruto', 'Wafula', 'Barasa', 'Mutua', 'Musyoka', 'Gitau', 'Kamau'],
  female: ['Mary', 'Jane', 'Grace', 'Faith', 'Joy', 'Elizabeth', 'Sarah', 'Ann', 'Rose', 'Alice',
           'Wanjiku', 'Njeri', 'Achieng', 'Anyango', 'Nafula', 'Nekesa', 'Muthoni', 'Nyambura', 'Kerubo', 'Moraa']
}

const KENYAN_LAST_NAMES = [
  'Mwangi', 'Kamau', 'Njoroge', 'Kimani', 'Kariuki', 'Wanjiku', 'Ochieng', 'Otieno', 'Oduor', 'Akinyi',
  'Wafula', 'Simiyu', 'Wanyama', 'Barasa', 'Masinde', 'Muthomi', 'Mutua', 'Musyoka', 'Kioko', 'Mwenda',
  'Koech', 'Kipchoge', 'Kipruto', 'Cheruiyot', 'Kiptoo', 'Ondiek', 'Nyong\'o', 'Owino', 'Adhiambo', 'Awuor',
  'Githinji', 'Maina', 'Ndungu', 'Ngugi', 'Muriuki', 'Kinyua', 'Kiragu', 'Wambui', 'Wairimu', 'Gathoni'
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function randomDate(daysBack: number): Date {
  return new Date(Date.now() - randomInt(0, daysBack) * 24 * 60 * 60 * 1000)
}

function generatePhone(): string {
  const prefixes = ['0700', '0701', '0702', '0703', '0704', '0705', '0710', '0711', '0712', '0713',
                    '0714', '0715', '0716', '0717', '0718', '0719', '0720', '0721', '0722', '0723',
                    '0724', '0725', '0726', '0727', '0728', '0729', '0740', '0741', '0742', '0743',
                    '0745', '0746', '0748', '0757', '0758', '0759', '0768', '0769', '0790', '0791',
                    '0792', '0793', '0794', '0795', '0796', '0797', '0798', '0799']
  return `+254${randomElement(prefixes).slice(1)}${randomInt(100000, 999999)}`
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com']
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${randomInt(1, 99)}`,
  ]
  return `${randomElement(formats)}@${randomElement(domains)}`
}

function addCoordinateJitter(lat: number, lng: number, jitter = 0.1): { lat: number; lng: number } {
  return {
    lat: lat + randomFloat(-jitter, jitter, 4),
    lng: lng + randomFloat(-jitter, jitter, 4),
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')
  console.log('================================================\n')

  // Clear existing data in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🗑️  Clearing existing data...')
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
    console.log('✅ Existing data cleared\n')
  }

  // ============================================================================
  // CREATE ADMIN USERS
  // ============================================================================
  console.log('👑 Creating admin users...')
  
  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: 'clerk_admin_001',
        email: 'admin@artisanlink.co.ke',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+254700000001',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
        profile: {
          create: {
            bio: 'System administrator for ArtisanLink platform',
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
        email: 'support@artisanlink.co.ke',
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
  console.log(`✅ Created ${adminUsers.length} admin users\n`)

  // ============================================================================
  // CREATE CLIENT USERS (40 clients across different counties)
  // ============================================================================
  console.log('👥 Creating client users...')
  
  const clientPromises = []
  for (let i = 0; i < 40; i++) {
    const isFemale = Math.random() > 0.5
    const firstName = randomElement(isFemale ? KENYAN_FIRST_NAMES.female : KENYAN_FIRST_NAMES.male)
    const lastName = randomElement(KENYAN_LAST_NAMES)
    const county = randomElement(KENYAN_COUNTIES.slice(0, 25)) // Focus on more populated counties
    const city = randomElement(county.cities)
    const coords = addCoordinateJitter(county.lat, county.lng)
    
    clientPromises.push(
      prisma.user.create({
        data: {
          clerkId: `clerk_client_${String(i + 1).padStart(3, '0')}`,
          email: generateEmail(firstName, lastName),
          firstName,
          lastName,
          phone: generatePhone(),
          role: UserRole.CLIENT,
          status: i < 35 ? UserStatus.ACTIVE : UserStatus.PENDING,
          emailVerifiedAt: i < 35 ? randomDate(180) : null,
          lastLoginAt: i < 30 ? randomDate(14) : null,
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
              city,
              county: county.name,
              country: 'Kenya',
              latitude: coords.lat,
              longitude: coords.lng,
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
    )
  }
  
  const clients = await Promise.all(clientPromises)
  console.log(`✅ Created ${clients.length} client users\n`)

  // ============================================================================
  // CREATE ARTISAN USERS (150 artisans across all professions and counties)
  // ============================================================================
  console.log('🔨 Creating artisan users...')
  
  const artisanPromises = []
  const artisansPerProfession = 10
  
  for (let profIndex = 0; profIndex < PROFESSIONS.length; profIndex++) {
    const profession = PROFESSIONS[profIndex]
    
    for (let i = 0; i < artisansPerProfession; i++) {
      const isFemale = Math.random() > 0.65 // 35% female artisans
      const firstName = randomElement(isFemale ? KENYAN_FIRST_NAMES.female : KENYAN_FIRST_NAMES.male)
      const lastName = randomElement(KENYAN_LAST_NAMES)
      const county = randomElement(KENYAN_COUNTIES.slice(0, 35)) // More coverage
      const city = randomElement(county.cities)
      const coords = addCoordinateJitter(county.lat, county.lng)
      
      const experience = randomInt(1, 20)
      const hourlyRate = randomInt(profession.hourlyRateRange[0], profession.hourlyRateRange[1])
      
      // Determine artisan status distribution
      const statusRoll = Math.random()
      let artisanStatus: ArtisanStatus
      let hasSubscription = false
      let isAvailable = false
      
      if (statusRoll < 0.65) {
        // 65% verified
        artisanStatus = ArtisanStatus.VERIFIED
        hasSubscription = Math.random() > 0.2 // 80% of verified have subscription
        isAvailable = hasSubscription && Math.random() > 0.15 // 85% of subscribed are available
      } else if (statusRoll < 0.85) {
        // 20% pending
        artisanStatus = ArtisanStatus.PENDING
      } else {
        // 15% rejected
        artisanStatus = ArtisanStatus.REJECTED
      }
      
      const artisanId = profIndex * artisansPerProfession + i + 1
      
      artisanPromises.push(
        prisma.user.create({
          data: {
            clerkId: `clerk_artisan_${String(artisanId).padStart(3, '0')}`,
            email: generateEmail(firstName, lastName),
            firstName,
            lastName,
            phone: generatePhone(),
            role: UserRole.ARTISAN,
            status: artisanStatus === ArtisanStatus.REJECTED ? UserStatus.SUSPENDED : UserStatus.ACTIVE,
            emailVerifiedAt: randomDate(365),
            lastLoginAt: isAvailable ? randomDate(7) : randomDate(30),
            profile: {
              create: {
                bio: `Experienced ${profession.name.toLowerCase()} with ${experience} years of expertise. ${randomElement([
                  'Committed to quality and customer satisfaction.',
                  'Specializing in both residential and commercial projects.',
                  'Known for attention to detail and timely delivery.',
                  'Passionate about craftsmanship and innovation.',
                  'Serving clients across the region with dedication.',
                ])}`,
                profession: profession.name,
                experience,
                hourlyRate,
                isAvailable,
                artisanStatus,
                city,
                county: county.name,
                country: 'Kenya',
                latitude: coords.lat,
                longitude: coords.lng,
                address: `${randomElement(['Plot', 'House', 'Shop', 'Building'])} ${randomInt(1, 500)}, ${city}`,
                averageRating: artisanStatus === ArtisanStatus.VERIFIED ? randomFloat(3.5, 5.0, 1) : 0,
                totalReviews: artisanStatus === ArtisanStatus.VERIFIED ? randomInt(0, 50) : 0,
                certificateUrl: artisanStatus !== ArtisanStatus.PENDING ? `https://certificates.artisanlink.co.ke/${artisanId}.pdf` : null,
                certificateUploadedAt: randomDate(180),
                verifiedAt: artisanStatus === ArtisanStatus.VERIFIED ? randomDate(90) : null,
                verifiedBy: artisanStatus === ArtisanStatus.VERIFIED ? adminUsers[0].id : null,
                ...(hasSubscription && {
                  subscription: {
                    create: {
                      plan: Math.random() > 0.4 ? SubscriptionPlan.MONTHLY : SubscriptionPlan.ANNUAL,
                      status: Math.random() > 0.1 ? SubscriptionStatus.ACTIVE : SubscriptionStatus.EXPIRED,
                      startDate: randomDate(365),
                      endDate: new Date(Date.now() + randomInt(-30, 365) * 24 * 60 * 60 * 1000),
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
      )
    }
  }
  
  const artisans = await Promise.all(artisanPromises)
  console.log(`✅ Created ${artisans.length} artisan users\n`)

  // ============================================================================
  // CREATE SPECIALIZATIONS FOR ARTISANS
  // ============================================================================
  console.log('🎯 Creating specializations...')
  
  const specializationPromises = []
  
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
      specializationPromises.push(
        prisma.specialization.create({
          data: {
            profileId: artisan.profile.id,
            name: spec,
            category: profession.name,
            skillLevel: randomInt(3, 5),
            yearsExp: randomInt(1, artisan.profile.experience || 5),
          }
        })
      )
    }
  }
  
  const specializations = await Promise.all(specializationPromises)
  console.log(`✅ Created ${specializations.length} specializations\n`)

  // ============================================================================
  // CREATE PORTFOLIO ITEMS FOR VERIFIED ARTISANS
  // ============================================================================
  console.log('🎨 Creating portfolio items...')
  
  const portfolioPromises = []
  const verifiedArtisans = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.VERIFIED)
  
  for (const artisan of verifiedArtisans) {
    if (!artisan.profile) continue
    
    const profession = PROFESSIONS.find(p => p.name === artisan.profile!.profession)
    if (!profession) continue
    
    // Add 2-6 portfolio items per verified artisan
    const numItems = randomInt(2, 6)
    
    for (let i = 0; i < numItems; i++) {
      const category = randomElement(profession.portfolioCategories)
      const projectTitles = [
        `${category} Project in ${artisan.profile.city}`,
        `Custom ${category} Work`,
        `${category} Renovation`,
        `${profession.name} Services - ${category}`,
        `Complete ${category} Installation`,
      ]
      
      portfolioPromises.push(
        prisma.portfolioItem.create({
          data: {
            profileId: artisan.profile.id,
            title: randomElement(projectTitles),
            description: `Professional ${profession.name.toLowerCase()} work completed for a satisfied client. ${randomElement([
              'This project showcases our attention to detail.',
              'Completed on time and within budget.',
              'Client was extremely pleased with the results.',
              'A challenging project that turned out beautifully.',
              'One of our favorite projects to date.',
            ])}`,
            imageUrl: `https://images.artisanlink.co.ke/portfolio/${artisan.profile.id}/${i + 1}.jpg`,
            imageUrls: Array.from({ length: randomInt(1, 4) }, (_, j) => 
              `https://images.artisanlink.co.ke/portfolio/${artisan.profile!.id}/${i + 1}_${j + 1}.jpg`
            ),
            category,
            tags: [profession.name.toLowerCase(), category.toLowerCase(), artisan.profile.city?.toLowerCase() || '', 'kenya'].filter(Boolean),
            completedAt: randomDate(365),
            duration: randomElement(['1 day', '2 days', '3 days', '1 week', '2 weeks', '3 weeks', '1 month']),
            cost: randomInt(5000, 200000),
            isPublic: true,
            isFeatured: Math.random() > 0.7,
          }
        })
      )
    }
  }
  
  const portfolioItems = await Promise.all(portfolioPromises)
  console.log(`✅ Created ${portfolioItems.length} portfolio items\n`)

  // ============================================================================
  // CREATE REVIEWS
  // ============================================================================
  console.log('⭐ Creating reviews...')
  
  const reviewPromises = []
  const reviewComments = {
    5: [
      'Absolutely exceptional work! Highly recommend.',
      'Outstanding craftsmanship and professionalism.',
      'Exceeded all expectations. Will definitely hire again.',
      'Best artisan I\'ve ever worked with in Kenya.',
      'Perfect work, great communication, fair pricing.',
    ],
    4: [
      'Very good work, minor issues but overall satisfied.',
      'Professional and skilled. Would recommend.',
      'Quality work delivered on time.',
      'Good experience, will consider for future projects.',
      'Solid work, reasonable prices.',
    ],
    3: [
      'Decent work but could improve on communication.',
      'Average service, nothing special.',
      'Work was okay, some delays experienced.',
      'Acceptable quality for the price.',
    ],
    2: [
      'Below expectations, several issues with the work.',
      'Not satisfied with the final result.',
    ],
    1: [
      'Very poor experience, would not recommend.',
    ]
  }
  
  // Create reviews for verified artisans
  for (const artisan of verifiedArtisans.slice(0, 100)) { // Limit to 100 artisans for reviews
    if (!artisan.profile) continue
    
    const numReviews = randomInt(0, 8)
    const usedClients = new Set<string>()
    
    for (let i = 0; i < numReviews; i++) {
      // Get a random client that hasn't reviewed this artisan yet
      let client
      let attempts = 0
      do {
        client = randomElement(clients)
        attempts++
      } while (usedClients.has(client.id) && attempts < 10)
      
      if (usedClients.has(client.id)) continue
      usedClients.add(client.id)
      
      const rating = randomInt(3, 5) as 1 | 2 | 3 | 4 | 5 // Bias towards positive reviews
      
      reviewPromises.push(
        prisma.review.create({
          data: {
            profileId: artisan.profile.id,
            clientId: client.id,
            rating,
            comment: randomElement(reviewComments[rating]),
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
      )
    }
  }
  
  const reviews = await Promise.all(reviewPromises)
  console.log(`✅ Created ${reviews.length} reviews\n`)

  // ============================================================================
  // CREATE CONVERSATIONS AND MESSAGES
  // ============================================================================
  console.log('💬 Creating conversations and messages...')
  
  const conversationPromises = []
  const availableArtisans = artisans.filter(a => a.profile?.isAvailable)
  
  // Create 80 conversations
  for (let i = 0; i < 80; i++) {
    const client = randomElement(clients.filter(c => c.status === UserStatus.ACTIVE))
    const artisan = randomElement(availableArtisans)
    
    conversationPromises.push(
      prisma.conversation.create({
        data: {
          clientId: client.id,
          artisanId: artisan.id,
          status: randomElement([ConversationStatus.ACTIVE, ConversationStatus.ACTIVE, ConversationStatus.ACTIVE, ConversationStatus.ARCHIVED]),
          subject: randomElement([
            'Project Inquiry',
            'Quote Request',
            'Availability Check',
            'Service Question',
            'Booking Request',
            null
          ]),
          lastMessageAt: randomDate(30),
        }
      })
    )
  }
  
  const conversations = await Promise.all(conversationPromises)
  
  // Create messages for each conversation
  const messagePromises = []
  const messageTemplates = {
    clientFirst: [
      'Hi, I saw your profile and I\'m interested in your services. Are you available for a project?',
      'Hello! I need help with a project. Can you provide a quote?',
      'Good day! I\'d like to discuss a potential job. When are you free?',
      'Hi there! I\'ve been looking for a skilled professional and your work looks impressive.',
    ],
    artisanReply: [
      'Thank you for reaching out! I\'d be happy to help. Can you tell me more about what you need?',
      'Hello! Yes, I\'m available. What kind of project do you have in mind?',
      'Thanks for your interest! I can definitely assist. What are the details?',
      'Hi! I appreciate you contacting me. Let\'s discuss your requirements.',
    ],
    clientFollowUp: [
      'Great! The project involves... Can we meet to discuss further?',
      'Perfect! I\'ll send you some photos of what I need done.',
      'Excellent! What would be a good time for a site visit?',
      'Thanks for the quick response! Here are the details...',
    ],
    artisanFollowUp: [
      'That sounds like a project I can handle. I\'m free this week for a consultation.',
      'I\'ve reviewed the details. I can provide a quote after seeing the site.',
      'Thanks for the information. My rate for this type of work is...',
      'I understand. Let me prepare an estimate for you.',
    ]
  }
  
  for (const conv of conversations) {
    const numMessages = randomInt(2, 8)
    const client = clients.find(c => c.id === conv.clientId)!
    const artisan = artisans.find(a => a.id === conv.artisanId)!
    
    for (let i = 0; i < numMessages; i++) {
      const isClientMessage = i % 2 === 0
      const sender = isClientMessage ? client : artisan
      const receiver = isClientMessage ? artisan : client
      
      let content: string
      if (i === 0) content = randomElement(messageTemplates.clientFirst)
      else if (i === 1) content = randomElement(messageTemplates.artisanReply)
      else if (i % 2 === 0) content = randomElement(messageTemplates.clientFollowUp)
      else content = randomElement(messageTemplates.artisanFollowUp)
      
      const createdAt = new Date(conv.lastMessageAt!.getTime() - (numMessages - i) * randomInt(1, 24) * 60 * 60 * 1000)
      
      messagePromises.push(
        prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: sender.id,
            receiverId: receiver.id,
            content,
            status: i < numMessages - 1 ? MessageStatus.READ : randomElement([MessageStatus.SENT, MessageStatus.DELIVERED, MessageStatus.READ]),
            createdAt,
            readAt: i < numMessages - 1 ? new Date(createdAt.getTime() + randomInt(1, 12) * 60 * 60 * 1000) : null,
          }
        })
      )
    }
  }
  
  const messages = await Promise.all(messagePromises)
  console.log(`✅ Created ${conversations.length} conversations with ${messages.length} messages\n`)

  // ============================================================================
  // CREATE SAVED ARTISANS
  // ============================================================================
  console.log('💾 Creating saved artisans...')
  
  const savedArtisanPromises = []
  
  for (const client of clients.slice(0, 30)) {
    const numSaved = randomInt(0, 8)
    const savedIds = new Set<string>()
    
    for (let i = 0; i < numSaved; i++) {
      const artisan = randomElement(availableArtisans)
      if (savedIds.has(artisan.profile!.id)) continue
      savedIds.add(artisan.profile!.id)
      
      savedArtisanPromises.push(
        prisma.savedArtisan.create({
          data: {
            userId: client.id,
            profileId: artisan.profile!.id,
            createdAt: randomDate(90),
          }
        })
      )
    }
  }
  
  const savedArtisans = await Promise.all(savedArtisanPromises)
  console.log(`✅ Created ${savedArtisans.length} saved artisans\n`)

  // ============================================================================
  // CREATE SEARCH HISTORY
  // ============================================================================
  console.log('🔍 Creating search history...')
  
  const searchHistoryPromises = []
  
  for (const client of clients.slice(0, 25)) {
    const numSearches = randomInt(1, 10)
    
    for (let i = 0; i < numSearches; i++) {
      const profession = randomElement(PROFESSIONS)
      const county = randomElement(KENYAN_COUNTIES.slice(0, 20))
      
      searchHistoryPromises.push(
        prisma.searchHistory.create({
          data: {
            userId: client.id,
            query: Math.random() > 0.5 ? randomElement([profession.name.toLowerCase(), ...profession.specializations.map(s => s.toLowerCase())]) : null,
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
      )
    }
  }
  
  const searchHistory = await Promise.all(searchHistoryPromises)
  console.log(`✅ Created ${searchHistory.length} search history entries\n`)

  // ============================================================================
  // CREATE PAYMENTS
  // ============================================================================
  console.log('💳 Creating payment records...')
  
  const paymentPromises = []
  const artisansWithSubscription = artisans.filter(a => a.profile?.subscription)
  
  for (const artisan of artisansWithSubscription) {
    const subscription = artisan.profile!.subscription!
    const numPayments = randomInt(1, 6)
    
    for (let i = 0; i < numPayments; i++) {
      paymentPromises.push(
        prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: subscription.amount,
            currency: 'KES',
            method: PaymentMethod.MPESA,
            status: i === 0 ? PaymentStatus.COMPLETED : randomElement([PaymentStatus.COMPLETED, PaymentStatus.COMPLETED, PaymentStatus.COMPLETED, PaymentStatus.FAILED]),
            mpesaRequestId: `ws_CO_${randomInt(100000000, 999999999)}`,
            mpesaCheckoutId: `ws_CO_${randomInt(100000000, 999999999)}`,
            mpesaTransactionId: `OEI${randomInt(1000000, 9999999)}`,
            mpesaReceiptNumber: `OEI${randomInt(1000000, 9999999)}`,
            phoneNumber: artisan.phone,
            description: `${subscription.plan === SubscriptionPlan.MONTHLY ? 'Monthly' : 'Annual'} subscription payment`,
            createdAt: randomDate(365),
            paidAt: randomDate(365),
          }
        })
      )
    }
  }
  
  const payments = await Promise.all(paymentPromises)
  console.log(`✅ Created ${payments.length} payment records\n`)

  // ============================================================================
  // CREATE NOTIFICATIONS
  // ============================================================================
  console.log('🔔 Creating notifications...')
  
  const notificationPromises = []
  const notificationTypes = [
    { type: NotificationType.MESSAGE, title: 'New Message', message: 'You have received a new message.' },
    { type: NotificationType.REVIEW, title: 'New Review', message: 'Someone left you a review.' },
    { type: NotificationType.VERIFICATION, title: 'Verification Update', message: 'Your profile verification status has been updated.' },
    { type: NotificationType.SYSTEM, title: 'System Update', message: 'We have made improvements to the platform.' },
    { type: NotificationType.BOOKING, title: 'New Inquiry', message: 'You have received a new service inquiry.' },
  ]
  
  for (const user of [...clients.slice(0, 20), ...artisans.slice(0, 50)]) {
    const numNotifications = randomInt(0, 10)
    
    for (let i = 0; i < numNotifications; i++) {
      const notif = randomElement(notificationTypes)
      
      notificationPromises.push(
        prisma.notification.create({
          data: {
            userId: user.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            isRead: Math.random() > 0.3,
            linkUrl: Math.random() > 0.5 ? '/dashboard' : null,
            createdAt: randomDate(30),
            readAt: Math.random() > 0.3 ? randomDate(30) : null,
          }
        })
      )
    }
  }
  
  const notifications = await Promise.all(notificationPromises)
  console.log(`✅ Created ${notifications.length} notifications\n`)

  // ============================================================================
  // CREATE ACTIVITY LOGS
  // ============================================================================
  console.log('📝 Creating activity logs...')
  
  const activityLogPromises = []
  const actions = [
    { action: 'USER_VERIFIED', targetType: 'ARTISAN', description: 'Verified artisan certificate and approved profile' },
    { action: 'USER_REJECTED', targetType: 'ARTISAN', description: 'Rejected artisan application' },
    { action: 'SUBSCRIPTION_ACTIVATED', targetType: 'SUBSCRIPTION', description: 'Activated subscription' },
    { action: 'REVIEW_APPROVED', targetType: 'REVIEW', description: 'Approved review' },
    { action: 'USER_SUSPENDED', targetType: 'USER', description: 'Suspended user account' },
    { action: 'SETTING_UPDATED', targetType: 'SETTING', description: 'Updated system setting' },
  ]
  
  for (let i = 0; i < 100; i++) {
    const admin = randomElement(adminUsers)
    const actionItem = randomElement(actions)
    const targetUser = randomElement(artisans)
    
    activityLogPromises.push(
      prisma.activityLog.create({
        data: {
          adminId: admin.id,
          adminEmail: admin.email,
          action: actionItem.action,
          targetType: actionItem.targetType,
          targetId: targetUser.id,
          description: actionItem.description,
          ipAddress: `192.168.${randomInt(0, 255)}.${randomInt(0, 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: randomDate(90),
        }
      })
    )
  }
  
  const activityLogs = await Promise.all(activityLogPromises)
  console.log(`✅ Created ${activityLogs.length} activity logs\n`)

  // ============================================================================
  // CREATE SYSTEM SETTINGS
  // ============================================================================
  console.log('⚙️  Creating system settings...')
  
  await Promise.all([
    prisma.setting.create({
      data: {
        key: 'monthly_subscription_price',
        value: '499',
        type: 'number',
        description: 'Monthly subscription price in KES',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'annual_subscription_price',
        value: '4999',
        type: 'number',
        description: 'Annual subscription price in KES (save 17%)',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'max_portfolio_items',
        value: '20',
        type: 'number',
        description: 'Maximum number of portfolio items per artisan',
        isPublic: false,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'max_images_per_portfolio',
        value: '10',
        type: 'number',
        description: 'Maximum images per portfolio item',
        isPublic: false,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'platform_commission',
        value: '5',
        type: 'number',
        description: 'Platform commission percentage',
        isPublic: false,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'email_notifications_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Enable email notifications globally',
        isPublic: false,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'sms_notifications_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Enable SMS notifications globally',
        isPublic: false,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Enable maintenance mode',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'min_search_radius_km',
        value: '5',
        type: 'number',
        description: 'Minimum search radius in kilometers',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'max_search_radius_km',
        value: '100',
        type: 'number',
        description: 'Maximum search radius in kilometers',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'default_search_radius_km',
        value: '25',
        type: 'number',
        description: 'Default search radius in kilometers',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'professions_list',
        value: JSON.stringify(PROFESSIONS.map(p => p.name)),
        type: 'json',
        description: 'List of available artisan professions',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'support_email',
        value: 'support@artisanlink.co.ke',
        type: 'string',
        description: 'Support email address',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'support_phone',
        value: '+254700000000',
        type: 'string',
        description: 'Support phone number',
        isPublic: true,
      }
    }),
  ])
  console.log('✅ Created system settings\n')

  // ============================================================================
  // SUMMARY
  // ============================================================================
  
  const verifiedCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.VERIFIED).length
  const pendingCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.PENDING).length
  const rejectedCount = artisans.filter(a => a.profile?.artisanStatus === ArtisanStatus.REJECTED).length
  const subscribedCount = artisans.filter(a => a.profile?.subscription).length
  const availableCount = artisans.filter(a => a.profile?.isAvailable).length
  
  console.log('================================================')
  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!')
  console.log('================================================\n')
  console.log('📊 SEEDING SUMMARY:')
  console.log('─────────────────────────────────────────────────')
  console.log(`👑 Admin Users:          ${adminUsers.length}`)
  console.log(`👥 Client Users:         ${clients.length}`)
  console.log(`🔨 Artisan Users:        ${artisans.length}`)
  console.log(`   ├─ Verified:          ${verifiedCount}`)
  console.log(`   ├─ Pending:           ${pendingCount}`)
  console.log(`   ├─ Rejected:          ${rejectedCount}`)
  console.log(`   ├─ With Subscription: ${subscribedCount}`)
  console.log(`   └─ Available:         ${availableCount}`)
  console.log(`🎯 Specializations:      ${specializations.length}`)
  console.log(`🎨 Portfolio Items:      ${portfolioItems.length}`)
  console.log(`⭐ Reviews:              ${reviews.length}`)
  console.log(`💬 Conversations:        ${conversations.length}`)
  console.log(`📨 Messages:             ${messages.length}`)
  console.log(`💾 Saved Artisans:       ${savedArtisans.length}`)
  console.log(`🔍 Search History:       ${searchHistory.length}`)
  console.log(`💳 Payments:             ${payments.length}`)
  console.log(`🔔 Notifications:        ${notifications.length}`)
  console.log(`📝 Activity Logs:        ${activityLogs.length}`)
  console.log(`⚙️  System Settings:      14`)
  console.log('─────────────────────────────────────────────────')
  console.log(`🌍 Counties Covered:     ${KENYAN_COUNTIES.length}`)
  console.log(`🛠️  Professions:          ${PROFESSIONS.length}`)
  console.log('─────────────────────────────────────────────────\n')
  console.log('🚀 You can now start the application and explore!')
  console.log('   Run: npm run dev\n')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
