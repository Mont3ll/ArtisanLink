import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for updating specialization
const updateSpecializationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().max(100).optional().nullable(),
  skillLevel: z.number().int().min(1).max(5).optional(),
  yearsExp: z.number().int().min(0).max(100).optional().nullable()
})

type RouteParams = {
  params: Promise<{ id: string }>
}

// PUT - Update specialization
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user || user.role !== 'ARTISAN' || !user.profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get existing specialization
    const existingSpec = await prisma.specialization.findUnique({
      where: { id }
    })

    if (!existingSpec) {
      return NextResponse.json({ error: 'Specialization not found' }, { status: 404 })
    }

    // Verify ownership
    if (existingSpec.profileId !== user.profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validationResult = updateSpecializationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check for duplicate name if name is being changed
    if (data.name && data.name !== existingSpec.name) {
      const duplicate = await prisma.specialization.findUnique({
        where: {
          profileId_name: {
            profileId: user.profile.id,
            name: data.name
          }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Specialization with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Update specialization
    const specialization = await prisma.specialization.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.skillLevel !== undefined && { skillLevel: data.skillLevel }),
        ...(data.yearsExp !== undefined && { yearsExp: data.yearsExp })
      }
    })

    return NextResponse.json(specialization)
  } catch (error) {
    console.error('Error updating specialization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete specialization
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    })

    if (!user || user.role !== 'ARTISAN' || !user.profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get existing specialization
    const existingSpec = await prisma.specialization.findUnique({
      where: { id }
    })

    if (!existingSpec) {
      return NextResponse.json({ error: 'Specialization not found' }, { status: 404 })
    }

    // Verify ownership
    if (existingSpec.profileId !== user.profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete specialization
    await prisma.specialization.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting specialization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
