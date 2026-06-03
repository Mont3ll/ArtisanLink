import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const updateUserSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED']),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const rateLimitResult = rateLimit(request, 'admin/users/update', RATE_LIMITS.STRICT)
  if (!rateLimitResult.allowed) return rateLimitResult.response!

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const parsed = updateUserSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    if (admin.id === id && parsed.data.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Admins cannot restrict their own account' },
        { status: 400 },
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: parsed.data.status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
