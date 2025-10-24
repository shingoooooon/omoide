// Accessibility utilities and helpers

// ARIA live region announcer
export class LiveAnnouncer {
  private static instance: LiveAnnouncer;
  private liveElement: HTMLElement | null = null;

  static getInstance(): LiveAnnouncer {
    if (!LiveAnnouncer.instance) {
      LiveAnnouncer.instance = new LiveAnnouncer();
    }
    return LiveAnnouncer.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.createLiveElement();
    }
  }

  private createLiveElement(): void {
    this.liveElement = document.createElement('div');
    this.liveElement.setAttribute('aria-live', 'polite');
    this.liveElement.setAttribute('aria-atomic', 'true');
    this.liveElement.setAttribute('aria-relevant', 'additions text');
    this.liveElement.style.position = 'absolute';
    this.liveElement.style.left = '-10000px';
    this.liveElement.style.width = '1px';
    this.liveElement.style.height = '1px';
    this.liveElement.style.overflow = 'hidden';
    document.body.appendChild(this.liveElement);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveElement) return;

    this.liveElement.setAttribute('aria-live', priority);
    this.liveElement.textContent = message;

    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (this.liveElement) {
        this.liveElement.textContent = '';
      }
    }, 1000);
  }
}

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static trapFocus(element: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(element);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }

  static pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }

  static popFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  static getNextFocusableElement(current: HTMLElement, direction: 'next' | 'prev' = 'next'): HTMLElement | null {
    const focusableElements = this.getFocusableElements(document.body);
    const currentIndex = focusableElements.indexOf(current);
    
    if (currentIndex === -1) return null;

    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    return focusableElements[nextIndex];
  }
}

// Keyboard navigation utilities
export const KeyboardNavigation = {
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    TAB: 'Tab',
  },

  isActionKey(key: string): boolean {
    return key === this.KEYS.ENTER || key === this.KEYS.SPACE;
  },

  isArrowKey(key: string): boolean {
    return [
      this.KEYS.ARROW_UP,
      this.KEYS.ARROW_DOWN,
      this.KEYS.ARROW_LEFT,
      this.KEYS.ARROW_RIGHT,
    ].includes(key);
  },

  handleButtonKeyDown(event: KeyboardEvent, onClick: () => void): void {
    if (this.isActionKey(event.key)) {
      event.preventDefault();
      onClick();
    }
  },

  handleMenuKeyDown(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void,
    onClose?: () => void
  ): number {
    let newIndex = currentIndex;

    switch (event.key) {
      case this.KEYS.ARROW_DOWN:
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case this.KEYS.ARROW_UP:
        event.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case this.KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case this.KEYS.END:
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case this.KEYS.ENTER:
      case this.KEYS.SPACE:
        event.preventDefault();
        onSelect(currentIndex);
        return currentIndex;
      case this.KEYS.ESCAPE:
        event.preventDefault();
        onClose?.();
        return currentIndex;
    }

    if (newIndex !== currentIndex) {
      items[newIndex]?.focus();
    }

    return newIndex;
  },
};

// Color contrast utilities
export const ColorContrast = {
  // Calculate relative luminance
  getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
    const lum1 = this.getLuminance(...color1);
    const lum2 = this.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast ratio meets WCAG standards
  meetsWCAG(ratio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
    const requirements = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 },
    };
    return ratio >= requirements[level][size];
  },

  // Parse hex color to RGB
  hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  },
};

// Screen reader utilities
export const ScreenReader = {
  // Hide element from screen readers
  hide(element: HTMLElement): void {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show element to screen readers
  show(element: HTMLElement): void {
    element.removeAttribute('aria-hidden');
  },

  // Set accessible name
  setAccessibleName(element: HTMLElement, name: string): void {
    element.setAttribute('aria-label', name);
  },

  // Set accessible description
  setAccessibleDescription(element: HTMLElement, description: string): void {
    element.setAttribute('aria-describedby', description);
  },

  // Create visually hidden text for screen readers
  createVisuallyHiddenText(text: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'sr-only';
    return span;
  },
};

// Reduced motion utilities
export const ReducedMotion = {
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  respectMotionPreference(element: HTMLElement, animationClass: string): void {
    if (!this.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  },
};

// High contrast mode detection
export const HighContrast = {
  isHighContrastMode(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  adaptForHighContrast(element: HTMLElement, highContrastClass: string): void {
    if (this.isHighContrastMode()) {
      element.classList.add(highContrastClass);
    }
  },
};

// Export singleton instances
export const liveAnnouncer = LiveAnnouncer.getInstance();