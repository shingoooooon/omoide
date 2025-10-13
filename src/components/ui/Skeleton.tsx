import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  width, 
  height, 
  lines = 1,
  ...props 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]'
  
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  }

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined)
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variants[variant],
              index === lines - 1 && 'w-3/4', // Last line is shorter
              className
            )}
            style={style}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        className
      )}
      style={style}
      {...props}
    />
  )
}

interface SkeletonCardProps {
  showAvatar?: boolean
  lines?: number
  className?: string
}

export function SkeletonCard({ showAvatar = false, lines = 3, className }: SkeletonCardProps) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Skeleton variant="text" lines={lines} />
      </div>
      <div className="flex space-x-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={100} height={32} />
      </div>
    </div>
  )
}

export default Skeleton