import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ShoppingBag, Plus, Check, ArrowUpDown } from 'lucide-react';
import axios from 'axios';

interface CatalogExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
  onAddToCloset: (item: any) => void;
  cartItems: any[];
  userGarments: any[];
}

const CATEGORIES = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear', 'Accessories'];

export const CatalogExplorerModal: React.FC<CatalogExplorerModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onAddToCloset,
  cartItems,
  userGarments,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'price-asc' | 'price-desc'>('none');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('/api/catalog');
        setItems(res.data);
      } catch (err) {
        console.warn('Failed to load catalog');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = items
    .filter((item) => {
      const matchCat =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchQuery =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.styleArchetype.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return 0;
    });

  const isInCart = (id: string) => cartItems.some((ci) => ci.id === id);
  const isInCloset = (id: string) => userGarments.some((g) => g.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-5xl glass-panel-luxury rounded-3xl p-6 md:p-8 border border-rose-900/40 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Spring/Autumn 2026 Collection
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">
              Curated Fashion Inventory Catalog
            </h3>
            <p className="text-xs text-slate-400">
              Browse retailer pieces to pair with your wardrobe or purchase for your capsule.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'btn-luxury-primary text-white shadow-md'
                    : 'glass-panel-card text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input & Sort */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search coats, denim, boots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500/40"
              />
            </div>

            <button
              onClick={() => {
                setSortOrder((prev) =>
                  prev === 'none' ? 'price-asc' : prev === 'price-asc' ? 'price-desc' : 'none'
                );
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl glass-panel-card text-xs text-slate-300 border border-slate-800 hover:border-rose-500/40 shrink-0"
              title="Sort by price"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden md:inline">
                {sortOrder === 'price-asc' ? '$ Low-High' : sortOrder === 'price-desc' ? '$ High-Low' : 'Sort'}
              </span>
            </button>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading catalog items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400">
              No garments found matching "{searchQuery}" in {selectedCategory}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const inCart = isInCart(item.id);
                const inCloset = isInCloset(item.id);

                return (
                  <div
                    key={item.id}
                    className="glass-panel-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition-all"
                  >
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-black/70 backdrop-blur-md text-white border border-white/10">
                        {item.category}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl text-xs font-serif font-bold bg-black/80 backdrop-blur-md text-rose-300 border border-white/10">
                        ${item.price}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-xs md:text-sm text-white truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 gap-2">
                        {/* Add to Closet */}
                        <button
                          onClick={() => onAddToCloset(item)}
                          disabled={inCloset}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                            inCloset
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'glass-panel-card text-slate-300 hover:text-white border-slate-800'
                          }`}
                        >
                          {inCloset ? <span>In Closet</span> : <span>+ Closet</span>}
                        </button>

                        {/* Add to Cart */}
                        <button
                          onClick={() => onAddToCart(item)}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                            inCart
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'btn-luxury-primary text-white shadow-md shadow-rose-900/20'
                          }`}
                        >
                          {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                          <span>{inCart ? 'Added' : 'Cart'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
