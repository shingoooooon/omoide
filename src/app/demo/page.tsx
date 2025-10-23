'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Layout } from '@/components/layout/Layout'
import { Button, Card, Badge } from '@/components/ui'
import { Timeline } from '@/components/timeline/Timeline'
import { AlbumView } from '@/components/album/AlbumView'
import { StorybookViewer } from '@/components/storybook/StorybookViewer'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from '@/lib/translations'
import { Icon } from '@/components/ui/Icon'
import { demoGrowthRecords, demoStorybook, getDemoAlbums, demoPhotos } from '@/lib/demoData'

type DemoView = 'overview' | 'timeline' | 'albums' | 'storybook'

export default function DemoPage() {
  const router = useRouter()
  const { locale } = useLocale()
  // const { t } = useTranslations(locale)
  const [currentView, setCurrentView] = useState<DemoView>('overview')
  const [selectedAlbum, setSelectedAlbum] = useState<{
    id: string;
    title: string;
    description: string;
    photos: any[];
    createdAt: Date;
    coverPhoto: any;
  } | null>(null)

  const demoAlbums = getDemoAlbums()

  const renderContent = () => {
    switch (currentView) {
      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">成長タイムライン</h2>
              <p className="text-neutral-600">AIが自動生成した成長記録とコメント</p>
            </div>
            <Timeline 
              records={demoGrowthRecords}
              isDemo={true}
            />
          </div>
        )
      
      case 'albums':
        // デモ用のアルバムを作成（コメント付きの写真を含む）
        const demoAlbum = {
          id: 'demo-album-all',
          title: 'デモアルバム - 成長の記録',
          description: '子どもの成長を美しく記録したアルバム',
          photos: demoPhotos, // コメント付きのdemoPhotosを直接使用
          createdAt: new Date(),
          coverPhoto: demoPhotos[0]
        }
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">フォトアルバム</h2>
              <p className="text-neutral-600">思い出を美しく整理したアルバム</p>
            </div>
            <AlbumView 
              album={demoAlbum}
              isDemo={true}
            />
          </div>
        )
      
      case 'storybook':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">AI絵本</h2>
              <p className="text-neutral-600">成長記録から自動生成された絵本</p>
            </div>
            <StorybookViewer 
              storybook={demoStorybook}
              isDemo={true}
            />
          </div>
        )
      
      default:
        return (
          <div className="space-y-12">
            {/* Demo Introduction */}
            <div className="text-center">
              <Badge variant="primary" className="mb-4">
                <Icon name="sparkles" size="sm" className="mr-2" />
                デモ体験
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                Omoideの機能をお試しください
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                実際のサンプルデータを使って、AIが生成する成長記録、アルバム、絵本をご覧いただけます
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card 
                className="text-center p-8 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => setCurrentView('timeline')}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="clock" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  成長タイムライン
                </h3>
                <p className="text-neutral-600 mb-4">
                  AIが写真を解析して自動生成した成長記録とコメント
                </p>
                <Button variant="outline" size="sm">
                  タイムラインを見る
                </Button>
              </Card>

              <Card 
                className="text-center p-8 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => setCurrentView('albums')}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="photo" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  フォトアルバム
                </h3>
                <p className="text-neutral-600 mb-4">
                  思い出を美しく整理したデジタルアルバム
                </p>
                <Button variant="outline" size="sm">
                  アルバムを見る
                </Button>
              </Card>

              <Card 
                className="text-center p-8 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => setCurrentView('storybook')}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="book" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  AI絵本
                </h3>
                <p className="text-neutral-600 mb-4">
                  成長記録から自動生成された美しい絵本
                </p>
                <Button variant="outline" size="sm">
                  絵本を読む
                </Button>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 border-primary-100 p-8 text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                あなたの思い出も美しく残しませんか？
              </h2>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                無料でアカウントを作成して、お子様の成長記録を始めましょう
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => router.push('/auth/login')}
                >
                  <Icon name="camera" size="sm" className="mr-2" />
                  今すぐ始める
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/')}
                >
                  ホームに戻る
                </Button>
              </div>
            </Card>
          </div>
        )
    }
  }

  return (
    <Layout requireAuth={false}>
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        {currentView !== 'overview' && (
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('overview')}
              className="mb-4"
            >
              <Icon name="arrow-left" size="sm" className="mr-2" />
              デモ概要に戻る
            </Button>
          </div>
        )}

        {renderContent()}
      </div>
    </Layout>
  )
}