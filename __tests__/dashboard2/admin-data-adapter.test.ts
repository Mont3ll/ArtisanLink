/// <reference types="vitest/globals" />
import {
  mapPendingArtisanToVerificationRecord,
  mapAdminArtisanToSource,
  mapInviteToRow,
  mapAdminStatsToSource,
  relativeTime,
} from '@/lib/hooks/use-admin-data-adapter'

describe('relativeTime', () => {
  it('shows hours ago for same-day timestamps', () => {
    const recent = new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    expect(relativeTime(recent)).toBe('2h ago')
  })
  it('shows Just now for recent timestamps', () => {
    const veryRecent = new Date(Date.now() - 10 * 1000).toISOString()
    expect(relativeTime(veryRecent)).toBe('Just now')
  })
})

describe('mapPendingArtisanToVerificationRecord', () => {
  const makeArtisan = (profileOverrides: Record<string, unknown> = {}) => ({
    id: 'art-1', firstName: 'Joseph', lastName: 'Njoroge', email: 'j@e.com', phone: undefined,
    createdAt: new Date().toISOString(),
    profile: {
      profession: 'Welder', county: 'Nairobi', artisanStatus: 'PENDING' as const,
      certificateUrl: 'https://cert.example.com/1.pdf',
      idDocumentUrl: 'https://id.example.com/1.jpg',
      idDocumentType: 'NATIONAL_ID',
      ...profileOverrides,
    },
  })

  it('maps basic fields', () => {
    const result = mapPendingArtisanToVerificationRecord(makeArtisan())
    expect(result.id).toBe('art-1')
    expect(result.name).toBe('Joseph Njoroge')
    expect(result.profession).toBe('Welder')
    expect(result.county).toBe('Nairobi')
  })
  it('includes National ID in documents when idDocumentUrl present', () => {
    const result = mapPendingArtisanToVerificationRecord(makeArtisan())
    expect(result.documents).toContain('National ID')
    expect(result.documents).toContain('Certificate')
  })
  it('maps REJECTED artisanStatus to REVIEW', () => {
    const result = mapPendingArtisanToVerificationRecord(makeArtisan({ artisanStatus: 'REJECTED' }))
    expect(result.status).toBe('REVIEW')
  })
  it('sets High risk when no documents', () => {
    const result = mapPendingArtisanToVerificationRecord(
      makeArtisan({ certificateUrl: null, idDocumentUrl: null })
    )
    expect(result.risk).toBe('High')
  })
  it('sets Low risk when both documents present', () => {
    const result = mapPendingArtisanToVerificationRecord(makeArtisan())
    expect(result.risk).toBe('Low')
  })
})

describe('mapAdminArtisanToSource', () => {
  it('maps VERIFIED artisan with active subscription', () => {
    const artisan = {
      id: 'a1', name: 'Grace Wanjiku', email: '', phone: null,
      profession: 'Carpenter', location: 'Westlands, Nairobi',
      experience: 5, rating: 4.8, totalReviews: 24, portfolioItems: 8,
      status: 'VERIFIED' as const, isAvailable: true,
      joinDate: '', lastActive: '',
      subscriptionStatus: 'ACTIVE' as const, subscriptionPlan: 'MONTHLY' as const, subscriptionEndDate: null,
    }
    const result = mapAdminArtisanToSource(artisan)
    expect(result.isVerified).toBe(true)
    expect(result.isPremium).toBe(true)
    expect(result.rating).toEqual({ average: 4.8, total: 24 })
    expect(result.location.city).toBe('Westlands')
    expect(result.location.county).toBe('Nairobi')
  })
  it('maps PENDING artisan with no subscription', () => {
    const artisan = {
      id: 'a2', name: 'John Doe', email: '', phone: null,
      profession: null, location: null,
      experience: 0, rating: 0, totalReviews: 0, portfolioItems: 0,
      status: 'PENDING' as const, isAvailable: false,
      joinDate: '', lastActive: '',
      subscriptionStatus: 'INACTIVE' as const, subscriptionPlan: null, subscriptionEndDate: null,
    }
    const result = mapAdminArtisanToSource(artisan)
    expect(result.isVerified).toBe(false)
    expect(result.isPremium).toBe(false)
    expect(result.location.city).toBe('')
  })
})

describe('mapInviteToRow', () => {
  it('maps PENDING → PENDING', () => {
    expect(mapInviteToRow({ id: 'i1', email: 'a@b.com', status: 'PENDING', createdAt: new Date().toISOString() }).status).toBe('PENDING')
  })
  it('maps ACCEPTED → COMPLETED', () => {
    expect(mapInviteToRow({ id: 'i2', email: 'a@b.com', status: 'ACCEPTED', createdAt: new Date().toISOString() }).status).toBe('COMPLETED')
  })
  it('maps EXPIRED → REVIEW', () => {
    expect(mapInviteToRow({ id: 'i3', email: 'a@b.com', status: 'EXPIRED', createdAt: new Date().toISOString() }).status).toBe('REVIEW')
  })
  it('defaults unknown status → PENDING', () => {
    expect(mapInviteToRow({ id: 'i4', email: 'a@b.com', status: 'UNKNOWN', createdAt: new Date().toISOString() }).status).toBe('PENDING')
  })
  it('sets role to Artisan', () => {
    expect(mapInviteToRow({ id: 'i5', email: 'a@b.com', status: 'PENDING', createdAt: new Date().toISOString() }).role).toBe('Artisan')
  })
})

describe('mapAdminStatsToSource', () => {
  it('formats stats correctly', () => {
    const stats = {
      pendingVerifications: 19, totalArtisans: 312, activeSubscriptions: 156,
      systemUptime: 99.96, totalUsers: 2418, activeArtisans: 280,
      monthlyRevenue: 46800, monthlyGrowth: 12, totalReviews: 480,
    }
    const result = mapAdminStatsToSource(stats)
    expect(result.pendingVerification).toBe('19')
    expect(result.activeSubscriptions).toBe('156')
    expect(result.systemUptime).toBe('99.96%')
    expect(result.openModeration).toBe('0')
  })
  it('handles zero values', () => {
    const stats = {
      pendingVerifications: 0, totalArtisans: 0, activeSubscriptions: 0,
      systemUptime: 100, totalUsers: 0, activeArtisans: 0,
      monthlyRevenue: 0, monthlyGrowth: 0, totalReviews: 0,
    }
    const result = mapAdminStatsToSource(stats)
    expect(result.pendingVerification).toBe('0')
    expect(result.systemUptime).toBe('100.00%')
  })
})
