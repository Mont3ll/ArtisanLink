import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Predefined specialization categories
const SPECIALIZATION_CATEGORIES = [
  'Woodworking',
  'Metalwork',
  'Plumbing',
  'Electrical',
  'Masonry',
  'Painting',
  'Carpentry',
  'Welding',
  'Roofing',
  'Tiling',
  'Landscaping',
  'HVAC',
  'Furniture Making',
  'Auto Repair',
  'Tailoring',
  'Cobbling',
  'Electronics Repair',
  'Appliance Repair',
  'Glass Work',
  'Other'
]

// Validation schema for creating specialization
const createSpecializationSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  skillLevel: z.number().int().min(1).max(5).optional().default(1),
  yearsExp: z.number().int().min(0).max(100).optional()
})

// GET - List specializations for authenticated artisan
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if requesting categories
    const { searchParams } = new URL(request.url)
    if (searchParams.get('categories') === 'true') {
      return NextResponse.json({ categories: SPECIALIZATION_CATEGORIES })
    }

    // Get specializations
    const specializations = await prisma.specialization.findMany({
      where: { profileId: user.profile.id },
      orderBy: { skillLevel: 'desc' }
    })

    return NextResponse.json({
      specializations,
      categories: SPECIALIZATION_CATEGORIES
    })
  } catch (error) {
    console.error('Error fetching specializations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new specialization
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = createSpecializationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check for duplicate specialization name
    const existing = await prisma.specialization.findUnique({
      where: {
        profileId_name: {
          profileId: user.profile.id,
          name: data.name
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Specialization with this name already exists' },
        { status: 409 }
      )
    }

    // Create specialization
    const specialization = await prisma.specialization.create({
      data: {
        profileId: user.profile.id,
        name: data.name,
        category: data.category,
        skillLevel: data.skillLevel,
        yearsExp: data.yearsExp
      }
    })

    return NextResponse.json(specialization, { status: 201 })
  } catch (error) {
    console.error('Error creating specialization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
