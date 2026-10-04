import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { parseGarmentImage, parseGarmentImagesBatch } from './tools/visionParser';
import { getFullCatalog, searchCatalog, calculateWardrobeAnalytics } from './tools/catalogSearch';
import { buildPersonalizedCapsuleWardrobe, chatWithStylist } from './agent';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Allow large image uploads (base64)
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup multer memory storage for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// System Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'VisualCapsule-Stylist Backend',
    gcpProject: process.env.GCP_PROJECT_ID || 'ai-builder-sql-copilot',
    visionModel: process.env.GEMINI_VISION_MODEL || 'gemini-3.5-flash-lite',
    textModel: process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash-lite',
    imagenModel: process.env.IMAGEN_MODEL || 'imagen-3.0-generate-002',
    timestamp: new Date().toISOString(),
  });
});

// Get Retailer Fashion Inventory Catalog (Supports search, category, and maxPrice filtering)
app.get('/api/catalog', (req: Request, res: Response) => {
  const { category, q, maxPrice } = req.query;
  const parsedPrice = maxPrice ? parseFloat(maxPrice as string) : undefined;
  
  if (category || q || maxPrice) {
    const filtered = searchCatalog(category as string, q as string, parsedPrice);
    return res.json(filtered);
  }
  
  res.json(getFullCatalog());
});

// Analyze Single Garment via Gemini Multimodal Vision
app.post('/api/analyze-garment', upload.single('image'), async (req: Request, res: Response) => {
  try {
    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (req.file) {
      base64Data = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.imageBase64) {
      base64Data = req.body.imageBase64;
      mimeType = req.body.mimeType || 'image/jpeg';
    } else {
      return res.status(400).json({ error: 'Please upload an image file or provide imageBase64.' });
    }

    console.log('📸 Analyzing garment photo via Gemini Multimodal Vision...');
    const garmentAttributes = await parseGarmentImage(base64Data, mimeType);

    if (req.body.previewUrl) {
      garmentAttributes.imageUrl = req.body.previewUrl;
    }

    res.json(garmentAttributes);
  } catch (err: any) {
    console.error('❌ Garment Analysis Error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze garment image.' });
  }
});

// Batch Analyze Multiple Garments via Gemini Multimodal Vision
app.post('/api/analyze-batch', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be an array with at least one image.' });
    }

    console.log(`📸 Batch analyzing ${items.length} garments via Gemini Vision...`);
    const results = await parseGarmentImagesBatch(items);
    res.json(results);
  } catch (err: any) {
    console.error('❌ Batch Garment Analysis Error:', err);
    res.status(500).json({ error: err.message || 'Failed to batch analyze garments.' });
  }
});

// Interactive AI Stylist Chat
app.post('/api/chat-stylist', async (req: Request, res: Response) => {
  try {
    const { message, history, userGarments, occasion } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message is required.' });
    }

    console.log(`💬 AI Stylist query: "${message.slice(0, 60)}..."`);
    const catalog = getFullCatalog();
    const response = await chatWithStylist(
      message,
      history || [],
      userGarments || [],
      catalog,
      occasion || 'Versatile Everyday'
    );

    res.json(response);
  } catch (err: any) {
    console.error('❌ Stylist Chat Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process stylist chat.' });
  }
});

// Compute Live Wardrobe Analytics & Gap Analysis
app.post('/api/analytics', (req: Request, res: Response) => {
  try {
    const { userGarments, outfitsCount } = req.body;
    const analytics = calculateWardrobeAnalytics(userGarments || [], outfitsCount || 3);
    res.json(analytics);
  } catch (err: any) {
    console.error('❌ Analytics Error:', err);
    res.status(500).json({ error: err.message || 'Failed to calculate analytics.' });
  }
});

// Generate Personalized Capsule Wardrobe
app.post('/api/generate-capsule', async (req: Request, res: Response) => {
  try {
    const { userGarments, occasion } = req.body;
    if (!userGarments || !Array.isArray(userGarments)) {
      return res.status(400).json({ error: 'userGarments must be a valid array.' });
    }

    console.log(`👗 Synthesizing Capsule Wardrobe for ${userGarments.length} garments (${occasion || 'Everyday'})...`);
    const session = await buildPersonalizedCapsuleWardrobe(userGarments, occasion);
    res.json(session);
  } catch (err: any) {
    console.error('❌ Capsule Generation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate capsule wardrobe.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 VisualCapsule-Stylist Server running on http://localhost:${PORT}`);
  console.log(`👁️ Vision Model: ${process.env.GEMINI_VISION_MODEL || 'gemini-3.5-flash-lite'}`);
  console.log(`💬 Text Model: ${process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash-lite'}`);
  console.log(`🎨 Imagen Model: ${process.env.IMAGEN_MODEL || 'imagen-3.0-generate-002'}`);
});
