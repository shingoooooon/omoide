'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from '@/lib/translations'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Layout } from '@/components/layout/Layout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const { locale } = useLocale()
  const { t } = useTranslations(locale)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError(t('auth.errors.requiredFields'))
      return
    }

    try {
      setLoading(true)
      setError('')
      await signInWithEmail(email, password)
      router.push('/')
    } catch (error: any) {
      setError(t('auth.errors.authFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      await signInWithGoogle()
      router.push('/')
    } catch (error: any) {
      setError(t('auth.errors.googleSignInFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout requireAuth={false}>
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/omoide-icon.svg"
                alt="Omoide"
                width={48}
                height={48}
                className="w-full h-full rounded-md"
              />
            </div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent ml-3">
              Omoide
            </h1>
          </div>
          <p className="text-lg text-neutral-600">
            {locale === 'ja' ? '子どもの成長を記録し、美しい絵本を作成しましょう' : 'Record your child\'s growth and create beautiful storybooks'}
          </p>
        </div>

        <Card>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={locale === 'ja' ? '6文字以上' : '6+ characters'}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-lg font-medium"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-neutral-300"></div>
            <span className="px-4 text-neutral-500 text-sm">{locale === 'ja' ? 'または' : 'or'}</span>
            <div className="flex-1 border-t border-neutral-300"></div>
          </div>

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full py-3 text-lg font-medium"
            disabled={loading}
            size="lg"
          >
            <Icon name="google" className="w-5 h-5 mr-3" />
            {t('auth.signInWithGoogle')}
          </Button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              {t('auth.noAccount')}{' '}
              <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                {locale === 'ja' ? 'こちら' : 'here'}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}