import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (user) return <div>User: {user.email}</div>
  return <div>No user</div>
}

describe('AuthContext', () => {
  it('provides authentication context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Initially should show loading or no user
    expect(screen.getByText(/Loading...|No user/)).toBeInTheDocument()
  })

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })
})