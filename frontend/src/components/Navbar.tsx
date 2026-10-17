import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Eye,
  Wand2,
  MessageSquare,
  BookOpen,
  Store,
  RotateCcw,
  Cloud,
  LayoutDashboard,
  Shirt,
} from 'lucide-react';

interface NavbarProps {
  currentMode: 'shopper' | 'merchant';
  onToggleMode: (mode: 'shopper' | 'merchant') => void;
  onOpenGcpTelemetry: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenChat: () => void;
  onOpenCatalog: () => void;
  onOpenLookbook: () => void;
  onResetCloset: () => void;
  versatilityScore: number;
  hasOutfits: boolean;
  closetCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onToggleMode,
  onOpenGcpTelemetry,
  cartCount,
  onOpenCart,
  onOpenChat,
  onOpenCatalog,
  onOpenLookbook,
  onResetCloset,
  versatilityScore,
  hasOutfits,
  closetCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel-luxury border-b border-rose-950/40 px-3 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-violet-500 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="h-full w-full bg-[#0b0c10] rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif italic font-bold text-base md:text-xl tracking-wide bg-gradient-to-r from-rose-100 via-stone-200 to-rose-300 bg-clip-text text-transparent">
                CapsuleAI Studio
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Unified Commerce
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Google Cloud AI Builder Cup 2026 • Retail & Commerce
            </p>
          </div>
        </div>

        {/* Center Mode Switcher: Shopper Experience vs Merchant Intelligence */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <button
            onClick={() => onToggleMode('shopper')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentMode === 'shopper'
                ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shopper Studio</span>
            <span className="sm:hidden">Shopper</span>
          </button>

          <button
            onClick={() => onToggleMode('merchant')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentMode === 'merchant'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Merchant Operations</span>
            <span className="sm:hidden">Merchant</span>
          </button>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          
          {/* GCP Telemetry Button */}
          <button
            onClick={onOpenGcpTelemetry}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700/60"
            title="View Live Google Cloud Platform Telemetry"
          >
            <Cloud className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden lg:inline text-[11px] font-mono">GCP Stack</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
          
          {/* Ask Aura Stylist Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl btn-luxury-primary text-xs font-semibold text-white shadow-md shadow-rose-900/30"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Ask Stylist</span>
          </button>

          {/* Browse Catalog Explorer */}
          <button
            onClick={onOpenCatalog}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl btn-luxury-secondary text-xs font-semibold text-slate-300 hover:text-white"
          >
            <Store className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden md:inline">Browse Catalog</span>
          </button>

          {/* Export Lookbook Button (visible when outfits exist) */}
          {hasOutfits && (
            <button
              onClick={onOpenLookbook}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl btn-luxury-secondary text-xs font-semibold text-slate-300 hover:text-white"
              title="Export Lookbook"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden lg:inline">Lookbook</span>
            </button>
          )}

          {/* Versatility Score Indicator */}
          {versatilityScore > 0 && (
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-300">
              <Wand2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Versatility:</span>
              <span className="font-bold text-white">{versatilityScore}%</span>
            </div>
          )}

          {/* Reset Closet (if items exist) */}
          {closetCount > 0 && (
            <button
              onClick={onResetCloset}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Reset Closet"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Shoppable Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl btn-luxury-secondary text-xs font-semibold text-white transition-all"
          >
            <ShoppingBag className="h-4 w-4 text-rose-400" />
            <span className="hidden xs:inline">Cart</span>
            {cartCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
