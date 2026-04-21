'use client';

import { useCartStore } from '@/lib/store';
import { CheckoutModal } from './CheckoutModal';
import { useState } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, shipping, total } = useCartStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      <div onClick={closeCart}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg2 border-l border-border z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-heading text-xl font-bold text-gwhite">🛒 Your Cart</h2>
          <button onClick={closeCart} className="text-muted hover:text-gwhite transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <div className="text-5xl mb-3">🎮</div>
              <p className="font-heading text-sm">Your cart is empty.</p>
              <p className="text-xs mt-1">Add some games!</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-3 border-b border-border">
                <img src={item.image_url || ''} alt={item.name}
                  className="w-14 h-[74px] object-cover rounded bg-card flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56x74/111620/00D4FF?text=G'; }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gwhite font-semibold leading-snug line-clamp-2 mb-1">{item.name}</div>
                  <div className="font-heading text-sm text-accent font-bold">{(item.price * item.qty).toFixed(2)} EGP</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}
                      className="bg-card border border-border text-gwhite w-6 h-6 rounded flex items-center justify-center hover:border-accent transition-colors">
                      <Minus size={10} />
                    </button>
                    <span className="font-heading text-sm text-gwhite min-w-[20px] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}
                      className="bg-card border border-border text-gwhite w-6 h-6 rounded flex items-center justify-center hover:border-accent transition-colors">
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red transition-colors flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border">
            <div className="flex justify-between text-sm text-muted mb-2"><span>Subtotal</span><span>{subtotal().toFixed(2)} EGP</span></div>
            <div className="flex justify-between text-sm text-muted mb-3">
              <span>Shipping</span>
              <span>{shipping() === 0 ? <span className="text-green font-bold">FREE</span> : `${shipping().toFixed(2)} EGP`}</span>
            </div>
            <div className="flex justify-between font-heading text-xl font-bold text-gwhite border-t border-border pt-3 mb-4">
              <span>Total</span><span className="text-accent">{total().toFixed(2)} EGP</span>
            </div>
            <button onClick={() => { closeCart(); setCheckoutOpen(true); }}
              className="w-full bg-accent text-black font-heading font-bold text-sm tracking-widest py-4 rounded hover:bg-[#00b8e0] transition-colors uppercase">
              CHECKOUT →
            </button>
          </div>
        )}
      </div>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
