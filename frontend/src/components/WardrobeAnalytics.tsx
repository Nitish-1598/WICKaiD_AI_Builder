import React from 'react';
import {
  Wand2,
  PieChart,
  Palette,
  TrendingDown,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Check,
} from 'lucide-react';

interface WardrobeAnalyticsProps {
  analytics: any;
  onAddToCart: (item: any) => void;
  cartItems: any[];
}

export const WardrobeAnalytics: React.FC<WardrobeAnalyticsProps> = ({
  analytics,
  onAddToCart,
  cartItems,
}) => {
  if (!analytics || !analytics.categoryDistribution) return null;

  const isInCart = (id: string) => cartItems.some((ci) => ci.id === id);

  return (
    <div className="w-full glass-panel-luxury rounded-3xl p-6 md:p-8 space-y-8 border border-rose-950/50 shadow-2xl">
      
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Wardrobe Intelligence & Versatility Engine</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white mt-1">
            Capsule Health & Color Harmony Analytics
          </h3>
          <p className="text-xs text-slate-400">{analytics.styleSummary}</p>
        </div>

        {/* Versatility Score Dial */}
        <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/30">
          <Wand2 className="h-6 w-6 text-rose-400" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Versatility Rating
            </div>
            <div className="font-serif text-2xl font-bold text-white">
              {analytics.versatilityScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Category Balance + Palette Extraction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Closet Category Balance */}
        <div className="glass-panel-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-300">
            <PieChart className="h-4 w-4 text-rose-400" />
            <span>Closet Category Balance</span>
          </div>

          <div className="space-y-3">
            {analytics.categoryDistribution.map((cat: any) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.category}</span>
                  <span className="text-slate-400 font-mono">
                    {cat.count} pcs ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-700"
                    style={{ width: `${Math.max(5, cat.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Missing Gaps Callout */}
          {analytics.missingCategories?.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Wardrobe Gaps Detected:</span> Missing{' '}
                {analytics.missingCategories.join(', ')}. Add pieces from the catalog to complete your capsule combinations.
              </div>
            </div>
          )}
        </div>

        {/* Right: Extracted Color Palette */}
        <div className="glass-panel-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-slate-300">
            <Palette className="h-4 w-4 text-rose-400" />
            <span>Extracted Closet Palette</span>
          </div>

          <p className="text-xs text-slate-400">
            Harmonious base and accent tones detected across your digitized garments:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {analytics.palette?.map((col: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800"
              >
                <span
                  className="h-8 w-8 rounded-lg shadow-inner border border-white/20 shrink-0"
                  style={{ backgroundColor: col.hex }}
                ></span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{col.color}</div>
                  <div className="text-[10px] font-mono text-slate-400">{col.hex}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs text-slate-400">
            💡 <span className="text-slate-300 font-semibold">Color Theory Tip:</span> A timeless capsule builds on 3 neutral anchor tones (camel, charcoal, cream) and 1–2 seasonal accent hues.
          </div>
        </div>

      </div>

      {/* Cost-Per-Wear (CPW) Simulation Cards */}
      {analytics.costPerWearEstimates?.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-rose-400">
            <TrendingDown className="h-4 w-4" />
            <span>Cost-Per-Wear (CPW) ROI Simulator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.costPerWearEstimates.map((est: any) => {
              const inCart = isInCart(est.itemId);

              return (
                <div
                  key={est.itemId}
                  className="p-4 rounded-2xl glass-panel-card border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <h5 className="font-semibold text-xs md:text-sm text-white">{est.itemName}</h5>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-serif font-bold text-lg text-white">${est.price}</span>
                      <span className="text-[11px] text-slate-400">retail</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Outfits Unlocked</div>
                      <div className="font-bold text-rose-300 text-sm">+{est.outfitsUnlocked} Looks</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Cost Per Wear</div>
                      <div className="font-bold text-emerald-400 text-sm">${est.costPerWear}/wear</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart({ id: est.itemId, name: est.itemName, price: est.price })}
                    className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      inCart
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'btn-luxury-primary text-white'
                    }`}
                  >
                    {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                    <span>{inCart ? 'Added to Cart' : 'Acquire Piece'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
