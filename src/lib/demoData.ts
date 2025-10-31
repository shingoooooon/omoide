/**
 * Demo data for showcasing the application features
 * Used to provide a preview experience before user registration
 */

import { GrowthRecord, Storybook, StorybookPage } from '@/types/models'

// Multilingual demo comments
const demoComments = {
    ja: [
        '今日は初めての笑顔を見せてくれました！とても愛らしい表情で、見ているだけで心が温かくなります。',
        'ぐっすりと眠る姿がとても平和で愛らしいです。安らかな寝顔に心が癒されます。',
        'ハイハイができるようになりました！一生懸命に前に進もうとする姿がとても可愛らしいです。',
        '一人でお座りができるようになりました！バランスを取りながら座る姿は成長を感じさせます。',
        'ついに初めての一歩を踏み出しました！小さな足で大きな世界へ向かって歩き始めました。',
        'おもちゃで遊ぶのがとても上手になりました。集中して遊ぶ姿は成長を感じさせます。'
    ],
    en: [
        'Today they showed their first smile! Such an adorable expression that warms the heart just by looking at it.',
        'Sleeping so peacefully and sweetly. The serene sleeping face is so healing to watch.',
        'They learned to crawl! The way they try so hard to move forward is absolutely adorable.',
        'They can now sit up by themselves! Watching them balance while sitting shows such growth.',
        'Finally took their first step! Started walking into the big world with those tiny feet.',
        'They\'ve become so good at playing with toys. Watching them play with such focus shows their development.'
    ]
};

// Sample photos for demo (using appropriate baby photos from Unsplash)
export const getDemoPhotos = (locale: 'ja' | 'en' = 'ja') => [
    {
        id: 'demo-photo-1',
        url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=face',
        fileName: 'first_smile.jpg',
        uploadedAt: new Date('2024-01-15'),
        faceDetected: true,
        isUploaded: true,
        comment: demoComments[locale][0]
    },
    {
        id: 'demo-photo-2',
        url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop&crop=face',
        fileName: 'sleeping_baby.jpg',
        uploadedAt: new Date('2024-01-20'),
        faceDetected: true,
        isUploaded: true,
        comment: demoComments[locale][1]
    },
    {
        id: 'demo-photo-3',
        url: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=400&fit=crop&crop=face',
        fileName: 'crawling.jpg',
        uploadedAt: new Date('2024-02-20'),
        faceDetected: true,
        isUploaded: true,
        comment: demoComments[locale][2]
    },
    {
        id: 'demo-photo-4',
        url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop&crop=face',
        fileName: 'sitting_baby.jpg',
        uploadedAt: new Date('2024-02-28'),
        faceDetected: true,
        isUploaded: true,
        comment: demoComments[locale][3]
    },
    {
        id: 'demo-photo-5',
        url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=face',
        fileName: 'first_steps.jpg',
        uploadedAt: new Date('2024-03-10'),
        faceDetected: true,
        isUploaded: true,
        comment: demoComments[locale][4]
    },
    {
        id: 'demo-photo-6',
        url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400&h=400&fit=crop&crop=face',
        fileName: 'playing.jpg',
        uploadedAt: new Date('2024-04-05'),
        faceDetected: true,
        isUploaded: true,
        comment: demoComments[locale][5]
    }
];

// For backward compatibility
const demoPhotos = getDemoPhotos('ja');

// Sample growth records for demo
export const getDemoGrowthRecords = (locale: 'ja' | 'en' = 'ja'): GrowthRecord[] => {
    const photos = getDemoPhotos(locale);
    return [
        {
            id: 'demo-record-1',
            userId: 'demo-user',
            photos: [photos[0]],
            comments: [
                {
                    id: 'demo-comment-1',
                    photoId: 'demo-photo-1',
                    content: photos[0].comment,
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
            photos: [photos[1]],
            comments: [
                {
                    id: 'demo-comment-2',
                    photoId: 'demo-photo-2',
                    content: photos[1].comment,
                    generatedAt: new Date('2024-01-20'),
                    isEdited: false
                }
            ],
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20'),
            isShared: false
        },
        {
            id: 'demo-record-3',
            userId: 'demo-user',
            photos: [photos[2]],
            comments: [
                {
                    id: 'demo-comment-3',
                    photoId: 'demo-photo-3',
                    content: photos[2].comment,
                    generatedAt: new Date('2024-02-20'),
                    isEdited: false
                }
            ],
            createdAt: new Date('2024-02-20'),
            updatedAt: new Date('2024-02-20'),
            isShared: false
        },
        {
            id: 'demo-record-4',
            userId: 'demo-user',
            photos: [photos[3]],
            comments: [
                {
                    id: 'demo-comment-4',
                    photoId: 'demo-photo-4',
                    content: photos[3].comment,
                    generatedAt: new Date('2024-02-28'),
                    isEdited: false
                }
            ],
            createdAt: new Date('2024-02-28'),
            updatedAt: new Date('2024-02-28'),
            isShared: false
        },
        {
            id: 'demo-record-5',
            userId: 'demo-user',
            photos: [photos[4]],
            comments: [
                {
                    id: 'demo-comment-5',
                    photoId: 'demo-photo-5',
                    content: photos[4].comment,
                    generatedAt: new Date('2024-03-10'),
                    isEdited: false
                }
            ],
            createdAt: new Date('2024-03-10'),
            updatedAt: new Date('2024-03-10'),
            isShared: false
        },
        {
            id: 'demo-record-6',
            userId: 'demo-user',
            photos: [photos[5]],
            comments: [
                {
                    id: 'demo-comment-6',
                    photoId: 'demo-photo-6',
                    content: photos[5].comment,
                    generatedAt: new Date('2024-04-05'),
                    isEdited: false
                }
            ],
            createdAt: new Date('2024-04-05'),
            updatedAt: new Date('2024-04-05'),
            isShared: false
        }
    ];
};

// For backward compatibility
export const demoGrowthRecords = getDemoGrowthRecords('ja');

// Multilingual storybook texts
const storybookTexts = {
    ja: [
        'ある日、小さな赤ちゃんが初めて笑顔を見せてくれました。その瞬間、家族の心は温かい光で満たされました。',
        'ぐっすりと眠る赤ちゃんの寝顔は、まるで天使のように美しく、見ているだけで心が安らぎます。',
        '好奇心いっぱいの赤ちゃんは、ハイハイで世界を探検し始めました。新しい発見がいっぱいの毎日です。',
        '一人でお座りができるようになり、周りの世界をじっくりと観察するようになりました。',
        'ついに立ち上がって、初めての一歩を踏み出しました。小さな足で大きな世界へ向かって歩き始めたのです。',
        'おもちゃで遊びながら、たくさんのことを学んでいます。毎日が新しい発見と成長の連続です。'
    ],
    en: [
        'One day, the little baby showed their first smile. In that moment, the family\'s hearts were filled with warm light.',
        'The baby\'s sleeping face is as beautiful as an angel, bringing peace just by watching.',
        'Full of curiosity, the baby began exploring the world by crawling. Every day is filled with new discoveries.',
        'Now able to sit up alone, they began observing the world around them more carefully.',
        'Finally standing up, they took their first step. With tiny feet, they began walking toward the big world.',
        'While playing with toys, they are learning so many things. Every day is a continuous series of new discoveries and growth.'
    ]
};

// Sample storybook pages
const getDemoStorybookPages = (locale: 'ja' | 'en' = 'ja'): StorybookPage[] => {
    const photos = getDemoPhotos(locale);
    return [
        {
            id: 'demo-page-1',
            pageNumber: 1,
            text: storybookTexts[locale][0],
            imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop'
        },
        {
            id: 'demo-page-2',
            pageNumber: 2,
            text: storybookTexts[locale][1],
            imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop'
        },
        {
            id: 'demo-page-3',
            pageNumber: 3,
            text: storybookTexts[locale][2],
            imageUrl: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&h=400&fit=crop'
        },
        {
            id: 'demo-page-4',
            pageNumber: 4,
            text: storybookTexts[locale][3],
            imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=400&fit=crop'
        },
        {
            id: 'demo-page-5',
            pageNumber: 5,
            text: storybookTexts[locale][4],
            imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop'
        },
        {
            id: 'demo-page-6',
            pageNumber: 6,
            text: storybookTexts[locale][5],
            imageUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&h=400&fit=crop'
        }
    ];
};

// Multilingual storybook titles
const storybookTitles = {
    ja: '小さな成長の物語',
    en: 'Little Growth Story'
};

// Sample storybook
export const getDemoStorybook = (locale: 'ja' | 'en' = 'ja'): Storybook => ({
    id: 'demo-storybook-1',
    userId: 'demo-user',
    title: storybookTitles[locale],
    month: '2024-03',
    pages: getDemoStorybookPages(locale),
    createdAt: new Date('2024-04-01'),
    isShared: false
});

// For backward compatibility
export const demoStorybook = getDemoStorybook('ja');

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
            iconUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=100&h=100&fit=crop&crop=face'
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

// Multilingual album data
const albumData = {
    ja: [
        { title: '初めての笑顔', description: '生後3ヶ月での初めての笑顔の記録' },
        { title: '眠りの時間', description: '平和な寝顔の記録' },
        { title: '成長の記録', description: 'ハイハイからお座りまで' },
        { title: '初めての一歩', description: '歩行の記録' },
        { title: '遊びの時間', description: '楽しい遊びの瞬間たち' }
    ],
    en: [
        { title: 'First Smile', description: 'Recording the first smile at 3 months old' },
        { title: 'Sleep Time', description: 'Recording peaceful sleeping faces' },
        { title: 'Growth Records', description: 'From crawling to sitting' },
        { title: 'First Steps', description: 'Recording walking milestones' },
        { title: 'Play Time', description: 'Fun moments of play' }
    ]
};

export const getDemoAlbums = (locale: 'ja' | 'en' = 'ja') => {
    const photos = getDemoPhotos(locale);
    const albumTexts = albumData[locale];

    const albums = [
        {
            id: 'demo-album-1',
            title: albumTexts[0].title,
            description: albumTexts[0].description,
            photos: [photos[0]],
            createdAt: new Date('2024-01-15'),
            coverPhoto: photos[0]
        },
        {
            id: 'demo-album-2',
            title: albumTexts[1].title,
            description: albumTexts[1].description,
            photos: [photos[1]],
            createdAt: new Date('2024-01-20'),
            coverPhoto: photos[1]
        },
        {
            id: 'demo-album-3',
            title: albumTexts[2].title,
            description: albumTexts[2].description,
            photos: [photos[2], photos[3]],
            createdAt: new Date('2024-02-28'),
            coverPhoto: photos[3]
        },
        {
            id: 'demo-album-4',
            title: albumTexts[3].title,
            description: albumTexts[3].description,
            photos: [photos[4]],
            createdAt: new Date('2024-03-10'),
            coverPhoto: photos[4]
        },
        {
            id: 'demo-album-5',
            title: albumTexts[4].title,
            description: albumTexts[4].description,
            photos: [photos[5]],
            createdAt: new Date('2024-04-05'),
            coverPhoto: photos[5]
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
    getDemoAlbums,
    getDemoPhotos,
    getDemoGrowthRecords,
    getDemoStorybook
}

export { demoPhotos }
export default demoDataExport