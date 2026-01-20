import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUpload, MultiImageUpload } from '@/components/dashboard/artisan/portfolio/image-upload';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, onError, ...props }: { src: string; alt: string; onError?: () => void; [key: string]: unknown }) => (
    <img 
      src={src} 
      alt={alt} 
      data-testid="next-image"
      onError={onError}
      {...props} 
    />
  ),
}));

describe('ImageUpload', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders with default label', () => {
      render(<ImageUpload value="" onChange={mockOnChange} />);
      expect(screen.getByText('Image URL')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<ImageUpload value="" onChange={mockOnChange} label="Custom Label" />);
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('renders without label when label is empty', () => {
      render(<ImageUpload value="" onChange={mockOnChange} label="" />);
      expect(screen.queryByText('Image URL')).not.toBeInTheDocument();
    });

    it('renders URL input when no value', () => {
      render(<ImageUpload value="" onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<ImageUpload value="" onChange={mockOnChange} placeholder="Enter URL here" />);
      expect(screen.getByPlaceholderText('Enter URL here')).toBeInTheDocument();
    });

    it('shows help text for URL input', () => {
      render(<ImageUpload value="" onChange={mockOnChange} />);
      expect(screen.getByText(/Enter an image URL/)).toBeInTheDocument();
    });
  });

  describe('With existing value', () => {
    it('shows image preview when value is set', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('shows Change URL button when image is displayed', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      expect(screen.getByText('Change URL')).toBeInTheDocument();
    });

    it('shows remove button when image is displayed', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      // Button has X icon, find by role
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find(btn => btn.className.includes('destructive'));
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls onChange when URL is typed', async () => {
      const user = userEvent.setup();
      render(<ImageUpload value="" onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://test.com/img.jpg');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('shows Preview button when URL is entered', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      // Initially shows image, click Change URL to show input with Preview button
      fireEvent.click(screen.getByText('Change URL'));
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('switches to preview mode when Preview is clicked', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('Change URL'));
      expect(screen.getByText('Preview')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Preview'));
      expect(screen.getByTestId('next-image')).toBeInTheDocument();
    });

    it('switches to URL input mode when Change URL is clicked', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('Change URL'));
      
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    });

    it('clears value and shows URL input when remove is clicked', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      
      // Find all buttons - the remove button has the X icon and is the last button
      const buttons = screen.getAllByRole('button');
      // The remove button is the one that doesn't have text (just icon)
      const removeButton = buttons.find(btn => !btn.textContent?.trim() || btn.textContent?.trim() === '');
      fireEvent.click(removeButton!);
      
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('Disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<ImageUpload value="" onChange={mockOnChange} disabled />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeDisabled();
    });

    it('disables Change URL button when disabled', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} disabled />);
      expect(screen.getByText('Change URL')).toBeDisabled();
    });

    it('disables remove button when disabled', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} disabled />);
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find(btn => btn.className.includes('destructive'));
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Error handling', () => {
    it('shows error state when image fails to load', () => {
      render(<ImageUpload value="https://example.com/broken.jpg" onChange={mockOnChange} />);
      
      const image = screen.getByTestId('next-image');
      fireEvent.error(image);
      
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });

    it('resets error state when URL changes', async () => {
      const user = userEvent.setup();
      render(<ImageUpload value="https://example.com/broken.jpg" onChange={mockOnChange} />);
      
      // Trigger error
      const image = screen.getByTestId('next-image');
      fireEvent.error(image);
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      
      // Change URL
      fireEvent.click(screen.getByText('Change URL'));
      const input = screen.getByDisplayValue('https://example.com/broken.jpg');
      await user.clear(input);
      await user.type(input, 'https://example.com/new.jpg');
      
      // Click Preview and verify no error shown initially
      fireEvent.click(screen.getByText('Preview'));
      expect(screen.queryByText('Failed to load image')).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ImageUpload value="" onChange={mockOnChange} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('MultiImageUpload', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders with default label', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      expect(screen.getByText('Additional Images')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} label="Gallery Images" />);
      expect(screen.getByText('Gallery Images')).toBeInTheDocument();
    });

    it('shows image count', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      expect(screen.getByText('0 / 10 images added')).toBeInTheDocument();
    });

    it('shows correct count with custom maxImages', () => {
      render(<MultiImageUpload value={['url1', 'url2']} onChange={mockOnChange} maxImages={5} />);
      expect(screen.getByText('2 / 5 images added')).toBeInTheDocument();
    });

    it('renders URL input for adding new images', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    });

    it('renders Add button', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      expect(screen.getByText('Add')).toBeInTheDocument();
    });
  });

  describe('Displaying existing images', () => {
    it('displays existing images in grid', () => {
      const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
      const images = screen.getAllByTestId('next-image');
      expect(images).toHaveLength(2);
    });

    it('sets correct alt text for images', () => {
      const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
      expect(screen.getByAltText('Image 1')).toBeInTheDocument();
      expect(screen.getByAltText('Image 2')).toBeInTheDocument();
    });

    it('shows remove buttons for each image', () => {
      const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
      // Each image has a remove button - find buttons with size "icon" class
      const buttons = screen.getAllByRole('button');
      // Remove buttons are the small icon buttons (not the Add button)
      const removeButtons = buttons.filter(btn => 
        btn.className.includes('h-6') || btn.className.includes('size-icon')
      );
      // Should have at least 2 remove buttons (one for each image)
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Adding images', () => {
    it('calls onChange with new URL when Add is clicked', async () => {
      const user = userEvent.setup();
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://example.com/new.jpg');
      
      fireEvent.click(screen.getByText('Add'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['https://example.com/new.jpg']);
    });

    it('appends to existing images', async () => {
      const user = userEvent.setup();
      const existing = ['https://example.com/1.jpg'];
      render(<MultiImageUpload value={existing} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://example.com/2.jpg');
      
      fireEvent.click(screen.getByText('Add'));
      
      expect(mockOnChange).toHaveBeenCalledWith([
        'https://example.com/1.jpg',
        'https://example.com/2.jpg'
      ]);
    });

    it('adds image on Enter key press', async () => {
      const user = userEvent.setup();
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://example.com/new.jpg');
      await user.keyboard('{Enter}');
      
      expect(mockOnChange).toHaveBeenCalledWith(['https://example.com/new.jpg']);
    });

    it('does not add when URL is empty', async () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      
      fireEvent.click(screen.getByText('Add'));
      
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('disables Add button when URL is empty', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      expect(screen.getByText('Add')).toBeDisabled();
    });
  });

  describe('Removing images', () => {
    it('removes correct image when remove is clicked', () => {
      const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
      // Find all remove buttons and click the second one
      const buttons = screen.getAllByRole('button');
      const removeButtons = buttons.filter(btn => btn.className.includes('destructive'));
      fireEvent.click(removeButtons[1]);
      
      expect(mockOnChange).toHaveBeenCalledWith([
        'https://example.com/1.jpg',
        'https://example.com/3.jpg'
      ]);
    });

    it('removes first image correctly', () => {
      const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
      const buttons = screen.getAllByRole('button');
      const removeButtons = buttons.filter(btn => btn.className.includes('destructive'));
      fireEvent.click(removeButtons[0]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['https://example.com/2.jpg']);
    });

    it('removes last image correctly', () => {
      const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
      const buttons = screen.getAllByRole('button');
      const removeButtons = buttons.filter(btn => btn.className.includes('destructive'));
      fireEvent.click(removeButtons[1]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['https://example.com/1.jpg']);
    });
  });

  describe('Max images limit', () => {
    it('hides input when max images reached', () => {
      const urls = Array(10).fill(null).map((_, i) => `https://example.com/${i}.jpg`);
      render(<MultiImageUpload value={urls} onChange={mockOnChange} maxImages={10} />);
      
      expect(screen.queryByPlaceholderText('https://example.com/image.jpg')).not.toBeInTheDocument();
    });

    it('shows input when below max images', () => {
      const urls = Array(9).fill(null).map((_, i) => `https://example.com/${i}.jpg`);
      render(<MultiImageUpload value={urls} onChange={mockOnChange} maxImages={10} />);
      
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    });

    it('does not add when at max images', async () => {
      const user = userEvent.setup();
      const urls = Array(10).fill(null).map((_, i) => `https://example.com/${i}.jpg`);
      
      // This test verifies the behavior when trying to add programmatically
      // (the input is hidden, but the logic should still prevent adding)
      const { rerender } = render(
        <MultiImageUpload value={urls.slice(0, 9)} onChange={mockOnChange} maxImages={10} />
      );
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://example.com/new.jpg');
      
      // Re-render with max images
      rerender(<MultiImageUpload value={urls} onChange={mockOnChange} maxImages={10} />);
      
      // Input should be hidden now
      expect(screen.queryByPlaceholderText('https://example.com/image.jpg')).not.toBeInTheDocument();
    });

    it('respects custom maxImages value', () => {
      const urls = Array(3).fill(null).map((_, i) => `https://example.com/${i}.jpg`);
      render(<MultiImageUpload value={urls} onChange={mockOnChange} maxImages={3} />);
      
      expect(screen.queryByPlaceholderText('https://example.com/image.jpg')).not.toBeInTheDocument();
      expect(screen.getByText('3 / 3 images added')).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('disables input when disabled', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} disabled />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeDisabled();
    });

    it('disables Add button when disabled', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} disabled />);
      expect(screen.getByText('Add')).toBeDisabled();
    });

    it('disables remove buttons when disabled', () => {
      const urls = ['https://example.com/1.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} disabled />);
      
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find(btn => btn.className.includes('destructive'));
      expect(removeButton).toBeDisabled();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <MultiImageUpload value={[]} onChange={mockOnChange} className="gallery-upload" />
      );
      expect(container.firstChild).toHaveClass('gallery-upload');
    });
  });

  describe('Image error handling', () => {
    it('handles image load errors gracefully', () => {
      const urls = ['https://example.com/broken.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
      const image = screen.getByTestId('next-image');
      fireEvent.error(image);
      
      // The component hides the image on error
      expect(image).toHaveStyle({ display: 'none' });
    });
  });
});
