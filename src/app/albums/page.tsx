'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GrowthRecord, User } from '@/types/models';
import { getAllGrowthRecords } from '@/lib/services/growthRecordService';
import { getUser, updateChildInfo } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/layout/Layout';
import { AlbumView } from '@/components/album/AlbumView';
import { ChildInfoSettings } from '@/components/profile/ChildInfoSettings';
import { calculateAge, hasBirthDate } from '@/lib/ageUtils';
import { Icon } from '@/components/ui/Icon';

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

      // Expand records to individual photo entries and sort by creation date (newest first)
      const expandedRecords: GrowthRecord[] = [];

      allRecords.forEach(record => {
        // Create individual records for each photo
        record.photos.forEach((photo, photoIndex) => {
          const photoComment = record.comments.find(comment => comment.photoId === photo.id) || record.comments[photoIndex] || record.comments[0];

          // Always create an entry for each photo, even if there's no comment yet
          expandedRecords.push({
            ...record,
            id: `${record.id}_photo_${photoIndex}`, // Unique ID for each photo entry
            photos: [photo], // Single photo per record
            comments: photoComment ? [photoComment] : [] // Empty array if no comment
          });
        });
      });

      const sortedRecords = expandedRecords.sort((a, b) =>
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
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const childName = user?.childInfo?.name || 'お子さま';

  return (
    <Layout className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          {/* Child Profile Section */}
          <div className="mb-8">
            {/* Child Icon */}
            <div className="mb-6">
              {user?.childInfo?.photoURL ? (
                <div className="relative inline-block">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto bg-white">
                    <Image
                      src={user.childInfo.photoURL}
                      alt={`${childName}の写真`}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Decorative elements around the photo */}
                  <div className="absolute -top-3 -right-3 text-blue-400 animate-bounce-gentle">
                    <Icon name="sparkles" size="xl" solid />
                  </div>
                  <div className="absolute -bottom-3 -left-3 text-cyan-500 animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>
                    <Icon name="star" size="lg" solid />
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 border-8 border-white flex items-center justify-center mx-auto shadow-2xl">
                  <Icon name="user" className="w-20 h-20 text-blue-600" solid />
                </div>
              )}
            </div>

            {/* Child Name */}
            <h1 className="text-5xl font-bold text-gray-800 mb-4 font-handwriting">
              {childName}
            </h1>

            {/* Age Information */}
            {user?.childInfo?.birthDate && hasBirthDate(user.childInfo.birthDate) ? (
              <div className="text-2xl text-gray-600 font-handwriting mb-6">
                {(() => {
                  const ageInfo = calculateAge(user.childInfo.birthDate, new Date());
                  return `${ageInfo.displayText}（生後${ageInfo.totalDays}日）`;
                })()}
              </div>
            ) : (
              <div className="text-xl text-gray-500 font-handwriting mb-6">
                年齢を表示するには誕生日を設定してください
              </div>
            )}

            {/* Settings Button */}
            <Button
              onClick={() => setShowChildSettings(true)}
              variant="outline"
              size="sm"
              className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200 font-handwriting mb-6"
            >
              <Icon name="settings" size="sm" className="mr-1" />
              設定
            </Button>
          </div>
          {!user?.childInfo && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg max-w-md mx-auto">
              <p className="text-blue-800 text-sm font-handwriting">
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
    </Layout>
  );
}