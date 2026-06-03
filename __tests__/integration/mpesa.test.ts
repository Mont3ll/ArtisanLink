/**
 * Integration tests for M-Pesa Payment flows
 * 
 * Tests the M-Pesa payment-related API routes:
 * - STK Push initiation
 * - Callback handling
 * - Payment status queries
 */
import { createHmac } from 'crypto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock M-Pesa library
vi.mock('@/lib/mpesa', () => ({
  getMpesaConfig: vi.fn(() => ({
    consumerKey: 'test_key',
    consumerSecret: 'test_secret',
    passkey: 'test_passkey',
    shortCode: '174379',
    callbackUrl: 'https://example.com/callback',
    environment: 'sandbox',
  })),
  validateMpesaConfig: vi.fn(() => ({ valid: true, missing: [] })),
  isMpesaEnabled: vi.fn(() => true),
  initiateSTKPush: vi.fn(),
  querySTKPushStatus: vi.fn(),
  parseSTKCallback: vi.fn(),
  getResultCodeDescription: vi.fn((code: number) => {
    const descriptions: Record<number, string> = {
      0: 'Success',
      1: 'Insufficient funds',
      1032: 'Request cancelled by user',
      1037: 'DS timeout user cannot be reached',
    };
    return descriptions[code] || 'Unknown error';
  }),
  formatPhoneNumber: vi.fn((phone: string) => phone.replace(/^0/, '254')),
  isValidKenyanPhone: vi.fn((phone: string) => /^(254|0)?7\d{8}$/.test(phone)),
  SUBSCRIPTION_PLANS: {
    MONTHLY: { name: 'Monthly', price: 499, durationDays: 30 },
    ANNUAL: { name: 'Annual', price: 4999, durationDays: 365 },
  },
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    payment: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback: (tx: unknown) => Promise<unknown>) => callback({
      payment: {
        create: vi.fn().mockResolvedValue({ id: 'payment_1' }),
        update: vi.fn(),
      },
      subscription: {
        create: vi.fn().mockResolvedValue({ id: 'sub_1' }),
        update: vi.fn(),
      },
      notification: {
        create: vi.fn(),
      },
    })),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  initiateSTKPush,
  isMpesaEnabled,
  parseSTKCallback,
  querySTKPushStatus,
} from '@/lib/mpesa';

// Import route handlers after mocks
import { POST as initiatePOST } from '@/app/api/payments/mpesa/initiate/route';
import { POST as callbackPOST, GET as callbackGET } from '@/app/api/payments/mpesa/callback/route';
import { GET as statusGET } from '@/app/api/payments/mpesa/status/route';

describe('M-Pesa Payment Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.MPESA_CALLBACK_SECRET;
  });

  afterEach(() => {
    delete process.env.MPESA_CALLBACK_SECRET;
  });

  describe('POST /api/payments/mpesa/initiate', () => {
    it('should return 503 when M-Pesa is disabled', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(false);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('M-Pesa payments are not enabled');
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: null } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 403 when non-artisan tries to subscribe', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'CLIENT',
        profile: null,
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only artisans can subscribe');
    });

    it('should return 400 when artisan profile not found', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: null,
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('profile not found');
    });

    it('should return 409 when already has active subscription', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: {
          id: 'profile_1',
          subscription: { status: 'ACTIVE' },
        },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('You already have an active subscription');
    });

    it('should return 400 for invalid phone number', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', subscription: null },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '123', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid plan', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', subscription: null },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'INVALID' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should initiate STK push successfully for monthly plan', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', subscription: null },
      } as never);
      vi.mocked(initiateSTKPush).mockResolvedValue({
        MerchantRequestID: 'merchant_123',
        CheckoutRequestID: 'checkout_456',
        ResponseCode: '0',
        ResponseDescription: 'Success',
        CustomerMessage: 'Success',
      });
      vi.mocked(prisma.payment.update).mockResolvedValue({} as never);
      vi.mocked(prisma.subscription.update).mockResolvedValue({} as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.checkoutRequestId).toBe('checkout_456');
      expect(data.merchantRequestId).toBe('merchant_123');
      expect(data.plan).toBe('MONTHLY');
      expect(data.amount).toBe(499);
      expect(data.currency).toBe('KES');
    });

    it('should initiate STK push successfully for annual plan', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', subscription: null },
      } as never);
      vi.mocked(initiateSTKPush).mockResolvedValue({
        MerchantRequestID: 'merchant_789',
        CheckoutRequestID: 'checkout_abc',
        ResponseCode: '0',
        ResponseDescription: 'Success',
        CustomerMessage: 'Success',
      });
      vi.mocked(prisma.payment.update).mockResolvedValue({} as never);
      vi.mocked(prisma.subscription.update).mockResolvedValue({} as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '254712345678', plan: 'ANNUAL' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.plan).toBe('ANNUAL');
      expect(data.amount).toBe(4999);
    });

    it('should handle STK push failure gracefully', async () => {
      vi.mocked(isMpesaEnabled).mockReturnValue(true);
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user_1',
        role: 'ARTISAN',
        profile: { id: 'profile_1', subscription: null },
      } as never);
      vi.mocked(initiateSTKPush).mockRejectedValue(new Error('Network error'));
      vi.mocked(prisma.payment.update).mockResolvedValue({} as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/initiate', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0712345678', plan: 'MONTHLY' }),
      });

      const response = await initiatePOST(request);
      const data = await response.json();

      expect([429, 500]).toContain(response.status);
      if (response.status === 500) {
        expect(data.error).toContain('Failed to initiate payment');
      }
    });
  });

  describe('POST /api/payments/mpesa/callback', () => {
    it('should return 400 for invalid callback structure', async () => {
      const request = new Request('http://localhost:3000/api/payments/mpesa/callback', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      });

      const response = await callbackPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid callback data');
    });

    it('rejects callbacks with an invalid HMAC signature when a callback secret is configured', async () => {
      process.env.MPESA_CALLBACK_SECRET = 'callback-secret';
      const body = JSON.stringify({ invalid: 'data' });

      const request = new Request('http://localhost:3000/api/payments/mpesa/callback', {
        method: 'POST',
        body,
        headers: { 'x-chapaworks-signature': 'sha256=invalid' },
      });

      const response = await callbackPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.ResultDesc).toBe('Invalid signature');
    });

    it('accepts callbacks with a valid HMAC signature when a callback secret is configured', async () => {
      process.env.MPESA_CALLBACK_SECRET = 'callback-secret';
      const body = JSON.stringify({ invalid: 'data' });
      const signature = `sha256=${createHmac('sha256', 'callback-secret').update(body).digest('hex')}`;

      const request = new Request('http://localhost:3000/api/payments/mpesa/callback', {
        method: 'POST',
        body,
        headers: { 'x-chapaworks-signature': signature },
      });

      const response = await callbackPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid callback data');
    });

    it('should handle successful payment callback', async () => {
      const callbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant_123',
            CheckoutRequestID: 'checkout_456',
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 499 },
                { Name: 'MpesaReceiptNumber', Value: 'ABC123XYZ' },
                { Name: 'PhoneNumber', Value: '254712345678' },
              ],
            },
          },
        },
      };

      vi.mocked(parseSTKCallback).mockReturnValue({
        success: true,
        checkoutRequestId: 'checkout_456',
        merchantRequestId: 'merchant_123',
        resultCode: 0,
        resultDesc: 'Success',
        amount: 499,
        mpesaReceiptNumber: 'ABC123XYZ',
        phoneNumber: '254712345678',
        transactionDate: new Date().toISOString(),
      });

      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        id: 'payment_1',
        subscriptionId: 'sub_1',
        subscription: {
          id: 'sub_1',
          plan: 'MONTHLY',
          profile: {
            user: { id: 'user_1' },
          },
        },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/callback', {
        method: 'POST',
        body: JSON.stringify(callbackData),
      });

      const response = await callbackPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ResultCode).toBe(0);
      expect(data.ResultDesc).toBe('Callback processed successfully');
    });

    it('should handle failed payment callback', async () => {
      const callbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant_123',
            CheckoutRequestID: 'checkout_456',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user',
          },
        },
      };

      vi.mocked(parseSTKCallback).mockReturnValue({
        success: false,
        checkoutRequestId: 'checkout_456',
        merchantRequestId: 'merchant_123',
        resultCode: 1032,
        resultDesc: 'Request cancelled by user',
        amount: undefined,
        mpesaReceiptNumber: undefined,
        phoneNumber: undefined,
        transactionDate: undefined,
      });

      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        id: 'payment_1',
        subscriptionId: 'sub_1',
        subscription: {
          id: 'sub_1',
          plan: 'MONTHLY',
          profile: {
            user: { id: 'user_1' },
          },
        },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/callback', {
        method: 'POST',
        body: JSON.stringify(callbackData),
      });

      const response = await callbackPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ResultCode).toBe(0); // Always return success to M-Pesa
    });

    it('should handle payment not found gracefully', async () => {
      const callbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant_unknown',
            CheckoutRequestID: 'checkout_unknown',
            ResultCode: 0,
            ResultDesc: 'Success',
          },
        },
      };

      vi.mocked(parseSTKCallback).mockReturnValue({
        success: true,
        checkoutRequestId: 'checkout_unknown',
        merchantRequestId: 'merchant_unknown',
        resultCode: 0,
        resultDesc: 'Success',
        amount: 499,
        mpesaReceiptNumber: 'ABC123',
        phoneNumber: '254712345678',
        transactionDate: new Date().toISOString(),
      });

      vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/payments/mpesa/callback', {
        method: 'POST',
        body: JSON.stringify(callbackData),
      });

      const response = await callbackPOST(request);
      const data = await response.json();

      // Should still return success to prevent M-Pesa retries
      expect(response.status).toBe(200);
      expect(data.ResultCode).toBe(0);
    });
  });

  describe('GET /api/payments/mpesa/callback', () => {
    it('should return health check status', async () => {
      const response = await callbackGET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.message).toContain('callback endpoint is active');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('GET /api/payments/mpesa/status', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=test');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=test');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 when checkoutRequestId missing', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('checkoutRequestId is required');
    });

    it('should return 404 when payment not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=unknown');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Payment not found');
    });

    it('should return 403 when user does not own payment', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        id: 'payment_1',
        status: 'PENDING',
        subscription: {
          profile: { userId: 'user_2' }, // Different user
        },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=checkout_456');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    it('should return completed payment status from database', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        id: 'payment_1',
        status: 'COMPLETED',
        amount: 499,
        currency: 'KES',
        mpesaReceiptNumber: 'ABC123XYZ',
        paidAt: new Date(),
        failureReason: null,
        subscription: {
          id: 'sub_1',
          status: 'ACTIVE',
          plan: 'MONTHLY',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          profile: { userId: 'user_1' },
        },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=checkout_456');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('COMPLETED');
      expect(data.receiptNumber).toBe('ABC123XYZ');
      expect(data.subscription.status).toBe('ACTIVE');
    });

    it('should return failed payment status', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        id: 'payment_1',
        status: 'FAILED',
        amount: 499,
        currency: 'KES',
        mpesaReceiptNumber: null,
        paidAt: null,
        failureReason: 'Insufficient funds',
        subscription: {
          id: 'sub_1',
          status: 'INACTIVE',
          plan: 'MONTHLY',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          profile: { userId: 'user_1' },
        },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=checkout_456');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('FAILED');
      expect(data.failureReason).toBe('Insufficient funds');
    });

    it('should return pending status when payment is pending', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        id: 'payment_1',
        status: 'PENDING',
        amount: 499,
        currency: 'KES',
        mpesaReceiptNumber: null,
        paidAt: null,
        failureReason: null,
        subscription: {
          id: 'sub_1',
          status: 'INACTIVE',
          plan: 'MONTHLY',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          profile: { userId: 'user_1' },
        },
      } as never);

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=checkout_456');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('PENDING');
      expect(data.statusMessage).toContain('Waiting for payment');
    });

    it('should query M-Pesa API when requested and payment pending', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_123' } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1' } as never);
      vi.mocked(prisma.payment.findFirst).mockResolvedValue({
        id: 'payment_1',
        status: 'PENDING',
        amount: 499,
        currency: 'KES',
        subscription: {
          id: 'sub_1',
          status: 'INACTIVE',
          plan: 'MONTHLY',
          profile: { userId: 'user_1' },
        },
      } as never);
      vi.mocked(querySTKPushStatus).mockResolvedValue({
        ResponseCode: '0',
        ResponseDescription: 'Success',
        MerchantRequestID: 'merchant_123',
        CheckoutRequestID: 'checkout_456',
        ResultCode: '0',
        ResultDesc: 'Success',
      });

      const request = new Request('http://localhost:3000/api/payments/mpesa/status?checkoutRequestId=checkout_456&query=true');
      const response = await statusGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('PROCESSING');
      expect(querySTKPushStatus).toHaveBeenCalled();
    });
  });
});
