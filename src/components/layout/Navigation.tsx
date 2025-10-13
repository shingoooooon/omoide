'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: string
  description?: string
}

interface NavigationProps {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

export function Navigation({ 
  items, 
  orientation = 'horizontal', 
  variant = 'default',
  className 
}: NavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const baseStyles = {
    horizontal: 'flex space-x-1',
    vertical: 'flex flex-col space-y-1'
  }

  const itemStyles = {
    default: {
      base: 'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
      active: 'bg-primary-100 text-primary-700 shadow-soft',
      inactive: 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
    },
    pills: {
      base: 'flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
      active: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-medium',
      inactive: 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50'
    },
    underline: {
      base: 'flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2',
      active: 'text-primary-700 border-primary-500',
      inactive: 'text-neutral-600 hover:text-primary-700 border-transparent hover:border-primary-200'
    }
  }

  return (
    <nav className={cn(baseStyles[orientation], className)}>
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            itemStyles[variant].base,
            isActive(item.href) 
              ? itemStyles[variant].active 
              : itemStyles[variant].inactive
          )}
          title={item.description}
        >
          <span className={orientation === 'horizontal' ? 'text-base' : 'text-lg'}>
            {item.icon}
          </span>
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}

export default Navigation