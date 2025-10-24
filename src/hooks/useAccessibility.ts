'use client';

import { useEffect, useRef, useCallback } from 'react';
import { liveAnnouncer, FocusManager, ReducedMotion } from '@/lib/accessibility';

interface UseAccessibilityOptions {
  announcePageChanges?: boolean;
  manageFocus?: boolean;
  respectMotionPreferences?: boolean;
}

export function useAccessibility({
  announcePageChanges = true,
  manageFocus = true,
  respectMotionPreferences = true,
}: UseAccessibilityOptions = {}) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Announce page changes
  const announcePageChange = useCallback((message: string) => {
    if (announcePageChanges) {
      liveAnnouncer.announce(message);
    }
  }, [announcePageChanges]);

  // Focus management
  const saveFocus = useCallback(() => {
    if (manageFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [manageFocus]);

  const restoreFocus = useCallback(() => {
    if (manageFocus && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [manageFocus]);

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (manageFocus && element) {
      element.focus();
    }
  }, [manageFocus]);

  // Motion preferences
  const prefersReducedMotion = useCallback(() => {
    return respectMotionPreferences ? ReducedMotion.prefersReducedMotion() : false;
  }, [respectMotionPreferences]);

  return {
    announcePageChange,
    saveFocus,
    restoreFocus,
    focusElement,
    prefersReducedMotion,
  };
}

// Hook for managing keyboard navigation in lists/grids
export function useKeyboardNavigation(
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', wrap = true, onSelect } = options;
  const currentIndexRef = useRef(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    let newIndex = currentIndexRef.current;

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = wrap 
            ? (currentIndexRef.current + 1) % items.length
            : Math.min(currentIndexRef.current + 1, items.length - 1);
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          newIndex = wrap
            ? (currentIndexRef.current - 1 + items.length) % items.length
            : Math.max(currentIndexRef.current - 1, 0);
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = wrap
            ? (currentIndexRef.current + 1) % items.length
            : Math.min(currentIndexRef.current + 1, items.length - 1);
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          newIndex = wrap
            ? (currentIndexRef.current - 1 + items.length) % items.length
            : Math.max(currentIndexRef.current - 1, 0);
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(currentIndexRef.current);
        return;
    }

    if (newIndex !== currentIndexRef.current) {
      currentIndexRef.current = newIndex;
      items[newIndex]?.focus();
    }
  }, [items, orientation, wrap, onSelect]);

  const setCurrentIndex = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      currentIndexRef.current = index;
      items[index]?.focus();
    }
  }, [items]);

  return {
    handleKeyDown,
    setCurrentIndex,
    currentIndex: currentIndexRef.current,
  };
}

// Hook for managing ARIA live regions
export function useLiveRegion() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    liveAnnouncer.announce(message, priority);
  }, []);

  const announceError = useCallback((message: string) => {
    liveAnnouncer.announce(`エラー: ${message}`, 'assertive');
  }, []);

  const announceSuccess = useCallback((message: string) => {
    liveAnnouncer.announce(`成功: ${message}`, 'polite');
  }, []);

  const announceLoading = useCallback((message: string = '読み込み中') => {
    liveAnnouncer.announce(message, 'polite');
  }, []);

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading,
  };
}

// Hook for managing focus traps (modals, dropdowns, etc.)
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const releaseTrapRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      releaseTrapRef.current = FocusManager.trapFocus(containerRef.current);
    } else if (releaseTrapRef.current) {
      releaseTrapRef.current();
      releaseTrapRef.current = null;
    }

    return () => {
      if (releaseTrapRef.current) {
        releaseTrapRef.current();
        releaseTrapRef.current = null;
      }
    };
  }, [isActive]);

  return containerRef;
}

// Hook for managing roving tabindex
export function useRovingTabIndex(items: HTMLElement[], currentIndex: number) {
  useEffect(() => {
    items.forEach((item, index) => {
      if (index === currentIndex) {
        item.setAttribute('tabindex', '0');
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });
  }, [items, currentIndex]);
}