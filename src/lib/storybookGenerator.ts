import OpenAI from 'openai';
import { GrowthRecord, StorybookPage } from '@/types/models';
import { generateMultipleIllustrations, IllustrationRequest } from '@/lib/illustrationService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface StoryData {
  title: string;
  pages: {
    pageNumber: number;
    text: string;
    illustrationPrompt: string;
  }[];
}

// Generate story from monthly growth records
export async function generateStoryFromRecords(records: GrowthRecord[]): Promise<StoryData> {
  try {
    // Prepare context from growth records
    const recordsContext = records.map((record, index) => {
      const date = record.createdAt.toLocaleDateString('ja-JP');
      const comments = record.comments.map(c => c.content).join('、');
      return `${index + 1}. ${date}: ${comments}`;
    }).join('\n');

    const prompt = `あなたは子どもの成長記録から心温まる絵本を作る専門家です。以下の今月の成長記録を基に、短い絵本の物語を作成してください。

成長記録:
${recordsContext}

絵本作成のガイドライン:
- 4-6ページの短い絵本
- 各ページは1-2文の短いテキスト
- 子どもの成長と発見を温かく描写
- 親子の愛情を感じられる内容
- 各ページに挿絵の説明も含める
- 日本語で作成

重要: 必ず以下のJSON形式のみで回答してください。マークダウンや説明文は一切含めないでください:

{
  "title": "絵本のタイトル",
  "pages": [
    {
      "pageNumber": 1,
      "text": "ページのテキスト",
      "illustrationPrompt": "挿絵の詳細な説明（英語で、DALL-E用）"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは子どもの成長記録から心温まる絵本を作る専門家です。必ず有効なJSONのみを返してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (!response) {
      throw new Error('物語の生成に失敗しました');
    }

    try {
      // Extract JSON from markdown code blocks if present
      let jsonString = response;
      
      // Remove markdown code block markers
      if (response.includes('```json')) {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1];
        }
      } else if (response.includes('```')) {
        const jsonMatch = response.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1];
        }
      }
      
      // Clean up the JSON string
      jsonString = jsonString.trim();
      
      console.log('Attempting to parse JSON:', jsonString.substring(0, 200) + '...');
      
      const storyData = JSON.parse(jsonString) as StoryData;
      
      // Validate the response structure
      if (!storyData.title || !Array.isArray(storyData.pages) || storyData.pages.length === 0) {
        throw new Error('生成された物語の形式が正しくありません');
      }

      return storyData;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Original response:', response);
      throw new Error('生成された物語の解析に失敗しました');
    }

  } catch (error) {
    console.error('Story generation error:', error);
    
    // Fallback: Generate a simple story based on the records
    console.log('Falling back to simple story generation...');
    
    const fallbackStory: StoryData = {
      title: `${new Date().getMonth() + 1}月の成長記録`,
      pages: [
        {
          pageNumber: 1,
          text: "今月もたくさんの素敵な瞬間がありました。",
          illustrationPrompt: "A happy child playing, warm and colorful illustration style"
        },
        {
          pageNumber: 2,
          text: "毎日新しいことを発見して、どんどん成長しています。",
          illustrationPrompt: "A child discovering something new, bright and cheerful scene"
        },
        {
          pageNumber: 3,
          text: "笑顔いっぱいの毎日が、とても大切な宝物です。",
          illustrationPrompt: "A smiling child with family, heartwarming illustration"
        },
        {
          pageNumber: 4,
          text: "これからもたくさんの冒険が待っています。",
          illustrationPrompt: "A child looking forward to adventures, hopeful and bright scene"
        }
      ]
    };
    
    return fallbackStory;
  }
}

// Generate illustrations for storybook pages using DALL-E 3
export async function generateStorybookIllustrations(
  pages: StoryData['pages']
): Promise<StorybookPage[]> {
  try {
    // Prepare illustration requests
    const illustrationRequests: IllustrationRequest[] = pages.map(page => ({
      prompt: page.illustrationPrompt,
      pageNumber: page.pageNumber,
      style: 'children-book',
      mood: 'gentle'
    }));

    // Generate all illustrations
    const illustrationResults = await generateMultipleIllustrations(illustrationRequests);

    // Create storybook pages with illustrations
    const illustratedPages: StorybookPage[] = pages.map(page => {
      const illustration = illustrationResults.find(result => result.pageNumber === page.pageNumber);
      
      const storybookPage: StorybookPage = {
        id: `page-${page.pageNumber}`, // Temporary ID, will be updated when saving
        pageNumber: page.pageNumber,
        text: page.text,
        imageUrl: illustration?.imageUrl || 'https://via.placeholder.com/400x300/E2E8F0/64748B?text=挿絵を生成中',
      };
      
      // Don't include audioUrl if it's undefined
      return storybookPage;
    });

    return illustratedPages;

  } catch (error) {
    console.error('Illustration generation error:', error);
    
    // Fallback: Create pages with placeholder images
    console.log('Falling back to placeholder images...');
    
    const fallbackPages: StorybookPage[] = pages.map(page => {
      const storybookPage: StorybookPage = {
        id: `page-${page.pageNumber}`,
        pageNumber: page.pageNumber,
        text: page.text,
        imageUrl: 'https://via.placeholder.com/400x300/E2E8F0/64748B?text=挿絵を生成中',
      };
      
      // Don't include audioUrl if it's undefined
      return storybookPage;
    });

    return fallbackPages;
  }
}

// Generate story title based on month and records
export function generateStorybookTitle(month: string, recordsCount: number): string {
  const [year, monthNum] = month.split('-');
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const monthName = monthNames[parseInt(monthNum) - 1];
  return `${year}年${monthName}の成長物語`;
}

// Validate story data structure
export function validateStoryData(storyData: any): storyData is StoryData {
  return (
    typeof storyData === 'object' &&
    typeof storyData.title === 'string' &&
    Array.isArray(storyData.pages) &&
    storyData.pages.every((page: any) => 
      typeof page.pageNumber === 'number' &&
      typeof page.text === 'string' &&
      typeof page.illustrationPrompt === 'string'
    )
  );
}