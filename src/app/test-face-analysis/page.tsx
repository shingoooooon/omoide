'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis'
import { PhotoUpload } from '@/components/photos/PhotoUpload'

interface Photo {
  id: string
  file: File
  url: string
  fileName: string
  uploadedAt: Date
  faceDetected?: boolean
  uploadProgress?: number
  storageUrl?: string
  storagePath?: string
  isUploaded?: boolean
}

export default function TestFaceAnalysisPage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  const { 
    state, 
    analyzePhotos, 
    checkPhotoSuitability, 
    getValidPhotos, 
    getInvalidPhotos,
    reset 
  } = useFaceAnalysis()

  const handlePhotosUploaded = (uploadedPhotos: Photo[]) => {
    setPhotos(uploadedPhotos)
    console.log('📸 Photos uploaded:', uploadedPhotos)
  }

  const runFaceAnalysis = async () => {
    if (!user) {
      alert('ログインが必要です')
      return
    }

    const uploadedPhotos = photos.filter(p => p.isUploaded && p.storageUrl)
    
    if (uploadedPhotos.length === 0) {
      alert('アップロード済みの写真がありません')
      return
    }

    const photoUrls = uploadedPhotos.map(p => p.storageUrl!)
    console.log('🔍 Starting face analysis for:', photoUrls)
    
    await analyzePhotos(user.uid, photoUrls)
  }

  const checkSuitability = async () => {
    if (!user) {
      alert('ログインが必要です')
      return
    }

    const uploadedPhotos = photos.filter(p => p.isUploaded && p.storageUrl)
    
    if (uploadedPhotos.length === 0) {
      alert('アップロード済みの写真がありません')
      return
    }

    const photoUrls = uploadedPhotos.map(p => p.storageUrl!)
    console.log('✅ Checking photo suitability for:', photoUrls)
    
    const result = await checkPhotoSuitability(user.uid, photoUrls)
    setAnalysisResults([result])
  }

  const clearResults = () => {
    reset()
    setAnalysisResults([])
    setPhotos([])
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">顔解析テスト</h1>
      
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">このテストを実行するにはログインが必要です。</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Photo Upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">1. 写真をアップロード</h2>
            <PhotoUpload
              onPhotosUploaded={handlePhotosUploaded}
              maxPhotos={5}
              autoUpload={true}
            />
          </div>

          {/* Analysis Controls */}
          {photos.some(p => p.isUploaded) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">2. 顔解析を実行</h2>
              <div className="space-y-4">
                <button
                  onClick={runFaceAnalysis}
                  disabled={state.isAnalyzing || !user}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {state.isAnalyzing ? '⏳ 解析中...' : '🔍 顔解析を実行'}
                </button>
                
                <button
                  onClick={checkSuitability}
                  disabled={state.isAnalyzing || !user}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {state.isAnalyzing ? '⏳ チェック中...' : '✅ 写真の適性をチェック'}
                </button>

                <button
                  onClick={clearResults}
                  className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  🗑️ 結果をクリア
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {/* Analysis State */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">解析状態</h2>
            <div className="space-y-2 text-sm">
              <p><strong>解析中:</strong> {state.isAnalyzing ? '✅ はい' : '❌ いいえ'}</p>
              <p><strong>総写真数:</strong> {state.totalCount}</p>
              <p><strong>有効な写真数:</strong> {state.validCount}</p>
              {state.error && (
                <p className="text-red-600"><strong>エラー:</strong> {state.error}</p>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {state.results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">顔解析結果</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {state.results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={result.imageUrl} 
                        alt={`解析結果 ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.evaluation.isValid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.evaluation.isValid ? '✅ 有効' : '❌ 無効'}
                          </span>
                          <span className="text-sm text-gray-600">
                            信頼度: {(result.evaluation.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700">
                          <strong>理由:</strong> {result.evaluation.reason}
                        </p>
                        
                        {result.evaluation.suggestions && result.evaluation.suggestions.length > 0 && (
                          <div className="text-sm">
                            <strong>提案:</strong>
                            <ul className="list-disc list-inside mt-1 text-gray-600">
                              {result.evaluation.suggestions.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.error && (
                          <div className="text-sm text-red-600">
                            <strong>エラー:</strong> {result.error.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suitability Results */}
          {analysisResults.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">適性チェック結果</h2>
              {analysisResults.map((result, index) => (
                <div key={index} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-green-700 mb-2">✅ 適している写真 ({result.suitable?.length || 0})</h3>
                      <div className="space-y-1">
                        {result.suitable?.map((url: string, i: number) => (
                          <div key={i} className="flex items-center space-x-2">
                            <img src={url} alt={`適している写真 ${i + 1}`} className="w-8 h-8 object-cover rounded" />
                            <span className="text-sm text-gray-600">写真 {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-red-700 mb-2">❌ 適していない写真 ({result.unsuitable?.length || 0})</h3>
                      <div className="space-y-1">
                        {result.unsuitable?.map((url: string, i: number) => (
                          <div key={i} className="flex items-center space-x-2">
                            <img src={url} alt={`適していない写真 ${i + 1}`} className="w-8 h-8 object-cover rounded" />
                            <span className="text-sm text-gray-600">写真 {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-blue-700 mb-2">💡 改善提案</h3>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {result.suggestions.map((suggestion: string, i: number) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Valid/Invalid Photos Summary */}
          {state.results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">写真の分類</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-green-700 mb-2">✅ 有効な写真</h3>
                  <div className="space-y-1">
                    {getValidPhotos().map((url, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <img src={url} alt={`有効な写真 ${i + 1}`} className="w-8 h-8 object-cover rounded" />
                        <span className="text-sm text-gray-600">写真 {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-red-700 mb-2">❌ 無効な写真</h3>
                  <div className="space-y-2">
                    {getInvalidPhotos().map((photo, i) => (
                      <div key={i} className="border-l-2 border-red-300 pl-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <img src={photo.url} alt={`無効な写真 ${i + 1}`} className="w-8 h-8 object-cover rounded" />
                          <span className="text-sm text-gray-600">写真 {i + 1}</span>
                        </div>
                        <p className="text-xs text-gray-600">{photo.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}