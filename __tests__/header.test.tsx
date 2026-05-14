import { render, screen } from '@testing-library/react'
import Header from '../components/landing/header'

describe('Header', () => {
  it('renders brand and primary links', () => {
    render(<Header />)

    // Brand logo link (using aria-label to get the specific element)
    expect(screen.getByLabelText('Home')).toHaveTextContent(/ChapaWorks/i)
    
    // Navigation links — page-based (multiple exist due to mobile menu)
    expect(screen.getAllByText(/Browse Artisans/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pricing/i).length).toBeGreaterThan(0)
    
    // Auth button (when not signed in)
    expect(screen.getAllByText(/Sign In|Get Started/i).length).toBeGreaterThan(0)
  })
})
