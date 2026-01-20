/**
 * Tests for lib/utils.ts
 */
import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('cn (classname utility)', () => {
  it('should merge simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('should merge conflicting Tailwind classes', () => {
    // twMerge should resolve conflicts by keeping the last class
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('bg-white', 'bg-black')).toBe('bg-black')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle object syntax for conditional classes', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle complex nested conditions', () => {
    const isActive = true
    const isDisabled = false
    expect(
      cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled',
        { 'hover:bg-gray-100': !isDisabled }
      )
    ).toBe('base-class active hover:bg-gray-100')
  })

  it('should handle responsive Tailwind variants', () => {
    expect(cn('p-2', 'md:p-4', 'lg:p-6')).toBe('p-2 md:p-4 lg:p-6')
  })

  it('should handle state variants correctly', () => {
    expect(cn('hover:bg-blue-500', 'hover:bg-red-500')).toBe('hover:bg-red-500')
  })

  it('should return empty string for no valid inputs', () => {
    expect(cn()).toBe('')
    expect(cn(undefined, null, false)).toBe('')
  })
})
