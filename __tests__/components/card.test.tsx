/**
 * Tests for Card UI components
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '../../components/ui/card'

describe('Card component', () => {
  describe('rendering', () => {
    it('should render card element', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<Card data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card')
    })

    it('should render as a div', () => {
      render(<Card data-testid="card">Content</Card>)
      expect(screen.getByTestId('card').tagName).toBe('DIV')
    })
  })

  describe('styling', () => {
    it('should have base card styles', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('shadow-sm')
    })

    it('should merge custom className', () => {
      render(<Card data-testid="card" className="custom-card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
      expect(card).toHaveClass('rounded-xl') // Still has base styles
    })
  })

  describe('composition', () => {
    it('should render complete card structure', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Main content here</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Main content here')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })
  })
})

describe('CardHeader component', () => {
  it('should render header content', () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>)
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header')
  })

  it('should merge custom className', () => {
    render(<CardHeader data-testid="header" className="custom-header">Header</CardHeader>)
    expect(screen.getByTestId('header')).toHaveClass('custom-header')
  })

  it('should have padding styles', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>)
    expect(screen.getByTestId('header')).toHaveClass('px-6')
  })
})

describe('CardTitle component', () => {
  it('should render title text', () => {
    render(<CardTitle>My Title</CardTitle>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)
    expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'card-title')
  })

  it('should have font styling', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)
    expect(screen.getByTestId('title')).toHaveClass('font-semibold')
  })

  it('should merge custom className', () => {
    render(<CardTitle data-testid="title" className="text-2xl">Title</CardTitle>)
    const title = screen.getByTestId('title')
    expect(title).toHaveClass('text-2xl')
    expect(title).toHaveClass('font-semibold')
  })
})

describe('CardDescription component', () => {
  it('should render description text', () => {
    render(<CardDescription>Some description</CardDescription>)
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)
    expect(screen.getByTestId('desc')).toHaveAttribute('data-slot', 'card-description')
  })

  it('should have muted text styling', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)
    expect(screen.getByTestId('desc')).toHaveClass('text-muted-foreground')
  })

  it('should have small text size', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)
    expect(screen.getByTestId('desc')).toHaveClass('text-sm')
  })
})

describe('CardContent component', () => {
  it('should render content', () => {
    render(<CardContent>Content here</CardContent>)
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content')
  })

  it('should have horizontal padding', () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    expect(screen.getByTestId('content')).toHaveClass('px-6')
  })

  it('should merge custom className', () => {
    render(<CardContent data-testid="content" className="py-8">Content</CardContent>)
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('py-8')
    expect(content).toHaveClass('px-6')
  })
})

describe('CardFooter component', () => {
  it('should render footer content', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer')
  })

  it('should have flex layout', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveClass('flex')
    expect(screen.getByTestId('footer')).toHaveClass('items-center')
  })

  it('should have horizontal padding', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveClass('px-6')
  })
})

describe('CardAction component', () => {
  it('should render action content', () => {
    render(<CardAction>Action Button</CardAction>)
    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('should have data-slot attribute', () => {
    render(<CardAction data-testid="action">Action</CardAction>)
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'card-action')
  })

  it('should be positioned for grid layout', () => {
    render(<CardAction data-testid="action">Action</CardAction>)
    const action = screen.getByTestId('action')
    expect(action).toHaveClass('col-start-2')
    expect(action).toHaveClass('row-span-2')
  })

  it('should work in card header context', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction data-testid="action">
            <button>Edit</button>
          </CardAction>
        </CardHeader>
      </Card>
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})

describe('Card accessibility', () => {
  it('should support role attribute', () => {
    render(<Card role="article" data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('role', 'article')
  })

  it('should support aria-labelledby', () => {
    render(
      <Card aria-labelledby="card-title" data-testid="card">
        <CardHeader>
          <CardTitle id="card-title">Accessible Card</CardTitle>
        </CardHeader>
      </Card>
    )
    
    expect(screen.getByTestId('card')).toHaveAttribute('aria-labelledby', 'card-title')
  })

  it('should support aria-describedby', () => {
    render(
      <Card aria-describedby="card-desc" data-testid="card">
        <CardHeader>
          <CardDescription id="card-desc">Description</CardDescription>
        </CardHeader>
      </Card>
    )
    
    expect(screen.getByTestId('card')).toHaveAttribute('aria-describedby', 'card-desc')
  })
})

describe('Card HTML attributes', () => {
  it('should pass through id attribute', () => {
    render(<Card id="my-card" data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('id', 'my-card')
  })

  it('should pass through data attributes', () => {
    render(<Card data-testid="card" data-custom="value">Content</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-custom', 'value')
  })

  it('should support onClick handler', () => {
    const handleClick = vi.fn()
    render(<Card data-testid="card" onClick={handleClick}>Content</Card>)
    
    screen.getByTestId('card').click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

// Need to import vi for onClick test
import { vi } from 'vitest'
