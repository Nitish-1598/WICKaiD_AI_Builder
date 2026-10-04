import fs from 'fs';
import path from 'path';
import { GarmentAttributes } from './visionParser';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  color: string;
  colorHex: string;
  styleArchetype: string;
  formality: number;
  imageUrl: string;
  description: string;
}

export interface WardrobeAnalytics {
  versatilityScore: number;
  totalPieces: number;
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  palette: {
    color: string;
    hex: string;
    count: number;
  }[];
  missingCategories: string[];
  costPerWearEstimates: {
    itemId: string;
    itemName: string;
    price: number;
    estimatedWears: number;
    costPerWear: number;
    outfitsUnlocked: number;
  }[];
  styleSummary: string;
}

function loadCatalog(): CatalogItem[] {
  const candidatePaths = [
    path.resolve(__dirname, '../data/catalog.json'),
    path.resolve(__dirname, '../../src/data/catalog.json'),
    path.resolve(process.cwd(), 'src/data/catalog.json'),
    path.resolve(process.cwd(), 'data/catalog.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
      } catch (err) {
        console.error('Error parsing catalog at', p, err);
      }
    }
  }
  return [];
}

const catalog: CatalogItem[] = loadCatalog();

export function getFullCatalog(): CatalogItem[] {
  return catalog;
}

export function searchCatalog(
  category?: string,
  query?: string,
  maxPrice?: number
): CatalogItem[] {
  let results = [...catalog];

  if (category && category !== 'All') {
    results = results.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        item.styleArchetype.toLowerCase().includes(q)
    );
  }

  if (maxPrice && !isNaN(maxPrice)) {
    results = results.filter((item) => item.price <= maxPrice);
  }

  return results;
}

export function findComplementaryItems(
  userGarments: GarmentAttributes[],
  limit: number = 3
): CatalogItem[] {
  if (!userGarments || userGarments.length === 0) {
    return catalog.slice(0, limit);
  }

  const presentCategories = new Set(userGarments.map((g) => g.category));
  const avgFormality =
    userGarments.reduce((acc, g) => acc + g.formality, 0) / userGarments.length;

  // Prioritize categories missing from the user's closet
  const missingCategoryItems = catalog.filter(
    (item) => !presentCategories.has(item.category as any)
  );

  const candidates = missingCategoryItems.length > 0 ? missingCategoryItems : catalog;

  const scoredItems = candidates.map((item) => {
    const formalityDiff = Math.abs(item.formality - avgFormality);
    return { item, score: formalityDiff };
  });

  scoredItems.sort((a, b) => a.score - b.score);
  return scoredItems.slice(0, limit).map((s) => s.item);
}

export function calculateWardrobeAnalytics(
  userGarments: GarmentAttributes[],
  outfitsCount: number = 3
): WardrobeAnalytics {
  const allCategories = ['Outerwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories'];
  const total = userGarments.length;

  // Category distribution
  const counts: Record<string, number> = {};
  allCategories.forEach((cat) => (counts[cat] = 0));
  userGarments.forEach((g) => {
    counts[g.category] = (counts[g.category] || 0) + 1;
  });

  const categoryDistribution = allCategories.map((cat) => ({
    category: cat,
    count: counts[cat] || 0,
    percentage: total > 0 ? Math.round(((counts[cat] || 0) / total) * 100) : 0,
  }));

  const missingCategories = allCategories.filter((cat) => (counts[cat] || 0) === 0);

  // Palette extraction
  const colorMap: Record<string, { hex: string; count: number }> = {};
  userGarments.forEach((g) => {
    const key = g.primaryColor || 'Neutral';
    if (!colorMap[key]) {
      colorMap[key] = { hex: g.colorHex || '#808080', count: 0 };
    }
    colorMap[key].count += 1;
  });

  const palette = Object.entries(colorMap).map(([color, data]) => ({
    color,
    hex: data.hex,
    count: data.count,
  }));

  // True versatility score based on category coverage & piece count
  const categoryBonus = (allCategories.length - missingCategories.length) * 12;
  const pieceBonus = Math.min(28, total * 6);
  const outfitBonus = outfitsCount * 4;
  const versatilityScore = total === 0 ? 0 : Math.min(98, Math.max(35, categoryBonus + pieceBonus + outfitBonus));

  // Cost per wear simulation for top 3 gap pieces
  const complementary = findComplementaryItems(userGarments, 3);
  const costPerWearEstimates = complementary.map((c, idx) => {
    const estimatedWears = 24 + idx * 8;
    const outfitsUnlocked = Math.max(3, total * 2 - idx);
    return {
      itemId: c.id,
      itemName: c.name,
      price: c.price,
      estimatedWears,
      costPerWear: Number((c.price / estimatedWears).toFixed(2)),
      outfitsUnlocked,
    };
  });

  let styleSummary = 'Curate more foundational wardrobe pieces to establish a signature aesthetic.';
  if (total >= 4) {
    const dominantCategory = categoryDistribution.reduce((a, b) => (a.count > b.count ? a : b));
    styleSummary = `Strong ${dominantCategory.category} foundation with ${palette.length} complementary tones. Filling ${missingCategories.length} remaining categories will maximize outfit versatility.`;
  }

  return {
    versatilityScore,
    totalPieces: total,
    categoryDistribution,
    palette,
    missingCategories,
    costPerWearEstimates,
    styleSummary,
  };
}
