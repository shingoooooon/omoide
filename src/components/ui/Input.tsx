import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { liveAnnouncer } from '@/lib/accessibility'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  announceErrors?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon,
    id,
    required,
    announceErrors = true,
    onBlur,
    ...props 
  }, ref) => {
    const [hasBeenFocused, setHasBeenFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setHasBeenFocused(true);
      
      // Announce errors to screen readers
      if (error && announceErrors && hasBeenFocused) {
        liveAnnouncer.announce(`エラー: ${error}`, 'assertive');
      }
      
      onBlur?.(event);
    };
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="必須">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-neutral-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              'block w-full rounded-xl border-0 py-3 px-4 text-neutral-900 shadow-soft ring-1 ring-inset ring-neutral-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-200 bg-white/80 backdrop-blur-sm',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'ring-error-300 focus:ring-error-500 focus-visible:ring-error-500',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(errorId, helperId).trim() || undefined}
            aria-required={required}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="text-neutral-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="text-sm text-error-600 flex items-center space-x-1" role="alert" aria-live="polite">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>
              <span className="sr-only">エラー: </span>
              {error}
            </span>
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }