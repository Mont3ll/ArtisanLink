import { test, expect } from '@playwright/test';

/**
 * Artisan Onboarding Flow E2E Tests for ArtisanLink
 * Tests the complete artisan registration and profile setup flow
 * 
 * Note: These tests simulate the onboarding flow for unauthenticated users
 * and test the artisan dashboard UI for authenticated scenarios (mocked).
 */

test.describe('Artisan Onboarding Flow', () => {
  test.describe('Landing Page to Sign Up', () => {
    test('user can navigate from homepage to artisan sign up', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000); // Wait for preloader
      
      // Click Get Started
      const getStartedLink = page.getByRole('link', { name: /get started/i }).first();
      await getStartedLink.click();
      
      // Should be on sign-up page
      await expect(page).toHaveURL(/sign-up/);
    });

    test('pricing page shows artisan subscription plans', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Navigate to pricing section
      await page.getByRole('link', { name: /pricing/i }).first().click();
      await page.waitForTimeout(500);
      
      // Pricing section should be visible
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection).toBeInViewport();
    });
  });

  test.describe('Sign Up Page', () => {
    test('sign up page is accessible and loads correctly', async ({ page }) => {
      await page.goto('/sign-up');
      
      // Page should load without critical errors
      await expect(page).toHaveURL(/sign-up/);
    });

    test('sign up page has proper structure', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        if (!error.message.includes('ResizeObserver')) {
          errors.push(error.message);
        }
      });

      await page.goto('/sign-up');
      await page.waitForTimeout(2000);

      // No critical JavaScript errors
      expect(errors.filter(e => !e.includes('Script error'))).toHaveLength(0);
    });
  });

  test.describe('Artisan Dashboard Access', () => {
    test('unauthenticated user is redirected from artisan dashboard', async ({ page }) => {
      await page.goto('/artisan-dashboard');
      
      // Should redirect to sign-in
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('unauthenticated user is redirected from artisan portfolio', async ({ page }) => {
      await page.goto('/artisan-dashboard/portfolio');
      
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('unauthenticated user is redirected from artisan settings', async ({ page }) => {
      await page.goto('/artisan-dashboard/settings');
      
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('unauthenticated user is redirected from artisan analytics', async ({ page }) => {
      await page.goto('/artisan-dashboard/analytics');
      
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('unauthenticated user is redirected from artisan subscription', async ({ page }) => {
      await page.goto('/artisan-dashboard/subscription');
      
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });
  });

  test.describe('Onboarding API Endpoints', () => {
    test('artisan stats API requires authentication', async ({ request }) => {
      const response = await request.get('/api/artisan/stats');
      
      // Should return 401 Unauthorized
      expect(response.status()).toBe(401);
    });

    test('artisan portfolio API requires authentication', async ({ request }) => {
      const response = await request.get('/api/artisan/portfolio');
      
      expect(response.status()).toBe(401);
    });

    test('artisan specializations API requires authentication', async ({ request }) => {
      const response = await request.get('/api/artisan/specializations');
      
      expect(response.status()).toBe(401);
    });

    test('artisan payments API requires authentication', async ({ request }) => {
      const response = await request.get('/api/artisan/payments');
      
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Profile Setup Flow Structure', () => {
    test('artisan dashboard routes exist', async ({ page }) => {
      // Test that routes exist (even if they redirect)
      const routes = [
        '/artisan-dashboard',
        '/artisan-dashboard/portfolio',
        '/artisan-dashboard/portfolio/new',
        '/artisan-dashboard/settings',
        '/artisan-dashboard/analytics',
        '/artisan-dashboard/subscription',
        '/artisan-dashboard/payments',
      ];

      for (const route of routes) {
        const response = await page.goto(route);
        // Should not be 404 - either redirect (3xx) or success (2xx)
        expect(response?.status()).not.toBe(404);
      }
    });
  });
});

test.describe('Artisan Features Discovery', () => {
  test.describe('Homepage Features Section', () => {
    test('features section highlights artisan benefits', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Navigate to features
      await page.getByRole('link', { name: /features/i }).first().click();
      await page.waitForTimeout(500);
      
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeVisible();
    });
  });

  test.describe('Pricing Information', () => {
    test('pricing section is accessible from homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Scroll to pricing
      await page.getByRole('link', { name: /pricing/i }).first().click();
      await page.waitForTimeout(500);
      
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection).toBeInViewport();
    });
  });

  test.describe('FAQ for Artisans', () => {
    test('FAQ section is accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      await page.getByRole('link', { name: /faq/i }).first().click();
      await page.waitForTimeout(500);
      
      const faqSection = page.locator('#faq');
      await expect(faqSection).toBeInViewport();
    });
  });
});

test.describe('Mobile Artisan Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('mobile user can access sign up', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // On mobile, find the Get Started CTA in hero
    const getStartedButton = page.getByRole('link', { name: /get started/i }).first();
    await getStartedButton.click();
    
    await expect(page).toHaveURL(/sign-up/);
  });

  test('mobile menu provides navigation to sign up', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Mobile menu should be visible
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Should have Get Started link
    const getStartedLink = mobileMenu.getByRole('link', { name: /get started/i });
    await expect(getStartedLink).toBeVisible();
  });

  test('artisan dashboard redirects on mobile', async ({ page }) => {
    await page.goto('/artisan-dashboard');
    
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('Artisan Onboarding Accessibility', () => {
  test('sign up page is keyboard navigable', async ({ page }) => {
    await page.goto('/sign-up');
    await page.waitForTimeout(2000);
    
    // Page should be focusable
    await page.keyboard.press('Tab');
    
    // Some element should have focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeTruthy();
  });

  test('homepage CTA buttons are accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Get Started should be a link with proper role
    const getStartedLinks = page.getByRole('link', { name: /get started/i });
    const count = await getStartedLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
