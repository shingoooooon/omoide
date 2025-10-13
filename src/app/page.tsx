'use client'

import { Layout } from '@/components/layout/Layout'
import { Button, Card, Badge } from '@/components/ui'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from '@/lib/translations'

export default function Home() {
  const { locale } = useLocale()
  const { t } = useTranslations(locale)

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <Badge variant="primary" className="mb-6 text-sm font-medium">
            ✨ {t('home.title')}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6 leading-tight">
            {t('home.title')}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-4 shadow-medium hover:shadow-large">
              📸 {t('home.uploadPhotos')}
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              {t('home.viewDemo')}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card variant="elevated" className="text-center p-8 hover:shadow-large transition-all duration-300 group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
              <span className="text-3xl">📷</span>
            </div>
            <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">
              {t('home.features.upload.title')}
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              {t('home.features.upload.description')}
            </p>
          </Card>

          <Card variant="elevated" className="text-center p-8 hover:shadow-large transition-all duration-300 group">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">
              {t('home.features.ai.title')}
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              {t('home.features.ai.description')}
            </p>
          </Card>

          <Card variant="elevated" className="text-center p-8 hover:shadow-large transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">
              {t('home.features.storybook.title')}
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              {t('home.features.storybook.description')}
            </p>
          </Card>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: t('home.howItWorks.steps.upload.title'),
                description: t('home.howItWorks.steps.upload.description'),
                icon: '📤'
              },
              {
                step: '2',
                title: t('home.howItWorks.steps.analyze.title'),
                description: t('home.howItWorks.steps.analyze.description'),
                icon: '✨'
              },
              {
                step: '3',
                title: t('home.howItWorks.steps.create.title'),
                description: t('home.howItWorks.steps.create.description'),
                icon: '📖'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mb-4 relative">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 border-primary-100 p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
              {t('home.cta.subtitle')}
            </p>
            <Button size="lg" className="text-lg px-10 py-4 shadow-medium hover:shadow-large">
              {t('home.cta.getStarted')}
            </Button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-primary-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-secondary-100 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-accent-100 rounded-full opacity-30"></div>
        </Card>
      </div>
    </Layout>
  )
}