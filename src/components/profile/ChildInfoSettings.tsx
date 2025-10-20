'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ChildInfo } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { uploadChildIcon } from '@/lib/childIconUpload';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ChildInfoSettingsProps {
  childInfo?: ChildInfo;
  onSave: (childInfo: ChildInfo) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function ChildInfoSettings({ childInfo, onSave, isOpen, onClose }: ChildInfoSettingsProps) {
  const { user } = useAuth();
  const [name, setName] = useState(childInfo?.name || '');
  const [birthDate, setBirthDate] = useState(
    childInfo?.birthDate ? format(childInfo.birthDate, 'yyyy-MM-dd') : ''
  );
  const [photoURL, setPhotoURL] = useState(childInfo?.photoURL || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('お子さまのお名前を入力してください');
      return;
    }

    if (!birthDate) {
      setError('誕生日を入力してください');
      return;
    }

    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      setError('正しい日付を入力してください');
      return;
    }

    if (birthDateObj > new Date()) {
      setError('誕生日は今日以前の日付を入力してください');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await onSave({
        name: name.trim(),
        birthDate: birthDateObj,
        photoURL: photoURL || undefined
      });
      
      onClose();
    } catch (err) {
      console.error('Error saving child info:', err);
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      // Use the authenticated user's ID for the upload
      const result = await uploadChildIcon(file, user.uid);
      setPhotoURL(result.url);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError(err instanceof Error ? err.message : '画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoURL('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isSaving && !isUploading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="お子さまの情報設定">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mb-4">
            {photoURL ? (
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg">
                  <Image
                    src={photoURL}
                    alt="お子さまの写真"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                  disabled={isUploading || isSaving}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-amber-200 flex items-center justify-center text-4xl mx-auto shadow-lg">
                👶
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            お子さまの名前と誕生日、写真を設定すると、<br />
            アルバムで年齢と一緒に表示されます
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お子さまの写真
            </label>
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isUploading || isSaving}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                disabled={isUploading || isSaving}
                className="flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
                    <span>アップロード中...</span>
                  </>
                ) : (
                  <>
                    <span>📷</span>
                    <span>写真を選択</span>
                  </>
                )}
              </Button>
              {photoURL && (
                <Button
                  onClick={handleRemovePhoto}
                  variant="outline"
                  size="sm"
                  disabled={isUploading || isSaving}
                  className="text-red-600 hover:text-red-700"
                >
                  削除
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              JPG、PNG形式、5MB以下
            </p>
          </div>
          <div>
            <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-2">
              お子さまのお名前 *
            </label>
            <Input
              id="childName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ゆうくん"
              className="w-full"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
              誕生日 *
            </label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full"
              disabled={isSaving}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={isSaving || isUploading}
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}