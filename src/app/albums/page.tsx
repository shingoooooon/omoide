'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GrowthRecord, User } from '@/types/models';
import { getAllGrowthRecords } from '@/lib/services/growthRecordService';
import { getUser, updateChildInfo } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { AlbumView } from '@/components/album/AlbumView';
import { ChildInfoSettings } from '@/components/profile/ChildInfoSettings';

export default function AlbumsPage() {
  const { user: authUser } = useAuth();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChildSettings, setShowChildSettings] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadData();
    }
  }, [authUser]);

  const loadData = async () => {
    if (!authUser) return;
    
    try {
      setLoading(true);
      
      // Load user data and records in parallel
      const [userData, allRecords] = await Promise.all([
        getUser(authUser.uid),
        getAllGrowthRecords()
      ]);
      
      setUser(userData);
      
      // Sort by creation date (newest first)
      const sortedRecords = allRecords.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecords(sortedRecords);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChildInfo = async (childInfo: import('@/types/models').ChildInfo) => {
    if (!authUser) return;
    
    try {
      // If user document doesn't exist, create it first with auth user info
      if (!user) {
        const { initializeUserFromAuth } = await import('@/lib/services/userService');
        await initializeUserFromAuth(
          authUser.uid,
          authUser.email || '',
          authUser.displayName || '',
          authUser.photoURL || undefined
        );
      }
      
      await updateChildInfo(authUser.uid, childInfo);
      // Reload user data to get updated child info
      const updatedUser = await getUser(authUser.uid);
      setUser(updatedUser);
    } catch (err) {
      console.error('Error saving child info:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  const childName = user?.childInfo?.name || 'お子さま';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          {/* Child Icon */}
          <div className="mb-6">
            {user?.childInfo?.photoURL ? (
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-6 border-amber-300 shadow-2xl mx-auto bg-white">
                  <Image
                    src={user.childInfo.photoURL}
                    alt={`${childName}の写真`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative elements around the photo */}
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce-gentle">✨</div>
                <div className="absolute -bottom-2 -left-2 text-xl animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>🌟</div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-6 border-amber-300 flex items-center justify-center text-6xl mx-auto shadow-2xl">
                👶
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl font-bold text-amber-800 font-handwriting">
              📖 {childName}の思い出アルバム
            </h1>
            <Button
              onClick={() => setShowChildSettings(true)}
              variant="outline"
              size="sm"
              className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 font-handwriting"
            >
              ⚙️ 設定
            </Button>
          </div>
          <p className="text-amber-700 text-lg font-handwriting">
            大切な成長の記録を手書き風アルバムで振り返ろう
          </p>
          {!user?.childInfo && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-800 text-sm font-handwriting">
                お子さまの名前と誕生日、写真を設定すると、年齢と一緒に表示されます
              </p>
            </div>
          )}
        </div>

        <AlbumView records={records} childInfo={user?.childInfo} />
      </div>

      <ChildInfoSettings
        childInfo={user?.childInfo}
        onSave={handleSaveChildInfo}
        isOpen={showChildSettings}
        onClose={() => setShowChildSettings(false)}
      />
    </div>
  );
}