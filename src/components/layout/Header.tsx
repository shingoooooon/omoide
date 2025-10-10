'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-secondary-500">
            <span className="text-lg font-bold text-white">O</span>
          </div>
          <span className="text-xl font-bold text-neutral-900">Omoide</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/timeline" 
            className="text-neutral-600 hover:text-primary-600 transition-colors"
          >
            Timeline
          </Link>
          <Link 
            href="/storybooks" 
            className="text-neutral-600 hover:text-primary-600 transition-colors"
          >
            Storybooks
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}