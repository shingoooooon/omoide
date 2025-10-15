// 無料のコメント生成（ルールベース）

const positiveWords = [
  '素敵な', '可愛い', '元気な', '笑顔の', '愛らしい', 
  '健やかな', '輝く', '温かい', '優しい', '美しい'
];

const growthWords = [
  '成長', '発見', '冒険', '学び', '挑戦', 
  '進歩', '変化', '発達', '体験', '経験'
];

const emotionWords = [
  '喜び', '驚き', '好奇心', '安らぎ', '満足', 
  '楽しさ', '幸せ', '平和', '興味', '関心'
];

const endingPhrases = [
  'だね！', 'ですね', 'だな', 'が素晴らしい', 'が印象的',
  'を感じます', 'が伝わってくる', 'に心が温まる'
];

export function generateFreeComment(analysisData?: any): string {
  const positive = positiveWords[Math.floor(Math.random() * positiveWords.length)];
  const growth = growthWords[Math.floor(Math.random() * growthWords.length)];
  const emotion = emotionWords[Math.floor(Math.random() * emotionWords.length)];
  const ending = endingPhrases[Math.floor(Math.random() * endingPhrases.length)];

  // 解析データがある場合は、それに基づいてコメントを調整
  if (analysisData) {
    if (analysisData.emotions?.includes('joy')) {
      return `${positive}笑顔で${emotion}いっぱい${ending}`;
    }
    if (analysisData.emotions?.includes('curiosity')) {
      return `好奇心旺盛な表情が${positive}${ending}`;
    }
    if (analysisData.faceDetected) {
      return `${positive}表情から${growth}を感じる${ending}`;
    }
  }

  // デフォルトのランダムコメント
  const templates = [
    `${positive}${emotion}が伝わってくる${ending}`,
    `今日も${positive}${growth}${ending}`,
    `${emotion}いっぱいの表情が${positive}${ending}`,
    `${growth}の瞬間を捉えた${positive}写真${ending}`,
    `${positive}${emotion}に心が温まる${ending}`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateMultipleFreeComments(analysisDataArray: any[]): string[] {
  return analysisDataArray.map(data => generateFreeComment(data));
}