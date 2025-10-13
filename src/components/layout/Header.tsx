'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import UserProfile from '@/components/auth/UserProfile'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { cn } from '@/lib/utils'

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navigation')

  const navigation = [
    { name: t('home'), href: '/', icon: '🏠' },
    { name: t('timeline'), href: '/timeline', icon: '📅' },
    { name: t('storybooks'), href: '/storybooks', icon: '📚' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform duration-200">
                思
              </div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Omoide
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                )}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher variant="toggle" />
            <UserProfile />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors duration-200"
            aria-label="メニューを開く"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-100 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 shadow-soft'
                      : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-primary-100 mt-4 space-y-3">
                <div className="flex justify-center">
                  <LanguageSwitcher variant="dropdown" />
                </div>
                <UserProfile />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header