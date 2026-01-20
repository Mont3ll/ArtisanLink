import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/admin/locations/stats')

// Kenya's 47 counties organized by region
const KENYA_REGIONS = {
  'Central': ['Kiambu', 'Murang\'a', 'Nyeri', 'Kirinyaga', 'Nyandarua'],
  'Coast': ['Mombasa', 'Kilifi', 'Kwale', 'Tana River', 'Lamu', 'Taita Taveta'],
  'Eastern': ['Machakos', 'Kitui', 'Makueni', 'Embu', 'Tharaka Nithi', 'Meru', 'Isiolo', 'Marsabit'],
  'Nairobi': ['Nairobi'],
  'North Eastern': ['Garissa', 'Wajir', 'Mandera'],
  'Nyanza': ['Kisumu', 'Siaya', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'],
  'Rift Valley': ['Nakuru', 'Kajiado', 'Narok', 'Kericho', 'Bomet', 'Nandi', 'Uasin Gishu', 'Trans Nzoia', 'Elgeyo Marakwet', 'Baringo', 'Laikipia', 'Samburu', 'Turkana', 'West Pokot'],
  'Western': ['Kakamega', 'Bungoma', 'Busia', 'Vihiga']
}

// GET - Get location statistics (admin only)
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') // Filter by region
    const includeEmpty = searchParams.get('includeEmpty') === 'true' // Include counties with 0 artisans

    // Get artisan counts by county
    const artisansByCounty = await prisma.profile.groupBy({
      by: ['county'],
      where: {
        user: { role: 'ARTISAN' },
        county: { not: null }
      },
      _count: { id: true }
    })

    // Get artisan counts by city
    const artisansByCity = await prisma.profile.groupBy({
      by: ['city', 'county'],
      where: {
        user: { role: 'ARTISAN' },
        city: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50 // Top 50 cities
    })

    // Build county map with artisan counts
    const countyMap = new Map<string, number>()
    artisansByCounty.forEach((item: { county: string | null; _count: { id: number } }) => {
      if (item.county) {
        countyMap.set(item.county, item._count.id)
      }
    })

    // Build regions with county data
    const regions = Object.entries(KENYA_REGIONS).map(([regionName, counties]) => {
      const regionCounties = counties.map((county, idx) => ({
        id: `${regionName.toLowerCase().replace(/\s+/g, '-')}-${idx + 1}`,
        name: county,
        artisanCount: countyMap.get(county) || 0,
        active: (countyMap.get(county) || 0) > 0,
        featured: county === 'Nairobi' || county === 'Mombasa' || county === 'Nakuru' || county === 'Kisumu'
      }))

      // Filter out empty counties unless includeEmpty is true
      const filteredCounties = includeEmpty 
        ? regionCounties 
        : regionCounties.filter(c => c.artisanCount > 0 || c.featured)

      return {
        id: regionName.toLowerCase().replace(/\s+/g, '-'),
        name: regionName,
        counties: filteredCounties.length,
        totalCounties: counties.length,
        artisanCount: regionCounties.reduce((sum, c) => sum + c.artisanCount, 0),
        countyList: filteredCounties
      }
    })

    // Filter regions if specified
    const filteredRegions = region 
      ? regions.filter(r => r.name.toLowerCase() === region.toLowerCase())
      : regions

    // Build cities list
    const cities = artisansByCity.map((item: { city: string | null; county: string | null; _count: { id: number } }, idx: number) => ({
      id: `city-${idx + 1}`,
      name: item.city || 'Unknown',
      county: item.county || 'Unknown',
      artisanCount: item._count.id,
      active: true,
      featured: item.city === 'Nairobi' || item.city === 'Mombasa' || item.city === 'Nakuru' || item.city === 'Eldoret'
    }))

    // Calculate stats
    const totalArtisans = artisansByCounty.reduce((sum: number, item: { _count: { id: number } }) => sum + item._count.id, 0)
    const activeCounties = artisansByCounty.filter((item: { _count: { id: number } }) => item._count.id > 0).length
    const activeCities = artisansByCity.filter((item: { _count: { id: number } }) => item._count.id > 0).length
    const featuredCounties = ['Nairobi', 'Mombasa', 'Nakuru', 'Kisumu', 'Kiambu', 'Machakos']
    const featuredCount = featuredCounties.filter(county => countyMap.has(county) && (countyMap.get(county) || 0) > 0).length

    // Calculate coverage score (percentage of counties with at least 1 artisan)
    const totalCounties = Object.values(KENYA_REGIONS).flat().length
    const coverageScore = Math.round((activeCounties / totalCounties) * 100)

    // Get top counties for quick reference
    const topCounties = Array.from(countyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count], idx) => ({
        id: `top-${idx + 1}`,
        name,
        artisanCount: count,
        rank: idx + 1
      }))

    return NextResponse.json({
      stats: {
        totalCounties,
        activeCounties,
        activeCities,
        featuredLocations: featuredCount,
        coverageScore,
        totalArtisans
      },
      regions: filteredRegions.sort((a, b) => b.artisanCount - a.artisanCount),
      counties: filteredRegions.flatMap(r => r.countyList).sort((a, b) => b.artisanCount - a.artisanCount),
      cities: cities.slice(0, 20), // Top 20 cities
      topCounties,
      metadata: {
        country: 'Kenya',
        totalRegions: Object.keys(KENYA_REGIONS).length,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Error fetching location stats', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
