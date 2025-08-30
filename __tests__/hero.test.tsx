import { render, screen } from '@testing-library/react'
import Features from '../components/landing/features'

describe('Features', () => {
  it('renders feature cards', () => {
    render(<Features />)

    expect(screen.getByText(/Localized discovery/i)).toBeInTheDocument()
    expect(screen.getByText(/M-Pesa subscriptions/i)).toBeInTheDocument()
  })
})
