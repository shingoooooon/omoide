'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  once?: boolean;
  onIntersect?: () => void;
}

export function LazyLoad({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  className,
  once = true,
  onIntersect,
}: LazyLoadProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible) {
          setHasIntersected(true);
          onIntersect?.();
          
          if (once) {
            observer.unobserve(element);
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, once, onIntersect]);

  const shouldRender = once ? hasIntersected : isIntersecting;

  return (
    <div ref={elementRef} className={cn('min-h-[1px]', className)}>
      {shouldRender ? children : fallback}
    </div>
  );
}

// Specialized lazy loading components
export function LazySection({
  children,
  className,
  minHeight = '200px',
}: {
  children: ReactNode;
  className?: string;
  minHeight?: string;
}) {
  return (
    <LazyLoad
      fallback={
        <div 
          className={cn('flex items-center justify-center bg-gray-50 rounded-lg', className)}
          style={{ minHeight }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">読み込み中...</p>
          </div>
        </div>
      }
      className={className}
    >
      {children}
    </LazyLoad>
  );
}

export function LazyImageGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <LazyLoad
      fallback={
        <div className={cn('grid gap-4', className)}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      }
      rootMargin="100px"
    >
      {children}
    </LazyLoad>
  );
}