/**
 * Tests for custom React hooks
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../../hooks/use-mobile'

describe('useIsMobile', () => {
  const MOBILE_BREAKPOINT = 768
  let matchMediaMock: ReturnType<typeof vi.fn>
  let addEventListenerMock: ReturnType<typeof vi.fn>
  let removeEventListenerMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    addEventListenerMock = vi.fn()
    removeEventListenerMock = vi.fn()

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024, // Default to desktop
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false on desktop (width >= 768)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should return true on mobile (width < 768)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should return false at exactly 768px (not mobile)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should return true at 767px (mobile)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 767, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should call matchMedia with correct query', () => {
    renderHook(() => useIsMobile())
    
    expect(matchMediaMock).toHaveBeenCalledWith(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  })

  it('should add event listener on mount', () => {
    renderHook(() => useIsMobile())
    
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())
    
    unmount()
    
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should update when window resizes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
    
    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
      // Get the change handler and call it
      const changeHandler = addEventListenerMock.mock.calls[0][1]
      changeHandler()
    })
    
    expect(result.current).toBe(true)
  })

  it('should update when window resizes from mobile to desktop', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
    
    // Simulate resize to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      const changeHandler = addEventListenerMock.mock.calls[0][1]
      changeHandler()
    })
    
    expect(result.current).toBe(false)
  })

  it('should handle tablet sizes correctly', () => {
    // iPad portrait (768px) - not mobile
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true })
    const { result: result1 } = renderHook(() => useIsMobile())
    expect(result1.current).toBe(false)

    // Small tablet (600px) - mobile
    Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
    const { result: result2 } = renderHook(() => useIsMobile())
    expect(result2.current).toBe(true)
  })

  it('should handle very small screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 320, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should handle very large screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 2560, writable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })
})
