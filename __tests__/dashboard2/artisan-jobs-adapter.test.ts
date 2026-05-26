import { mapApiJobToSourceJob, mapStatusToSourceStatus } from '@/lib/hooks/use-artisan-jobs-adapter'

describe('mapApiJobToSourceJob', () => {
  it('maps a quoted job to source format', () => {
    const apiJob = {
      id: 'job-1', title: 'Fix sink', description: 'Leaking tap',
      location: 'Nairobi', status: 'QUOTED', clientBudget: 6000, agreedPrice: null,
      category: null, depositAmount: null, depositPercent: 30, depositPaid: false,
      depositPaidAt: null, finalPaid: false, finalPaidAt: null, startedAt: null,
      requestedStartDate: null, requestedEndDate: null, scheduledStartDate: null,
      scheduledEndDate: null, completedAt: null, declineReason: null, cancelReason: null,
      createdAt: '', updatedAt: '', needsAction: false, conversationId: null,
      client: { id: 'c1', name: 'Jane Doe', email: 'j@e.com', profileImage: null },
      latestQuote: {
        id: 'q1', amount: 4800, status: 'SENT', description: '', round: 1,
        estimatedDuration: null, paymentTerms: null, validUntil: null,
        clientResponse: null, requestedDepositPercent: null, lineItems: [], createdAt: '',
      },
      payments: [],
    }
    const result = mapApiJobToSourceJob(apiJob)
    expect(result.id).toBe('job-1')
    expect(result.client).toBe('Jane Doe')
    expect(result.status).toBe('QUOTED')
    expect(result.budget).toBe('KES 6,000')
    expect(result.quote).toBe('KES 4,800')
    expect(result.location).toBe('Nairobi')
    expect(result.description).toBe('Leaking tap')
  })

  it('maps REQUESTED → PENDING', () => {
    expect(mapStatusToSourceStatus('REQUESTED')).toBe('PENDING')
  })

  it('maps IN_PROGRESS → ACTIVE', () => {
    expect(mapStatusToSourceStatus('IN_PROGRESS')).toBe('ACTIVE')
  })

  it('maps PAID → COMPLETED', () => {
    expect(mapStatusToSourceStatus('PAID')).toBe('COMPLETED')
  })

  it('maps DEPOSIT_PAID → ACTIVE', () => {
    expect(mapStatusToSourceStatus('DEPOSIT_PAID')).toBe('ACTIVE')
  })

  it('maps ACCEPTED → ACTIVE', () => {
    expect(mapStatusToSourceStatus('ACCEPTED')).toBe('ACTIVE')
  })

  it('maps DISPUTED → REVIEW', () => {
    expect(mapStatusToSourceStatus('DISPUTED')).toBe('REVIEW')
  })

  it('returns "Not sent" when no quote', () => {
    const job = {
      id: 'j2', title: 'T', description: '', location: null, status: 'REQUESTED',
      clientBudget: 3000, agreedPrice: null, category: null, depositAmount: null,
      depositPercent: 30, depositPaid: false, depositPaidAt: null, finalPaid: false,
      finalPaidAt: null, startedAt: null, requestedStartDate: null, requestedEndDate: null,
      scheduledStartDate: null, scheduledEndDate: null, completedAt: null,
      declineReason: null, cancelReason: null, createdAt: '', updatedAt: '',
      needsAction: false, conversationId: null,
      client: { id: 'c2', name: 'Bob', email: '', profileImage: null },
      latestQuote: null, payments: [],
    }
    const result = mapApiJobToSourceJob(job)
    expect(result.quote).toBe('Not sent')
    expect(result.status).toBe('PENDING')
    expect(result.budget).toBe('KES 3,000')
  })

  it('uses agreedPrice when clientBudget is null', () => {
    const job = {
      id: 'j3', title: 'T', description: '', location: null, status: 'ACTIVE',
      clientBudget: null, agreedPrice: 8500, category: null, depositAmount: null,
      depositPercent: 30, depositPaid: true, depositPaidAt: null, finalPaid: false,
      finalPaidAt: null, startedAt: null, requestedStartDate: null, requestedEndDate: null,
      scheduledStartDate: null, scheduledEndDate: null, completedAt: null,
      declineReason: null, cancelReason: null, createdAt: '', updatedAt: '',
      needsAction: false, conversationId: null,
      client: { id: 'c3', name: 'Alice', email: '', profileImage: null },
      latestQuote: { id: 'q3', amount: 8500, status: 'ACCEPTED', description: '', round: 1,
        estimatedDuration: null, paymentTerms: null, validUntil: null,
        clientResponse: null, requestedDepositPercent: null, lineItems: [], createdAt: '' },
      payments: [],
    }
    const result = mapApiJobToSourceJob(job)
    expect(result.budget).toBe('KES 8,500')
  })

  it('falls back to Kenya when location is null', () => {
    const job = {
      id: 'j4', title: 'T', description: '', location: null, status: 'PENDING',
      clientBudget: 1000, agreedPrice: null, category: null, depositAmount: null,
      depositPercent: 30, depositPaid: false, depositPaidAt: null, finalPaid: false,
      finalPaidAt: null, startedAt: null, requestedStartDate: null, requestedEndDate: null,
      scheduledStartDate: null, scheduledEndDate: null, completedAt: null,
      declineReason: null, cancelReason: null, createdAt: '', updatedAt: '',
      needsAction: false, conversationId: null,
      client: { id: 'c4', name: 'X', email: '', profileImage: null },
      latestQuote: null, payments: [],
    }
    expect(mapApiJobToSourceJob(job).location).toBe('Kenya')
  })
})
