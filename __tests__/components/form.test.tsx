/**
 * Tests for form-related UI components (Input, Textarea, Label)
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'

describe('Input component', () => {
  describe('rendering', () => {
    it('should render an input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('data-slot', 'input')
    })

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter your name" />)
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    })

    it('should render with default value', () => {
      render(<Input defaultValue="John Doe" />)
      expect(screen.getByRole('textbox')).toHaveValue('John Doe')
    })
  })

  describe('types', () => {
    it('should have no explicit type attribute by default (browser defaults to text)', () => {
      render(<Input />)
      // Input component doesn't set type by default, browser defaults to "text"
      expect(screen.getByRole('textbox')).not.toHaveAttribute('type')
    })

    it('should render text input when type="text" is specified', () => {
      render(<Input type="text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('should render email input', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      render(<Input type="password" />)
      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('should render number input', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
    })

    it('should render tel input', () => {
      render(<Input type="tel" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel')
    })

    it('should render search input', () => {
      render(<Input type="search" />)
      expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'search')
    })
  })

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should be required when required prop is true', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly />)
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
    })
  })

  describe('user interaction', () => {
    it('should handle onChange events', async () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'Hello')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle controlled input', async () => {
      const TestComponent = () => {
        const [value, setValue] = vi.importActual<typeof import('react')>('react').then(r => r.useState(''))
        return <Input value={typeof value === 'string' ? value : ''} onChange={(e) => {}} />
      }
      
      // Simple controlled test
      const handleChange = vi.fn()
      render(<Input value="controlled" onChange={handleChange} />)
      expect(screen.getByRole('textbox')).toHaveValue('controlled')
    })

    it('should handle onFocus events', () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} />)
      
      fireEvent.focus(screen.getByRole('textbox'))
      
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('should handle onBlur events', () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)
      
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('styling', () => {
    it('should merge custom className', () => {
      render(<Input className="custom-class" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-class')
    })

    it('should have base styling classes', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('rounded-md')
      expect(input).toHaveClass('border')
    })
  })

  describe('accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Search" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Search')
    })

    it('should support aria-describedby', () => {
      render(<Input aria-describedby="helper-text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'helper-text')
    })

    it('should support aria-invalid', () => {
      render(<Input aria-invalid="true" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })
  })
})

describe('Textarea component', () => {
  describe('rendering', () => {
    it('should render a textarea element', () => {
      render(<Textarea />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
    })

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter description" />)
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
    })

    it('should render with default value', () => {
      render(<Textarea defaultValue="Some text" />)
      expect(screen.getByRole('textbox')).toHaveValue('Some text')
    })

    it('should set displayName correctly', () => {
      expect(Textarea.displayName).toBe('Textarea')
    })
  })

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should be required when required prop is true', () => {
      render(<Textarea required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('should be readonly when readOnly prop is true', () => {
      render(<Textarea readOnly />)
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
    })
  })

  describe('sizing', () => {
    it('should support rows attribute', () => {
      render(<Textarea rows={5} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5')
    })

    it('should support cols attribute', () => {
      render(<Textarea cols={50} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('cols', '50')
    })

    it('should have minimum height styling', () => {
      render(<Textarea />)
      expect(screen.getByRole('textbox')).toHaveClass('min-h-[80px]')
    })
  })

  describe('user interaction', () => {
    it('should handle onChange events', async () => {
      const handleChange = vi.fn()
      render(<Textarea onChange={handleChange} />)
      
      await userEvent.type(screen.getByRole('textbox'), 'Hello World')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle multiline input', async () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await userEvent.type(textarea, 'Line 1{enter}Line 2')
      
      expect(textarea).toHaveValue('Line 1\nLine 2')
    })
  })

  describe('styling', () => {
    it('should merge custom className', () => {
      render(<Textarea className="custom-textarea" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-textarea')
    })

    it('should have base styling classes', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('rounded-md')
      expect(textarea).toHaveClass('border')
      expect(textarea).toHaveClass('w-full')
    })
  })

  describe('ref forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = vi.fn()
      render(<Textarea ref={ref} />)
      
      expect(ref).toHaveBeenCalled()
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTextAreaElement)
    })
  })
})

describe('Label component', () => {
  describe('rendering', () => {
    it('should render a label element', () => {
      render(<Label>Username</Label>)
      expect(screen.getByText('Username')).toBeInTheDocument()
    })

    it('should have data-slot attribute', () => {
      render(<Label>Test</Label>)
      expect(screen.getByText('Test')).toHaveAttribute('data-slot', 'label')
    })
  })

  describe('association', () => {
    it('should associate with input using htmlFor', () => {
      render(
        <>
          <Label htmlFor="email">Email</Label>
          <Input id="email" />
        </>
      )
      
      const label = screen.getByText('Email')
      expect(label).toHaveAttribute('for', 'email')
    })

    it('should click on label focuses associated input', async () => {
      render(
        <>
          <Label htmlFor="username">Username</Label>
          <Input id="username" />
        </>
      )
      
      await userEvent.click(screen.getByText('Username'))
      
      expect(screen.getByRole('textbox')).toHaveFocus()
    })
  })

  describe('styling', () => {
    it('should merge custom className', () => {
      render(<Label className="custom-label">Test</Label>)
      expect(screen.getByText('Test')).toHaveClass('custom-label')
    })

    it('should have base styling classes', () => {
      render(<Label>Test</Label>)
      const label = screen.getByText('Test')
      expect(label).toHaveClass('text-sm')
      expect(label).toHaveClass('font-medium')
    })
  })

  describe('with children', () => {
    it('should render children elements', () => {
      render(
        <Label>
          <span data-testid="icon">*</span>
          Required Field
        </Label>
      )
      
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Required Field')).toBeInTheDocument()
    })
  })
})
