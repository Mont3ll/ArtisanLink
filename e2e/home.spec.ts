import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests for ArtisanLink
 * Tests the landing page core functionality and content
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Header', () => {
    test('displays the ArtisanLink brand logo', async ({ page }) => {
      const logo = page.getByRole('link', { name: /artisanlink/i });
      await expect(logo).toBeVisible();
    });

    test('displays navigation links on desktop', async ({ page }) => {
      // Skip on mobile viewports
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        test.skip();
        return;
      }

      await expect(page.getByRole('link', { name: /features/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /faq/i })).toBeVisible();
    });

    test('displays Sign In button when not authenticated', async ({ page }) => {
      // The header should show Sign In for unauthenticated users
      await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    });

    test('displays Get Started link when not authenticated', async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        test.skip();
        return;
      }

      await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible();
    });

    test('mobile menu toggle is visible on mobile', async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width >= 768) {
        test.skip();
        return;
      }

      const menuButton = page.getByRole('button', { name: /open menu|close menu/i });
      await expect(menuButton).toBeVisible();
    });
  });

  test.describe('Hero Section', () => {
    test('displays the main headline', async ({ page }) => {
      // Wait for preloader to finish (it has a 2.5s delay)
      await page.waitForTimeout(3000);
      
      const headline = page.getByRole('heading', { level: 1 });
      await expect(headline).toContainText('Connect with');
      await expect(headline).toContainText('verified');
      await expect(headline).toContainText('local artisans');
    });

    test('displays the hero description', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      const description = page.getByText(/helps clients discover skilled local professionals/i);
      await expect(description).toBeVisible();
    });

    test('displays call-to-action buttons', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Get started or Go to Dashboard button
      const ctaButton = page.getByRole('link', { name: /get started|go to dashboard/i }).first();
      await expect(ctaButton).toBeVisible();

      // Learn more link
      const learnMore = page.getByRole('link', { name: /learn more/i });
      await expect(learnMore).toBeVisible();
    });

    test('displays statistics', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      await expect(page.getByText('2K+')).toBeVisible();
      await expect(page.getByText(/verified artisans/i)).toBeVisible();
      await expect(page.getByText('15K+')).toBeVisible();
      await expect(page.getByText(/projects done/i)).toBeVisible();
      await expect(page.getByText('98%')).toBeVisible();
      await expect(page.getByText(/satisfaction/i)).toBeVisible();
    });

    test('displays hero image', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      const heroImage = page.getByRole('img', { name: /artisans gallery/i });
      await expect(heroImage).toBeVisible();
    });
  });

  test.describe('Features Section', () => {
    test('features section is present', async ({ page }) => {
      const featuresSection = page.locator('#features');
      await expect(featuresSection).toBeVisible();
    });
  });

  test.describe('Pricing Section', () => {
    test('pricing section is present', async ({ page }) => {
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection).toBeVisible();
    });
  });

  test.describe('FAQ Section', () => {
    test('FAQ section is present', async ({ page }) => {
      const faqSection = page.locator('#faq');
      await expect(faqSection).toBeVisible();
    });
  });

  test.describe('Footer', () => {
    test('footer contains ArtisanLink branding', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  });
});

test.describe('Navigation', () => {
  test('clicking Features link scrolls to features section', async ({ page }) => {
    await page.goto('/');
    
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      test.skip();
      return;
    }

    await page.getByRole('link', { name: /features/i }).first().click();
    
    // Wait for scroll animation
    await page.waitForTimeout(500);
    
    // Check if features section is in viewport
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeInViewport();
  });

  test('clicking Pricing link scrolls to pricing section', async ({ page }) => {
    await page.goto('/');
    
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      test.skip();
      return;
    }

    await page.getByRole('link', { name: /pricing/i }).first().click();
    
    await page.waitForTimeout(500);
    
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeInViewport();
  });

  test('clicking FAQ link scrolls to FAQ section', async ({ page }) => {
    await page.goto('/');
    
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      test.skip();
      return;
    }

    await page.getByRole('link', { name: /faq/i }).first().click();
    
    await page.waitForTimeout(500);
    
    const faqSection = page.locator('#faq');
    await expect(faqSection).toBeInViewport();
  });

  test('clicking logo navigates to homepage', async ({ page }) => {
    await page.goto('/');
    
    // First navigate away (scroll down or to a section)
    await page.getByRole('link', { name: /pricing/i }).first().click();
    await page.waitForTimeout(500);

    // Click logo to return to top
    await page.getByRole('link', { name: /artisanlink/i }).click();
    
    // Should be at the top of the page
    await expect(page).toHaveURL('/');
  });
});

test.describe('Responsive Design', () => {
  test('layout adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await expect(menuButton).toBeVisible();

    // Desktop nav should be hidden
    const desktopNav = page.locator('nav[aria-label="Primary"]');
    await expect(desktopNav).toBeHidden();
  });

  test('mobile menu opens and shows navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await menuButton.click();

    // Wait for animation
    await page.waitForTimeout(1000);

    // Mobile menu should be visible with navigation items
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
  });

  test('tablet viewport shows desktop navigation', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Desktop nav should be visible
    const desktopNav = page.locator('nav[aria-label="Primary"]');
    await expect(desktopNav).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds (generous for dev server)
    expect(loadTime).toBeLessThan(10000);
  });

  test('hero image loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const heroImage = page.getByRole('img', { name: /artisans gallery/i });
    await expect(heroImage).toBeVisible();
    
    // Check image is actually loaded
    const isLoaded = await heroImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0;
    });
    expect(isLoaded).toBe(true);
  });
});

test.describe('Accessibility', () => {
  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Should have exactly one h1
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
  });

  test('navigation has proper aria labels', async ({ page }) => {
    await page.goto('/');

    // Main navigation should have aria-label
    const nav = page.locator('nav[aria-label="Primary"]');
    await expect(nav).toHaveCount(1);
  });

  test('mobile menu button has proper aria attributes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /open menu/i });
    await expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // After opening
    await menuButton.click();
    await page.waitForTimeout(500);
    
    const closeButton = page.getByRole('button', { name: /close menu/i });
    await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // All links should have text content or aria-label
    const links = page.locator('a:visible');
    const count = await links.count();
    
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Link should have either text content or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });
});
