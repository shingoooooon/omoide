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

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const { locale } = useLocale()
  const { t } = useTranslations(locale)
  const router = useRouter()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !displayName) {
      setError(t('auth.errors.requiredName'))
      return
    }

    if (password !== confirmPassword) {
      setError(locale === 'ja' ? 'パスワードが一致しません' : 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError(t('auth.errors.weakPassword'))
      return
    }

    try {
      setLoading(true)
      setError('')
      await signUpWithEmail(email, password, displayName)
      router.push('/')
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError(t('auth.errors.emailInUse'))
      } else if (error.code === 'auth/weak-password') {
        setError(t('auth.errors.weakPassword'))
      } else {
        setError('アカウント作成に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)
      setError('')
      await signInWithGoogle()
      router.push('/')
    } catch (error: any) {
      setError('Googleアカウントでの登録に失敗しました')
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
            アカウントを作成して、成長記録を始めましょう
          </p>
        </div>

        <Card>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-2">
                お名前
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="山田太郎"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                メールアドレス
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
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワードを再入力"
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
                'アカウント作成'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-neutral-300"></div>
            <span className="px-4 text-neutral-500 text-sm">または</span>
            <div className="flex-1 border-t border-neutral-300"></div>
          </div>

          {/* Google Sign Up */}
          <Button
            onClick={handleGoogleSignUp}
            variant="outline"
            className="w-full py-3 text-lg font-medium"
            disabled={loading}
            size="lg"
          >
            <Icon name="google" className="w-5 h-5 mr-3" />
            Googleでアカウント作成
          </Button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              既にアカウントをお持ちの方は{' '}
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                こちら
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}