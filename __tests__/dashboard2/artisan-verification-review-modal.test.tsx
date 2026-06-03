import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ArtisanVerificationReviewModal } from '@/components/dashboard2/admin/artisan-verification-review-modal'

global.URL.createObjectURL = vi.fn(() => 'blob:test')
global.URL.revokeObjectURL = vi.fn()
global.open = vi.fn()

const defaultProps = {
  artisanId: 'artisan-123',
  artisanName: 'Grace Wanjiku',
  profession: 'Carpenter',
  county: 'Nairobi',
  documents: ['National ID', 'Certificate'],
  idDocumentUrl: 'https://res.cloudinary.com/test/id.png',
  certificateUrl: 'https://res.cloudinary.com/test/cert.avif',
  portfolioImageUrls: [
    'https://res.cloudinary.com/test/portfolio-1.jpg',
    'https://res.cloudinary.com/test/portfolio-2.jpg',
  ],
  onClose: vi.fn(),
}

describe('ArtisanVerificationReviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })))
  })

  it('renders artisan name and profession', () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Grace Wanjiku' })).toBeInTheDocument()
    expect(screen.getByText(/Carpenter/)).toBeInTheDocument()
    expect(screen.getByText(/Nairobi/)).toBeInTheDocument()
  })

  it('shows document tabs for each submitted document type', () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    expect(screen.getAllByText('National ID').length).toBeGreaterThan(0)
    expect(screen.getByText('Trade certificate')).toBeInTheDocument()
    expect(screen.getByText('Portfolio evidence')).toBeInTheDocument()
  })

  it('switches active document on click and shows real cert image', async () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    await userEvent.click(screen.getByText('Trade certificate'))
    // When a real certificate URL is provided, the image renders — not the previewTitle text
    const certImg = screen.getByAltText('Trade certificate document preview')
    expect(certImg).toBeInTheDocument()
    expect(certImg).toHaveAttribute('src', expect.stringContaining('cert.avif'))
  })

  it('"Open original" opens the real document URL when provided', async () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /Open original/ }))
    expect(window.open).toHaveBeenCalledWith(
      'https://res.cloudinary.com/test/id.png',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('shows real ID document as an image when idDocumentUrl is provided', () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    const img = screen.getByAltText('National ID document preview')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('id.png'))
  })

  it('"Open file" falls back to blob URL when no document URL is on file', async () => {
    // Render with no real document URLs
    render(<ArtisanVerificationReviewModal {...defaultProps} idDocumentUrl={null} certificateUrl={null} />)
    await userEvent.click(screen.getByRole('button', { name: /Open/ }))
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith('blob:test', '_blank', 'noopener,noreferrer')
  })

  it('disables the Approve CTA until all checklist items are checked', async () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Approve and verify' })).toBeDisabled()

    for (const label of ['Document is legible', 'Name matches profile', 'Document is not expired', 'Document appears authentic', 'No visible tampering']) {
      await userEvent.click(screen.getByLabelText(label))
    }
    await userEvent.type(screen.getByPlaceholderText(/Add audit note/), 'All documents verified and clear.')

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Approve and verify' })).not.toBeDisabled(),
    )
  })

  it('calls /api/admin/verification/process with APPROVE when approved', async () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)

    for (const label of ['Document is legible', 'Name matches profile', 'Document is not expired', 'Document appears authentic', 'No visible tampering']) {
      await userEvent.click(screen.getByLabelText(label))
    }
    await userEvent.type(screen.getByPlaceholderText(/Add audit note/), 'Verified.')
    await userEvent.click(screen.getByRole('button', { name: 'Approve and verify' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/admin/verification/process', expect.objectContaining({ method: 'POST' })))
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string)
    expect(body.action).toBe('APPROVE')
    expect(body.artisanId).toBe('artisan-123')
    expect(screen.getByText('Decision submitted')).toBeInTheDocument()
  })

  it('calls /api/admin/verification/process with REJECT when rejected', async () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }))
    await userEvent.type(screen.getByPlaceholderText(/Add audit note/), 'Documents unclear.')
    await userEvent.click(screen.getByRole('button', { name: 'Reject submission' }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string)
    expect(body.action).toBe('REJECT')
  })

  it('calls onClose when X is clicked', async () => {
    const onClose = vi.fn()
    render(<ArtisanVerificationReviewModal {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Close review' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows real portfolio images as the portfolio evidence tab', async () => {
    render(<ArtisanVerificationReviewModal {...defaultProps} />)
    await userEvent.click(screen.getByText('Portfolio evidence'))
    const imgs = screen.getAllByAltText(/Portfolio/)
    expect(imgs.length).toBeGreaterThan(0)
    expect(imgs[0]).toHaveAttribute('src', expect.stringContaining('portfolio-1.jpg'))
  })
})
