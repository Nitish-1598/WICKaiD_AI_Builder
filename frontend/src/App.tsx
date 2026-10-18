import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { WardrobeUploader } from './components/WardrobeUploader';
import { GarmentCard } from './components/GarmentCard';
import { CapsuleStudio } from './components/CapsuleStudio';
import { CatalogRecommender } from './components/CatalogRecommender';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { StylistChatDrawer } from './components/StylistChatDrawer';
import { CatalogExplorerModal } from './components/CatalogExplorerModal';
import { WardrobeAnalytics } from './components/WardrobeAnalytics';
import { LookbookExportModal } from './components/LookbookExportModal';
import { MerchantDashboard } from './components/MerchantDashboard';
import { GcpTelemetryModal } from './components/GcpTelemetryModal';
import {
  Sparkles,
  Wand2,
  Shirt,
  Loader2,
  ArrowRight,
  MessageSquare,
  Store,
  BookOpen,
  Filter,
} from 'lucide-react';

const OCCASIONS = [
  'Versatile Everyday',
  'Executive Office & Meetings',
  'Autumn Weekend Travel',
  'Evening Gallery & Dinners',
  'Casual Weekend Brunch',
];

const CLOSET_CATEGORIES = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories'];

export function App() {
  // Local storage persistence
  const [userGarments, setUserGarments] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('capsule_user_garments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartItems, setCartItems] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('capsule_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [capsuleOutfits, setCapsuleOutfits] = useState<any[]>([]);
  const [recommendedCatalog, setRecommendedCatalog] = useState<any[]>([]);
  const [allCatalog, setAllCatalog] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [versatilityScore, setVersatilityScore] = useState(0);

  // Modals & Navigation
  const [currentMode, setCurrentMode] = useState<'shopper' | 'merchant'>('shopper');
  const [isGcpTelemetryOpen, setIsGcpTelemetryOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isLookbookOpen, setIsLookbookOpen] = useState(false);

  // Filters & State
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [closetCategoryFilter, setClosetCategoryFilter] = useState('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Persist garments
  useEffect(() => {
    try {
      localStorage.setItem('capsule_user_garments', JSON.stringify(userGarments));
    } catch (err) {
      console.warn('Storage save error:', err);
    }
  }, [userGarments]);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('capsule_cart_items', JSON.stringify(cartItems));
    } catch (err) {
      console.warn('Storage save error:', err);
    }
  }, [cartItems]);

  // Initial load: catalog and analytics
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get('/api/catalog');
        setAllCatalog(res.data);
        setRecommendedCatalog(res.data.slice(0, 3));
      } catch (err) {
        console.warn('Backend not yet reachable for catalog.');
      }
    };
    fetchInitialData();
  }, []);

  // Update live analytics whenever userGarments change
  useEffect(() => {
    const updateAnalytics = async () => {
      if (userGarments.length === 0) {
        setAnalytics(null);
        setVersatilityScore(0);
        return;
      }
      try {
        const res = await axios.post('/api/analytics', {
          userGarments,
          outfitsCount: capsuleOutfits.length || 3,
        });
        setAnalytics(res.data);
        setVersatilityScore(res.data.versatilityScore);
      } catch (err) {
        console.warn('Analytics compute error:', err);
      }
    };
    updateAnalytics();
  }, [userGarments, capsuleOutfits.length]);

  const handleGarmentAnalyzed = (garment: any) => {
    setUserGarments((prev) => [...prev, garment]);
  };

  const handleRemoveGarment = (id: string) => {
    setUserGarments((prev) => prev.filter((g) => g.id !== id));
  };

  const handleUpdateGarment = (updated: any) => {
    setUserGarments((prev) =>
      prev.map((g) => (g.id === updated.id ? updated : g))
    );
  };

  const handleResetCloset = () => {
    if (confirm('Are you sure you want to clear all pieces from your digitized closet?')) {
      setUserGarments([]);
      setCapsuleOutfits([]);
      setAnalytics(null);
      setVersatilityScore(0);
      localStorage.removeItem('capsule_user_garments');
    }
  };

  const handleSynthesizeCapsule = async () => {
    if (userGarments.length === 0) return;
    setIsSynthesizing(true);
    try {
      const res = await axios.post('/api/generate-capsule', {
        userGarments,
        occasion: selectedOccasion,
      });
      setCapsuleOutfits(res.data.capsuleOutfits || []);
      setRecommendedCatalog(res.data.recommendedCatalogItems || []);
      if (res.data.analytics) {
        setAnalytics(res.data.analytics);
        setVersatilityScore(res.data.analytics.versatilityScore);
      } else {
        setVersatilityScore(res.data.totalWardrobeVersatilityScore || 85);
      }
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAddToCart = (item: any) => {
    if (!cartItems.some((ci) => ci.id === item.id)) {
      setCartItems((prev) => [...prev, item]);
    }
  };

  const handleAddToCloset = (item: any) => {
    const closetItem = {
      ...item,
      id: `CAT-CLOSET-${item.id}-${Date.now().toString().slice(-4)}`,
      primaryColor: item.color,
    };
    setUserGarments((prev) => [...prev, closetItem]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== id));
  };

  const handleUpdateOutfit = (outfitIdx: number, updatedItems: any[]) => {
    setCapsuleOutfits((prev) => {
      const copy = [...prev];
      if (copy[outfitIdx]) {
        copy[outfitIdx] = {
          ...copy[outfitIdx],
          items: updatedItems,
          palette: updatedItems.map((i: any) => i.colorHex || '#808080'),
        };
      }
      return copy;
    });
  };

  // Filtered closet items
  const filteredCloset = userGarments.filter((g) => {
    if (closetCategoryFilter === 'All') return true;
    return g.category.toLowerCase() === closetCategoryFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-radial-luxury flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        onToggleMode={setCurrentMode}
        onOpenGcpTelemetry={() => setIsGcpTelemetryOpen(true)}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenLookbook={() => setIsLookbookOpen(true)}
        onResetCloset={handleResetCloset}
        versatilityScore={versatilityScore}
        hasOutfits={capsuleOutfits.length > 0}
        closetCount={userGarments.length}
      />

      {/* Conditional View: Merchant Operations vs Shopper Studio */}
      {currentMode === 'merchant' ? (
        <MerchantDashboard onOpenGcpTelemetry={() => setIsGcpTelemetryOpen(true)} />
      ) : (
        /* Main Body Content */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-12">
        
        {/* Editorial Hero Banner */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel-card text-xs font-semibold text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-950/40">
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            <span>Autonomous Capsule Wardrobe Architecture • Gemini Vision + Imagen 3</span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Curate More Looks with <span className="bg-gradient-to-r from-rose-200 via-rose-400 to-amber-200 bg-clip-text text-transparent">Fewer, Timeless Pieces</span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Digitize your wardrobe in seconds. Gemini Multimodal Vision extracts silhouette, fabrics, and formality, while Imagen 3 synthesizes complete editorial outfit combinations.
          </p>

          {/* Occasion Selector Chips */}
          <div className="flex items-center justify-center space-x-2 pt-2 overflow-x-auto pb-1 no-scrollbar">
            {OCCASIONS.map((occ, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOccasion(occ)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedOccasion === occ
                    ? 'btn-luxury-primary text-white shadow-md shadow-rose-900/40 scale-105'
                    : 'glass-panel-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </section>

        {/* Upload & Garment Input Area */}
        <section>
          <WardrobeUploader
            onGarmentAnalyzed={handleGarmentAnalyzed}
            isLoading={isAnalyzing}
          />
        </section>

        {/* User's Closet Inventory Grid */}
        {userGarments.length > 0 && (
          <section className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Shirt className="h-5 w-5 text-rose-400" />
                <h3 className="font-serif text-xl font-bold text-white">
                  Your Digitized Closet ({userGarments.length} Pieces)
                </h3>
              </div>

              {/* Action Buttons: Browse Catalog & Synthesize */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCatalogOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl btn-luxury-secondary text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <Store className="h-3.5 w-3.5 text-rose-400" />
                  <span>Explore Retail Catalog</span>
                </button>

                <button
                  onClick={handleSynthesizeCapsule}
                  disabled={isSynthesizing}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl btn-luxury-primary text-xs md:text-sm font-semibold text-white shadow-xl shadow-rose-950/40 disabled:opacity-50 transition-all hover:scale-[1.02]"
                >
                  {isSynthesizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Capsule Outfits...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>Synthesize Capsule Looks</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Closet Category Filter Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs text-slate-500 font-medium flex items-center space-x-1 mr-1">
                <Filter className="h-3 w-3" />
                <span>Filter:</span>
              </span>
              {CLOSET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setClosetCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    closetCategoryFilter === cat
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Garments Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCloset.map((garment) => (
                <GarmentCard
                  key={garment.id}
                  garment={garment}
                  onRemove={handleRemoveGarment}
                  onUpdate={handleUpdateGarment}
                />
              ))}
            </div>
          </section>
        )}

        {/* Capsule Studio (Imagen 3 Visual Outfit Studio & Customizer) */}
        {capsuleOutfits.length > 0 && (
          <section className="animate-in fade-in duration-500">
            <CapsuleStudio
              outfits={capsuleOutfits}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
              allClosetItems={userGarments}
              allCatalogItems={allCatalog}
              onUpdateOutfit={handleUpdateOutfit}
              onOpenLookbook={() => setIsLookbookOpen(true)}
            />
          </section>
        )}

        {/* Wardrobe Health & Analytics Dashboard */}
        {analytics && userGarments.length > 0 && (
          <section className="animate-in fade-in duration-500">
            <WardrobeAnalytics
              analytics={analytics}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
            />
          </section>
        )}

        {/* Missing Gap Recommendations */}
        {recommendedCatalog.length > 0 && (
          <section className="animate-in fade-in duration-500">
            <CatalogRecommender
              recommendedItems={recommendedCatalog}
              onAddToCart={handleAddToCart}
              cartItems={cartItems}
            />
          </section>
        )}

      </main>
      )}

      {/* Floating Aura AI Stylist Bubble (only in shopper mode) */}
      {currentMode === 'shopper' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center space-x-2.5 px-4 py-3 rounded-full btn-luxury-primary text-white shadow-2xl shadow-rose-950/70 hover:scale-105 transition-all group border border-rose-400/30"
          >
            <div className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <span className="text-xs font-bold tracking-wide">Ask Aura Stylist</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full glass-panel-luxury border-t border-rose-950/40 py-5 text-center text-xs text-slate-500 space-y-1">
        <div>Google Cloud AI Builder Cup 2026 • Retail & Commerce Unified Platform</div>
        <div className="text-[11px] text-slate-600">
          Powered by Gemini 3.5 Multimodal Vision, Imagen 3 Synthesis, Google BigQuery AI & Google Cloud Platform
        </div>
      </footer>

      {/* Google Cloud Platform Telemetry Modal */}
      <GcpTelemetryModal
        isOpen={isGcpTelemetryOpen}
        onClose={() => setIsGcpTelemetryOpen(false)}
      />

      {/* Shoppable Cart Slide-out Drawer */}
      <CheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCartItems([])}
      />

      {/* Aura AI Stylist Chat Drawer */}
      <StylistChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userGarments={userGarments}
        occasion={selectedOccasion}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
      />

      {/* Retail Catalog Explorer Modal */}
      <CatalogExplorerModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onAddToCart={handleAddToCart}
        onAddToCloset={handleAddToCloset}
        cartItems={cartItems}
        userGarments={userGarments}
      />

      {/* Lookbook Export Modal */}
      <LookbookExportModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        outfits={capsuleOutfits}
        occasion={selectedOccasion}
        userGarments={userGarments}
      />
    </div>
  );
}
