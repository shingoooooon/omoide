import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '../ProtectedRoute'
import { it } from 'node:test'
import { describe } from 'node:test'

// Mock the LoginForm component
jest.mock('../LoginForm', () => {
  return function MockLoginForm() {
    return <div>Login Form</div>
  }
})

// Mock the LoadingSpinner component
jest.mock('@/components/ui/LoadingSpinner', () => {
  return {
    LoadingSpinner: function MockLoadingSpinner() {
      return <div>Loading...</div>
    }
  }
})

describe('ProtectedRoute', () => {
  it('shows loading state initially', () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    )
    
    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})