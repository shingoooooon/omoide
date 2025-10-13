'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card, Input } from '@/components/ui'

const LoginForm: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      await signInWithGoogle()
    } catch {
      setError('Googleサインインに失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。')
      return
    }

    if (isSignUp && !displayName) {
      setError('お名前を入力してください。')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      const error = err as { code?: string }
      if (error.code === 'auth/user-not-found') {
        setError('このメールアドレスのアカウントが見つかりません。')
      } else if (error.code === 'auth/wrong-password') {
        setError('パスワードが正しくありません。')
      } else if (error.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています。')
      } else if (error.code === 'auth/weak-password') {
        setError('パスワードは6文字以上で入力してください。')
      } else if (error.code === 'auth/invalid-email') {
        setError('有効なメールアドレスを入力してください。')
      } else {
        setError('認証に失敗しました。もう一度お試しください。')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="elevated" className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            思
          </div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Omoide
          </h1>
        </div>
        <p className="text-neutral-600 leading-relaxed">
          子どもの成長を記録し、美しい絵本を作成しましょう
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm flex items-start space-x-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-5 mb-6">
        {isSignUp && (
          <Input
            type="text"
            label="お名前"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="山田 太郎"
            disabled={loading}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        )}
        
        <Input
          type="email"
          label="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          disabled={loading}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />
        
        <Input
          type="password"
          label="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6文字以上"
          disabled={loading}
          helperText={isSignUp ? "6文字以上で入力してください" : undefined}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
          isLoading={loading}
        >
          {isSignUp ? 'アカウント作成' : 'サインイン'}
        </Button>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-neutral-500">または</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center space-x-2"
        disabled={loading}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Googleでサインイン</span>
      </Button>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium"
          disabled={loading}
        >
          {isSignUp ? 'すでにアカウントをお持ちですか？ サインイン' : 'アカウントをお持ちでない方は こちら'}
        </button>
      </div>
    </Card>
  )
}

export default LoginForm