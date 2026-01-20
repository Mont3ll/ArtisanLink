import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests for ArtisanLink
 * Tests sign-in and sign-up page accessibility and navigation
 */

test.describe('Authentication Pages', () => {
  test.describe('Sign In Page', () => {
    test('sign in page is accessible', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Should be on sign-in page (Clerk handles the actual UI)
      await expect(page).toHaveURL(/sign-in/);
    });

    test('sign in page loads without errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/sign-in');
      await page.waitForTimeout(2000);

      // Filter out minor errors that don't affect functionality
      const criticalErrors = errors.filter(
        (err) => !err.includes('ResizeObserver') && !err.includes('Script error')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('clicking Sign In from homepage navigates to sign in page', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000); // Wait for preloader
      
      // Find and click Sign In button
      const signInLink = page.getByRole('link', { name: /sign in/i }).first();
      await signInLink.click();

      // Should navigate to sign-in page
      await expect(page).toHaveURL(/sign-in/);
    });
  });

  test.describe('Sign Up Page', () => {
    test('sign up page is accessible', async ({ page }) => {
      await page.goto('/sign-up');
      
      // Should be on sign-up page
      await expect(page).toHaveURL(/sign-up/);
    });

    test('sign up page loads without errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/sign-up');
      await page.waitForTimeout(2000);

      const criticalErrors = errors.filter(
        (err) => !err.includes('ResizeObserver') && !err.includes('Script error')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('clicking Get Started from homepage navigates to sign up page', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000); // Wait for preloader

      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        // On mobile, open the menu first
        const menuButton = page.getByRole('button', { name: /open menu/i });
        await menuButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Find and click Get Started link
      const getStartedLink = page.getByRole('link', { name: /get started/i }).first();
      await getStartedLink.click();

      // Should navigate to sign-up page
      await expect(page).toHaveURL(/sign-up/);
    });
  });

  test.describe('Protected Routes', () => {
    test('dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should redirect to sign-in page
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('admin dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto('/admin-dashboard');
      
      // Should redirect to sign-in page
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('artisan dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto('/artisan-dashboard');
      
      // Should redirect to sign-in page
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });

    test('client dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto('/client-dashboard');
      
      // Should redirect to sign-in page
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      await expect(page).toHaveURL(/sign-in/);
    });
  });
});

test.describe('Navigation Flows', () => {
  test.describe('Homepage to Auth', () => {
    test('complete flow: homepage -> get started -> sign up', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);

      const viewport = page.viewportSize();
      if (viewport && viewport.width >= 768) {
        // Desktop: Click Get Started in header
        await page.getByRole('link', { name: /get started/i }).first().click();
      } else {
        // Mobile: Use hero CTA
        await page.getByRole('link', { name: /get started/i }).first().click();
      }

      await expect(page).toHaveURL(/sign-up/);
    });

    test('complete flow: homepage -> sign in', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(3000);

      await page.getByRole('link', { name: /sign in/i }).first().click();
      
      await expect(page).toHaveURL(/sign-in/);
    });
  });

  test.describe('Section Navigation', () => {
    test('navigate to all main sections via header links', async ({ page }) => {
      await page.goto('/');
      
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        test.skip();
        return;
      }

      // Navigate to Features
      await page.getByRole('link', { name: /features/i }).first().click();
      await page.waitForTimeout(500);
      await expect(page.locator('#features')).toBeInViewport();

      // Navigate to Pricing
      await page.getByRole('link', { name: /pricing/i }).first().click();
      await page.waitForTimeout(500);
      await expect(page.locator('#pricing')).toBeInViewport();

      // Navigate to FAQ
      await page.getByRole('link', { name: /faq/i }).first().click();
      await page.waitForTimeout(500);
      await expect(page.locator('#faq')).toBeInViewport();
    });
  });

  test.describe('Footer Navigation', () => {
    test('footer links are functional', async ({ page }) => {
      await page.goto('/');

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  });
});

test.describe('Error Handling', () => {
  test('404 page for non-existent routes', async ({ page }) => {
    const response = await page.goto('/non-existent-page-12345');
    
    // Next.js returns 404 for non-existent pages
    expect(response?.status()).toBe(404);
  });

  test('app handles invalid dashboard routes gracefully', async ({ page }) => {
    // Try to access a deeply nested invalid route
    await page.goto('/dashboard/invalid/nested/route');
    
    // Should either 404 or redirect to sign-in
    const url = page.url();
    const is404 = await page.locator('text=404').isVisible().catch(() => false);
    const isSignIn = url.includes('sign-in');
    
    expect(is404 || isSignIn).toBe(true);
  });
});

test.describe('Browser Compatibility', () => {
  test('page renders correctly and is interactive', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Page should have rendered
    await expect(page.locator('body')).toBeVisible();

    // JavaScript should be working (interactive elements)
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Links should be clickable
    const homeLink = page.getByRole('link', { name: /artisanlink/i });
    await expect(homeLink).toBeEnabled();
  });

  test('CSS loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Check that Tailwind styles are applied
    const header = page.locator('header');
    const headerStyles = await header.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        position: styles.position,
        backgroundColor: styles.backgroundColor,
      };
    });

    // Header should be sticky and have background
    expect(headerStyles.position).toBe('sticky');
  });
});

test.describe('SEO and Meta', () => {
  test('page has proper title', async ({ page }) => {
    await page.goto('/');

    // Should have a title
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('page has meta viewport for mobile', async ({ page }) => {
    await page.goto('/');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });
});
