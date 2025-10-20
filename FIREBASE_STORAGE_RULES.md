# Firebase Storage セキュリティルール

子供のアイコン画像アップロード機能を有効にするために、Firebase Storageのセキュリティルールを更新する必要があります。

## 推奨セキュリティルール

Firebase Consoleの「Storage」→「Rules」タブで以下のルールを設定してください：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 認証されたユーザーのみ自分のフォルダにアクセス可能
    match /photos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 子供のアイコン画像用フォルダ
    match /child-icons/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 生成された画像用フォルダ（絵本の挿絵など）
    match /generated/{allPaths=**} {
      allow read: if true; // 生成された画像は誰でも読み取り可能
      allow write: if request.auth != null; // 認証されたユーザーのみ書き込み可能
    }
    
    // 音声ファイル用フォルダ
    match /audio/{allPaths=**} {
      allow read: if true; // 音声ファイルは誰でも読み取り可能
      allow write: if request.auth != null; // 認証されたユーザーのみ書き込み可能
    }
  }
}
```

## ルールの説明

1. **photos/{userId}**: ユーザーの写真は本人のみアクセス可能
2. **child-icons/{userId}**: 子供のアイコンは本人のみアクセス可能
3. **generated**: AI生成画像は読み取り自由、書き込みは認証ユーザーのみ
4. **audio**: 音声ファイルは読み取り自由、書き込みは認証ユーザーのみ

## 設定手順

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト「omoide-3b1d9」を選択
3. 左メニューから「Storage」を選択
4. 「Rules」タブをクリック
5. 上記のルールをコピー&ペースト
6. 「公開」ボタンをクリック

## 注意事項

- ルールの変更は即座に反映されます
- テスト環境では一時的により緩いルールを使用することも可能です
- 本番環境では必ずセキュリティを重視したルールを使用してください