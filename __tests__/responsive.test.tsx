/**
 * Responsive behavior tests for components
 * Tests how components adapt to different screen sizes
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock window.matchMedia
function createMatchMediaMock(matches: boolean) {
  const addEventListenerMock = vi.fn();
  const removeEventListenerMock = vi.fn();
  
  const matchMediaMock = vi.fn().mockImplementation(() => ({
    matches,
    media: '',
    onchange: null,
    addEventListener: addEventListenerMock,
    removeEventListener: removeEventListenerMock,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });

  return { matchMediaMock, addEventListenerMock, removeEventListenerMock };
}

describe('Responsive Behavior', () => {
  describe('Mobile Detection', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should detect mobile viewport (width < 768px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    it('should detect desktop viewport (width >= 768px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    it('should detect tablet viewport at 768px as desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    it('should detect small mobile viewport (320px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
      createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    it('should detect large desktop viewport (1920px)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });
  });

  describe('Viewport Resize Handling', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should respond to viewport changes from desktop to mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      const { addEventListenerMock } = createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
      
      // Simulate viewport change to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        const changeHandler = addEventListenerMock.mock.calls[0]?.[1];
        if (changeHandler) changeHandler();
      });
      
      expect(result.current).toBe(true);
    });

    it('should respond to viewport changes from mobile to desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      const { addEventListenerMock } = createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
      
      // Simulate viewport change to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
        const changeHandler = addEventListenerMock.mock.calls[0]?.[1];
        if (changeHandler) changeHandler();
      });
      
      expect(result.current).toBe(false);
    });

    it('should cleanup event listener on unmount', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      const { removeEventListenerMock } = createMatchMediaMock(false);
      
      const { unmount } = renderHook(() => useIsMobile());
      
      unmount();
      
      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Common Device Viewports', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    // iPhone SE
    it('should detect iPhone SE (375px) as mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    // iPhone 12/13/14 Pro
    it('should detect iPhone 12/13/14 Pro (390px) as mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 390, writable: true });
      createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    // iPhone 12/13/14 Pro Max
    it('should detect iPhone 12/13/14 Pro Max (428px) as mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 428, writable: true });
      createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    // Samsung Galaxy S21
    it('should detect Samsung Galaxy S21 (360px) as mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 360, writable: true });
      createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    // iPad Mini
    it('should detect iPad Mini (768px) as desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    // iPad
    it('should detect iPad (810px) as desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 810, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    // iPad Pro 11"
    it('should detect iPad Pro 11" (834px) as desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 834, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    // iPad Pro 12.9"
    it('should detect iPad Pro 12.9" (1024px) as desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    // MacBook Air 13"
    it('should detect MacBook Air 13" (1440px) as desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    // 4K Display
    it('should detect 4K display (3840px) as desktop', () => {
      Object.defineProperty(window, 'innerWidth', { value: 3840, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });
  });

  describe('Breakpoint Edge Cases', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should detect 767px as mobile (one pixel below breakpoint)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 767, writable: true });
      createMatchMediaMock(true);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(true);
    });

    it('should detect 768px as desktop (exactly at breakpoint)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });

    it('should detect 769px as desktop (one pixel above breakpoint)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 769, writable: true });
      createMatchMediaMock(false);
      
      const { result } = renderHook(() => useIsMobile());
      
      expect(result.current).toBe(false);
    });
  });
});
