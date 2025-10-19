import OpenAI from 'openai';
import { uploadImageFromUrl } from '@/lib/storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface IllustrationRequest {
  prompt: string;
  pageNumber: number;
  style?: 'children-book' | 'watercolor' | 'cartoon' | 'realistic';
  mood?: 'happy' | 'peaceful' | 'playful' | 'gentle';
}

export interface IllustrationResult {
  pageNumber: number;
  imageUrl: string;
  originalPrompt: string;
  generatedAt: Date;
}

// Generate illustration using DALL-E 3
export async function generateIllustration(
  request: IllustrationRequest
): Promise<IllustrationResult> {
  try {
    const enhancedPrompt = enhancePromptForChildrensBook(request);
    
    console.log(`🎨 Generating illustration for page ${request.pageNumber}:`, enhancedPrompt);

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = imageResponse.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error(`ページ${request.pageNumber}の挿絵生成に失敗しました`);
    }

    // Upload the generated image to Firebase Storage
    const fileName = `storybook-illustrations/page-${request.pageNumber}-${Date.now()}.png`;
    const uploadedImageUrl = await uploadImageFromUrl(imageUrl, fileName);

    return {
      pageNumber: request.pageNumber,
      imageUrl: uploadedImageUrl,
      originalPrompt: request.prompt,
      generatedAt: new Date(),
    };

  } catch (error) {
    console.error(`Error generating illustration for page ${request.pageNumber}:`, error);
    
    // Return placeholder instead of throwing error
    console.log(`Using placeholder for page ${request.pageNumber}`);
    return {
      pageNumber: request.pageNumber,
      imageUrl: 'https://via.placeholder.com/400x300/E2E8F0/64748B?text=挿絵を生成中',
      prompt: request.prompt
    };
  }
}

// Generate multiple illustrations concurrently
export async function generateMultipleIllustrations(
  requests: IllustrationRequest[]
): Promise<IllustrationResult[]> {
  try {
    console.log(`🎨 Generating ${requests.length} illustrations...`);

    // Generate illustrations with some delay to avoid rate limits
    const results: IllustrationResult[] = [];
    
    for (const request of requests) {
      try {
        const result = await generateIllustration(request);
        results.push(result);
        
        // Add a small delay between requests to avoid rate limiting
        if (requests.indexOf(request) < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Failed to generate illustration for page ${request.pageNumber}:`, error);
        
        // Create a placeholder result for failed illustrations
        results.push({
          pageNumber: request.pageNumber,
          imageUrl: '/placeholder-illustration.png',
          originalPrompt: request.prompt,
          generatedAt: new Date(),
        });
      }
    }

    return results;

  } catch (error) {
    console.error('Error generating multiple illustrations:', error);
    throw new Error('挿絵の生成中にエラーが発生しました');
  }
}

// Enhance prompt for children's book style
function enhancePromptForChildrensBook(request: IllustrationRequest): string {
  const { prompt, style = 'children-book', mood = 'gentle' } = request;
  
  const styleModifiers = {
    'children-book': 'Children\'s book illustration style, soft and warm',
    'watercolor': 'Watercolor painting style, gentle and flowing',
    'cartoon': 'Cartoon illustration style, friendly and approachable',
    'realistic': 'Realistic but gentle illustration style'
  };

  const moodModifiers = {
    'happy': 'bright, cheerful, joyful atmosphere',
    'peaceful': 'calm, serene, tranquil atmosphere',
    'playful': 'fun, energetic, lively atmosphere',
    'gentle': 'soft, tender, loving atmosphere'
  };

  const baseEnhancements = [
    styleModifiers[style],
    moodModifiers[mood],
    'pastel colors',
    'high quality',
    'detailed illustration',
    'suitable for a baby growth story',
    'heartwarming and family-friendly'
  ];

  return `${prompt}. ${baseEnhancements.join(', ')}.`;
}

// Create illustration prompt from story text
export function createIllustrationPrompt(
  storyText: string,
  context?: {
    childAge?: 'baby' | 'toddler' | 'child';
    setting?: 'home' | 'park' | 'bedroom' | 'garden';
    activity?: string;
  }
): string {
  const { childAge = 'baby', setting = 'home', activity } = context || {};
  
  // Extract key elements from story text
  const keywords = extractKeywords(storyText);
  
  let prompt = `A ${childAge} `;
  
  if (activity) {
    prompt += `${activity} `;
  } else if (keywords.length > 0) {
    prompt += `${keywords.join(' and ')} `;
  }
  
  prompt += `in a ${setting}`;
  
  // Add emotional context based on story text
  if (storyText.includes('笑顔') || storyText.includes('にこにこ')) {
    prompt += ', smiling happily';
  }
  if (storyText.includes('成長') || storyText.includes('大きく')) {
    prompt += ', showing growth and development';
  }
  if (storyText.includes('遊び') || storyText.includes('楽しい')) {
    prompt += ', playing joyfully';
  }
  
  return prompt;
}

// Extract keywords from Japanese text for illustration prompts
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  
  // Common baby/child activities and objects
  const activityMap: { [key: string]: string } = {
    '笑顔': 'smiling',
    'にこにこ': 'smiling cheerfully',
    'お座り': 'sitting',
    'ハイハイ': 'crawling',
    '立つ': 'standing',
    '歩く': 'walking',
    '遊ぶ': 'playing',
    '食べる': 'eating',
    '寝る': 'sleeping',
    'おもちゃ': 'with toys',
    '本': 'with books',
    'ぬいぐるみ': 'with stuffed animals',
    'ボール': 'with a ball',
    'ママ': 'with mother',
    'パパ': 'with father',
    '家族': 'with family'
  };
  
  for (const [japanese, english] of Object.entries(activityMap)) {
    if (text.includes(japanese)) {
      keywords.push(english);
    }
  }
  
  return keywords;
}

// Validate illustration request
export function validateIllustrationRequest(request: IllustrationRequest): boolean {
  return (
    typeof request.prompt === 'string' &&
    request.prompt.length > 0 &&
    typeof request.pageNumber === 'number' &&
    request.pageNumber > 0
  );
}