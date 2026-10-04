# 👗 VisualCapsule-Stylist: Multimodal AI Personal Shopper & Capsule Wardrobe Stylist
> **Google Cloud AI Builder Cup 2026** • Track: Retail & Commerce (Best Multimodal Agent)

VisualCapsule-Stylist is an autonomous personal shopper and capsule wardrobe architect powered by **Google Gemini 3.5 Multimodal Vision**, **Imagen 3**, and **Google Cloud Platform**. It digitizes a user's closet from photos or webcam scans, analyzes fabric compositions and color palettes, identifies wardrobe gaps, synthesizes editorial capsule looks, and provides an interactive conversational stylist assistant ("Aura").

---

## ✨ Key Features

1. **Multimodal Wardrobe Digitization**:
   - Upload multiple clothing photos (batch drag-and-drop) or capture garments in real time using the live camera scanner.
   - Powered by Gemini 3.5 Multimodal Vision to automatically extract garment name, category, color hex, fabric texture, formality rating (1–10), and recommended pairings.
   - In-place garment attribute editing and closet category filtering (`All`, `Outerwear`, `Tops`, `Bottoms`, `Footwear`, `Accessories`).

2. **Haute Couture Capsule Studio**:
   - Synthesizes 3 distinct multi-piece capsule outfits tailored to specific occasions (*Versatile Everyday*, *Executive Office*, *Weekend Travel*, *Gallery Dinners*).
   - **Dual View Mode**:
     - *Editorial Look*: Photorealistic editorial imagery generated with Imagen 3 prompts.
     - *Composite Flat-Lay Canvas*: Interactive digital flat-lay grid rendering user closet items alongside catalog pieces with drop shadows and labels.
   - **Interactive Swap Customizer**: Click "Swap" on any garment in an outfit to replace it with any piece from your closet or catalog.
   - Extracted color palette chips for every look.

3. **Conversational AI Stylist ("Aura")**:
   - Multi-turn styling assistant with full context of your digitized closet and retailer catalog.
   - Answers natural language questions, provides event-specific packing formulas, and suggests item pairings.

4. **Wardrobe Health & Cost-Per-Wear (CPW) Engine**:
   - Real-time closet category distribution balance (Outerwear : Tops : Bottoms : Footwear : Accessories).
   - Extracted 5-color capsule palette (neutral base vs. accent tones).
   - Cost-Per-Wear ROI Simulator: Calculates how purchasing recommended pieces lowers cost-per-wear and unlocks additional outfit formulas.

5. **Curated Retail Catalog Explorer**:
   - Browse the retailer's inventory of 15+ garments across all categories.
   - Filter by category, search by keyword, sort by price, and add items directly to closet or cart.

6. **Shoppable Cart & Lookbook Export**:
   - 1-click shoppable drawer with tax calculation and checkout celebration.
   - Export Lookbook to Print / PDF or copy a markdown summary for travel packing.
   - Full state persistence via `localStorage`.

---

## 🛠️ Tech Stack & Architecture

- **AI & Models**: Google Gemini 3.5 Flash Lite (`gemini-3.5-flash-lite`), Imagen 3 (`imagen-3.0-generate-002`)
- **Backend**: Node.js, Express, TypeScript, Multer, Google Cloud Storage SDK, `@google/generative-ai`
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Design System**: Luxury dark-mode glassmorphism with Playfair Display typography and rose gold accents

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- Google Gemini API Key (from Google AI Studio)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY
npm install
npm run dev
# Server running on http://localhost:4001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5174
```

---

## 🔒 Security & Privacy Notice
All `.env` environment files, API keys, GCP service account credentials (`gcp-key.json`), and build artifacts are strictly excluded via `.gitignore`.
