'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { PhotoUpload, Photo } from '@/components/photos'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'

export default function UploadPage() {
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([])
  const { user, loading } = useAuth()

  const handlePhotosUploaded = (photos: Photo[]) => {
    setUploadedPhotos(photos)
    console.log('Photos uploaded:', photos)
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">読み込み中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            写真をアップロード
          </h1>
          <p className="text-lg text-neutral-600 mb-4">
            お子さまの写真をアップロードして、成長記録を作成しましょう
          </p>
          {!user && (
            <Card className="border-amber-200 bg-amber-50 mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-800">
                    ログインしていません
                  </p>
                  <p className="text-sm text-amber-700">
                    写真を選択できますが、クラウドに保存するにはログインが必要です。
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <PhotoUpload
          onPhotosUploaded={handlePhotosUploaded}
          maxPhotos={5}
          maxFileSize={10}
          autoUpload={!!user} // Only auto-upload if user is logged in
        />

        {uploadedPhotos.length > 0 && (
          <Card>
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              アップロード結果
            </h3>
            <div className="space-y-2">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={photo.url}
                      alt={photo.fileName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <div className="font-medium text-neutral-900">{photo.fileName}</div>
                      <div className="text-sm text-neutral-600">
                        {photo.isUploaded ? 'アップロード完了' : 'アップロード中...'}
                      </div>
                    </div>
                  </div>
                  {photo.storageUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(photo.storageUrl, '_blank')}
                    >
                      表示
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}