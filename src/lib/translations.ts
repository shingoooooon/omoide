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
      upload: "アップロード",
      timeline: "タイムライン",
      albums: "アルバム",
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
    timeline: {
      title: "成長の記録",
      memories: "件の思い出",
      noRecords: "まだ記録がありません",
      noRecordsDescription: "最初の写真をアップロードして、成長記録を始めましょう！",
      loadMore: "もっと見る",
      loading: "読み込み中...",
      allRecordsShown: "すべての記録を表示しました",
      loadError: "記録の読み込みに失敗しました。もう一度お試しください。",
      retry: "再試行"
    },
    storybooks: {
      title: "作った絵本",
      count: "冊の絵本があります",
      createNew: "新しい絵本を作る",
      createStorybook: "絵本を作る",
      view: "見る",
      delete: "削除",
      pages: "ページ",
      createdDate: "作成日",
      noStorybooks: "まだ絵本がありません",
      noStorybooksDescription: "写真をアップロードして、最初の絵本を作ってみましょう",
      loadingStorybooks: "絵本を読み込み中...",
      loadError: "絵本の読み込みに失敗しました",
      deleteError: "絵本の削除に失敗しました",
      deleteConfirmTitle: "絵本を削除",
      deleteConfirmMessage: "本当に削除しますか？",
      deleteConfirmDescription: "この操作は取り消せません",
      deleting: "削除中...",
      generator: {
        title: "新しい絵本を作る",
        backToList: "絵本一覧に戻る",
        selectMonth: "絵本を作る月を選択してください",
        checkingStatus: "ステータスを確認中...",
        alreadyExists: "の絵本は既に作成済みです",
        alreadyExistsDescription: "既存の絵本をご覧いただくか、別の月の絵本を作成してください。",
        cannotCreate: "の絵本を作成できません",
        noRecordsMessage: "まず写真をアップロードして成長記録を作成してください。",
        noCommentsMessage: "写真にコメントを生成してから絵本を作成してください。",
        generating: "絵本を作成中...",
        generatingNote: "この処理には数分かかる場合があります",
        error: "エラーが発生しました",
        tryAgain: "もう一度試す",
        completed: "絵本が完成しました！",
        completedMessage: "が作成されました",
        viewStorybook: "絵本を見る",
        createAnother: "別の月の絵本を作る",
        prompt: "の絵本を作りませんか？",
        promptDescription: "今月の成長記録から、AIが素敵な絵本を作成します"
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
      upload: "Upload",
      timeline: "Timeline",
      albums: "Albums",
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
    timeline: {
      title: "Growth Records",
      memories: "memories",
      noRecords: "No records yet",
      noRecordsDescription: "Upload your first photo to start recording growth memories!",
      loadMore: "Load More",
      loading: "Loading...",
      allRecordsShown: "All records displayed",
      loadError: "Failed to load records. Please try again.",
      retry: "Retry"
    },
    storybooks: {
      title: "My Storybooks",
      count: "storybooks available",
      createNew: "Create New Storybook",
      createStorybook: "Create Storybook",
      view: "View",
      delete: "Delete",
      pages: "pages",
      createdDate: "Created",
      noStorybooks: "No storybooks yet",
      noStorybooksDescription: "Upload photos and create your first storybook",
      loadingStorybooks: "Loading storybooks...",
      loadError: "Failed to load storybooks",
      deleteError: "Failed to delete storybook",
      deleteConfirmTitle: "Delete Storybook",
      deleteConfirmMessage: "Are you sure you want to delete this?",
      deleteConfirmDescription: "This action cannot be undone",
      deleting: "Deleting...",
      generator: {
        title: "Create New Storybook",
        backToList: "Back to Storybooks",
        selectMonth: "Select month to create storybook",
        checkingStatus: "Checking status...",
        alreadyExists: "storybook already exists",
        alreadyExistsDescription: "View the existing storybook or create one for a different month.",
        cannotCreate: "cannot create storybook",
        noRecordsMessage: "Please upload photos and create growth records first.",
        noCommentsMessage: "Please generate comments for photos before creating storybook.",
        generating: "Creating storybook...",
        generatingNote: "This process may take a few minutes",
        error: "An error occurred",
        tryAgain: "Try Again",
        completed: "Storybook completed!",
        completedMessage: "has been created",
        viewStorybook: "View Storybook",
        createAnother: "Create Another Month",
        prompt: "Create storybook for",
        promptDescription: "AI will create a beautiful storybook from this month's growth records"
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