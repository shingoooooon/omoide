import { ReactNode } from 'react'
import Header from './Header'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface LayoutProps {
  children: ReactNode
  requireAuth?: boolean
}

export function Layout({ children, requireAuth = true }: LayoutProps) {
  const content = (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
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