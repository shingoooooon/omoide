/**
 * Demo data for showcasing the application features
 * Used to provide a preview experience before user registration
 */

import { GrowthRecord, Storybook, StorybookPage } from '@/types/models'

// Sample photos for demo (using placeholder images)
export const demoPhotos = [
    {
        id: 'demo-photo-1',
        url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=face',
        fileName: 'first_smile.jpg',
        uploadedAt: new Date('2024-01-15'),
        faceDetected: true,
        isUploaded: true
    },
    {
        id: 'demo-photo-2',
        url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=face',
        fileName: 'crawling.jpg',
        uploadedAt: new Date('2024-02-20'),
        faceDetected: true,
        isUploaded: true
    },
    {
        id: 'demo-photo-3',
        url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=face',
        fileName: 'first_steps.jpg',
        uploadedAt: new Date('2024-03-10'),
        faceDetected: true,
        isUploaded: true
    },
    {
        id: 'demo-photo-4',
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop&crop=face',
        fileName: 'playing.jpg',
        uploadedAt: new Date('2024-04-05'),
        faceDetected: true,
        isUploaded: true
    }
]

// Sample growth records for demo
export const demoGrowthRecords: GrowthRecord[] = [
    {
        id: 'demo-record-1',
        userId: 'demo-user',
        photos: [demoPhotos[0]],
        comments: [
            {
                id: 'demo-comment-1',
                photoId: 'demo-photo-1',
                content: '今日は初めての笑顔を見せてくれました！とても愛らしい表情で、見ているだけで心が温かくなります。',
                generatedAt: new Date('2024-01-15'),
                isEdited: false
            }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isShared: false
    },
    {
        id: 'demo-record-2',
        userId: 'demo-user',
        photos: [demoPhotos[1]],
        comments: [
            {
                id: 'demo-comment-2',
                photoId: 'demo-photo-2',
                content: 'ハイハイができるようになりました！一生懸命に前に進もうとする姿がとても可愛らしいです。',
                generatedAt: new Date('2024-02-20'),
                isEdited: false
            }
        ],
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
        isShared: false
    },
    {
        id: 'demo-record-3',
        userId: 'demo-user',
        photos: [demoPhotos[2]],
        comments: [
            {
                id: 'demo-comment-3',
                photoId: 'demo-photo-3',
                content: 'ついに初めての一歩を踏み出しました！バランスを取りながら歩く姿は感動的です。',
                generatedAt: new Date('2024-03-10'),
                isEdited: false
            }
        ],
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
        isShared: false
    },
    {
        id: 'demo-record-4',
        userId: 'demo-user',
        photos: [demoPhotos[3]],
        comments: [
            {
                id: 'demo-comment-4',
                photoId: 'demo-photo-4',
                content: 'おもちゃで遊ぶのがとても上手になりました。集中して遊ぶ姿は成長を感じさせます。',
                generatedAt: new Date('2024-04-05'),
                isEdited: false
            }
        ],
        createdAt: new Date('2024-04-05'),
        updatedAt: new Date('2024-04-05'),
        isShared: false
    }
]

// Sample storybook pages
const demoStorybookPages: StorybookPage[] = [
    {
        id: 'demo-page-1',
        pageNumber: 1,
        text: 'ある日、小さな赤ちゃんが初めて笑顔を見せてくれました。その瞬間、家族の心は温かい光で満たされました。',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
    },
    {
        id: 'demo-page-2',
        pageNumber: 2,
        text: '好奇心いっぱいの赤ちゃんは、ハイハイで世界を探検し始めました。新しい発見がいっぱいの毎日です。',
        imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&h=400&fit=crop'
    },
    {
        id: 'demo-page-3',
        pageNumber: 3,
        text: 'ついに立ち上がって、初めての一歩を踏み出しました。小さな足で大きな世界へ向かって歩き始めたのです。',
        imageUrl: 'https://images.unsplash.com/photo-1607349913338-552716f21d35?w=600&h=400&fit=crop'
    },
    {
        id: 'demo-page-4',
        pageNumber: 4,
        text: 'おもちゃで遊びながら、たくさんのことを学んでいます。毎日が新しい発見と成長の連続です。',
        imageUrl: 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=600&h=400&fit=crop'
    }
]

// Sample storybook
export const demoStorybook: Storybook = {
    id: 'demo-storybook-1',
    userId: 'demo-user',
    title: '小さな成長の物語',
    month: '2024-03',
    pages: demoStorybookPages,
    createdAt: new Date('2024-04-01'),
    isShared: false
}

// Demo user info
export const demoUser = {
    id: 'demo-user',
    name: 'デモユーザー',
    email: 'demo@example.com',
    children: [
        {
            id: 'demo-child-1',
            name: 'あかちゃん',
            birthDate: new Date('2023-10-15'),
            gender: 'unknown' as const,
            iconUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop&crop=face'
        }
    ]
}

// Helper functions for demo data
export const getDemoRecordsByMonth = (year: number, month: number): GrowthRecord[] => {
    return demoGrowthRecords.filter(record => {
        const recordDate = new Date(record.createdAt)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month - 1
    })
}

export const getDemoRecordsByDateRange = (startDate: Date, endDate: Date): GrowthRecord[] => {
    return demoGrowthRecords.filter(record => {
        const recordDate = new Date(record.createdAt)
        return recordDate >= startDate && recordDate <= endDate
    })
}

export const getDemoAlbums = () => {
    const albums = [
        {
            id: 'demo-album-1',
            title: '初めての笑顔',
            description: '生後3ヶ月での初めての笑顔の記録',
            photos: [demoPhotos[0]],
            createdAt: new Date('2024-01-15'),
            coverPhoto: demoPhotos[0]
        },
        {
            id: 'demo-album-2',
            title: '成長の記録',
            description: 'ハイハイから歩行まで',
            photos: [demoPhotos[1], demoPhotos[2]],
            createdAt: new Date('2024-03-10'),
            coverPhoto: demoPhotos[2]
        },
        {
            id: 'demo-album-3',
            title: '遊びの時間',
            description: '楽しい遊びの瞬間たち',
            photos: [demoPhotos[3]],
            createdAt: new Date('2024-04-05'),
            coverPhoto: demoPhotos[3]
        }
    ]

    return albums
}

const demoDataExport = {
    photos: demoPhotos,
    records: demoGrowthRecords,
    storybook: demoStorybook,
    user: demoUser,
    getDemoRecordsByMonth,
    getDemoRecordsByDateRange,
    getDemoAlbums
}

export default demoDataExport