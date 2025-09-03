import { NextResponse } from 'next/server'
import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      totalUsers: userCount,
      adminUsers: adminCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
