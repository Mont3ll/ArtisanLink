/// <reference types="vitest/globals" />
import {
  mapRealClientJobToSource,
  mapClientStatusToSource,
  mapClientStatsToSource,
} from '@/lib/hooks/use-client-data-adapter'

const makeRealJob = (overrides: Record<string, unknown> = {}) => ({
  id: 'cj-1', title: 'Paint living room', description: 'Two-room repaint',
  category: null, location: 'Westlands, Nairobi', status: 'QUOTED',
  clientBudget: 14000, agreedPrice: null, depositAmount: null, depositPercent: 30,
  depositPaid: false, depositPaidAt: null, finalPaid: false, finalPaidAt: null,
  startedAt: null, requestedStartDate: null, requestedEndDate: null,
  scheduledStartDate: null, scheduledEndDate: null, completedAt: null,
  declineReason: null, cancelReason: null, createdAt: '', updatedAt: '',
  artisan: { id: 'a1', name: 'Amina Hassan', email: '', profileImage: null,
    profession: 'Painter', phone: null, location: null, rating: 4.8, isAvailable: true },
  latestQuote: { id: 'q1', amount: 12000, description: '', estimatedDuration: null,
    paymentTerms: null, status: 'SENT', round: 1, validUntil: null,
    clientResponse: null, requestedDepositPercent: null, lineItems: [], createdAt: '' },
  payments: [],
  conversationId: null,
  ...overrides,
})

describe('mapClientStatusToSource', () => {
  it('maps REQUESTED → PENDING', () => expect(mapClientStatusToSource('REQUESTED')).toBe('PENDING'))
  it('maps IN_PROGRESS → ACTIVE', () => expect(mapClientStatusToSource('IN_PROGRESS')).toBe('ACTIVE'))
  it('maps PAID → COMPLETED', () => expect(mapClientStatusToSource('PAID')).toBe('COMPLETED'))
  it('maps DISPUTED → REVIEW', () => expect(mapClientStatusToSource('DISPUTED')).toBe('REVIEW'))
  it('passes QUOTED through', () => expect(mapClientStatusToSource('QUOTED')).toBe('QUOTED'))
  it('maps DEPOSIT_PAID → ACTIVE', () => expect(mapClientStatusToSource('DEPOSIT_PAID')).toBe('ACTIVE'))
  it('maps ACCEPTED → ACTIVE', () => expect(mapClientStatusToSource('ACCEPTED')).toBe('ACTIVE'))
  it('defaults unknown → PENDING', () => expect(mapClientStatusToSource('UNKNOWN')).toBe('PENDING'))
})

describe('mapRealClientJobToSource', () => {
  it('maps core fields', () => {
    const result = mapRealClientJobToSource(makeRealJob() as never)
    expect(result.id).toBe('cj-1')
    expect(result.title).toBe('Paint living room')
    expect(result.artisan).toBe('Amina Hassan')
    expect(result.profession).toBe('Painter')
    expect(result.quote).toBe('KES 12,000')
    expect(result.location).toBe('Westlands, Nairobi')
    expect(result.status).toBe('QUOTED')
    expect(result.description).toBe('Two-room repaint')
  })
  it('returns Not sent when no quote', () => {
    expect(mapRealClientJobToSource(makeRealJob({ latestQuote: null }) as never).quote).toBe('Not sent')
  })
  it('maps COMPLETED status', () => {
    expect(mapRealClientJobToSource(makeRealJob({ status: 'COMPLETED' }) as never).status).toBe('COMPLETED')
  })
  it('maps IN_PROGRESS → ACTIVE', () => {
    expect(mapRealClientJobToSource(makeRealJob({ status: 'IN_PROGRESS' }) as never).status).toBe('ACTIVE')
  })
  it('falls back to Kenya when location is null', () => {
    expect(mapRealClientJobToSource(makeRealJob({ location: null }) as never).location).toBe('Kenya')
  })
  it('falls back to Artisan when profession is null', () => {
    const job = makeRealJob({ artisan: { id: 'a2', name: 'Bob', email: '', profileImage: null,
      profession: null, phone: null, location: null, rating: 4, isAvailable: true } })
    expect(mapRealClientJobToSource(job as never).profession).toBe('Artisan')
  })
})

describe('mapClientStatsToSource', () => {
  it('formats stats', () => {
    const result = mapClientStatsToSource({ totalProjects: 20, activeProjects: 3, completedProjects: 17, savedArtisans: 12 })
    expect(result.activeJobs).toBe('3')
    expect(result.savedArtisans).toBe('12')
    expect(result.completedJobs).toBe('17')
    expect(result.unreadMessages).toBe('0')
  })
  it('handles null', () => {
    const result = mapClientStatsToSource(null)
    expect(result.activeJobs).toBe('0')
    expect(result.savedArtisans).toBe('0')
    expect(result.completedJobs).toBe('0')
  })
  it('handles undefined', () => {
    const result = mapClientStatsToSource(undefined)
    expect(result.activeJobs).toBe('0')
  })
})
