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
    console.warn(`Failed to load image: ${currentSrc}`);
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback image if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`Trying fallback image: ${fallbackSrc}`);
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
  onLoadComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = useCallback(() => {
    console.log('StorybookImage loaded successfully:', src);
    setImageLoaded(true);
    setImageError(false);
    onLoadComplete?.();
  }, [src, onLoadComplete]);

  const handleError = useCallback((error: Error) => {
    console.error('StorybookImage failed to load:', src, error);
    setImageError(true);
    setImageLoaded(false);
    onError?.(error);
  }, [src, onError]);

  return (
    <div className="relative w-full h-full">
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm">絵本の画像</p>
            <p className="text-xs text-gray-500 mt-1">画像を読み込めませんでした</p>
          </div>
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-contain transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        quality={90}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        onLoad={handleLoad}
        onError={handleError}
        priority={props.priority}
        {...props}
      />
    </div>
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