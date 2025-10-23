'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm text-gray-700">
          {user.displayName || user.email}
        </span>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        disabled={loading}
        className="text-neutral-600 hover:text-primary-700"
      >
        {loading ? '...' : 'ログアウト'}
      </Button>
    </div>
  )
}

export default UserProfile