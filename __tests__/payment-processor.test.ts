/**
 * Tests for lib/payment-processor.ts
 * 
 * Tests the business logic for processing job payments,
 * calculating commissions, and creating payout records.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the B2C module
vi.mock('@/lib/mpesa/b2c', () => ({
  isB2CEnabled: vi.fn(() => true),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}))

import { isB2CEnabled } from '@/lib/mpesa/b2c'
import {
  calculateCommissionRate,
  calculateDepositSplit,
  calculateFinalPaymentDistribution,
  processDepositPayment,
  processFinalPayment,
  getArtisanPayoutPhone,
  getPaymentConfig,
  validatePayoutCreation,
  paymentConfig,
} from '@/lib/payment-processor'

describe('calculateCommissionRate', () => {
  it('should return promotional rate (5%) for artisans with 0 completed jobs', () => {
    const result = calculateCommissionRate(0)
    expect(result.rate).toBe(0.05)
    expect(result.isPromotional).toBe(true)
  })

  it('should return promotional rate (5%) for artisans with less than 5 completed jobs', () => {
    expect(calculateCommissionRate(1).isPromotional).toBe(true)
    expect(calculateCommissionRate(2).isPromotional).toBe(true)
    expect(calculateCommissionRate(3).isPromotional).toBe(true)
    expect(calculateCommissionRate(4).isPromotional).toBe(true)
  })

  it('should return standard rate (10%) for artisans with 5 or more completed jobs', () => {
    const result = calculateCommissionRate(5)
    expect(result.rate).toBe(0.10)
    expect(result.isPromotional).toBe(false)
  })

  it('should return standard rate for artisans with many completed jobs', () => {
    expect(calculateCommissionRate(10).isPromotional).toBe(false)
    expect(calculateCommissionRate(50).isPromotional).toBe(false)
    expect(calculateCommissionRate(100).isPromotional).toBe(false)
  })
})

describe('calculateDepositSplit', () => {
  it('should split deposit 80/20 (artisan/held)', () => {
    const result = calculateDepositSplit(1000)
    expect(result.artisanShare).toBe(800)
    expect(result.heldAmount).toBe(200)
  })

  it('should handle decimal amounts correctly', () => {
    const result = calculateDepositSplit(1500)
    expect(result.artisanShare).toBe(1200)
    expect(result.heldAmount).toBe(300)
  })

  it('should round to 2 decimal places', () => {
    const result = calculateDepositSplit(333)
    expect(result.artisanShare).toBe(266.4)
    expect(result.heldAmount).toBe(66.6)
  })

  it('should handle small amounts', () => {
    const result = calculateDepositSplit(10)
    expect(result.artisanShare).toBe(8)
    expect(result.heldAmount).toBe(2)
  })

  it('should handle zero amount', () => {
    const result = calculateDepositSplit(0)
    expect(result.artisanShare).toBe(0)
    expect(result.heldAmount).toBe(0)
  })

  it('artisan share + held amount should equal deposit', () => {
    const depositAmounts = [100, 500, 1000, 2500, 9999, 15000]
    depositAmounts.forEach(amount => {
      const result = calculateDepositSplit(amount)
      expect(result.artisanShare + result.heldAmount).toBeCloseTo(amount, 2)
    })
  })
})

describe('calculateFinalPaymentDistribution', () => {
  it('should calculate commission on total job price with 5% promotional rate', () => {
    const result = calculateFinalPaymentDistribution(
      5000,  // finalAmount
      2000,  // heldAmount
      10000, // totalJobPrice
      0.05   // commissionRate (5% promotional)
    )
    
    // Commission: 10000 * 0.05 = 500
    // Artisan payout: 5000 + 2000 - 500 = 6500
    expect(result.commission).toBe(500)
    expect(result.artisanPayout).toBe(6500)
  })

  it('should calculate commission on total job price with 10% standard rate', () => {
    const result = calculateFinalPaymentDistribution(
      5000,  // finalAmount
      2000,  // heldAmount
      10000, // totalJobPrice
      0.10   // commissionRate (10% standard)
    )
    
    // Commission: 10000 * 0.10 = 1000
    // Artisan payout: 5000 + 2000 - 1000 = 6000
    expect(result.commission).toBe(1000)
    expect(result.artisanPayout).toBe(6000)
  })

  it('should handle zero held amount', () => {
    const result = calculateFinalPaymentDistribution(
      10000, // finalAmount
      0,     // heldAmount
      10000, // totalJobPrice
      0.10   // commissionRate
    )
    
    expect(result.commission).toBe(1000)
    expect(result.artisanPayout).toBe(9000)
  })

  it('should round amounts to 2 decimal places', () => {
    const result = calculateFinalPaymentDistribution(
      3333,  // finalAmount
      1111,  // heldAmount
      5555,  // totalJobPrice
      0.10   // commissionRate
    )
    
    // Commission: 5555 * 0.10 = 555.5
    // Artisan payout: 3333 + 1111 - 555.5 = 3888.5
    expect(result.commission).toBe(555.5)
    expect(result.artisanPayout).toBe(3888.5)
  })

  it('should handle large amounts', () => {
    const result = calculateFinalPaymentDistribution(
      50000,  // finalAmount
      20000,  // heldAmount
      100000, // totalJobPrice
      0.10    // commissionRate
    )
    
    expect(result.commission).toBe(10000)
    expect(result.artisanPayout).toBe(60000)
  })
})

describe('processDepositPayment', () => {
  let mockTx: {
    job: { update: ReturnType<typeof vi.fn> }
    artisanPayout: { create: ReturnType<typeof vi.fn> }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockTx = {
      job: { update: vi.fn().mockResolvedValue({}) },
      artisanPayout: { create: vi.fn().mockResolvedValue({ id: 'payout_123' }) },
    }
    vi.mocked(isB2CEnabled).mockReturnValue(true)
  })

  it('should create payout and update held amount for valid deposit', async () => {
    const result = await processDepositPayment(mockTx, {
      jobId: 'job_1',
      jobPaymentId: 'payment_1',
      depositAmount: 1000,
      artisanId: 'artisan_1',
      artisanPhone: '254712345678',
      artisanCompletedJobs: 0,
    })

    expect(result.success).toBe(true)
    expect(result.payoutId).toBe('payout_123')
    expect(result.details?.grossAmount).toBe(1000)
    expect(result.details?.netAmount).toBe(800)
    expect(result.details?.heldAmount).toBe(200)
    expect(result.details?.commission).toBe(0) // No commission on deposit

    expect(mockTx.artisanPayout.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        artisanId: 'artisan_1',
        jobId: 'job_1',
        type: 'DEPOSIT_SHARE',
        grossAmount: 800,
        commission: 0,
        netAmount: 800,
        phoneNumber: '254712345678',
        status: 'PENDING',
      }),
    })

    expect(mockTx.job.update).toHaveBeenCalledWith({
      where: { id: 'job_1' },
      data: { heldAmount: 200 },
    })
  })

  it('should skip payout creation when B2C is disabled', async () => {
    vi.mocked(isB2CEnabled).mockReturnValue(false)

    const result = await processDepositPayment(mockTx, {
      jobId: 'job_1',
      jobPaymentId: 'payment_1',
      depositAmount: 1000,
      artisanId: 'artisan_1',
      artisanPhone: '254712345678',
      artisanCompletedJobs: 0,
    })

    expect(result.success).toBe(true)
    expect(result.message).toContain('B2C payouts disabled')
    expect(mockTx.artisanPayout.create).not.toHaveBeenCalled()
    expect(mockTx.job.update).not.toHaveBeenCalled()
  })

  it('should hold full amount when artisan share is below minimum', async () => {
    const result = await processDepositPayment(mockTx, {
      jobId: 'job_1',
      jobPaymentId: 'payment_1',
      depositAmount: 10, // 80% = 8, below minimum of 10
      artisanId: 'artisan_1',
      artisanPhone: '254712345678',
      artisanCompletedJobs: 0,
    })

    expect(result.success).toBe(true)
    expect(result.message).toContain('below minimum payout')
    expect(result.details?.heldAmount).toBe(10) // Full amount held
    expect(result.details?.netAmount).toBe(0)
    expect(mockTx.artisanPayout.create).not.toHaveBeenCalled()
    expect(mockTx.job.update).toHaveBeenCalledWith({
      where: { id: 'job_1' },
      data: { heldAmount: { increment: 10 } },
    })
  })
})

describe('processFinalPayment', () => {
  let mockTx: {
    job: { update: ReturnType<typeof vi.fn> }
    artisanPayout: { create: ReturnType<typeof vi.fn> }
    platformEarning: { create: ReturnType<typeof vi.fn> }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockTx = {
      job: { update: vi.fn().mockResolvedValue({}) },
      artisanPayout: { create: vi.fn().mockResolvedValue({ id: 'payout_456' }) },
      platformEarning: { create: vi.fn().mockResolvedValue({ id: 'earning_789' }) },
    }
    vi.mocked(isB2CEnabled).mockReturnValue(true)
  })

  it('should process final payment with promotional rate', async () => {
    const result = await processFinalPayment(mockTx, {
      jobId: 'job_1',
      jobPaymentId: 'payment_1',
      finalAmount: 5000,
      heldAmount: 2000,
      artisanId: 'artisan_1',
      artisanPhone: '254712345678',
      artisanCompletedJobs: 2, // Promotional rate
      totalJobPrice: 10000,
    })

    expect(result.success).toBe(true)
    expect(result.payoutId).toBe('payout_456')
    expect(result.earningId).toBe('earning_789')
    expect(result.details?.isPromotional).toBe(true)
    expect(result.details?.commissionRate).toBe(0.05)
    expect(result.details?.commission).toBe(500) // 10000 * 0.05
    expect(result.details?.netAmount).toBe(6500) // 5000 + 2000 - 500

    expect(mockTx.artisanPayout.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'FINAL_PAYMENT',
        grossAmount: 7000, // 5000 + 2000
        commission: 500,
        netAmount: 6500,
        status: 'PENDING',
      }),
    })

    expect(mockTx.platformEarning.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobId: 'job_1',
        artisanId: 'artisan_1',
        jobValue: 10000,
        commissionRate: 0.05,
        commissionAmount: 500,
        isPromotional: true,
        paymentType: 'FINAL',
      }),
    })

    expect(mockTx.job.update).toHaveBeenCalledWith({
      where: { id: 'job_1' },
      data: { heldReleasedAt: expect.any(Date) },
    })
  })

  it('should process final payment with standard rate', async () => {
    const result = await processFinalPayment(mockTx, {
      jobId: 'job_1',
      jobPaymentId: 'payment_1',
      finalAmount: 5000,
      heldAmount: 2000,
      artisanId: 'artisan_1',
      artisanPhone: '254712345678',
      artisanCompletedJobs: 10, // Standard rate
      totalJobPrice: 10000,
    })

    expect(result.success).toBe(true)
    expect(result.details?.isPromotional).toBe(false)
    expect(result.details?.commissionRate).toBe(0.10)
    expect(result.details?.commission).toBe(1000) // 10000 * 0.10
    expect(result.details?.netAmount).toBe(6000) // 5000 + 2000 - 1000
  })

  it('should skip payout creation when B2C is disabled', async () => {
    vi.mocked(isB2CEnabled).mockReturnValue(false)

    const result = await processFinalPayment(mockTx, {
      jobId: 'job_1',
      jobPaymentId: 'payment_1',
      finalAmount: 5000,
      heldAmount: 2000,
      artisanId: 'artisan_1',
      artisanPhone: '254712345678',
      artisanCompletedJobs: 10,
      totalJobPrice: 10000,
    })

    expect(result.success).toBe(true)
    expect(result.message).toContain('B2C payouts disabled')
    expect(mockTx.artisanPayout.create).not.toHaveBeenCalled()
    expect(mockTx.platformEarning.create).not.toHaveBeenCalled()
  })
})

describe('getArtisanPayoutPhone', () => {
  it('should return phone number when artisan exists', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ phone: '254712345678' }),
      },
    }

    const phone = await getArtisanPayoutPhone(mockPrisma, 'artisan_1')
    expect(phone).toBe('254712345678')
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'artisan_1' },
      select: { phone: true },
    })
  })

  it('should return null when artisan not found', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    }

    const phone = await getArtisanPayoutPhone(mockPrisma, 'nonexistent')
    expect(phone).toBeNull()
  })

  it('should return null when artisan has no phone', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ phone: null }),
      },
    }

    const phone = await getArtisanPayoutPhone(mockPrisma, 'artisan_1')
    expect(phone).toBeNull()
  })
})

describe('getPaymentConfig', () => {
  beforeEach(() => {
    vi.mocked(isB2CEnabled).mockReturnValue(true)
  })

  it('should return configuration object with B2C status', () => {
    const config = getPaymentConfig()
    
    expect(config).toHaveProperty('standardCommissionRate')
    expect(config).toHaveProperty('promotionalCommissionRate')
    expect(config).toHaveProperty('promotionalJobThreshold')
    expect(config).toHaveProperty('artisanDepositShare')
    expect(config).toHaveProperty('minimumPayoutAmount')
    expect(config).toHaveProperty('maxPayoutRetries')
    expect(config).toHaveProperty('b2cEnabled')
    expect(config.b2cEnabled).toBe(true)
  })

  it('should reflect B2C disabled status', () => {
    vi.mocked(isB2CEnabled).mockReturnValue(false)
    const config = getPaymentConfig()
    expect(config.b2cEnabled).toBe(false)
  })
})

describe('validatePayoutCreation', () => {
  beforeEach(() => {
    vi.mocked(isB2CEnabled).mockReturnValue(true)
  })

  it('should return valid for correct inputs', () => {
    const result = validatePayoutCreation(100, '254712345678')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should return invalid when B2C is disabled', () => {
    vi.mocked(isB2CEnabled).mockReturnValue(false)
    const result = validatePayoutCreation(100, '254712345678')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('B2C payouts are not enabled')
  })

  it('should return invalid when amount is below minimum', () => {
    const result = validatePayoutCreation(5, '254712345678')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('below minimum payout')
  })

  it('should return invalid when phone number is null', () => {
    const result = validatePayoutCreation(100, null)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('phone number not available')
  })

  it('should return invalid for invalid phone number format', () => {
    const result = validatePayoutCreation(100, '12345')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid phone number')
  })

  it('should accept various valid Kenyan phone formats', () => {
    const validPhones = [
      '254712345678',
      '0712345678',
      '712345678',
      '+254712345678',
      '254 712 345 678',
    ]

    validPhones.forEach(phone => {
      const result = validatePayoutCreation(100, phone)
      expect(result.valid).toBe(true)
    })
  })

  it('should accept Safaricom numbers (07xx, 01xx)', () => {
    expect(validatePayoutCreation(100, '0722123456').valid).toBe(true)
    expect(validatePayoutCreation(100, '0733123456').valid).toBe(true)
    expect(validatePayoutCreation(100, '0100123456').valid).toBe(true)
    expect(validatePayoutCreation(100, '0101123456').valid).toBe(true)
  })
})

describe('paymentConfig', () => {
  it('should have expected default values', () => {
    expect(paymentConfig.standardCommissionRate).toBe(0.10)
    expect(paymentConfig.promotionalCommissionRate).toBe(0.05)
    expect(paymentConfig.promotionalJobThreshold).toBe(5)
    expect(paymentConfig.artisanDepositShare).toBe(0.80)
    expect(paymentConfig.minimumPayoutAmount).toBe(10)
    expect(paymentConfig.maxPayoutRetries).toBe(3)
  })
})
