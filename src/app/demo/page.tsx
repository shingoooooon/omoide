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
import { getDemoGrowthRecords, getDemoStorybook, getDemoAlbums, getDemoPhotos } from '@/lib/demoData'

type DemoView = 'overview' | 'timeline' | 'albums' | 'storybook'

export default function DemoPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useTranslations(locale)
  const [currentView, setCurrentView] = useState<DemoView>('overview')
  const [selectedAlbum, setSelectedAlbum] = useState<{
    id: string;
    title: string;
    description: string;
    photos: unknown[];
    createdAt: Date;
    coverPhoto: unknown;
  } | null>(null)

  const demoAlbums = getDemoAlbums(locale)
  const demoGrowthRecords = getDemoGrowthRecords(locale)
  const demoStorybook = getDemoStorybook(locale)
  const demoPhotos = getDemoPhotos(locale)

  const renderContent = () => {
    switch (currentView) {
      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t('demo.timeline.title')}</h2>
              <p className="text-neutral-600">{t('demo.timeline.description')}</p>
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t('demo.albums.title')}</h2>
              <p className="text-neutral-600">{t('demo.albums.description')}</p>
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">{t('demo.storybook.title')}</h2>
              <p className="text-neutral-600">{t('demo.storybook.description')}</p>
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
                {t('demo.experience')}
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                {t('demo.title')}
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                {t('demo.subtitle')}
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card 
                className="text-center p-8 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => setCurrentView('timeline')}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="calendar" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {t('demo.timeline.title')}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {t('demo.timeline.description')}
                </p>
                <Button variant="outline" size="sm">
                  {t('demo.timeline.button')}
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
                  {t('demo.albums.title')}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {t('demo.albums.description')}
                </p>
                <Button variant="outline" size="sm">
                  {t('demo.albums.button')}
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
                  {t('demo.storybook.title')}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {t('demo.storybook.description')}
                </p>
                <Button variant="outline" size="sm">
                  {t('buttons.readStorybook')}
                </Button>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 border-primary-100 p-8 text-center">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                {t('demo.cta.title')}
              </h2>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                {t('demo.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => router.push('/auth/login')}
                >
                  <Icon name="camera" size="sm" className="mr-2" />
                  {t('demo.cta.getStarted')}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/')}
                >
                  {t('demo.cta.backHome')}
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
              {t('demo.backToOverview')}
            </Button>
          </div>
        )}

        {renderContent()}
      </div>
    </Layout>
  )
}