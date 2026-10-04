import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface GarmentAttributes {
  id: string;
  name: string;
  category: 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear' | 'Accessories';
  primaryColor: string;
  colorHex: string;
  styleArchetype: string;
  formality: number;
  description: string;
  recommendedPairings: string[];
  fabric?: string;
  season?: string;
  imageUrl?: string;
}

export async function parseGarmentImage(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<GarmentAttributes> {
  const modelName = process.env.GEMINI_VISION_MODEL || 'gemini-3.5-flash-lite';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are an expert AI Fashion Stylist and Wardrobe Analyzer.
Analyze this garment image and extract accurate fashion attributes.

Return ONLY a valid JSON object matching this schema:
{
  "name": "Short descriptive luxury name (e.g. Charcoal Double-Pleated Wool Trousers)",
  "category": "Tops" | "Bottoms" | "Outerwear" | "Footwear" | "Accessories",
  "primaryColor": "Color name (e.g. Navy Blue, Camel, Heather Grey)",
  "colorHex": "Estimated hex code (e.g. #000080)",
  "styleArchetype": "Style vibe (e.g. Minimalist Classic, Quiet Luxury, Streetwear, Business Casual)",
  "formality": 1 to 10 integer rating,
  "fabric": "Estimated fabric composition (e.g. 100% Merino Wool, Silk Blend, Selvedge Denim)",
  "season": "All-Season | Spring/Summer | Autumn/Winter",
  "description": "1 concise sentence description of fabric texture, silhouette cut, and styling potential.",
  "recommendedPairings": ["3 complementary garment types to style with this item"]
}
`;

  try {
    const imagePart = {
      inlineData: {
        data: base64Data.replace(/^data:image\/\w+;base64,/, ''),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const parsed = JSON.parse(result.response.text());

    return {
      id: `USER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: parsed.name || 'Wardrobe Garment',
      category: parsed.category || 'Tops',
      primaryColor: parsed.primaryColor || 'Neutral',
      colorHex: parsed.colorHex || '#808080',
      styleArchetype: parsed.styleArchetype || 'Modern Casual',
      formality: Number(parsed.formality) || 5,
      fabric: parsed.fabric || 'Cotton Blend',
      season: parsed.season || 'All-Season',
      description: parsed.description || 'Uploaded wardrobe item.',
      recommendedPairings: parsed.recommendedPairings || ['Trousers', 'Boots'],
    };
  } catch (err: any) {
    console.error('❌ Gemini Vision Parser Error:', err);
    // Graceful fallback for offline testing
    return {
      id: `USER-${Date.now()}`,
      name: 'Structured Casual Piece',
      category: 'Tops',
      primaryColor: 'Slate Grey',
      colorHex: '#708090',
      styleArchetype: 'Minimalist Daily',
      formality: 6,
      fabric: 'Fine Cotton Twill',
      season: 'All-Season',
      description: 'Versatile wardrobe piece suitable for everyday layering.',
      recommendedPairings: ['Dark Denim', 'Chelsea Boots', 'Wool Coat'],
    };
  }
}

export async function parseGarmentImagesBatch(
  items: { base64Data: string; mimeType: string; previewUrl?: string }[]
): Promise<GarmentAttributes[]> {
  const promises = items.map(async (item) => {
    const attr = await parseGarmentImage(item.base64Data, item.mimeType);
    if (item.previewUrl) {
      attr.imageUrl = item.previewUrl;
    }
    return attr;
  });
  return Promise.all(promises);
}
