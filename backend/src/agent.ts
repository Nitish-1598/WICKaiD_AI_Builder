import { GarmentAttributes, parseGarmentImage } from './tools/visionParser';
import {
  CatalogItem,
  findComplementaryItems,
  getFullCatalog,
  calculateWardrobeAnalytics,
  WardrobeAnalytics,
} from './tools/catalogSearch';
import { CapsuleOutfit, synthesizeCapsuleOutfits } from './tools/outfitSynthesizer';
import { chatWithStylist, ChatMessage, StylistChatResponse } from './tools/stylistChat';

export interface WardrobeAnalysisSession {
  userGarments: GarmentAttributes[];
  recommendedCatalogItems: CatalogItem[];
  capsuleOutfits: CapsuleOutfit[];
  totalWardrobeVersatilityScore: number;
  analytics: WardrobeAnalytics;
}

export async function buildPersonalizedCapsuleWardrobe(
  userGarments: GarmentAttributes[],
  occasion: string = 'Versatile Everyday'
): Promise<WardrobeAnalysisSession> {
  // Step 1: Identify style gaps and retrieve complementary catalog items
  const recommendedCatalogItems = findComplementaryItems(userGarments, 4);

  // Step 2: Synthesize multi-piece outfit combinations via Gemini Stylist
  const capsuleOutfits = await synthesizeCapsuleOutfits(
    userGarments,
    recommendedCatalogItems,
    occasion
  );

  // Step 3: Calculate comprehensive wardrobe analytics & versatility score
  const analytics = calculateWardrobeAnalytics(userGarments, capsuleOutfits.length);

  return {
    userGarments,
    recommendedCatalogItems,
    capsuleOutfits,
    totalWardrobeVersatilityScore: analytics.versatilityScore,
    analytics,
  };
}

export {
  parseGarmentImage,
  getFullCatalog,
  chatWithStylist,
  calculateWardrobeAnalytics,
  ChatMessage,
  StylistChatResponse,
};
