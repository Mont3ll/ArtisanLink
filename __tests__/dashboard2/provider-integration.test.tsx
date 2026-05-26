/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import { DashboardRealDataProvider, useOptionalDashboardRealData } from '@/components/dashboard2/context/dashboard-real-data-context'

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'u1',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/avatar.jpg',
    },
  }),
}))

// Mock React Query hooks
vi.mock('@/lib/hooks/use-current-user', () => ({
  useCurrentUser: () => ({
    data: { user: { id: 'db1', role: 'ARTISAN' }, profile: { profileImage: null } },
    isLoading: false,
  }),
}))

vi.mock('@/lib/hooks/use-unread-messages', () => ({
  useUnreadMessages: () => ({ data: { total: 5 }, isLoading: false }),
}))

vi.mock('@/lib/hooks', () => ({
  useArtisanDashboard: () => ({
    data: {
      profile: { artisanStatus: 'PENDING', rejectionReason: null },
    },
  }),
}))

vi.mock('@/lib/hooks/use-artisan-jobs-adapter', () => ({
  useArtisanJobsAdapter: () => ({ jobs: [], isLoading: false, error: null }),
}))

vi.mock('@/lib/hooks/use-artisan-portfolio-adapter', () => ({
  useArtisanPortfolioAdapter: () => ({ projects: [], isLoading: false, error: null, total: 0, totalPages: 0 }),
}))

vi.mock('@/lib/hooks/use-artisan-earnings-adapter', () => ({
  useArtisanEarningsAdapter: () => ({ earningRows: [], isLoading: false, error: null, totalEarned: 0, totalCommission: 0, pendingPayout: 0 }),
}))

vi.mock('@/lib/hooks/use-artisan-settings-adapter', () => ({
  useArtisanSettingsAdapter: () => ({ profile: null, specializations: [], categories: [], completionPct: 50, isLoading: false, counties: [] }),
}))

vi.mock('@/lib/hooks/use-conversations-adapter', () => ({
  useConversationsAdapter: () => ({ threads: [], isLoading: false, error: null, unreadCount: 0 }),
}))

vi.mock('@/lib/hooks/use-admin-data-adapter', () => ({
  useAdminDataAdapter: () => ({
    verificationQueue: [],
    adminArtisans: [],
    users: [],
    stats: null,
    isLoading: false,
  }),
}))

function TestConsumer() {
  const ctx = useOptionalDashboardRealData()
  if (!ctx) return <div data-testid="no-ctx">no context</div>
  return (
    <div>
      <span data-testid="name">{ctx.displayName}</span>
      <span data-testid="unread">{ctx.unreadCount}</span>
      <span data-testid="verification">{ctx.verificationStatus}</span>
      <span data-testid="loading">{ctx.isLoading ? 'loading' : 'ready'}</span>
    </div>
  )
}

describe('DashboardRealDataProvider integration', () => {
  it('renders children without error', () => {
    render(
      <DashboardRealDataProvider role="artisan">
        <div data-testid="child">content</div>
      </DashboardRealDataProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides displayName to consumers', () => {
    render(
      <DashboardRealDataProvider role="artisan">
        <TestConsumer />
      </DashboardRealDataProvider>
    )
    expect(screen.getByTestId('name')).toHaveTextContent('Test User')
  })

  it('provides unread count to consumers', () => {
    render(
      <DashboardRealDataProvider role="artisan">
        <TestConsumer />
      </DashboardRealDataProvider>
    )
    expect(screen.getByTestId('unread')).toHaveTextContent('5')
  })

  it('provides verification status for artisan role', () => {
    render(
      <DashboardRealDataProvider role="artisan">
        <TestConsumer />
      </DashboardRealDataProvider>
    )
    expect(screen.getByTestId('verification')).toHaveTextContent('PENDING')
  })

  it('returns null from useOptionalDashboardRealData when called outside provider', () => {
    render(<TestConsumer />)
    expect(screen.getByTestId('no-ctx')).toBeInTheDocument()
  })

  it('does not throw when wrapped with client role', () => {
    expect(() =>
      render(
        <DashboardRealDataProvider role="client">
          <div data-testid="client-child">ok</div>
        </DashboardRealDataProvider>
      )
    ).not.toThrow()
    expect(screen.getByTestId('client-child')).toBeInTheDocument()
  })

  it('does not throw when wrapped with admin role', () => {
    expect(() =>
      render(
        <DashboardRealDataProvider role="admin">
          <div data-testid="admin-child">ok</div>
        </DashboardRealDataProvider>
      )
    ).not.toThrow()
    expect(screen.getByTestId('admin-child')).toBeInTheDocument()
  })
})
