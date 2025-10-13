'use client'

import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown' | 'toggle'
  className?: string
}

export function LanguageSwitcher({ variant = 'toggle', className }: LanguageSwitcherProps) {
  const { locale, setLocale, toggleLocale } = useLocale()

  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleLocale}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50 text-neutral-600 hover:text-primary-700',
          className
        )}
        title={locale === 'ja' ? 'Switch to English' : '日本語に切り替え'}
      >
        <span className="text-base">🌐</span>
        <span className="font-semibold">
          {locale === 'ja' ? 'EN' : 'JP'}
        </span>
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as 'ja' | 'en')}
          className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-neutral-700 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        >
          <option value="ja">🇯🇵 日本語</option>
          <option value="en">🇺🇸 English</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex space-x-1', className)}>
      <Button
        variant={locale === 'ja' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setLocale('ja')}
        className="text-xs"
      >
        🇯🇵 JP
      </Button>
      <Button
        variant={locale === 'en' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setLocale('en')}
        className="text-xs"
      >
        🇺🇸 EN
      </Button>
    </div>
  )
}

export default LanguageSwitcher