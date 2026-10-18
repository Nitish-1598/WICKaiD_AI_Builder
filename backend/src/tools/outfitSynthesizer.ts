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
  const modelName = process.env.IMAGEN_MODEL || 'imagen-3.0-generate-002';
  const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;
  
  try {
    if (apiKey) {
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
          console.log(`✨ Photorealistic outfit flat-lay generated via Google ${modelName}`);
          return `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`;
        }
      }
    }
  } catch (err: any) {
    console.warn(`ℹ️ Imagen 3 API notice (${err.message || 'quota'}). Using curated Scandinavian editorial preview.`);
  }

  return HIGH_RES_EDITORIAL_PREVIEWS[fallbackIndex % HIGH_RES_EDITORIAL_PREVIEWS.length];
}

function getItemsByCategory(catalogItems: CatalogItem[]) {
  return {
    Outerwear: catalogItems.filter((i) => i.category === 'Outerwear'),
    Tops: catalogItems.filter((i) => i.category === 'Tops'),
    Bottoms: catalogItems.filter((i) => i.category === 'Bottoms'),
    Footwear: catalogItems.filter((i) => i.category === 'Footwear'),
    Accessories: catalogItems.filter((i) => i.category === 'Accessories'),
  };
}

function generateIntelligentFallbackOutfits(
  userGarments: GarmentAttributes[],
  catalogItems: CatalogItem[],
  occasionIntent: string
): CapsuleOutfit[] {
  const cat = getItemsByCategory(catalogItems);
  const nowSuffix = Date.now().toString().slice(-4);

  // Helper to pick a catalog item by ID or fallback to category index
  const getCatItem = (category: keyof typeof cat, idx: number): CatalogItem => {
    const list = cat[category];
    return list[idx % list.length] || catalogItems[0];
  };

  // If user provided closet pieces, ensure user garments are the anchor
  if (userGarments.length > 0) {
    const userPiece = userGarments[0];
    const userCategory = userPiece.category;

    // Helper to build cohesive pieces for a look around the user's item
    const buildLookItems = (lookIdx: number): (GarmentAttributes | CatalogItem)[] => {
      // Rotate anchor if user has multiple pieces, else use the single piece for all 3 looks
      const anchor = userGarments.length === 1 ? userPiece : userGarments[lookIdx % userGarments.length];
      const anchorCat = anchor.category;

      const items: (GarmentAttributes | CatalogItem)[] = [anchor];

      // Add Top if anchor isn't a top
      if (anchorCat !== 'Tops') {
        items.push(getCatItem('Tops', lookIdx));
      }

      // Add Bottom if anchor isn't bottoms
      if (anchorCat !== 'Bottoms') {
        items.push(getCatItem('Bottoms', lookIdx));
      }

      // Add Footwear if anchor isn't footwear
      if (anchorCat !== 'Footwear') {
        items.push(getCatItem('Footwear', lookIdx));
      }

      // Add Outerwear or Accessories for layering
      if (anchorCat !== 'Outerwear') {
        if (lookIdx === 0 || lookIdx === 1) {
          items.push(getCatItem('Outerwear', lookIdx));
        } else {
          items.push(getCatItem('Accessories', lookIdx));
        }
      } else {
        items.push(getCatItem('Accessories', lookIdx));
      }

      // If user has a secondary garment from a compatible category, include it in look 1
      if (userGarments.length > 1 && lookIdx === 0) {
        const secondary = userGarments.find((g) => g.category !== anchorCat);
        if (secondary) {
          const conflictIdx = items.findIndex((i) => i.category === secondary.category && i.id !== secondary.id);
          if (conflictIdx !== -1) {
            items[conflictIdx] = secondary;
          }
        }
      }

      return items;
    };

    const look1Items = buildLookItems(0);
    const look2Items = buildLookItems(1);
    const look3Items = buildLookItems(2);

    return [
      {
        outfitId: `OUTFIT-1-${nowSuffix}`,
        name: 'Effortless Tailored Commute',
        vibe: 'Modern architectural structure balanced with warm tactile knitwear.',
        occasion: 'Work & Creative Meetings',
        items: look1Items,
        stylingNotes: `Anchor this look with your ${userPiece.name}. Keep knitwear tucked cleanly to highlight the silhouette and drape outerwear effortlessly over shoulders.`,
        imagenPrompt: `High-end editorial fashion flat-lay photograph of ${look1Items.map((i) => i.name).join(', ')} neatly styled on neutral linen canvas with soft directional window light.`,
        previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[0],
        palette: look1Items.map((i) => (i as any).colorHex || '#36454F'),
      },
      {
        outfitId: `OUTFIT-2-${nowSuffix}`,
        name: 'Sunday Espresso Casual',
        vibe: 'Relaxed tailored casual with effortless organic tones and athletic minimalism.',
        occasion: 'Weekend Casual',
        items: look2Items,
        stylingNotes: `Pair your ${userPiece.name} with clean low-top trainers and a casual outer layer. Roll cuffs once for an unstudied, relaxed weekend poise.`,
        imagenPrompt: `High-end editorial fashion flat-lay photograph of ${look2Items.map((i) => i.name).join(', ')} neatly styled on neutral linen canvas with soft morning light.`,
        previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[1],
        palette: look2Items.map((i) => (i as any).colorHex || '#FAF9F6'),
      },
      {
        outfitId: `OUTFIT-3-${nowSuffix}`,
        name: 'Twilight Bistro Dinner',
        vibe: 'Polished evening elegance blending deep tones with architectural silhouettes.',
        occasion: 'Dinner & Social',
        items: look3Items,
        stylingNotes: `Elevate your ${userPiece.name} for evening dining with structured tailoring and cordovan leather accents. Complete with minimal jewelry or a structured tote.`,
        imagenPrompt: `High-end editorial fashion flat-lay photograph of ${look3Items.map((i) => i.name).join(', ')} neatly styled on neutral linen canvas with dramatic evening lighting.`,
        previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[2],
        palette: look3Items.map((i) => (i as any).colorHex || '#101720'),
      },
    ];
  }

  // Fallback when user closet is completely empty
  const defaultItems1 = [getCatItem('Outerwear', 0), getCatItem('Tops', 0), getCatItem('Bottoms', 0), getCatItem('Footwear', 0)];
  const defaultItems2 = [getCatItem('Outerwear', 2), getCatItem('Tops', 1), getCatItem('Bottoms', 1), getCatItem('Footwear', 1)];
  const defaultItems3 = [getCatItem('Outerwear', 1), getCatItem('Tops', 2), getCatItem('Bottoms', 2), getCatItem('Footwear', 2)];

  return [
    {
      outfitId: `OUTFIT-1-${nowSuffix}`,
      name: 'Effortless Gallery Commute',
      vibe: 'Modern minimalist structure with tactile knitwear contrast.',
      occasion: 'Work & Creative Meetings',
      items: defaultItems1,
      stylingNotes: 'Wear the knit sweater untucked over tailored trousers for clean drapery.',
      imagenPrompt: 'Editorial fashion flat-lay of camel coat, cream turtleneck, and charcoal trousers on linen background.',
      previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[0],
      palette: defaultItems1.map((i) => i.colorHex || '#808080'),
    },
    {
      outfitId: `OUTFIT-2-${nowSuffix}`,
      name: 'Sunday Espresso Casual',
      vibe: 'Relaxed tailored casual with earthy organic tones.',
      occasion: 'Weekend Casual',
      items: defaultItems2,
      stylingNotes: 'Pair with leather boots and roll the pant cuffs once for an effortless look.',
      imagenPrompt: 'Editorial fashion flat-lay of knitwear, selvedge denim, and burnished boots.',
      previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[1],
      palette: defaultItems2.map((i) => i.colorHex || '#808080'),
    },
    {
      outfitId: `OUTFIT-3-${nowSuffix}`,
      name: 'Twilight Bistro Dinner',
      vibe: 'Polished evening elegance with deep monochrome accents.',
      occasion: 'Dinner & Social',
      items: defaultItems3,
      stylingNotes: 'Add structured tote bag and a fine gold watch to elevate the silhouette.',
      imagenPrompt: 'Editorial fashion flat-lay with dark tailored pieces and leather tote.',
      previewImageUrl: HIGH_RES_EDITORIAL_PREVIEWS[2],
      palette: defaultItems3.map((i) => i.colorHex || '#808080'),
    },
  ];
}

export async function synthesizeCapsuleOutfits(
  userGarments: GarmentAttributes[],
  catalogItems: CatalogItem[],
  occasionIntent: string = 'Versatile Everyday'
): Promise<CapsuleOutfit[]> {
  const allAvailablePieces = [...userGarments, ...catalogItems];

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

USER'S DIGITIZED CLOSET PIECES (MANDATORY ANCHORS):
${JSON.stringify(userGarments.map((p) => ({ id: p.id, name: p.name, category: p.category, color: p.colorHex || p.primaryColor, formality: p.formality })), null, 2)}

AVAILABLE RETAIL CATALOG PIECES (COMPLEMENTARY ADDITIONS):
${JSON.stringify(catalogItems.map((p) => ({ id: p.id, name: p.name, category: p.category, color: p.colorHex || p.color, formality: p.formality })), null, 2)}

OCCASION VIBE INTENT: "${occasionIntent}"

CRITICAL STYLING RULES:
1. MANDATORY USER PIECE INCLUSION:
   - EVERY single outfit look MUST feature at least one piece from the USER'S DIGITIZED CLOSET as the anchor!
   - If the user has only 1 piece (e.g. "${userGarments[0]?.name || ''}"), that exact piece MUST be included in ALL 3 outfits! Show 3 completely different ways to style that one piece.
   - If the user has multiple closet pieces, rotate and distribute them so every outfit includes user piece(s).
2. COMPLETE & WEARABLE OUTFITS:
   - Each outfit MUST be a complete, wearable look containing 3 to 4 items:
     - 1 Top (or Top + Outerwear)
     - 1 Bottom (never output an outfit without pants/bottoms)
     - 1 Footwear
     - Optional Outerwear or Accessory
3. DISTINCT AESTHETICS:
   - Look 1: Smart Tailored / Work Commute
   - Look 2: Relaxed Weekend Casual
   - Look 3: Polished Evening / Social Dinner
4. Formulate an evocative Imagen 3 prompt: "High-end editorial fashion flat-lay photograph of [Garment Names] neatly styled on neutral linen canvas with soft directional window light, Vogue Scandinavia aesthetic."
5. Provide actionable, professional styling notes referencing how to wear and style the user's specific piece.
6. Return ONLY a valid JSON array of 3 outfits:
[
  {
    "name": "Look title (e.g. Parisian Monochromatic Tailoring)",
    "vibe": "1 evocative sentence describing silhouette, mood, and aesthetic balance",
    "occasion": "Specific event context (e.g. Work & Creative Meetings, Weekend Casual, Dinner & Social)",
    "itemIds": ["id1", "id2", "id3", "id4"],
    "stylingNotes": "Pro styling tip referencing the user piece and styling techniques (tuck, cuff, drape, layer).",
    "imagenPrompt": "Editorial flat-lay outfit layout description for Imagen 3"
  }
]
`;

  try {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured, using intelligent stylist fallback.');
    }

    const result = await model.generateContent(prompt);
    const parsedOutfits = JSON.parse(result.response.text());

    if (!Array.isArray(parsedOutfits) || parsedOutfits.length === 0) {
      throw new Error('Invalid outfit structure returned from Gemini.');
    }

    const synthesizedPromises = parsedOutfits.map(async (outfit: any, idx: number) => {
      let selectedItems = allAvailablePieces.filter((p) =>
        outfit.itemIds?.includes(p.id)
      );

      // GUARANTEE: User garments MUST be present in every outfit!
      if (userGarments.length > 0) {
        if (userGarments.length === 1) {
          const userItem = userGarments[0];
          // If the user's single item is not in selectedItems:
          if (!selectedItems.some((i) => i.id === userItem.id)) {
            // Remove any catalog item of conflicting category to avoid duplicate bottoms/tops
            selectedItems = selectedItems.filter((i) => i.category !== userItem.category);
            selectedItems.unshift(userItem);
          }
        } else {
          // If multiple user garments, ensure at least one is present
          const hasUserGarment = selectedItems.some((si) =>
            userGarments.some((ug) => ug.id === si.id)
          );
          if (!hasUserGarment) {
            const userItem = userGarments[idx % userGarments.length];
            selectedItems = selectedItems.filter((i) => i.category !== userItem.category);
            selectedItems.unshift(userItem);
          }
        }
      }

      // Ensure the outfit has at least 3 items and is complete
      if (selectedItems.length < 3) {
        const presentCategories = new Set(selectedItems.map((i) => i.category));
        for (const catItem of catalogItems) {
          if (!presentCategories.has(catItem.category) && !selectedItems.some((i) => i.id === catItem.id)) {
            selectedItems.push(catItem);
            presentCategories.add(catItem.category);
            if (selectedItems.length >= 4) break;
          }
        }
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
    console.warn('⚠️ Capsule Synthesis Note:', err.message || err);
    return generateIntelligentFallbackOutfits(userGarments, catalogItems, occasionIntent);
  }
}
