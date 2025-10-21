import React from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-primary-50 to-secondary-50 border-t border-primary-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                思
              </div>
              <h3 className="text-lg font-display font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Omoide
              </h3>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              AIが作る、子どもの成長物語。<br />
              写真から始まる、かけがえのない思い出。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-800">クイックリンク</h4>
            <div className="space-y-2">
              <Link 
                href="/" 
                className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                ホーム
              </Link>
              <Link 
                href="/timeline" 
                className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                タイムライン
              </Link>
              <Link 
                href="/storybooks" 
                className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                えほん一覧
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-800">サポート</h4>
            <div className="space-y-2">
              <Link 
                href="/help" 
                className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                ヘルプ
              </Link>
              <Link 
                href="/privacy" 
                className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                プライバシーポリシー
              </Link>
              <Link 
                href="/terms" 
                className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
              >
                利用規約
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-100">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-neutral-500">
              © {currentYear} Omoide. All rights reserved.
            </p>
            <p className="text-xs text-neutral-500 flex items-center gap-1">
              Made with <Icon name="heart" size="sm" className="text-red-500" solid /> for families
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer