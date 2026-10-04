import React from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';

interface CatalogRecommenderProps {
  recommendedItems: any[];
  onAddToCart: (item: any) => void;
  cartItems: any[];
}

export const CatalogRecommender: React.FC<CatalogRecommenderProps> = ({
  recommendedItems,
  onAddToCart,
  cartItems,
}) => {
  if (!recommendedItems || recommendedItems.length === 0) return null;

  const isInCart = (id: string) => cartItems.some((ci) => ci.id === id);

  return (
    <div className="w-full space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Wardrobe Gap Analysis</span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-white mt-0.5">
            Recommended Pieces to Complete Your Capsule
          </h3>
        </div>
      </div>

      {/* Grid of Recommended Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendedItems.map((item) => {
          const added = isInCart(item.id);

          return (
            <div
              key={item.id}
              className="glass-panel-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group"
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/70 backdrop-blur-md text-white border border-white/10">
                  {item.category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl text-xs font-serif font-bold bg-black/80 backdrop-blur-md text-white border border-white/10">
                  ${item.price}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Style: <span className="text-rose-300 font-medium">{item.styleArchetype}</span>
                  </span>

                  <button
                    onClick={() => onAddToCart(item)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      added
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'btn-luxury-primary text-white shadow-md shadow-rose-900/20'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
