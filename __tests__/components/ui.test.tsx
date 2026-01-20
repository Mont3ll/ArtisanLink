/**
 * Tests for UI components (Button, Badge)
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

describe('Button component', () => {
  describe('rendering', () => {
    it('should render with children text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('should render as a button element by default', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button').tagName).toBe('BUTTON')
    })

    it('should have data-slot attribute', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
    })
  })

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<Button variant="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
    })

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('should apply link variant styles', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary')
      expect(button).toHaveClass('hover:underline')
    })
  })

  describe('sizes', () => {
    it('should apply default size', () => {
      render(<Button size="default">Default Size</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
    })

    it('should apply small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8')
    })

    it('should apply large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
    })

    it('should apply icon size', () => {
      render(<Button size="icon">+</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('size-9')
    })
  })

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('should handle click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('className prop', () => {
    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class">Test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('inline-flex') // default class
    })
  })

  describe('asChild prop', () => {
    it('should render children directly when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveTextContent('Link Button')
      expect(link).toHaveAttribute('href', '/test')
    })
  })

  describe('HTML attributes', () => {
    it('should pass through type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should pass through aria attributes', () => {
      render(<Button aria-label="Close dialog">X</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog')
    })
  })
})

describe('Badge component', () => {
  describe('rendering', () => {
    it('should render with children text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should render as a span element by default', () => {
      render(<Badge>Test</Badge>)
      expect(screen.getByText('Test').tagName).toBe('SPAN')
    })

    it('should have data-slot attribute', () => {
      render(<Badge>Test</Badge>)
      expect(screen.getByText('Test')).toHaveAttribute('data-slot', 'badge')
    })
  })

  describe('variants', () => {
    it('should apply default variant styles', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-primary')
    })

    it('should apply secondary variant styles', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('bg-secondary')
    })

    it('should apply destructive variant styles', () => {
      render(<Badge variant="destructive">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('bg-destructive')
    })

    it('should apply success variant styles', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-green-500')
    })

    it('should apply outline variant styles', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-foreground')
    })
  })

  describe('className prop', () => {
    it('should merge custom className with default classes', () => {
      render(<Badge className="ml-2">Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge).toHaveClass('ml-2')
      expect(badge).toHaveClass('inline-flex') // default class
    })
  })

  describe('asChild prop', () => {
    it('should render children directly when asChild is true', () => {
      render(
        <Badge asChild>
          <a href="/status">Active</a>
        </Badge>
      )
      const link = screen.getByRole('link')
      expect(link).toHaveTextContent('Active')
      expect(link).toHaveAttribute('href', '/status')
    })
  })

  describe('styling', () => {
    it('should have rounded corners', () => {
      render(<Badge>Rounded</Badge>)
      expect(screen.getByText('Rounded')).toHaveClass('rounded-md')
    })

    it('should have proper font sizing', () => {
      render(<Badge>Text</Badge>)
      expect(screen.getByText('Text')).toHaveClass('text-xs')
    })

    it('should have border for all variants', () => {
      render(<Badge>Border</Badge>)
      expect(screen.getByText('Border')).toHaveClass('border')
    })
  })
})
