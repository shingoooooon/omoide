'use client'

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

  return (
    <Layout requireAuth={false} fullWidth={true}>
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/bg2.png"
            alt="background image"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                子どもの成長を<br />
                いつでも、どこでも、<br />
                いつまでも
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                写真をアップロードするだけで、AIが自動で成長記録を作成。<br />
                家族で楽しく会話したり成長を心ゆくまで記録できます。
              </p>

              {/* Action Buttons - Only show for non-authenticated users */}
              {!loading && !user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-neutral-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg"
                    onClick={() => router.push('/auth/login')}
                  >
                    <Icon name="camera" className="w-5 h-5 mr-2" />
                    今すぐ始める
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-8 py-4 text-lg"
                    onClick={() => router.push('/demo')}
                  >
                    デモを見る
                  </Button>
                </div>
              )}

              {/* Welcome message for authenticated users */}
              {!loading && user && (
                <div className="text-center">
                  <p className="text-xl text-white/90 mb-6 drop-shadow-md">
                    おかえりなさい、{user.displayName || user.email}さん
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-white text-neutral-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg"
                      onClick={() => router.push('/upload')}
                    >
                      <Icon name="camera" className="w-5 h-5 mr-2" />
                      写真をアップロード
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-8 py-4 text-lg"
                      onClick={() => router.push('/timeline')}
                    >
                      <Icon name="calendar" className="w-5 h-5 mr-2" />
                      タイムラインを見る
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              子どもの成長を記録する新しい方法
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              AIが写真から自動で成長記録を作成し、家族みんなで思い出を共有できます
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="camera" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                かんたんアップロード
              </h3>
              <p className="text-neutral-600">
                スマホで撮った写真をそのままアップロード。面倒な整理は不要です。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="sparkles" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                AI自動解析
              </h3>
              <p className="text-neutral-600">
                AIが写真を解析して、成長の瞬間を自動で記録。コメントも自動生成します。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icon name="book" className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                美しい絵本作成
              </h3>
              <p className="text-neutral-600">
                成長記録から自動で絵本を作成。家族の宝物になる思い出の本ができます。
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
              今すぐ始めてみませんか？
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              無料でアカウントを作成して、お子様の成長記録を美しく残しましょう
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={() => router.push('/auth/login')}
              >
                <Icon name="camera" className="w-5 h-5 mr-2" />
                今すぐ始める
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
                onClick={() => router.push('/demo')}
              >
                デモを見る
              </Button>
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
                何をしますか？
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                お子様の成長記録を作成・管理できます
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
                  写真アップロード
                </h3>
                <p className="text-neutral-600 text-sm">
                  新しい写真を追加
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
                  タイムライン
                </h3>
                <p className="text-neutral-600 text-sm">
                  成長記録を確認
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
                  アルバム
                </h3>
                <p className="text-neutral-600 text-sm">
                  写真を整理
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
                  絵本
                </h3>
                <p className="text-neutral-600 text-sm">
                  AI絵本を作成
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}