'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type Locale = 'ja' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

interface LocaleProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ 
  children, 
  initialLocale = 'ja' 
}) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const router = useRouter()
  const pathname = usePathname()

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'ja' || savedLocale === 'en')) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    
    // Update URL with new locale
    const currentPath = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    router.push(`/${newLocale}${currentPath}`)
  }

  const toggleLocale = () => {
    const newLocale = locale === 'ja' ? 'en' : 'ja'
    setLocale(newLocale)
  }

  const value: LocaleContextType = {
    locale,
    setLocale,
    toggleLocale
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}