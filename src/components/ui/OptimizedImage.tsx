'use client';

import React, { useState, useCallback } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showLoadingSpinner?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  onLoadComplete?: () => void;
  onError?: (error: Error) => void;
  lazy?: boolean;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-illustration.svg',
  showLoadingSpinner = true,
  loadingClassName,
  errorClassName,
  onLoadComplete,
  onError,
  lazy = true,
  quality = 85,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback image if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.(new Error(`Failed to load image: ${src}`));
    }
  }, [src, fallbackSrc, currentSrc, onError]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading Spinner */}
      {isLoading && showLoadingSpinner && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-gray-100',
          loadingClassName
        )}>
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400',
          errorClassName
        )}>
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">画像を読み込めませんでした</p>
          </div>
        </div>
      )}

      {/* Optimized Image */}
      <Image
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        quality={quality}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
        {...(!props.priority && { loading: lazy ? 'lazy' : 'eager' })}
      />
    </div>
  );
}

// Specialized components for common use cases
export function PhotoThumbnail({
  src,
  alt,
  size = 'md',
  ...props
}: OptimizedImageProps & {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
      height={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
      className={cn(
        'rounded-lg object-cover',
        sizeClasses[size]
      )}
      quality={75}
      {...props}
    />
  );
}

export function StorybookImage({
  src,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className="object-contain"
      quality={90}
      lazy={true}
      {...props}
    />
  );
}

export function TimelineImage({
  src,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="w-full h-48 object-cover rounded-lg"
      quality={80}
      {...props}
    />
  );
}