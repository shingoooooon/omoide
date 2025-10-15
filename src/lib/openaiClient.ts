import OpenAI from 'openai';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

// 成長コメント生成のプロンプト設計
export const generateGrowthCommentPrompt = (analysisData: any) => {
  return `あなたは優しい育児専門家です。以下の画像解析データを基に、子どもの成長を温かく見守る親の視点で、短くて心温まるコメントを日本語で生成してください。

画像解析データ:
${JSON.stringify(analysisData, null, 2)}

コメント作成のガイドライン:
- 50文字以内で簡潔に
- 親が子どもに対して感じる愛情を表現
- 成長の喜びや発見を含める
- 優しく温かいトーンで
- 具体的な観察ポイントがあれば含める
- 「〜ですね」「〜だね」などの親しみやすい語尾を使用

例:
- "今日もにこにこ笑顔が素敵だね！"
- "だんだんお座りが上手になってきたね"
- "好奇心いっぱいの表情が可愛いな"

コメント:`;
};

// 成長コメント生成関数
export async function generateGrowthComment(analysisData: any): Promise<string> {
  try {
    const prompt = generateGrowthCommentPrompt(analysisData);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 50,  // 50文字以内のコメントなので十分
      temperature: 0.7,
    });

    const comment = completion.choices[0]?.message?.content?.trim();
    
    if (!comment) {
      throw new Error('コメントの生成に失敗しました');
    }

    return comment;
  } catch (error) {
    console.error('OpenAI API エラー:', error);
    throw new Error('AIコメントの生成中にエラーが発生しました');
  }
}

// 複数の写真に対するコメント生成
export async function generateMultipleGrowthComments(
  analysisDataArray: any[]
): Promise<string[]> {
  try {
    const comments = await Promise.all(
      analysisDataArray.map(analysisData => generateGrowthComment(analysisData))
    );
    return comments;
  } catch (error) {
    console.error('複数コメント生成エラー:', error);
    throw new Error('複数のAIコメント生成中にエラーが発生しました');
  }
}