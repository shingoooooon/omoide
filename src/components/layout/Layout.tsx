import { ReactNode } from 'react'
import Header from './Header'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface LayoutProps {
  children: ReactNode
  requireAuth?: boolean
  className?: string
  fullWidth?: boolean
}

export function Layout({ children, requireAuth = true, className, fullWidth = false }: LayoutProps) {
  const content = (
    <div className={fullWidth ? "min-h-screen" : "min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50"}>
      <Header />
      <main className={fullWidth ? className || '' : `container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className || ''}`}>
        <div className={fullWidth ? '' : 'animate-fade-in'}>
          {children}
        </div>
      </main>
      
      {/* Background decorative elements - only show when not fullWidth */}
      {!fullWidth && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce-gentle"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
        </div>
      )}
    </div>
  )

  if (requireAuth) {
    return (
      <ProtectedRoute>
        {content}
      </ProtectedRoute>
    )
  }

  return content
}