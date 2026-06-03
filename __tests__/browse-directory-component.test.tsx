import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BrowseDirectorySection } from '@/components/landing/browse-directory'
import type { ArtisanCardData } from '@/components/landing/artisan-preview-card'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('verified=true'),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: false }),
}))

vi.mock('@/lib/hooks/use-artisan-search', () => ({
  useSavedArtisanIds: () => ({ data: new Set<string>() }),
  useToggleSaveArtisan: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('framer-motion', async () => {
  const React = await import('react')
  const stripMotionProps = <T extends Record<string, unknown>>(props: T) => {
    const rest = { ...props }
    for (const key of ['layout', 'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap']) {
      delete rest[key]
    }
    return rest
  }
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => <div {...stripMotionProps(props)}>{children}</div>,
      button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => <button {...stripMotionProps(props)}>{children}</button>,
    },
  }
})

const artisans: ArtisanCardData[] = [
  {
    id: 'verified-artisan',
    name: 'Verified Carpenter',
    profession: 'Carpenter',
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: 'Nairobi', county: 'Nairobi' },
    rating: { average: 4.9, total: 12 },
    hourlyRate: 1500,
    specializations: [{ name: 'Chairs' }],
    isVerified: true,
    isAvailable: true,
    isPremium: false,
  },
  {
    id: 'unverified-artisan',
    name: 'Pending Carpenter',
    profession: 'Carpenter',
    profileImage: null,
    portfolioThumbnail: null,
    location: { city: 'Nakuru', county: 'Nakuru' },
    rating: { average: 4.7, total: 9 },
    hourlyRate: 1200,
    specializations: [{ name: 'Shelves' }],
    isVerified: false,
    isAvailable: true,
    isPremium: false,
  },
]

describe('BrowseDirectorySection', () => {
  it('applies the verified URL filter to rendered results', () => {
    render(
      <BrowseDirectorySection
        initialArtisans={artisans}
        initialProfessions={[]}
        initialCounties={[]}
      />,
    )

    expect(screen.getByText('1 result found')).toBeInTheDocument()
    expect(screen.getByText('Verified Carpenter')).toBeInTheDocument()
    expect(screen.queryByText('Pending Carpenter')).not.toBeInTheDocument()
  })
})
