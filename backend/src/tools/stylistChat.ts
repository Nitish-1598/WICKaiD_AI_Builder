import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { GarmentAttributes } from './visionParser';
import { CatalogItem } from './catalogSearch';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StylistChatResponse {
  reply: string;
  recommendedItemIds: string[];
  suggestedAction?: 'synthesize' | 'browse' | 'cart';
}

export async function chatWithStylist(
  userMessage: string,
  history: ChatMessage[],
  userGarments: GarmentAttributes[],
  catalog: CatalogItem[],
  occasion: string = 'Versatile Everyday'
): Promise<StylistChatResponse> {
  const modelName = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash-lite';
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const wardrobeSummary = userGarments.length > 0
    ? userGarments.map((g) => `- [${g.category}] ${g.name} (${g.primaryColor}, Formality: ${g.formality}/10)`).join('\n')
    : 'User has not uploaded any garments yet.';

  const catalogSummary = catalog.slice(0, 10).map((c) =>
    `- ID: ${c.id} | ${c.name} (${c.category}, $${c.price}, ${c.color}, Formality: ${c.formality}/10)`
  ).join('\n');

  const systemInstruction = `
You are "Aura", an Elite AI Personal Stylist & Capsule Wardrobe Architect powered by Google Gemini.
Your expertise is in minimalist luxury, Parisian tailoring, quiet luxury, and capsule wardrobe optimization (doing more with fewer, high-versatility garments).

CURRENT USER WARDROBE:
${wardrobeSummary}

FEATURED RETAILER CATALOG PIECES:
${catalogSummary}

ACTIVE OCCASION/VIBE: "${occasion}"

CONVERSATION RULES:
1. Provide warm, sophisticated, concise styling advice.
2. Directly reference the user's specific garments by name and color.
3. Suggest specific pairings from their closet or point out gaps where a catalog piece would elevate the look.
4. If recommending a catalog item, mention it naturally and note its ID in your recommendations.
5. If the user asks about packing, travel, dates, work, or events, give actionable outfit formulas (e.g. Base Layer + Mid Layer + Statement Outerwear + Footwear).
6. Format your answer with elegant markdown (bolding key items, bullet points for outfit recipes).
`;

  try {
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemInstruction }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am Aura, your capsule wardrobe stylist. I am ready to advise you based on your closet and catalog.' }],
        },
        ...history.slice(-6).map((msg) => ({
          role: msg.role === 'model' ? ('model' as const) : ('user' as const),
          parts: [{ text: msg.text }],
        })),
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const reply = result.response.text();

    // Check which catalog items are mentioned in the response
    const recommendedItemIds = catalog
      .filter((item) =>
        reply.toLowerCase().includes(item.name.toLowerCase()) ||
        reply.toLowerCase().includes(item.id.toLowerCase())
      )
      .map((item) => item.id);

    return {
      reply,
      recommendedItemIds: recommendedItemIds.slice(0, 3),
    };
  } catch (err: any) {
    console.error('❌ Stylist Chat Error:', err);
    return {
      reply: `I love that question! For ${occasion}, I recommend pairing your neutral wardrobe staples with clean, tailored lines. Roll your trouser hems once to showcase sleek footwear, and drape your outerwear effortlessly over your shoulders for modern editorial flair.`,
      recommendedItemIds: catalog.slice(0, 2).map((c) => c.id),
    };
  }
}
