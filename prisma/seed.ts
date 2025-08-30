import { PrismaClient, UserRole, UserStatus, ArtisanStatus, SubscriptionStatus, SubscriptionPlan, ConversationStatus, MessageStatus } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🗑️  Clearing existing data...')
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
  }

  // Create Admin User
  console.log('👑 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'clerk_admin_123',
      email: 'admin@artisanlink.ke',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+254700000000',
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
        }
      }
    }
  })

  // Create Sample Clients
  console.log('👥 Creating client users...')
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: 'clerk_client_1',
        email: 'john.doe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254712345678',
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            bio: 'Looking for quality craftsmanship for my home renovation projects',
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
        clerkId: 'clerk_client_2',
        email: 'sarah.wilson@yahoo.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        phone: '+254723456789',
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            bio: 'Interior designer seeking skilled artisans for client projects',
            city: 'Mombasa',
            county: 'Mombasa',
            country: 'Kenya',
            latitude: -4.0435,
            longitude: 39.6682,
          }
        }
      }
    })
  ])

  // Create Sample Artisans
  console.log('🔨 Creating artisan users...')
  const artisans = await Promise.all([
    // Carpenter - Active with subscription
    prisma.user.create({
      data: {
        clerkId: 'clerk_artisan_1',
        email: 'james.carpenter@gmail.com',
        firstName: 'James',
        lastName: 'Mwangi',
        phone: '+254734567890',
        role: UserRole.ARTISAN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            bio: 'Expert carpenter with over 10 years of experience in custom furniture and home construction',
            profession: 'Carpenter',
            experience: 10,
            hourlyRate: 1500.0,
            isAvailable: true,
            artisanStatus: ArtisanStatus.VERIFIED,
            city: 'Nairobi',
            county: 'Nairobi',
            country: 'Kenya',
            latitude: -1.2864,
            longitude: 36.8172,
            address: 'Industrial Area, Nairobi',
            averageRating: 4.8,
            totalReviews: 23,
            certificateUrl: 'https://example.com/certificates/james-carpenter.pdf',
            certificateUploadedAt: new Date(),
            verifiedAt: new Date(),
            verifiedBy: adminUser.id,
            subscription: {
              create: {
                plan: SubscriptionPlan.ANNUAL,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                amount: 12000.0,
                currency: 'KES',
                mpesaRequestId: 'ws_CO_123456789',
                mpesaTransactionId: 'OEI2AK4Q16',
              }
            }
          }
        }
      },
      include: {
        profile: {
          include: {
            subscription: true
          }
        }
      }
    }),
    
    // Metalworker - Active with subscription
    prisma.user.create({
      data: {
        clerkId: 'clerk_artisan_2',
        email: 'mary.metalworks@gmail.com',
        firstName: 'Mary',
        lastName: 'Njeri',
        phone: '+254745678901',
        role: UserRole.ARTISAN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            bio: 'Skilled metalworker specializing in custom gates, grills, and artistic metalwork',
            profession: 'Metalworker',
            experience: 7,
            hourlyRate: 1200.0,
            isAvailable: true,
            artisanStatus: ArtisanStatus.VERIFIED,
            city: 'Nakuru',
            county: 'Nakuru',
            country: 'Kenya',
            latitude: -0.3031,
            longitude: 36.0800,
            address: 'Milimani Estate, Nakuru',
            averageRating: 4.6,
            totalReviews: 18,
            certificateUrl: 'https://example.com/certificates/mary-metalworks.pdf',
            certificateUploadedAt: new Date(),
            verifiedAt: new Date(),
            verifiedBy: adminUser.id,
            subscription: {
              create: {
                plan: SubscriptionPlan.MONTHLY,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                amount: 1200.0,
                currency: 'KES',
                mpesaRequestId: 'ws_CO_987654321',
                mpesaTransactionId: 'OEI2AK4Q17',
              }
            }
          }
        }
      },
      include: {
        profile: {
          include: {
            subscription: true
          }
        }
      }
    }),

    // Tailor - Pending verification
    prisma.user.create({
      data: {
        clerkId: 'clerk_artisan_3',
        email: 'peter.tailor@gmail.com',
        firstName: 'Peter',
        lastName: 'Kimani',
        phone: '+254756789012',
        role: UserRole.ARTISAN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            bio: 'Professional tailor with expertise in both traditional and modern clothing',
            profession: 'Tailor',
            experience: 5,
            hourlyRate: 800.0,
            isAvailable: false, // Not available until subscribed
            artisanStatus: ArtisanStatus.PENDING,
            city: 'Kisumu',
            county: 'Kisumu',
            country: 'Kenya',
            latitude: -0.0917,
            longitude: 34.7680,
            address: 'Milimani, Kisumu',
            averageRating: 0.0,
            totalReviews: 0,
            certificateUrl: 'https://example.com/certificates/peter-tailor.pdf',
            certificateUploadedAt: new Date(),
          }
        }
      },
      include: {
        profile: true
      }
    }),

    // Electrician - Active with subscription
    prisma.user.create({
      data: {
        clerkId: 'clerk_artisan_4',
        email: 'david.electric@gmail.com',
        firstName: 'David',
        lastName: 'Otieno',
        phone: '+254767890123',
        role: UserRole.ARTISAN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            bio: 'Licensed electrician with specialization in residential and commercial installations',
            profession: 'Electrician',
            experience: 12,
            hourlyRate: 2000.0,
            isAvailable: true,
            artisanStatus: ArtisanStatus.VERIFIED,
            city: 'Mombasa',
            county: 'Mombasa',
            country: 'Kenya',
            latitude: -4.0435,
            longitude: 39.6682,
            address: 'Nyali, Mombasa',
            averageRating: 4.9,
            totalReviews: 31,
            certificateUrl: 'https://example.com/certificates/david-electric.pdf',
            certificateUploadedAt: new Date(),
            verifiedAt: new Date(),
            verifiedBy: adminUser.id,
            subscription: {
              create: {
                plan: SubscriptionPlan.ANNUAL,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                amount: 12000.0,
                currency: 'KES',
                mpesaRequestId: 'ws_CO_456789123',
                mpesaTransactionId: 'OEI2AK4Q18',
              }
            }
          }
        }
      },
      include: {
        profile: {
          include: {
            subscription: true
          }
        }
      }
    }),

    // Plumber - Recently subscribed
    prisma.user.create({
      data: {
        clerkId: 'clerk_artisan_5',
        email: 'grace.plumber@gmail.com',
        firstName: 'Grace',
        lastName: 'Wanjiku',
        phone: '+254778901234',
        role: UserRole.ARTISAN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            bio: 'Expert plumber with experience in both residential and commercial plumbing systems',
            profession: 'Plumber',
            experience: 8,
            hourlyRate: 1800.0,
            isAvailable: true,
            artisanStatus: ArtisanStatus.VERIFIED,
            city: 'Eldoret',
            county: 'Uasin Gishu',
            country: 'Kenya',
            latitude: 0.5143,
            longitude: 35.2697,
            address: 'West Indies, Eldoret',
            averageRating: 4.7,
            totalReviews: 15,
            certificateUrl: 'https://example.com/certificates/grace-plumber.pdf',
            certificateUploadedAt: new Date(),
            verifiedAt: new Date(),
            verifiedBy: adminUser.id,
            subscription: {
              create: {
                plan: SubscriptionPlan.MONTHLY,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                amount: 1200.0,
                currency: 'KES',
                mpesaRequestId: 'ws_CO_789123456',
                mpesaTransactionId: 'OEI2AK4Q19',
              }
            }
          }
        }
      },
      include: {
        profile: {
          include: {
            subscription: true
          }
        }
      }
    })
  ])

  // Get verified artisans for portfolio creation (cast to include profile)
  const verifiedArtisans = artisans.filter((_, index) => [0, 1, 3, 4].includes(index)) as Array<typeof artisans[0] & { profile: NonNullable<typeof artisans[0]['profile']> }>

  // Create Portfolio Items
  console.log('🎨 Creating portfolio items...')
  const portfolioItems = []

  // James Mwangi (Carpenter) portfolio
  const jamesProfile = verifiedArtisans[0].profile
  portfolioItems.push(
    ...(await Promise.all([
      prisma.portfolioItem.create({
        data: {
          profileId: jamesProfile.id,
          title: 'Custom Mahogany Dining Set',
          description: 'Handcrafted 8-seater dining table with matching chairs made from locally sourced mahogany wood',
          imageUrl: 'https://example.com/portfolio/dining-set-1.jpg',
          imageUrls: [
            'https://example.com/portfolio/dining-set-2.jpg',
            'https://example.com/portfolio/dining-set-3.jpg'
          ],
          category: 'Furniture',
          tags: ['dining table', 'mahogany', 'custom furniture', 'handcrafted'],
          completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          duration: '3 weeks',
          cost: 85000.0,
          isFeatured: true,
        }
      }),
      prisma.portfolioItem.create({
        data: {
          profileId: jamesProfile.id,
          title: 'Modern Kitchen Cabinets',
          description: 'Complete kitchen renovation with custom-built cabinets and island',
          imageUrl: 'https://example.com/portfolio/kitchen-1.jpg',
          imageUrls: [
            'https://example.com/portfolio/kitchen-2.jpg',
            'https://example.com/portfolio/kitchen-3.jpg',
            'https://example.com/portfolio/kitchen-4.jpg'
          ],
          category: 'Kitchen',
          tags: ['kitchen cabinets', 'renovation', 'modern design', 'storage'],
          completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          duration: '2 weeks',
          cost: 120000.0,
          isFeatured: true,
        }
      })
    ]))
  )

  // Mary Njeri (Metalworker) portfolio
  const maryProfile = verifiedArtisans[1].profile
  portfolioItems.push(
    ...(await Promise.all([
      prisma.portfolioItem.create({
        data: {
          profileId: maryProfile.id,
          title: 'Decorative Security Gate',
          description: 'Custom wrought iron security gate with artistic scrollwork design',
          imageUrl: 'https://example.com/portfolio/gate-1.jpg',
          imageUrls: [
            'https://example.com/portfolio/gate-2.jpg',
            'https://example.com/portfolio/gate-3.jpg'
          ],
          category: 'Security',
          tags: ['security gate', 'wrought iron', 'decorative', 'custom design'],
          completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          duration: '1 week',
          cost: 45000.0,
          isFeatured: true,
        }
      }),
      prisma.portfolioItem.create({
        data: {
          profileId: maryProfile.id,
          title: 'Modern Staircase Railings',
          description: 'Sleek stainless steel railings for a contemporary home',
          imageUrl: 'https://example.com/portfolio/railings-1.jpg',
          imageUrls: [
            'https://example.com/portfolio/railings-2.jpg'
          ],
          category: 'Railings',
          tags: ['staircase', 'stainless steel', 'modern', 'railings'],
          completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          duration: '4 days',
          cost: 32000.0,
        }
      })
    ]))
  )

  // Create Specializations
  console.log('🎯 Creating specializations...')
  await Promise.all([
    // James Mwangi specializations
    prisma.specialization.create({
      data: {
        profileId: jamesProfile.id,
        name: 'Custom Furniture Making',
        category: 'Carpentry',
        skillLevel: 5,
        yearsExp: 10,
      }
    }),
    prisma.specialization.create({
      data: {
        profileId: jamesProfile.id,
        name: 'Kitchen Renovations',
        category: 'Carpentry',
        skillLevel: 5,
        yearsExp: 8,
      }
    }),
    prisma.specialization.create({
      data: {
        profileId: jamesProfile.id,
        name: 'Home Construction',
        category: 'Construction',
        skillLevel: 4,
        yearsExp: 10,
      }
    }),

    // Mary Njeri specializations
    prisma.specialization.create({
      data: {
        profileId: maryProfile.id,
        name: 'Security Gates & Grills',
        category: 'Metalwork',
        skillLevel: 5,
        yearsExp: 7,
      }
    }),
    prisma.specialization.create({
      data: {
        profileId: maryProfile.id,
        name: 'Decorative Ironwork',
        category: 'Metalwork',
        skillLevel: 4,
        yearsExp: 5,
      }
    })
  ])

  // Create Conversations and Messages
  console.log('💬 Creating conversations and messages...')
  const conversation1 = await prisma.conversation.create({
    data: {
      clientId: clients[0].id,
      artisanId: artisans[0].id,
      status: ConversationStatus.ACTIVE,
      subject: 'Kitchen Renovation Project',
      lastMessageAt: new Date(),
    }
  })

  await Promise.all([
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        senderId: clients[0].id,
        receiverId: artisans[0].id,
        content: 'Hi James, I saw your kitchen cabinet work and I\'m interested in discussing a renovation for my home. Are you available for a consultation?',
        status: MessageStatus.READ,
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      }
    }),
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        senderId: artisans[0].id,
        receiverId: clients[0].id,
        content: 'Hello John! Thank you for reaching out. I\'d be happy to discuss your kitchen renovation. I\'m available this week for a consultation. What\'s your preferred time?',
        status: MessageStatus.READ,
        readAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      }
    }),
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        senderId: clients[0].id,
        receiverId: artisans[0].id,
        content: 'Great! How about Thursday afternoon around 2 PM? I can show you the space and we can discuss the design ideas.',
        status: MessageStatus.DELIVERED,
      }
    })
  ])

  // Create Reviews
  console.log('⭐ Creating reviews...')
  await Promise.all([
    prisma.review.create({
      data: {
        profileId: jamesProfile.id,
        clientId: clients[1].id,
        rating: 5,
        comment: 'James did an absolutely fantastic job on our dining room furniture. The craftsmanship is outstanding and he completed the work on time. Highly recommended!',
        projectTitle: 'Custom Dining Set',
        projectCost: 85000.0,
        isApproved: true,
      }
    }),
    prisma.review.create({
      data: {
        profileId: maryProfile.id,
        clientId: clients[0].id,
        rating: 5,
        comment: 'Mary created a beautiful security gate for our home. The design is both functional and artistic. Very professional and reliable.',
        projectTitle: 'Security Gate Installation',
        projectCost: 45000.0,
        isApproved: true,
      }
    })
  ])

  // Create Activity Logs
  console.log('📝 Creating activity logs...')
  await Promise.all([
    prisma.activityLog.create({
      data: {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'USER_VERIFIED',
        targetType: 'ARTISAN',
        targetId: artisans[0].id,
        description: 'Verified artisan certificate and approved profile',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }),
    prisma.activityLog.create({
      data: {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'SUBSCRIPTION_ACTIVATED',
        targetType: 'SUBSCRIPTION',
        targetId: verifiedArtisans[0].profile.subscription?.id || '',
        description: 'Activated annual subscription for James Mwangi',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    })
  ])

  // Create System Settings
  console.log('⚙️  Creating system settings...')
  await Promise.all([
    prisma.setting.create({
      data: {
        key: 'monthly_subscription_price',
        value: '1200',
        type: 'number',
        description: 'Monthly subscription price in KES',
        isPublic: true,
      }
    }),
    prisma.setting.create({
      data: {
        key: 'annual_subscription_price',
        value: '12000',
        type: 'number',
        description: 'Annual subscription price in KES',
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
        description: 'Enable email notifications',
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
    })
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log(`
📊 Seeding Summary:
- 1 Admin user
- 2 Client users  
- 5 Artisan users (3 verified, 1 pending, 1 with expired subscription)
- 4 Portfolio items
- 5 Specializations
- 3 Subscriptions (2 active annual, 1 active monthly)
- 1 Conversation with 3 messages
- 2 Reviews
- 2 Activity logs
- 6 System settings

🚀 You can now start the application and explore the seeded data!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
