/**
 * Test Utilities for ChapaWorks
 * 
 * This file provides common test wrappers and utilities for component testing.
 * Import these utilities in your tests instead of directly from @testing-library/react.
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { vi } from 'vitest'

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

/**
 * Mock user data for testing authenticated states
 */
export const mockUser = {
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'CLIENT' as const,
  imageUrl: 'https://example.com/avatar.png',
}

export const mockArtisanUser = {
  ...mockUser,
  id: 'user_artisan123',
  role: 'ARTISAN' as const,
  firstName: 'Artisan',
  lastName: 'Test',
  email: 'artisan@example.com',
}

export const mockAdminUser = {
  ...mockUser,
  id: 'user_admin123',
  role: 'ADMIN' as const,
  firstName: 'Admin',
  lastName: 'Test',
  email: 'admin@example.com',
}

/**
 * Mock Clerk auth state
 */
export const mockAuthState = {
  signedOut: {
    isSignedIn: false,
    isLoaded: true,
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: vi.fn(() => false),
    signOut: vi.fn(),
    getToken: vi.fn(),
  },
  signedIn: {
    isSignedIn: true,
    isLoaded: true,
    userId: mockUser.id,
    sessionId: 'sess_test123',
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: vi.fn(() => true),
    signOut: vi.fn(),
    getToken: vi.fn(() => Promise.resolve('mock-token')),
  },
  loading: {
    isSignedIn: false,
    isLoaded: false,
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: vi.fn(() => false),
    signOut: vi.fn(),
    getToken: vi.fn(),
  },
}

/**
 * Mock router for Next.js navigation testing
 */
export const createMockRouter = (overrides = {}) => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  ...overrides,
})

/**
 * Mock pathname for testing route-specific behavior
 */
export const mockPathname = (pathname: string) => {
  const { usePathname } = require('next/navigation')
  usePathname.mockReturnValue(pathname)
}

/**
 * Mock search params for testing query parameters
 */
export const mockSearchParams = (params: Record<string, string>) => {
  const { useSearchParams } = require('next/navigation')
  useSearchParams.mockReturnValue(new URLSearchParams(params))
}

/**
 * Setup Clerk mock with specific auth state
 */
export const setupClerkMock = (
  state: 'signedIn' | 'signedOut' | 'loading' = 'signedOut',
  user = mockUser
) => {
  const { useAuth, useUser } = require('@clerk/nextjs')
  
  useAuth.mockReturnValue(mockAuthState[state])
  
  if (state === 'signedIn') {
    useUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: [{ emailAddress: user.email }],
        imageUrl: user.imageUrl,
        publicMetadata: { role: user.role },
      },
    })
  } else if (state === 'loading') {
    useUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      user: null,
    })
  } else {
    useUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    })
  }
}

/**
 * All providers wrapper for testing
 * Add any providers your app needs here
 */
interface AllProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  return <>{children}</>
}

/**
 * Custom render function that wraps components with all providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Override the render export
export { customRender as render }

/**
 * Helper to wait for async operations in tests
 */
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

/**
 * Create a mock API response
 */
export const createMockResponse = <T,>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
})

/**
 * Mock fetch for API testing
 */
export const mockFetch = (responses: Record<string, unknown>) => {
  global.fetch = vi.fn((url: string) => {
    const response = responses[url]
    if (response) {
      return Promise.resolve(createMockResponse(response))
    }
    return Promise.resolve(createMockResponse({ error: 'Not found' }, 404))
  }) as unknown as typeof fetch
}

/**
 * Reset all mocks between tests
 */
export const resetMocks = () => {
  vi.clearAllMocks()
  setupClerkMock('signedOut')
}

/**
 * Mock window.location for navigation tests
 */
export const mockWindowLocation = (url: string) => {
  const location = new URL(url)
  Object.defineProperty(window, 'location', {
    value: {
      href: location.href,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      origin: location.origin,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  })
}

/**
 * Create a mock Prisma client for testing
 * Use this for unit testing API routes
 */
export const createMockPrisma = () => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  profile: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
  review: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
  conversation: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  message: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  activityLog: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  portfolioItem: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  specialization: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  setting: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(createMockPrisma())),
})
