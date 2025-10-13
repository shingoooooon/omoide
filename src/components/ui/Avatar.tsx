'use client'

import { HTMLAttributes, forwardRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, ...props }, ref) => {
    const [imageError, setImageError] = useState(false)
    
    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    }

    const sizeValues = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    }

    const getInitials = (name?: string) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-white font-medium shadow-soft overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt || 'Avatar'}
            width={sizeValues[size]}
            height={sizeValues[size]}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="select-none">
            {getInitials(fallback || alt)}
          </span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }