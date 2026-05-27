import { mapPayoutToEarningRow } from '@/lib/hooks/use-artisan-earnings-adapter'

describe('mapPayoutToEarningRow', () => {
  it('maps a completed payout with a job', () => {
    const payout = {
      id: 'pay-1',
      type: 'FINAL_PAYMENT' as const,
      grossAmount: 10000,
      commission: 800,
      netAmount: 9200,
      status: 'COMPLETED' as const,
      phoneNumber: '+254700000000',
      mpesaReceiptNumber: 'ABC123',
      mpesaTransactionId: null,
      failureReason: null,
      createdAt: '2026-05-01T10:00:00Z',
      completedAt: '2026-05-01T11:00:00Z',
      job: {
        id: 'j1',
        title: 'Fix sink',
        agreedPrice: 10000,
        client: { firstName: 'Jane', lastName: 'Doe' },
      },
    }
    const result = mapPayoutToEarningRow(payout)
    expect(result.id).toBe('pay-1')
    expect(result.item).toBe('Fix sink')
    expect(result.client).toBe('Jane Doe')
    expect(result.amount).toBe('KES 10,000')
    expect(result.commission).toBe('KES 800')
    expect(result.net).toBe('KES 9,200')
    expect(result.status).toBe('COMPLETED')
  })

  it('handles a payout with no job', () => {
    const payout = {
      id: 'pay-2',
      type: 'DEPOSIT_SHARE' as const,
      grossAmount: 5000,
      commission: 400,
      netAmount: 4600,
      status: 'PENDING' as const,
      phoneNumber: '+254700000001',
      mpesaReceiptNumber: null,
      mpesaTransactionId: null,
      failureReason: null,
      createdAt: '',
      completedAt: null,
      job: null,
    }
    const result = mapPayoutToEarningRow(payout)
    expect(result.id).toBe('pay-2')
    expect(result.item).toBe('Payout')
    expect(result.client).toBe('—')
    expect(result.amount).toBe('KES 5,000')
    expect(result.status).toBe('PENDING')
  })

  it('maps PROCESSING status to PENDING', () => {
    const payout = {
      id: 'pay-3',
      type: 'DEPOSIT_SHARE' as const,
      grossAmount: 1000,
      commission: 80,
      netAmount: 920,
      status: 'PROCESSING' as const,
      phoneNumber: '+254',
      mpesaReceiptNumber: null,
      mpesaTransactionId: null,
      failureReason: null,
      createdAt: '',
      completedAt: null,
      job: null,
    }
    expect(mapPayoutToEarningRow(payout).status).toBe('PENDING')
  })

  it('formats amounts correctly', () => {
    const payout = {
      id: 'p', type: 'FINAL_PAYMENT' as const,
      grossAmount: 1250000, commission: 100000, netAmount: 1150000,
      status: 'COMPLETED' as const, phoneNumber: '+254', mpesaReceiptNumber: null,
      mpesaTransactionId: null, failureReason: null, createdAt: '', completedAt: null,
      job: null,
    }
    const result = mapPayoutToEarningRow(payout)
    expect(result.amount).toBe('KES 1,250,000')
    expect(result.net).toBe('KES 1,150,000')
  })
})
