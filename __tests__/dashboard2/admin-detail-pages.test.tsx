import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminDetailPage } from '@/components/dashboard2/admin/admin-detail-pages'

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'artisan-db-123' }),
}))

const mockArtisan = {
  id: 'artisan-db-123',
  name: 'Grace Wanjiku',
  email: 'grace@test.com',
  profession: 'Carpenter',
  location: { city: 'Nairobi', county: 'Nairobi' },
  isAvailable: true,
  verificationStatus: 'VERIFIED',
  rating: { average: 4.9, total: 12 },
  portfolioCount: 3,
  documents: ['National ID', 'Certificate'],
  isPremium: false,
  memberSince: '2026-01-01T00:00:00.000Z',
}

const mockPortfolio = {
  artisan: { id: 'artisan-db-123', name: 'Grace Wanjiku', profileId: 'profile-1' },
  portfolio: [
    { id: 'p1', title: 'Walnut table', description: 'Joinery', category: 'Furniture', isPublic: true, images: ['https://cdn.test/table.jpg'] },
    { id: 'p2', title: 'Oak shelf', description: 'Shelving', category: 'Storage', isPublic: true, images: ['https://cdn.test/shelf.jpg'] },
  ],
}

function setupFetch({ artisanOk = true, patchOk = true } = {}) {
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    if (url.includes('/portfolio')) {
      return new Response(JSON.stringify(mockPortfolio), { status: 200 })
    }
    if (init?.method === 'PATCH') {
      if (!patchOk) return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500 })
      return new Response(JSON.stringify({ profile: { id: 'profile-1', isAvailable: false, artisanStatus: 'VERIFIED' } }), { status: 200 })
    }
    // GET artisan detail
    if (!artisanOk) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    return new Response(JSON.stringify({ artisan: mockArtisan }), { status: 200 })
  }))
}

describe('AdminDetailPage (artisan kind)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupFetch()
  })

  it('fetches and shows real artisan name, profession and status', async () => {
    render(<AdminDetailPage kind="artisan" />)

    await waitFor(() => expect(screen.getAllByText('Grace Wanjiku').length).toBeGreaterThan(0))
    expect(screen.getByText(/Carpenter/)).toBeInTheDocument()
    expect(screen.getByText(/grace@test\.com/)).toBeInTheDocument()
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/admin/artisans/artisan-db-123'))
  })

  it('shows portfolio thumbnails from real API', async () => {
    render(<AdminDetailPage kind="artisan" />)
    await waitFor(() => expect(screen.getByAltText('Walnut table')).toBeInTheDocument())
    expect(screen.getByAltText('Oak shelf')).toBeInTheDocument()
  })

  it('"Review verification" opens the ArtisanVerificationReviewModal inline (no navigation)', async () => {
    render(<AdminDetailPage kind="artisan" />)
    await waitFor(() => expect(screen.getAllByText('Grace Wanjiku').length).toBeGreaterThan(0))

    await userEvent.click(screen.getByRole('button', { name: 'Review verification' }))

    expect(screen.getByRole('dialog', { name: /Verification review for Grace Wanjiku/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve and verify' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })

  it('closing the verification modal logs an audit event', async () => {
    render(<AdminDetailPage kind="artisan" />)
    await waitFor(() => expect(screen.getAllByText('Grace Wanjiku').length).toBeGreaterThan(0))

    await userEvent.click(screen.getByRole('button', { name: 'Review verification' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close review' }))

    expect(screen.queryByRole('dialog', { name: /Verification review/i })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByText(/Verification review workspace closed/i).length).toBeGreaterThan(0))
  })

  it('"Update visibility" calls PATCH API and updates the page status', async () => {
    render(<AdminDetailPage kind="artisan" />)
    await waitFor(() => expect(screen.getAllByText('Grace Wanjiku').length).toBeGreaterThan(0))

    await userEvent.click(screen.getByRole('button', { name: 'Update visibility' }))
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Unavailable')
    await userEvent.type(screen.getByPlaceholderText(/Add context for the audit timeline/), 'Artisan on leave.')
    await userEvent.click(screen.getByRole('button', { name: 'Apply change' }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/artisans/artisan-db-123',
        expect.objectContaining({ method: 'PATCH' }),
      ),
    )
    const body = JSON.parse((vi.mocked(fetch).mock.calls.find(([, init]) => (init as RequestInit)?.method === 'PATCH')?.[1] as RequestInit)?.body as string)
    expect(body.isAvailable).toBe(false)
    await waitFor(() => expect(screen.getAllByText(/Availability set to Unavailable/).length).toBeGreaterThan(0))
  })

  it('"Inspect portfolio" action modal shows fetched portfolio images', async () => {
    render(<AdminDetailPage kind="artisan" />)
    await waitFor(() => expect(screen.getAllByText('Grace Wanjiku').length).toBeGreaterThan(0))

    await userEvent.click(screen.getByRole('button', { name: 'Inspect portfolio' }))

    await waitFor(() => expect(screen.getAllByAltText('Walnut table').length).toBeGreaterThan(0))
  })
})

describe('AdminDetailPage (non-artisan kind)', () => {
  it('renders without fetching artisan data for verification kind', () => {
    render(<AdminDetailPage kind="verification" />)
    expect(screen.getByText('Verification review')).toBeInTheDocument()
    expect(screen.queryByText('Review verification')).not.toBeInTheDocument()
  })
})
