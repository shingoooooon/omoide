'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import UserProfile from '@/components/auth/UserProfile'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from '@/lib/translations'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useTranslations(locale)
  const { user, loading } = useAuth()

  // ログイン状態に応じてナビゲーションを変更
  const publicNavigation = [
    { name: t('navigation.home'), href: '/', icon: 'home' },
    { name: 'デモ', href: '/demo', icon: 'sparkles' },
  ] as const

  const authenticatedNavigation = [
    { name: t('navigation.home'), href: '/', icon: 'home' },
    { name: t('navigation.upload'), href: '/upload', icon: 'camera' },
    { name: t('navigation.timeline'), href: '/timeline', icon: 'calendar' },
    { name: t('navigation.albums'), href: '/albums', icon: 'book' },
    { name: t('navigation.storybooks'), href: '/storybooks', icon: 'bookmark' },
  ] as const

  const navigation = user ? authenticatedNavigation : publicNavigation

  const isActive = (href: string) => pathname === href

  return (
    <header className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/omoide-icon.svg"
                  alt="Omoide"
                  width={32}
                  height={32}
                  className="w-full h-full rounded-md"
                />
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
                <Icon name={item.icon} size="sm" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher variant="toggle" />
            {!loading && (
              user ? (
                <UserProfile />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/auth/login')}
                    className="text-neutral-600 hover:text-primary-700"
                  >
                    <Icon name="user" size="sm" className="mr-1" />
                    ログイン
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/auth/signup')}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    新規登録
                  </Button>
                </div>
              )
            )}
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
                  <Icon name={item.icon} size="md" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-primary-100 mt-4 space-y-3">
                <div className="flex justify-center">
                  <LanguageSwitcher variant="dropdown" />
                </div>
                {!loading && (
                  user ? (
                    <UserProfile />
                  ) : (
                    <div className="flex flex-col space-y-2 px-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          router.push('/auth/login')
                        }}
                        className="w-full text-neutral-600 hover:text-primary-700"
                      >
                        <Icon name="user" size="sm" className="mr-2" />
                        ログイン
                      </Button>
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          router.push('/auth/signup')
                        }}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        新規登録
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header