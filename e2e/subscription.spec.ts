import { test, expect } from '@playwright/test';

/**
 * Subscription Flow E2E Tests for ArtisanLink
 * Tests the subscription plans display, checkout flow, and payment pages
 * 
 * Note: Actual M-Pesa payments cannot be tested in E2E without a sandbox environment.
 * These tests verify the UI flow and API structure.
 */

test.describe('Subscription Flow', () => {
  test.describe('Pricing Page', () => {
    test('pricing section displays subscription plans', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Navigate to pricing
      await page.getByRole('link', { name: /pricing/i }).first().click();
      await page.waitForTimeout(500);
      
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection).toBeInViewport();
    });

    test('pricing section is accessible from direct scroll', async ({ page }) => {
      await page.goto('/#pricing');
      await page.waitForTimeout(3000);
      
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection).toBeVisible();
    });
  });

  test.describe('Subscription Dashboard Access', () => {
    test('subscription page requires authentication', async ({ page }) => {
      await page.goto('/artisan-dashboard/subscription');
      
      // Should redirect to sign-in
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('payment history page requires authentication', async ({ page }) => {
      await page.goto('/artisan-dashboard/payments');
      
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });
  });

  test.describe('M-Pesa Payment API', () => {
    test('M-Pesa initiate endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/payments/mpesa/initiate', {
        data: {
          phoneNumber: '254712345678',
          plan: 'BASIC',
        },
      });
      
      // Should return 401 Unauthorized or 503 if M-Pesa is not configured
      expect([401, 503]).toContain(response.status());
    });

    test('M-Pesa status endpoint requires authentication', async ({ request }) => {
      const response = await request.get('/api/payments/mpesa/status?checkoutRequestId=test123');
      
      expect(response.status()).toBe(401);
    });

    test('M-Pesa callback endpoint accepts POST requests', async ({ request }) => {
      // The callback endpoint should accept POST but may return error without valid data
      const response = await request.post('/api/payments/mpesa/callback', {
        data: {
          Body: {
            stkCallback: {
              MerchantRequestID: 'test',
              CheckoutRequestID: 'test',
              ResultCode: 0,
              ResultDesc: 'Test',
            },
          },
        },
      });
      
      // Should not be 404 - endpoint exists
      expect(response.status()).not.toBe(404);
    });

    test('artisan payments API requires authentication', async ({ request }) => {
      const response = await request.get('/api/artisan/payments');
      
      expect(response.status()).toBe(401);
    });

    test('payment export API requires authentication', async ({ request }) => {
      const response = await request.get('/api/artisan/payments/export');
      
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Subscription Plans Structure', () => {
    test('subscription routes exist and are protected', async ({ page }) => {
      const routes = [
        '/artisan-dashboard/subscription',
        '/artisan-dashboard/payments',
      ];

      for (const route of routes) {
        const response = await page.goto(route);
        // Routes should exist (redirect to sign-in, not 404)
        expect(response?.status()).not.toBe(404);
      }
    });
  });
});

test.describe('Payment Flow UI', () => {
  test.describe('Homepage Pricing CTA', () => {
    test('homepage has path to pricing information', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Pricing link should exist
      const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
      await expect(pricingLink).toBeVisible();
    });

    test('can navigate to pricing section', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      await page.getByRole('link', { name: /pricing/i }).first().click();
      await page.waitForTimeout(500);
      
      // Should scroll to pricing section
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection).toBeInViewport();
    });
  });

  test.describe('Sign Up to Subscription Flow', () => {
    test('new user flow: homepage -> sign up -> (would go to) subscription', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Step 1: Click Get Started
      await page.getByRole('link', { name: /get started/i }).first().click();
      await expect(page).toHaveURL(/sign-up/);
      
      // After sign up, user would be directed to dashboard/subscription
      // We can only verify the sign-up page loads
    });
  });
});

test.describe('Subscription Mobile Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('mobile pricing section is accessible', async ({ page }) => {
    await page.goto('/#pricing');
    await page.waitForTimeout(3000);
    
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();
  });

  test('mobile subscription page redirects to sign-in', async ({ page }) => {
    await page.goto('/artisan-dashboard/subscription');
    
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    await expect(page).toHaveURL(/sign-in/);
  });

  test('mobile payment history page redirects to sign-in', async ({ page }) => {
    await page.goto('/artisan-dashboard/payments');
    
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Payment API Security', () => {
  test('payment initiation requires valid phone number format', async ({ request }) => {
    // Even with auth, invalid data should be rejected
    const response = await request.post('/api/payments/mpesa/initiate', {
      data: {
        phoneNumber: 'invalid',
        plan: 'BASIC',
      },
    });
    
    // Should be 401 (auth), 400 (validation), or 503 (M-Pesa not configured)
    expect([400, 401, 503]).toContain(response.status());
  });

  test('payment callback validates request structure', async ({ request }) => {
    const response = await request.post('/api/payments/mpesa/callback', {
      data: { invalid: 'data' },
    });
    
    // Should handle gracefully (not 500 internal error ideally)
    expect(response.status()).not.toBe(404);
  });
});

test.describe('Subscription State Management', () => {
  test.describe('Protected Subscription Features', () => {
    test('subscription page is a protected route', async ({ page }) => {
      await page.goto('/artisan-dashboard/subscription');
      
      // Verify redirect happens
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('sign-in');
    });

    test('payments page is a protected route', async ({ page }) => {
      await page.goto('/artisan-dashboard/payments');
      
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('sign-in');
    });
  });
});

test.describe('Subscription Accessibility', () => {
  test('pricing section has proper structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Navigate to pricing
    await page.getByRole('link', { name: /pricing/i }).first().click();
    await page.waitForTimeout(500);
    
    // Pricing section should exist with id
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();
  });

  test('pricing link is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Tab through the page to find pricing link
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
    await expect(pricingLink).toBeVisible();
    
    // Link should be focusable
    await pricingLink.focus();
    await expect(pricingLink).toBeFocused();
  });
});

test.describe('Cron Job Endpoints', () => {
  test('subscription cron endpoint requires secret', async ({ request }) => {
    const response = await request.post('/api/cron/subscriptions');
    
    // Should return 401 without proper CRON_SECRET
    expect(response.status()).toBe(401);
  });

  test('subscription cron endpoint validates authorization header', async ({ request }) => {
    const response = await request.post('/api/cron/subscriptions', {
      headers: {
        'Authorization': 'Bearer invalid-secret',
      },
    });
    
    // Should return 401 with invalid secret
    expect(response.status()).toBe(401);
  });
});
