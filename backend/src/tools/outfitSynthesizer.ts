import { GoogleGenerativeAI } from '@google/generative-ai';
import { GarmentAttributes } from './visionParser';
import { CatalogItem } from './catalogSearch';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface CapsuleOutfit {
  outfitId: string;
  name: string;
  vibe: string;
  occasion: string;
  items: (GarmentAttributes | CatalogItem)[];
  stylingNotes: string;
  imagenPrompt: string;
  previewImageUrl: string;
  palette: string[];
}

const HIGH_RES_EDITORIAL_PREVIEWS = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85',
];

/**
 * Attempts to generate photorealistic outfit image via Imagen 3 API.
 * If quota-limited or unavailable, returns high-res editorial preview.
 */
async function generateImagenFlatlay(prompt: string, fallbackIndex: number): Promise<string> {
  const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  
  try {
    const res = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '1:1', outputMimeType: 'image/jpeg' },
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
        return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
      }
    }
  } catch (err) {
    // Graceful fallback to high-res editorial photography
  }

  return HIGH_RES_EDITORIAL_PREVIEWS[fallbackIndex % HIGH_RES_EDITORIAL_PREVIEWS.length];
}

export async function synthesizeCapsuleOutfits(
  userGarments: GarmentAttributes[],
  recommendedCatalogItems: CatalogItem[],
  occasionIntent: string = 'Versatile Everyday'
): Promise<CapsuleOutfit[]> {
  const allAvailablePieces = [...userGarments, ...recommendedCatalogItems];

  const modelName = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash-lite';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are a World-Class Haute Couture Capsule Wardrobe Director.
Synthesize 3 distinct, cohesive capsule wardrobe outfit looks combining these garments:
AVAILABLE ITEMS:
${JSON.stringify(allAvailablePieces.map((p) => ({ id: p.id, name: p.name, category: p.category, color: p.colorHex, formality: p.formality })), null, 2)}

OCCASION VIBE: "${occasionIntent}"

CRITICAL RULES:
1. Each outfit must combine 3 to 4 complementary items from the available list.
2. Mix user's existing pieces with recommended catalog pieces seamlessly.
3. Formulate a rich Imagen 3 prompt: "High-end editorial fashion flat-lay photograph of [Garment Descriptions] neatly styled on neutral linen canvas with soft directional window light, Vogue Scandinavia aesthetic."
4. Provide precise, actionable styling tips (e.g. how to tuck, roll, cuff, or layer).
5. Return ONLY a valid JSON array of 3 outfits:
[
  {
    "name": "Look title (e.g. Parisian Monochromatic Tailoring)",
    "vibe": "1 evocative sentence describing silhouette, mood, and aesthetic balance",
    "occasion": "Specific event context (e.g. Executive Boardroom, Weekend Gallery Walk, Candlelit Bistro)",
    "itemIds": ["id1", "id2", "id3"],
    "stylingNotes": "Pro styling tip: French-tuck the top into trousers and drape overcoat effortlessly over shoulders.",
    "imagenPrompt": "Editorial flat-lay outfit layout description for Imagen 3"
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const parsedOutfits = JSON.parse(result.response.text());

    const synthesizedPromises = parsedOutfits.map(async (outfit: any, idx: number) => {
      let selectedItems = allAvailablePieces.filter((p) =>
        outfit.itemIds?.includes(p.id)
      );

      if (selectedItems.length === 0) {
        selectedItems = allAvailablePieces.slice(idx * 2, idx * 2 + 3);
      }

      const palette = selectedItems.map((item) => (item as any).colorHex || '#808080');
      const previewImageUrl = await generateImagenFlatlay(
        outfit.imagenPrompt || `High-fashion flat lay of ${outfit.name}`,
        idx
      );

      return {
        outfitId: `OUTFIT-${idx + 1}-${Date.now().toString().slice(-4)}`,
        name: outfit.name || `Capsule Silhouette #${idx + 1}`,
        vibe: outfit.vibe || 'Cohesive, versatile modern silhouette.',
        occasion: outfit.occasion || occasionIntent,
        items: selectedItems,
        stylingNotes: outfit.stylingNotes || 'Layer outerwear cleanly over knitwear and finish with leather footwear.',
        imagenPrompt: outfit.imagenPrompt || 'Editorial flat-lay layout on neutral linen.',
        previewImageUrl,
        palette,
      };
    });

    return await Promise.all(synthesizedPromises);
  } catch (err: any) {
    console.error('❌ Capsule Synthesis Error:', err);
    // Intelligent fallback
    return [
      {
        outfitId: 'OUTFIT-1',
        name: 'Effortless Gallery Commute',
        vibe: 'Modern minimalist structure with tactile knitwear contrast.',
        occasion: 'Work & Creative Meetings',
        items: allAvailablePieces.slice(0, 3),
        stylingNotes: 'Wear the knit sweater untucked over tailored trousers for clean drapery.',
        imagenPrompt: 'Editorial fashion flat-lay of camel coat, cream turtleneck, and charcoal trousers on linen background.',
        previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[0],
        palette: ['#C19A6B', '#FAF9F6', '#36454F'],
      },
      {
        outfitId: 'OUTFIT-2',
        name: 'Sunday Espresso Casual',
        vibe: 'Relaxed tailored casual with earthy organic tones.',
        occasion: 'Weekend Casual',
        items: allAvailablePieces.slice(1, 4),
        stylingNotes: 'Pair with leather boots and roll the pant cuffs once for an effortless look.',
        imagenPrompt: 'Editorial fashion flat-lay of knitwear, selvedge denim, and burnished boots.',
        previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[1],
        palette: ['#FAF9F6', '#36454F', '#834333'],
      },
      {
        outfitId: 'OUTFIT-3',
        name: 'Twilight Bistro Dinner',
        vibe: 'Polished evening elegance with deep monochrome accents.',
        occasion: 'Dinner & Social',
        items: allAvailablePieces.slice(2, 5),
        stylingNotes: 'Add structured tote bag and a fine gold watch to elevate the silhouette.',
        imagenPrompt: 'Editorial fashion flat-lay with dark tailored pieces and leather tote.',
        previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[2],
        palette: ['#36454F', '#834333', '#101720'],
      },
    ];
  }
}
