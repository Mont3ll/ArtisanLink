import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock the Cloudinary upload hook
vi.mock('@/lib/hooks/use-cloudinary-upload', () => ({
  useCloudinaryUpload: vi.fn(() => ({
    upload: vi.fn().mockResolvedValue({ url: 'https://cloudinary.com/test.jpg', publicId: 'test-id' }),
    deleteImage: vi.fn().mockResolvedValue(true),
    isUploading: false,
    progress: 0,
    error: null,
    reset: vi.fn(),
  })),
  getUploadLimits: vi.fn(() => ({
    maxSize: 10 * 1024 * 1024,
    maxSizeFormatted: '10MB',
    allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  })),
  validateFile: vi.fn(() => ({ valid: true })),
}));

describe('ImageUpload', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('URL-only mode (enableFileUpload=false)', () => {
    it('renders with default label', () => {
      render(<ImageUpload value="" onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByText('Image')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<ImageUpload value="" onChange={mockOnChange} label="Custom Label" enableFileUpload={false} />);
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('renders URL input when no value', () => {
      render(<ImageUpload value="" onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<ImageUpload value="" onChange={mockOnChange} placeholder="Enter URL here" enableFileUpload={false} />);
      expect(screen.getByPlaceholderText('Enter URL here')).toBeInTheDocument();
    });

    it('shows help text for URL input', () => {
      render(<ImageUpload value="" onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByText(/Enter an image URL/)).toBeInTheDocument();
    });

    it('calls onChange when URL is typed', async () => {
      const user = userEvent.setup();
      render(<ImageUpload value="" onChange={mockOnChange} enableFileUpload={false} />);
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://test.com/img.jpg');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('disables input when disabled prop is true', () => {
      render(<ImageUpload value="" onChange={mockOnChange} disabled enableFileUpload={false} />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeDisabled();
    });
  });

  describe('With existing value', () => {
    it('shows image preview when value is set', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('shows Change button when image is displayed', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      expect(screen.getByText('Change')).toBeInTheDocument();
    });

    it('shows remove button when image is displayed', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      // Button has X icon - find buttons with destructive variant
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find(btn => btn.className.includes('destructive'));
      expect(removeButton).toBeInTheDocument();
    });

    it('shows Preview button when Change is clicked and URL has value', async () => {
      const user = userEvent.setup();
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} />);
      await user.click(screen.getByText('Change'));
      // Switch to URL tab
      const urlTab = screen.getByRole('tab', { name: /enter url/i });
      await user.click(urlTab);
      // Wait for the tab content to render
      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });

    // Note: Remove functionality is tested in MultiImageUpload where state management is simpler

    it('disables Change button when disabled', () => {
      render(<ImageUpload value="https://example.com/image.jpg" onChange={mockOnChange} disabled />);
      expect(screen.getByText('Change')).toBeDisabled();
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
  });

  describe('File upload mode (default)', () => {
    it('renders tabs for file upload and URL', () => {
      render(<ImageUpload value="" onChange={mockOnChange} />);
      expect(screen.getByRole('tab', { name: /upload file/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /enter url/i })).toBeInTheDocument();
    });

    it('shows drag and drop area in file mode', () => {
      render(<ImageUpload value="" onChange={mockOnChange} />);
      expect(screen.getByText(/click to upload or drag and drop/i)).toBeInTheDocument();
    });

    it('shows URL input when URL tab is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageUpload value="" onChange={mockOnChange} />);
      const urlTab = screen.getByRole('tab', { name: /enter url/i });
      await user.click(urlTab);
      // Wait for the tab content to render
      await waitFor(() => {
        expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
      });
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

  describe('URL-only mode (enableFileUpload=false)', () => {
    it('renders with default label', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByText('Images')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} label="Gallery Images" enableFileUpload={false} />);
      expect(screen.getByText('Gallery Images')).toBeInTheDocument();
    });

    it('shows image count', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByText('0 / 10 images added')).toBeInTheDocument();
    });

    it('shows correct count with custom maxImages', () => {
      render(<MultiImageUpload value={['url1', 'url2']} onChange={mockOnChange} maxImages={5} enableFileUpload={false} />);
      expect(screen.getByText('2 / 5 images added')).toBeInTheDocument();
    });

    it('renders URL input for adding new images', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    });

    it('renders Add button', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('disables input when disabled', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} disabled enableFileUpload={false} />);
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeDisabled();
    });

    it('disables Add button when disabled', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} disabled enableFileUpload={false} />);
      expect(screen.getByText('Add')).toBeDisabled();
    });

    it('disables Add button when URL is empty', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      expect(screen.getByText('Add')).toBeDisabled();
    });

    it('does not add when URL is empty', async () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      
      fireEvent.click(screen.getByText('Add'));
      
      expect(mockOnChange).not.toHaveBeenCalled();
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
      
      const buttons = screen.getAllByRole('button');
      const removeButtons = buttons.filter(btn => btn.className.includes('destructive'));
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Adding images via URL', () => {
    it('calls onChange with new URL when Add is clicked', async () => {
      const user = userEvent.setup();
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://example.com/new.jpg');
      
      fireEvent.click(screen.getByText('Add'));
      
      expect(mockOnChange).toHaveBeenCalledWith(['https://example.com/new.jpg']);
    });

    it('appends to existing images', async () => {
      const user = userEvent.setup();
      const existing = ['https://example.com/1.jpg'];
      render(<MultiImageUpload value={existing} onChange={mockOnChange} enableFileUpload={false} />);
      
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
      render(<MultiImageUpload value={[]} onChange={mockOnChange} enableFileUpload={false} />);
      
      const input = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(input, 'https://example.com/new.jpg');
      await user.keyboard('{Enter}');
      
      expect(mockOnChange).toHaveBeenCalledWith(['https://example.com/new.jpg']);
    });
  });

  describe('Removing images', () => {
    it('removes correct image when remove is clicked', () => {
      const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} />);
      
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

    it('disables remove buttons when disabled', () => {
      const urls = ['https://example.com/1.jpg'];
      render(<MultiImageUpload value={urls} onChange={mockOnChange} disabled />);
      
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find(btn => btn.className.includes('destructive'));
      expect(removeButton).toBeDisabled();
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
      render(<MultiImageUpload value={urls} onChange={mockOnChange} maxImages={10} enableFileUpload={false} />);
      
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
    });

    it('respects custom maxImages value', () => {
      const urls = Array(3).fill(null).map((_, i) => `https://example.com/${i}.jpg`);
      render(<MultiImageUpload value={urls} onChange={mockOnChange} maxImages={3} />);
      
      expect(screen.queryByPlaceholderText('https://example.com/image.jpg')).not.toBeInTheDocument();
      expect(screen.getByText('3 / 3 images added')).toBeInTheDocument();
    });
  });

  describe('File upload mode (default)', () => {
    it('renders tabs for file upload and URL', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      expect(screen.getByRole('tab', { name: /upload/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /url/i })).toBeInTheDocument();
    });

    it('shows drag and drop area in file mode', () => {
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      expect(screen.getByText(/click or drag to upload/i)).toBeInTheDocument();
    });

    it('shows URL input when URL tab is clicked', async () => {
      const user = userEvent.setup();
      render(<MultiImageUpload value={[]} onChange={mockOnChange} />);
      const urlTab = screen.getByRole('tab', { name: /url/i });
      await user.click(urlTab);
      // Wait for the tab content to render
      await waitFor(() => {
        expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
      });
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
