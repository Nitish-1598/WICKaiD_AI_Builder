import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
}) => {
  const [isOrdered, setIsOrdered] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + estimatedTax;

  const handleCheckout = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setIsOrdered(true);
    setTimeout(() => {
      onClearCart();
      setIsOrdered(false);
      onClose();
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md glass-panel-luxury h-full border-l border-rose-950/50 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-white">Shoppable Capsule Cart</h2>
                <p className="text-xs text-slate-400">{cartItems.length} items selected</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Itemized List */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <ShoppingBag className="h-8 w-8 mx-auto text-slate-600" />
                <p>Your capsule cart is empty.</p>
                <p className="text-[11px] text-slate-500">
                  Add recommended wardrobe pieces to complete your capsule looks!
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-xs text-white truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-400">{item.category} • ${item.price}</p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Checkout Summary */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-mono text-white">${estimatedTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800/60">
              <span className="font-serif">Total Order</span>
              <span className="font-mono text-rose-400 font-bold">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          {isOrdered ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-center text-xs font-bold flex items-center justify-center space-x-2 animate-in zoom-in-95">
              <CheckCircle2 className="h-5 w-5" />
              <span>Capsule Order Confirmed! Shipping Soon.</span>
            </div>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 rounded-2xl btn-luxury-primary text-sm font-semibold text-white flex items-center justify-center space-x-2 shadow-xl shadow-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>1-Click Order Capsule</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
            <span>Encrypted Checkout • Free Global Shipping & Returns</span>
          </div>
        </div>

      </div>
    </div>
  );
};
