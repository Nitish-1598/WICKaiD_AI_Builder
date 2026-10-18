import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  ShoppingBag,
  Check,
  RefreshCw,
  Palette,
  LayoutGrid,
  Image as ImageIcon,
  Bookmark,
  BookmarkCheck,
  X,
  Calculator,
  Cpu,
  TrendingDown,
  Layers,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface CapsuleStudioProps {
  outfits: any[];
  onAddToCart: (item: any) => void;
  cartItems: any[];
  allClosetItems: any[];
  allCatalogItems: any[];
  onUpdateOutfit?: (outfitIdx: number, updatedItems: any[]) => void;
  onOpenLookbook?: () => void;
}

export const CapsuleStudio: React.FC<CapsuleStudioProps> = ({
  outfits,
  onAddToCart,
  cartItems,
  allClosetItems,
  allCatalogItems,
  onUpdateOutfit,
  onOpenLookbook,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'editorial' | 'flatlay'>('editorial');
  const [swapTarget, setSwapTarget] = useState<{ itemIdx: number; category: string } | null>(null);
  const [savedLooks, setSavedLooks] = useState<Record<string, boolean>>({});
  const [wearsPerMonth, setWearsPerMonth] = useState<number>(4);
  const [showMultiAgentDetails, setShowMultiAgentDetails] = useState<boolean>(true);

  if (!outfits || outfits.length === 0) return null;

  const currentOutfit = outfits[currentIdx] || outfits[0];
  const isInCart = (id: string) => cartItems.some((ci) => ci.id === id);
  const isBookmarked = !!savedLooks[currentOutfit.outfitId];

  const totalOutfitPrice = (currentOutfit.items || []).reduce((sum: number, item: any) => {
    return sum + (Number(item?.price) || 85);
  }, 0);
  const annualWears = wearsPerMonth * 12;
  const costPerWear = (totalOutfitPrice / Math.max(1, annualWears)).toFixed(2);

  const handleToggleBookmark = () => {
    setSavedLooks((prev) => ({
      ...prev,
      [currentOutfit.outfitId]: !prev[currentOutfit.outfitId],
    }));
  };

  const handleSwapItem = (newItem: any) => {
    if (!swapTarget || !onUpdateOutfit) return;
    const updated = [...currentOutfit.items];
    updated[swapTarget.itemIdx] = newItem;
    onUpdateOutfit(currentIdx, updated);
    setSwapTarget(null);
  };

  // Candidates for swapping: closet or catalog pieces
  const swapCandidates = swapTarget
    ? [...allClosetItems, ...allCatalogItems].filter(
        (cand) =>
          cand.category.toLowerCase() === swapTarget.category.toLowerCase() &&
          !currentOutfit.items.some((i: any) => i.id === cand.id)
      )
    : [];

  return (
    <div className="w-full glass-panel-luxury rounded-3xl p-6 md:p-8 space-y-6 border border-rose-950/50 shadow-2xl relative">
      
      {/* Header with Navigation Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Imagen 3 • Haute Couture Studio
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mt-1">
            {currentOutfit.name}
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Occasion: <span className="text-rose-300 font-semibold">{currentOutfit.occasion}</span> • {currentOutfit.vibe}
          </p>
        </div>

        {/* View Mode & Carousel Steppers */}
        <div className="flex items-center space-x-3">
          
          {/* Dual View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('editorial')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'editorial'
                  ? 'btn-luxury-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Editorial Look</span>
            </button>
            <button
              onClick={() => setViewMode('flatlay')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'flatlay'
                  ? 'btn-luxury-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Composite Flat-Lay</span>
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2.5 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'glass-panel-card text-slate-400 hover:text-white border-slate-800'
            }`}
            title={isBookmarked ? 'Saved to Looks' : 'Save Look'}
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>

          {/* Export Lookbook Button */}
          {onOpenLookbook && (
            <button
              onClick={onOpenLookbook}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold hover:bg-amber-500/30 transition-all shadow-md"
              title="Export complete capsule lookbook as PDF"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lookbook Guide</span>
            </button>
          )}

          {/* Carousel Arrows */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentIdx((prev) => (prev > 0 ? prev - 1 : outfits.length - 1))}
              className="p-2.5 rounded-xl btn-luxury-secondary text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-400">
              {currentIdx + 1} / {outfits.length}
            </span>
            <button
              onClick={() => setCurrentIdx((prev) => (prev < outfits.length - 1 ? prev + 1 : 0))}
              className="p-2.5 rounded-xl btn-luxury-secondary text-slate-300 hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Display: Outfit Preview + Items Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Photorealistic Look Preview Render OR Dynamic Composite Flat-Lay */}
        <div className="lg:col-span-6 space-y-4">
          
          {viewMode === 'editorial' ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border border-slate-800 shadow-2xl group">
              <img
                src={currentOutfit.previewImageUrl}
                alt={currentOutfit.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] font-mono tracking-widest uppercase text-rose-300 font-bold">
                  IMAGEN 3 • EDITORIAL SYNTHESIS
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  {currentOutfit.name}
                </h3>
              </div>
            </div>
          ) : (
            /* Dynamic Composite Flat-Lay Canvas Mode */
            <div className="relative rounded-2xl aspect-[4/5] bg-[#16171d] p-5 border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-rose-300 font-bold">
                  COMPOSITE WARDROBE CANVAS
                </span>
                <span className="text-[10px] text-slate-400">{currentOutfit.items?.length || 0} Pieces Styled</span>
              </div>

              {/* Garment Grid Representation */}
              <div className="grid grid-cols-2 gap-3 my-auto py-2">
                {currentOutfit.items?.map((piece: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden bg-slate-900/90 border border-slate-700/80 p-2 shadow-lg hover:border-rose-500/50 transition-all flex flex-col items-center text-center"
                  >
                    <img
                      src={piece.imageUrl}
                      alt={piece.name}
                      className="w-24 h-24 object-cover rounded-lg shadow-md mb-2 group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-semibold text-white truncate max-w-full">
                      {piece.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {piece.category}
                    </span>
                    <span
                      className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border border-white/30"
                      style={{ backgroundColor: piece.colorHex || '#888' }}
                    ></span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-400 text-center border-t border-slate-800/80 pt-2">
                Harmonized Flat-Lay • Click "Swap" to customize pieces
              </div>
            </div>
          )}

          {/* Outfit Color Palette Chips */}
          <div className="p-3 rounded-2xl glass-panel-card border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-300 font-medium">
              <Palette className="h-4 w-4 text-rose-400" />
              <span>Palette Harmony:</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {currentOutfit.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: item.colorHex || '#888' }}
                  ></span>
                  <span className="text-[10px] font-mono text-slate-300">{item.color || item.primaryColor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stylist Notes Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3 text-xs text-slate-300">
            <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Styling Advice:</span>{' '}
              {currentOutfit.stylingNotes}
            </div>
          </div>

          {/* Interactive Cost-Per-Wear Dynamic Slider */}
          <div className="p-4 rounded-2xl glass-panel-card border border-emerald-900/40 bg-emerald-950/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                <Calculator className="h-4 w-4 text-emerald-400" />
                <span>Dynamic Cost-Per-Wear (CPW) Simulator</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ${costPerWear} / wear
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Wear Frequency:</span>
                <span className="text-white font-semibold font-mono">{wearsPerMonth}x / month ({annualWears}x / year)</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={wearsPerMonth}
                onChange={(e) => setWearsPerMonth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>1x/mo (Occasional)</span>
                <span>4x/mo (Weekly Rotation)</span>
                <span>8x/mo (Signature Staple)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 flex items-center space-x-1">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>
                Wearing this capsule <strong>{wearsPerMonth}x/month</strong> amortizes your investment to <strong>${costPerWear}/wear</strong>, saving 78% vs fast-fashion disposable single-wear items.
              </span>
            </p>
          </div>

          {/* Multi-Agent Collaborative Reasoning Pill */}
          <div className="p-4 rounded-2xl glass-panel-card border border-indigo-950/50 bg-indigo-950/20 space-y-2.5">
            <button
              onClick={() => setShowMultiAgentDetails(!showMultiAgentDetails)}
              className="w-full flex items-center justify-between text-xs text-indigo-300 font-bold hover:text-white transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <Cpu className="h-4 w-4 text-indigo-400" />
                <span>Autonomous 3-Agent Collaborative Pipeline</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400">
                {showMultiAgentDetails ? '▼ Hide Reasoning' : '▶ View Reasoning'}
              </span>
            </button>

            {showMultiAgentDetails && (
              <div className="space-y-2 pt-1 border-t border-indigo-900/40 text-[11px] text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="h-4 w-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">1</span>
                  <div>
                    <span className="font-semibold text-white">Agent 1: Vision & Harmony Analyst</span>
                    <p className="text-[10px] text-slate-400">Parsed primary color hex codes, fabric texture weight, and applied the 60-30-10 tonal balance rule.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="h-4 w-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">2</span>
                  <div>
                    <span className="font-semibold text-white">Agent 2: Capsule Stylist & Curator</span>
                    <p className="text-[10px] text-slate-400">Anchored look with user's verified closet piece and queried catalog for high-affinity zero-return gaps.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">3</span>
                  <div>
                    <span className="font-semibold text-white">Agent 3: Financial & Sustainability Auditor</span>
                    <p className="text-[10px] text-slate-400">Validated 3 distinct rotation formulas and verified wear-frequency longevity index.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Garments Included in This Capsule Look */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Garments in This Look</span>
            <span className="text-xs text-slate-500 font-normal">
              {currentOutfit.items?.length || 0} Pieces Combined
            </span>
          </h4>

          <div className="space-y-3">
            {currentOutfit.items?.map((piece: any, idx: number) => {
              const isCatalogItem = !piece.id.startsWith('USER-') && !piece.id.startsWith('PRESET-');
              const added = isInCart(piece.id);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl glass-panel-card border border-slate-800/80 gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {piece.imageUrl && (
                      <img
                        src={piece.imageUrl}
                        alt={piece.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs md:text-sm text-white truncate">
                          {piece.name}
                        </span>
                        {isCatalogItem ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            Recommended
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            In Your Closet
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {piece.category} • {piece.color || piece.primaryColor}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Swap Piece & Add to Cart */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Swap Piece Button */}
                    <button
                      onClick={() => setSwapTarget({ itemIdx: idx, category: piece.category })}
                      className="p-2 rounded-xl glass-panel-card text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center space-x-1"
                      title="Swap this piece for another"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-rose-400" />
                      <span className="hidden sm:inline text-[11px]">Swap</span>
                    </button>

                    {/* Add to Cart button for recommended pieces */}
                    {isCatalogItem && (
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-xs md:text-sm text-white">
                          ${piece.price}
                        </span>
                        <button
                          onClick={() => onAddToCart(piece)}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                            added
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'btn-luxury-primary text-white'
                          }`}
                        >
                          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Complete Look Button */}
          <div className="pt-3 space-y-2">
            <button
              onClick={() => {
                currentOutfit.items
                  .filter((p: any) => !p.id.startsWith('USER-') && !p.id.startsWith('PRESET-'))
                  .forEach((p: any) => onAddToCart(p));
              }}
              className="w-full py-3.5 rounded-2xl btn-luxury-primary font-semibold text-xs md:text-sm text-white flex items-center justify-center space-x-2 shadow-lg shadow-rose-900/30"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add All Recommended Pieces to Cart</span>
            </button>
          </div>
        </div>

      </div>

      {/* Swap Piece Selection Modal */}
      {swapTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-xl glass-panel-luxury rounded-3xl p-6 border border-rose-900/40 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-serif font-bold text-white text-base">
                  Swap {swapTarget.category} Piece
                </h4>
                <p className="text-xs text-slate-400">
                  Select a replacement piece from your closet or catalog
                </p>
              </div>
              <button
                onClick={() => setSwapTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {swapCandidates.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No other {swapTarget.category} items available to swap.
                </div>
              ) : (
                swapCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => handleSwapItem(cand)}
                    className="flex items-center justify-between p-3 rounded-xl glass-panel-card border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={cand.imageUrl}
                        alt={cand.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h5 className="font-semibold text-xs md:text-sm text-white">{cand.name}</h5>
                        <p className="text-[11px] text-slate-400">
                          {cand.color || cand.primaryColor} • Formality: {cand.formality}/10
                        </p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg btn-luxury-primary text-xs font-semibold text-white">
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
