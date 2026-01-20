import { render, screen } from '@testing-library/react'
import Header from '../components/landing/header'

describe('Header', () => {
  it('renders brand and primary links', () => {
    render(<Header />)

    // Brand logo link (using aria-label to get the specific element)
    expect(screen.getByLabelText('Home')).toHaveTextContent(/ArtisanLink/i)
    
    // Navigation links (multiple exist due to mobile menu, check at least one)
    expect(screen.getAllByText(/Features/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pricing/i).length).toBeGreaterThan(0)
    
    // Sign In button (when not signed in, Dashboard is not shown)
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0)
  })
})
