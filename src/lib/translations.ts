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
      viewDemo: "デモを見る",
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
        title: "今すぐ始めてみませんか？",
        subtitle: "無料でアカウントを作成して、お子様の成長記録を美しく残しましょう",
        getStarted: "今すぐ始める"
      },
      hero: {
        title: "いつもの写真が\nはじめての物語になる。",
        subtitle: "写真をアップロードするだけで、AIが自動で成長記録を作成。\n家族で楽しく会話したり成長を心ゆくまで記録できます。",
        getStarted: "今すぐ始める",
        viewDemo: "デモを見る",
        welcome: "おかえりなさい、{name}さん",
        uploadPhotos: "写真をアップロード",
        viewTimeline: "タイムラインを見る"
      },
      features: {
        title: "子どもの成長を記録する新しい方法",
        subtitle: "AIが写真から自動で成長記録を作成し、家族みんなで思い出を共有できます",
        upload: {
          title: "かんたんアップロード",
          description: "スマホで撮った写真をそのままアップロード。面倒な整理は不要です。"
        },
        ai: {
          title: "AI自動解析",
          description: "AIが写真を解析して、成長の瞬間を自動で記録。コメントも自動生成します。"
        },
        storybook: {
          title: "美しい絵本作成",
          description: "成長記録から自動で絵本を作成。家族の宝物になる思い出の本ができます。"
        }
      },
      quickActions: {
        title: "何をしますか？",
        subtitle: "お子様の成長記録を作成・管理できます",
        upload: "写真アップロード",
        uploadDesc: "新しい写真を追加",
        timeline: "タイムライン",
        timelineDesc: "成長記録を確認",
        albums: "アルバム",
        albumsDesc: "写真を整理",
        storybooks: "絵本",
        storybooksDesc: "AI絵本を作成"
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
    demo: {
      title: "Omoideの機能をお試しください",
      subtitle: "実際のサンプルデータを使って、AIが生成する成長記録、アルバム、絵本をご覧いただけます",
      experience: "デモ体験",
      timeline: {
        title: "成長タイムライン",
        description: "AIが写真を解析して自動生成した成長記録とコメント",
        button: "タイムラインを見る"
      },
      albums: {
        title: "フォトアルバム",
        description: "思い出を美しく整理したデジタルアルバム",
        button: "アルバムを見る"
      },
      storybook: {
        title: "AI絵本",
        description: "成長記録から自動生成された美しい絵本",
        button: "絵本を読む"
      },
      cta: {
        title: "あなたの思い出も美しく残しませんか？",
        subtitle: "無料でアカウントを作成して、お子様の成長記録を始めましょう",
        getStarted: "今すぐ始める",
        backHome: "ホームに戻る"
      },
      backToOverview: "デモ概要に戻る"
    },
    buttons: {
      login: "ログイン",
      signup: "新規登録",
      switchToJapanese: "日本語に切り替え",
      switchToEnglish: "Switch to English",
      readStorybook: "絵本を読む"
    },
    upload: {
      title: "写真をアップロード",
      subtitle: "お子様の写真をアップロードして、成長記録を作成しましょう",
      dragDrop: "ファイルをドラッグ&ドロップするか、クリックして選択してください",
      selectFiles: "ファイルを選択",
      supportedFormats: "対応形式: JPEG, PNG, WebP",
      maxFileSize: "最大ファイルサイズ",
      maxFiles: "最大枚数",
      uploadError: "アップロードエラー",
      validationError: "検証エラー",
      notice: "注意事項",
      selectedPhotos: "選択された写真",
      uploading: "写真をアップロード中",
      uploadComplete: "アップロード完了",
      uploadFailed: "アップロードに失敗しました",
      removePhoto: "写真を削除",
      uploadWaiting: "アップロード待機中"
    },
    albums: {
      title: "フォトアルバム",
      noAlbums: "まだアルバムがありません",
      noAlbumsDescription: "写真をアップロードして、最初のアルバムを作成しましょう",
      createAlbum: "アルバムを作成",
      viewAlbum: "アルバムを見る",
      photos: "枚の写真",
      createdAt: "作成日"
    },
    timelineCard: {
      viewDetails: "詳細を見る",
      generateComment: "コメントを生成するには詳細を開いてください",
      ago: "前"
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
        title: "Ready to Get Started?",
        subtitle: "Create a free account and beautifully preserve your child's growth records",
        getStarted: "Get Started Now"
      },
      hero: {
        title: "Turn everyday photos into first-time stories.",
        subtitle: "Simply upload photos and AI automatically creates growth records.\nEnjoy family conversations and record growth to your heart's content.",
        getStarted: "Get Started Now",
        viewDemo: "View Demo",
        welcome: "Welcome back, {name}",
        uploadPhotos: "Upload Photos",
        viewTimeline: "View Timeline"
      },
      features: {
        title: "A New Way to Record Child Growth",
        subtitle: "AI automatically creates growth records from photos, allowing the whole family to share memories",
        upload: {
          title: "Easy Upload",
          description: "Upload photos taken with your smartphone directly. No tedious organization required."
        },
        ai: {
          title: "AI Auto-Analysis",
          description: "AI analyzes photos and automatically records growth moments. Comments are also auto-generated."
        },
        storybook: {
          title: "Beautiful Storybook Creation",
          description: "Automatically create storybooks from growth records. Create memory books that become family treasures."
        }
      },
      quickActions: {
        title: "What would you like to do?",
        subtitle: "Create and manage your child's growth records",
        upload: "Photo Upload",
        uploadDesc: "Add new photos",
        timeline: "Timeline",
        timelineDesc: "View growth records",
        albums: "Albums",
        albumsDesc: "Organize photos",
        storybooks: "Storybooks",
        storybooksDesc: "Create AI storybooks"
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
    demo: {
      title: "Try Omoide Features",
      subtitle: "Experience AI-generated growth records, albums, and storybooks with real sample data",
      experience: "Demo Experience",
      timeline: {
        title: "Growth Timeline",
        description: "AI-analyzed photos with automatically generated growth records and comments",
        button: "View Timeline"
      },
      albums: {
        title: "Photo Albums",
        description: "Beautifully organized digital albums of precious memories",
        button: "View Albums"
      },
      storybook: {
        title: "AI Storybooks",
        description: "Beautiful storybooks automatically generated from growth records",
        button: "Read Storybook"
      },
      cta: {
        title: "Ready to Preserve Your Memories?",
        subtitle: "Create a free account and start recording your child's growth journey",
        getStarted: "Get Started Now",
        backHome: "Back to Home"
      },
      backToOverview: "Back to Demo Overview"
    },
    buttons: {
      login: "Login",
      signup: "Sign Up",
      switchToJapanese: "日本語に切り替え",
      switchToEnglish: "Switch to English",
      readStorybook: "Read Storybook"
    },
    upload: {
      title: "Upload Photos",
      subtitle: "Upload your child's photos to create growth records",
      dragDrop: "Drag & drop files here or click to select",
      selectFiles: "Select Files",
      supportedFormats: "Supported formats: JPEG, PNG, WebP",
      maxFileSize: "Max file size",
      maxFiles: "Max files",
      uploadError: "Upload Error",
      validationError: "Validation Error",
      notice: "Notice",
      selectedPhotos: "Selected Photos",
      uploading: "Uploading Photos",
      uploadComplete: "Upload Complete",
      uploadFailed: "Upload Failed",
      removePhoto: "Remove Photo",
      uploadWaiting: "Waiting for Upload"
    },
    albums: {
      title: "Photo Albums",
      noAlbums: "No albums yet",
      noAlbumsDescription: "Upload photos to create your first album",
      createAlbum: "Create Album",
      viewAlbum: "View Album",
      photos: "photos",
      createdAt: "Created"
    },
    timelineCard: {
      viewDetails: "View Details",
      generateComment: "Open details to generate comment",
      ago: "ago"
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