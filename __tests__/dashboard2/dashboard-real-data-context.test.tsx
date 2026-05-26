import { renderHook, render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import React from 'react'

// ─── mocks ────────────────────────────────────────────────────────────────────

vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    isLoaded: true,
    user: {
      id: 'clerk-123',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      imageUrl: 'https://example.com/avatar.jpg',
    },
  })),
}))

vi.mock('@/lib/hooks/use-current-user', () => ({
  useCurrentUser: vi.fn(() => ({
    data: {
      clerkUserId: 'clerk-123',
      user: { id: 'db-456', role: 'ARTISAN', status: 'ACTIVE', email: 'g@w.com', phone: null, firstName: 'Grace', lastName: 'Wanjiku' },
      profile: { id: 'p-1', profileImage: null, bio: null, profession: 'Carpenter', experience: null, hourlyRate: null, isAvailable: true, city: null, county: null, address: null },
    },
    isLoading: false,
  })),
}))

vi.mock('@/lib/hooks/use-unread-messages', () => ({
  useUnreadMessages: vi.fn(() => ({
    data: { total: 3, byConversation: [] },
    isLoading: false,
  })),
}))

vi.mock('@/lib/hooks', () => ({
  useArtisanDashboard: vi.fn(() => ({
    data: {
      stats: {},
      recentActivity: [],
      profile: { artisanStatus: 'PENDING', rejectionReason: null },
      user: null,
    },
  })),
}))

// Import after mocks
import {
  DashboardRealDataProvider,
  useDashboardRealData,
  type DashboardRole,
} from '@/components/dashboard2/context/dashboard-real-data-context'

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeWrapper(role: DashboardRole) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <DashboardRealDataProvider role={role}>
        {children}
      </DashboardRealDataProvider>
    )
  }
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('DashboardRealDataProvider', () => {
  it('renders children without crashing', () => {
    render(
      <DashboardRealDataProvider role="artisan">
        <div data-testid="child">content</div>
      </DashboardRealDataProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})

describe('useDashboardRealData', () => {
  it('throws when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useDashboardRealData())).toThrow(
      'useDashboardRealData must be used inside DashboardRealDataProvider',
    )
    consoleSpy.mockRestore()
  })

  it('returns displayName constructed from Clerk firstName + lastName', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    expect(result.current.displayName).toBe('Grace Wanjiku')
  })

  it('returns firstName from Clerk user', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    expect(result.current.firstName).toBe('Grace')
  })

  it('returns DB role from useCurrentUser', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    expect(result.current.role).toBe('ARTISAN')
  })

  it('returns unreadCount from useUnreadMessages', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    expect(result.current.unreadCount).toBe(3)
  })

  it('returns verificationStatus for artisan role', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    expect(result.current.verificationStatus).toBe('PENDING')
  })

  it('returns null verificationStatus for non-artisan role', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('client'),
    })
    expect(result.current.verificationStatus).toBeNull()
  })

  it('returns null verificationStatus for admin role', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('admin'),
    })
    expect(result.current.verificationStatus).toBeNull()
  })

  it('returns isLoading=true when Clerk is not loaded', async () => {
    const { useUser } = await import('@clerk/nextjs')
    vi.mocked(useUser).mockReturnValueOnce({
      isLoaded: false,
      user: null,
      isSignedIn: false,
    } as unknown as ReturnType<typeof useUser>)

    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.displayName).toBeNull()
  })

  it('returns avatarUrl from Clerk imageUrl', () => {
    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    expect(result.current.avatarUrl).toBe('https://example.com/avatar.jpg')
  })

  it('falls back to DB profileImage when Clerk imageUrl is absent', async () => {
    const { useUser } = await import('@clerk/nextjs')
    vi.mocked(useUser).mockReturnValueOnce({
      isLoaded: true,
      isSignedIn: true,
      user: {
        id: 'clerk-123',
        firstName: 'Grace',
        lastName: 'Wanjiku',
        imageUrl: '',
      },
    } as ReturnType<typeof useUser>)

    const { useCurrentUser } = await import('@/lib/hooks/use-current-user')
    vi.mocked(useCurrentUser).mockReturnValueOnce({
      data: {
        clerkUserId: 'clerk-123',
        user: { id: 'db-456', role: 'ARTISAN', status: 'ACTIVE', email: 'g@w.com', phone: null, firstName: 'Grace', lastName: 'Wanjiku' },
        profile: { id: 'p-1', profileImage: 'https://cdn.example.com/photo.jpg', bio: null, profession: null, experience: null, hourlyRate: null, isAvailable: true, city: null, county: null, address: null },
      },
      isLoading: false,
    } as ReturnType<typeof useCurrentUser>)

    const { result } = renderHook(() => useDashboardRealData(), {
      wrapper: makeWrapper('artisan'),
    })
    // Clerk imageUrl is empty string (falsy), so falls back to DB profileImage
    expect(result.current.avatarUrl).toBe('https://cdn.example.com/photo.jpg')
  })
})
