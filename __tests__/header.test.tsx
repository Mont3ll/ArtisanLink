import { render, screen } from '@testing-library/react'
import Header from '../components/landing/header'

describe('Header', () => {
  it('renders brand and primary links', () => {
    render(<Header />)

    expect(screen.getByText(/ArtisanLink/i)).toBeInTheDocument()
    expect(screen.getByText(/Features/i)).toBeInTheDocument()
    expect(screen.getByText(/Pricing/i)).toBeInTheDocument()
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
  })
})
