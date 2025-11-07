'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Layout } from '@/components/layout/Layout'
import { Button, Card, Badge } from '@/components/ui'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from '@/lib/translations'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/ui/Icon'

export default function Home() {
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useTranslations(locale)
  const { user, loading } = useAuth()

  // Memoize split text to avoid hydration mismatch
  const titleLines = React.useMemo(() => t('home.hero.title').split('\n'), [t])
  const subtitleLines = React.useMemo(() => t('home.hero.subtitle').split('\n'), [t])

  return (
    <Layout requireAuth={false} fullWidth={true}>
      {/* Hero Section with Background Image */}
      <main id="main-content" className="relative min-h-screen overflow-hidden">
        {/* Background Image - Right side safe zone */}
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/bg2.png"
            alt=""
            fill
            className="object-cover object-right"
            priority
          />
          {/* Gradient overlay for text readability on left side */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
        </div>

        {/* Content - Left aligned with safe zone */}
        <div className="relative z-10 min-h-screen pt-24 sm:pt-32 lg:pt-40 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                {titleLines.map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < titleLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-white/95 mb-8 leading-relaxed drop-shadow-lg max-w-xl">
                {subtitleLines.map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < subtitleLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>

              {/* Action Buttons - Only show for non-authenticated users */}
              {!loading && !user && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6" role="group" aria-label="アクションボタン">
                  {/* Primary CTA */}
                  <Button
                    size="lg"
                    className="bg-white text-neutral-900 hover:bg-white/90 hover:scale-105 px-8 py-6 text-lg font-bold shadow-2xl transition-all duration-200 min-h-[44px]"
                    onClick={() => router.push('/auth/login')}
                  >
                    <Icon name="camera" className="w-6 h-6 mr-2" />
                    {t('home.hero.getStarted')}
                  </Button>

                  {/* Secondary CTA - Text link style */}
                  <button
                    className="text-white/90 hover:text-white underline underline-offset-4 text-base font-medium transition-colors duration-200 min-h-[44px] px-4"
                    onClick={() => router.push('/demo')}
                  >
                    {t('home.hero.viewDemo')} →
                  </button>
                </div>
              )}

              {/* Welcome message for authenticated users */}
              {!loading && user && (
                <div>
                  <p className="text-xl text-white/95 mb-6 drop-shadow-lg">
                    {t('home.hero.welcome').replace('{name}', user.displayName || user.email || '')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Primary CTA */}
                    <Button
                      size="lg"
                      className="bg-white text-neutral-900 hover:bg-white/90 hover:scale-105 px-8 py-6 text-lg font-bold shadow-2xl transition-all duration-200 min-h-[44px]"
                      onClick={() => router.push('/upload')}
                    >
                      <Icon name="camera" className="w-6 h-6 mr-2" />
                      {t('home.hero.uploadPhotos')}
                    </Button>

                    {/* Secondary CTA */}
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/50 hover:bg-white/20 px-8 py-6 text-lg font-semibold min-h-[44px]"
                      onClick={() => router.push('/timeline')}
                    >
                      <Icon name="calendar" className="w-5 h-5 mr-2" />
                      {t('home.hero.viewTimeline')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="camera" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                {t('home.features.upload.title')}
              </h3>
              <p className="text-neutral-600">
                {t('home.features.upload.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="sparkles" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                {t('home.features.ai.title')}
              </h3>
              <p className="text-neutral-600">
                {t('home.features.ai.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="book" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                {t('home.features.storybook.title')}
              </h3>
              <p className="text-neutral-600">
                {t('home.features.storybook.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Only show for non-authenticated users */}
      {!loading && !user && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg font-bold shadow-lg hover:scale-105 transition-all duration-200 min-h-[44px]"
                onClick={() => router.push('/auth/login')}
              >
                <Icon name="camera" className="w-6 h-6 mr-2" />
                {t('home.cta.getStarted')}
              </Button>
              <button
                className="text-primary-600 hover:text-primary-700 underline underline-offset-4 text-base font-medium transition-colors duration-200 min-h-[44px] px-4"
                onClick={() => router.push('/demo')}
              >
                {t('home.hero.viewDemo')} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Section for authenticated users */}
      {!loading && user && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                {t('home.quickActions.title')}
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                {t('home.quickActions.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                className="text-center p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => router.push('/upload')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="camera" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {t('home.quickActions.upload')}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t('home.quickActions.uploadDesc')}
                </p>
              </Card>

              <Card
                className="text-center p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => router.push('/timeline')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="calendar" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {t('home.quickActions.timeline')}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t('home.quickActions.timelineDesc')}
                </p>
              </Card>

              <Card
                className="text-center p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => router.push('/albums')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="book" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {t('home.quickActions.albums')}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t('home.quickActions.albumsDesc')}
                </p>
              </Card>

              <Card
                className="text-center p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => router.push('/storybooks')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="bookmark" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {t('home.quickActions.storybooks')}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {t('home.quickActions.storybooksDesc')}
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}