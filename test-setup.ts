import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock next/image to render a plain <img> in tests (avoids jsdom canvas errors)
vi.mock('next/image', () => ({
  default: vi.fn().mockImplementation(
    ({ src, alt, fill: _fill, sizes: _sizes, priority: _priority, placeholder: _ph, blurDataURL: _blur, ...props }: {
      src: string; alt: string; fill?: boolean; sizes?: string; priority?: boolean;
      placeholder?: string; blurDataURL?: string; [key: string]: unknown
    }) => React.createElement('img', { src, alt, ...props })
  ),
}))

// Mock window.matchMedia for GSAP's ScrollTrigger and matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver for GSAP - must be a class
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock

// Mock IntersectionObserver - must be a class (used by Next.js Link)
class IntersectionObserverMock {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver

// Mock scrollTo
window.scrollTo = vi.fn()

// Mock getComputedStyle for GSAP
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = vi.fn().mockImplementation((element) => {
  return originalGetComputedStyle(element)
})

// Mock GSAP ScrollTrigger with all needed methods
vi.mock('gsap/ScrollTrigger', () => {
  const mockScrollTrigger = {
    register: vi.fn(),
    getAll: vi.fn(() => []),
    refresh: vi.fn(),
    update: vi.fn(),
    kill: vi.fn(),
    create: vi.fn(() => ({ kill: vi.fn() })),
    matchMedia: vi.fn(() => ({ 
      kill: vi.fn(), 
      add: vi.fn((conditions: string, callback: () => void) => {
        // Execute the callback immediately for testing
        if (callback) callback()
        return { kill: vi.fn() }
      }) 
    })),
    scrollerProxy: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    normalizeScroll: vi.fn(),
    config: vi.fn(),
    defaults: vi.fn(),
    batch: vi.fn(() => []),
    sort: vi.fn(),
    getById: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    saveStyles: vi.fn(),
    revert: vi.fn(),
    clearScrollMemory: vi.fn(),
    maxScroll: vi.fn(() => 0),
    isInViewport: vi.fn(() => true),
    positionInViewport: vi.fn(() => 0),
  }
  
  return {
    default: mockScrollTrigger,
    ScrollTrigger: mockScrollTrigger,
  }
})

// Mock GSAP core to prevent ScrollTrigger registration issues
vi.mock('gsap', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    default: {
      ...actual.default as object,
      registerPlugin: vi.fn(),
    },
    gsap: {
      ...(actual.gsap || actual.default) as object,
      registerPlugin: vi.fn(),
    },
  }
})

// Mock the animations module to prevent GSAP issues in tests
vi.mock('@/lib/animations', () => ({
  useStaggeredReveal: vi.fn(),
  useFadeInAnimation: vi.fn(),
  use3DCardEffect: vi.fn(),
  useShimmerEffect: vi.fn(),
  useGlowPulse: vi.fn(),
  useFloatingOrbs: vi.fn(),
  useParallax: vi.fn(),
  useSmoothScroll: vi.fn(),
  useTextReveal: vi.fn(),
  useCountUp: vi.fn(),
  useMagneticEffect: vi.fn(),
  useScrollProgress: vi.fn(() => ({ progress: 0 })),
}))

// Mock Clerk's hooks and components
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(() => ({
    isSignedIn: false,
    isLoaded: true,
    userId: null,
    sessionId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: vi.fn(),
    signOut: vi.fn(),
    getToken: vi.fn(),
  })),
  useUser: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  })),
  useClerk: vi.fn(() => ({
    loaded: true,
    client: null,
    session: null,
    user: null,
    signOut: vi.fn(),
    openSignIn: vi.fn(),
    openSignUp: vi.fn(),
    openUserProfile: vi.fn(),
    closeSignIn: vi.fn(),
    closeSignUp: vi.fn(),
    closeUserProfile: vi.fn(),
  })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => children,
  auth: vi.fn(() => ({ userId: null })),
  currentUser: vi.fn(() => null),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))
