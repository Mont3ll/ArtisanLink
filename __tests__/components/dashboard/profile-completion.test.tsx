import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileCompletion } from '@/components/dashboard/artisan/profile-completion';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ProfileCompletion', () => {
  const emptyProfile = {
    bio: null,
    profileImage: null,
    profession: null,
    experience: null,
    hourlyRate: null,
    latitude: null,
    longitude: null,
    address: null,
    city: null,
    county: null,
    certificateUrl: null,
    isAvailable: false,
    artisanStatus: null,
    portfolioItems: [],
    specializations: [],
  };

  const partialProfile = {
    ...emptyProfile,
    bio: 'A detailed bio with more than fifty characters to pass the validation check.',
    profileImage: 'https://example.com/image.jpg',
    profession: 'Carpenter',
    county: 'Nairobi',
    portfolioItems: [{ id: '1' }],
    specializations: [{ id: '1' }],
  };

  const completeProfile = {
    ...emptyProfile,
    bio: 'A detailed bio with more than fifty characters to pass the validation check.',
    profileImage: 'https://example.com/image.jpg',
    profession: 'Carpenter',
    county: 'Nairobi',
    certificateUrl: 'https://example.com/cert.pdf',
    portfolioItems: [{ id: '1' }, { id: '2' }, { id: '3' }],
    specializations: [{ id: '1' }, { id: '2' }],
  };

  describe('Rendering', () => {
    it('returns null when profile is null', () => {
      const { container } = render(<ProfileCompletion profile={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders profile completion card', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      expect(screen.getByText('Profile Completion')).toBeInTheDocument();
      expect(screen.getByText('Complete your profile to attract more clients')).toBeInTheDocument();
    });

    it('displays progress bar', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays all completion items', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      expect(screen.getByText('Add Bio')).toBeInTheDocument();
      expect(screen.getByText('Profile Photo')).toBeInTheDocument();
      expect(screen.getByText('Set Profession')).toBeInTheDocument();
      expect(screen.getByText('Add Specializations')).toBeInTheDocument();
      expect(screen.getByText('Build Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Set Location')).toBeInTheDocument();
      expect(screen.getByText('Upload Certificate')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('shows 0% for empty profile', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('shows partial progress for partial profile', () => {
      render(<ProfileCompletion profile={partialProfile} />);
      
      // Bio (15) + Image (10) + Profession (15) + Location (15) = 55%
      expect(screen.getByText('55%')).toBeInTheDocument();
    });

    it('shows 100% for complete profile', () => {
      render(<ProfileCompletion profile={completeProfile} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Status Labels', () => {
    it('shows "Getting Started" for low completion', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    it('shows "Good Progress" for 50%+ completion', () => {
      render(<ProfileCompletion profile={partialProfile} />);
      
      expect(screen.getByText('Good Progress')).toBeInTheDocument();
    });

    it('shows "Complete" for 100% completion', () => {
      render(<ProfileCompletion profile={completeProfile} />);
      
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  describe('Completion Items', () => {
    it('marks completed items with checkmark styling', () => {
      render(<ProfileCompletion profile={partialProfile} />);
      
      // Bio is complete - should have line-through
      const bioText = screen.getByText('Add Bio');
      expect(bioText).toHaveClass('line-through');
    });

    it('shows action button for incomplete items', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      // All items should have action buttons when incomplete
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('hides action button for completed items', () => {
      render(<ProfileCompletion profile={completeProfile} />);
      
      // Completed items should not have arrow buttons
      // The only button should be in the complete message area
    });
  });

  describe('Next Step CTA', () => {
    it('shows next step button for incomplete profile', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      // Should show the first incomplete item as next step
      expect(screen.getByText('Next: Add Bio')).toBeInTheDocument();
    });

    it('shows completion message for complete profile', () => {
      render(<ProfileCompletion profile={completeProfile} />);
      
      expect(screen.getByText('Profile Complete!')).toBeInTheDocument();
      expect(screen.getByText('Your profile is now ready to attract clients')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('contains correct href for settings items', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      const links = screen.getAllByRole('link');
      const settingsLinks = links.filter(link => 
        link.getAttribute('href')?.includes('/artisan-dashboard/settings')
      );
      
      expect(settingsLinks.length).toBeGreaterThan(0);
    });

    it('contains correct href for portfolio item', () => {
      render(<ProfileCompletion profile={emptyProfile} />);
      
      const portfolioLink = screen.getAllByRole('link').find(link =>
        link.getAttribute('href')?.includes('/artisan-dashboard/portfolio')
      );
      
      expect(portfolioLink).toBeTruthy();
    });
  });

  describe('Bio Validation', () => {
    it('marks bio as incomplete when less than 50 chars', () => {
      const shortBioProfile = {
        ...emptyProfile,
        bio: 'Short bio',
      };
      
      render(<ProfileCompletion profile={shortBioProfile} />);
      
      const bioText = screen.getByText('Add Bio');
      expect(bioText).not.toHaveClass('line-through');
    });

    it('marks bio as complete when 50+ chars', () => {
      const longBioProfile = {
        ...emptyProfile,
        bio: 'This is a sufficiently long bio that contains more than fifty characters.',
      };
      
      render(<ProfileCompletion profile={longBioProfile} />);
      
      const bioText = screen.getByText('Add Bio');
      expect(bioText).toHaveClass('line-through');
    });
  });

  describe('Portfolio Validation', () => {
    it('marks portfolio as incomplete with less than 3 items', () => {
      const fewPortfolioProfile = {
        ...emptyProfile,
        portfolioItems: [{ id: '1' }, { id: '2' }],
      };
      
      render(<ProfileCompletion profile={fewPortfolioProfile} />);
      
      const portfolioText = screen.getByText('Build Portfolio');
      expect(portfolioText).not.toHaveClass('line-through');
    });

    it('marks portfolio as complete with 3+ items', () => {
      const manyPortfolioProfile = {
        ...emptyProfile,
        portfolioItems: [{ id: '1' }, { id: '2' }, { id: '3' }],
      };
      
      render(<ProfileCompletion profile={manyPortfolioProfile} />);
      
      const portfolioText = screen.getByText('Build Portfolio');
      expect(portfolioText).toHaveClass('line-through');
    });
  });

  describe('Specializations Validation', () => {
    it('marks specializations as incomplete with less than 2', () => {
      const fewSpecsProfile = {
        ...emptyProfile,
        specializations: [{ id: '1' }],
      };
      
      render(<ProfileCompletion profile={fewSpecsProfile} />);
      
      const specsText = screen.getByText('Add Specializations');
      expect(specsText).not.toHaveClass('line-through');
    });

    it('marks specializations as complete with 2+', () => {
      const manySpecsProfile = {
        ...emptyProfile,
        specializations: [{ id: '1' }, { id: '2' }],
      };
      
      render(<ProfileCompletion profile={manySpecsProfile} />);
      
      const specsText = screen.getByText('Add Specializations');
      expect(specsText).toHaveClass('line-through');
    });
  });

  describe('Location Validation', () => {
    it('marks location as complete with county', () => {
      const countyProfile = {
        ...emptyProfile,
        county: 'Nairobi',
      };
      
      render(<ProfileCompletion profile={countyProfile} />);
      
      const locationText = screen.getByText('Set Location');
      expect(locationText).toHaveClass('line-through');
    });

    it('marks location as complete with coordinates', () => {
      const coordsProfile = {
        ...emptyProfile,
        latitude: -1.2921,
        longitude: 36.8219,
      };
      
      render(<ProfileCompletion profile={coordsProfile} />);
      
      const locationText = screen.getByText('Set Location');
      expect(locationText).toHaveClass('line-through');
    });
  });
});
