export type Locale = 'ja' | 'en'

export const translations = {
  ja: {
    common: {
      loading: "読み込み中...",
      error: "エラーが発生しました",
      success: "成功しました",
      cancel: "キャンセル",
      save: "保存",
      delete: "削除",
      edit: "編集",
      close: "閉じる"
    },
    navigation: {
      home: "ホーム",
      timeline: "タイムライン",
      storybooks: "えほん",
      profile: "プロフィール",
      settings: "設定"
    },
    auth: {
      signIn: "サインイン",
      signUp: "サインアップ",
      signOut: "サインアウト",
      signInWithGoogle: "Googleでサインイン",
      createAccount: "アカウント作成",
      fullName: "お名前",
      email: "メールアドレス",
      password: "パスワード",
      confirmPassword: "パスワード確認",
      forgotPassword: "パスワードを忘れた方",
      alreadyHaveAccount: "すでにアカウントをお持ちですか？ サインイン",
      noAccount: "アカウントをお持ちでない方は こちら",
      errors: {
        invalidEmail: "有効なメールアドレスを入力してください",
        weakPassword: "パスワードは6文字以上で入力してください",
        emailInUse: "このメールアドレスは既に使用されています",
        userNotFound: "このメールアドレスのアカウントが見つかりません",
        wrongPassword: "パスワードが正しくありません",
        authFailed: "認証に失敗しました。もう一度お試しください",
        googleSignInFailed: "Googleサインインに失敗しました。もう一度お試しください",
        requiredFields: "メールアドレスとパスワードを入力してください",
        requiredName: "お名前を入力してください"
      }
    },
    home: {
      title: "子どもの成長を美しい物語に",
      subtitle: "写真をアップロードするだけで、AIが自動的に成長記録とコメントを生成し、かけがえのない思い出を絵本として残すことができます。",
      uploadPhotos: "写真をアップロード",
      viewDemo: "デモを見る",
      features: {
        upload: {
          title: "かんたんアップロード",
          description: "写真を選ぶだけで、お子さまの成長記録を始められます。ドラッグ&ドロップにも対応。"
        },
        ai: {
          title: "AI自動生成",
          description: "最新のAI技術で写真を解析し、心温まる成長コメントを自動生成します。"
        },
        storybook: {
          title: "絵本作成",
          description: "月ごとの成長記録から、オリジナルの絵本を自動作成。音声読み上げ機能付き。"
        }
      },
      howItWorks: {
        title: "使い方はとってもシンプル",
        subtitle: "3つのステップで、お子さまの成長を美しい物語に変えることができます",
        steps: {
          upload: {
            title: "写真をアップロード",
            description: "お子さまの写真を選んでアップロードします"
          },
          analyze: {
            title: "AIが自動解析",
            description: "AIが写真を解析し、成長コメントを生成します"
          },
          create: {
            title: "絵本を作成",
            description: "月ごとの記録から美しい絵本を自動作成します"
          }
        }
      },
      cta: {
        title: "今すぐ始めませんか？",
        subtitle: "無料で始めて、お子さまの大切な瞬間を美しい物語として残しましょう。",
        getStarted: "無料で始める"
      }
    },
    footer: {
      brand: {
        title: "Omoide",
        description: "AIが作る、子どもの成長物語。写真から始まる、かけがえのない思い出。"
      },
      quickLinks: "クイックリンク",
      support: "サポート",
      help: "ヘルプ",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      copyright: "All rights reserved.",
      madeWith: "Made with ❤️ for families"
    }
  },
  en: {
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close"
    },
    navigation: {
      home: "Home",
      timeline: "Timeline",
      storybooks: "Storybooks",
      profile: "Profile",
      settings: "Settings"
    },
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
      signInWithGoogle: "Sign in with Google",
      createAccount: "Create Account",
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      alreadyHaveAccount: "Already have an account? Sign in",
      noAccount: "Don't have an account? Sign up",
      errors: {
        invalidEmail: "Please enter a valid email address",
        weakPassword: "Password should be at least 6 characters",
        emailInUse: "An account with this email already exists",
        userNotFound: "No account found with this email address",
        wrongPassword: "Incorrect password",
        authFailed: "Authentication failed. Please try again",
        googleSignInFailed: "Google sign-in failed. Please try again",
        requiredFields: "Please enter your email and password",
        requiredName: "Please enter your full name"
      }
    },
    home: {
      title: "Turn Your Child's Growth into Beautiful Stories",
      subtitle: "Simply upload photos and let AI automatically generate growth records and comments, then create beautiful storybooks to preserve precious memories.",
      uploadPhotos: "Upload Photos",
      viewDemo: "View Demo",
      features: {
        upload: {
          title: "Easy Upload",
          description: "Simply select photos to start recording your child's growth journey. Drag & drop supported."
        },
        ai: {
          title: "AI Generation",
          description: "AI analyzes photos and automatically generates heartwarming comments using the latest technology."
        },
        storybook: {
          title: "Storybook Creation",
          description: "Create original storybooks from monthly growth records with voice narration feature."
        }
      },
      howItWorks: {
        title: "How It Works - Simple Steps",
        subtitle: "Transform your child's growth into beautiful stories in just 3 steps",
        steps: {
          upload: {
            title: "Upload Photos",
            description: "Select and upload your child's photos"
          },
          analyze: {
            title: "AI Analysis",
            description: "AI analyzes photos and generates growth comments"
          },
          create: {
            title: "Create Storybook",
            description: "Beautiful storybooks are automatically created from monthly records"
          }
        }
      },
      cta: {
        title: "Ready to Start Your Journey?",
        subtitle: "Get started for free and preserve your child's precious moments as beautiful stories.",
        getStarted: "Get Started Free"
      }
    },
    footer: {
      brand: {
        title: "Omoide",
        description: "AI-powered child growth stories. Precious memories starting from photos."
      },
      quickLinks: "Quick Links",
      support: "Support",
      help: "Help",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      copyright: "All rights reserved.",
      madeWith: "Made with ❤️ for families"
    }
  }
} as const

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.')
  let value: unknown = translations[locale]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

export function useTranslations(locale: Locale) {
  return {
    t: (key: string) => getTranslation(locale, key),
    translations: translations[locale]
  }
}