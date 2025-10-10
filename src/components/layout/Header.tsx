'use client'

import React from 'react'
import UserProfile from '@/components/auth/UserProfile'

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-pink-600">
              Omoide
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <span className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer">
              Home
            </span>
            <span className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer">
              Timeline
            </span>
            <span className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer">
              Storybooks
            </span>
          </nav>

          <UserProfile />
        </div>
      </div>
    </header>
  )
}

export default Header