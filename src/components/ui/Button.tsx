import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { KeyboardNavigation, liveAnnouncer } from '@/lib/accessibility'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  announceOnClick?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    loadingText,
    announceOnClick,
    children, 
    disabled, 
    onClick,
    onKeyDown,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 focus-visible:ring-primary-500 shadow-soft hover:shadow-medium',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 focus-visible:ring-secondary-500 shadow-soft hover:shadow-medium',
      outline: 'border-2 border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 focus-visible:ring-primary-500',
      ghost: 'text-primary-700 hover:bg-primary-50 focus:ring-primary-500 focus-visible:ring-primary-500',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[32px]',
      md: 'px-4 py-2.5 text-base min-h-[40px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (announceOnClick) {
        liveAnnouncer.announce(announceOnClick);
      }
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      KeyboardNavigation.handleButtonKeyDown(event.nativeEvent, () => {
        if (announceOnClick) {
          liveAnnouncer.announce(announceOnClick);
        }
        onClick?.(event as any);
      });
      onKeyDown?.(event);
    };

    const isDisabled = disabled || isLoading;
    const buttonText = isLoading && loadingText ? loadingText : children;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span className={isLoading ? 'sr-only' : undefined}>
          {buttonText}
        </span>
        {isLoading && (
          <span className="sr-only">
            {loadingText || '読み込み中'}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }