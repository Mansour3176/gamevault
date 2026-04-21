'use client';

import { Product } from '@/types';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/components/Toaster';
import { calcDiscount } from '@/lib/supabase';

const BADGE_STYLES: Record<string, string> = {
  Hot:  'bg-red text-white',
  New:  'bg-accent text-black',
  Sale: 'bg-gold text-black',
  Ltd:  'bg-accent2 text-white',
};

export function ProductCard({ product: p }: { product: Product }) {
  const { addItem, openCart } = useCartStore();
  const toast = useToast();
  const discount = p.old_price ? calcDiscount(p.price, p.old_price) : null;

  function handleAdd() {
    addItem({ id: p.id, name: p.name, price: p.price, image_url: p.image_url });
    toast(`✅ Added: ${p.name.substring(0, 35)}`);
  }

  return (
    <div className="prod-card group bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 relative">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-card2 overflow-hidden">
        <img
          src={p.image_url || 'https://via.placeholder.com/220x293/111620/00D4FF?text=GAME'}
          alt={p.name}
          className="prod-image w-full h-full object-cover transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/220x293/111620/00D4FF?text=GAME'; }}
        />
        {p.badge && (
          <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded font-heading text-[10px] font-bold tracking-widest uppercase ${BADGE_STYLES[p.badge]}`}>
            {p.badge}
          </div>
        )}
        {discount && (
          <div className="absolute top-2.5 right-2.5 bg-red text-white font-heading text-[11px] font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
        {p.platform && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-muted font-heading text-[10px] tracking-widest px-2 py-1 rounded">
            {p.platform}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="font-heading text-[11px] text-accent tracking-widest uppercase mb-1">{p.category}</div>
        <div className="text-sm text-gwhite font-semibold leading-snug mb-3 line-clamp-2">{p.name}</div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="font-heading text-lg font-bold text-accent">{p.price.toFixed(2)} EGP</div>
            {p.old_price && (
              <div className="text-xs text-muted line-through">{p.old_price.toFixed(2)} EGP</div>
            )}
          </div>
          <button onClick={handleAdd}
            className="border border-accent text-accent font-heading text-[11px] font-bold tracking-widest px-3 py-1.5 rounded hover:bg-accent hover:text-black transition-all uppercase">
            + ADD
          </button>
        </div>
      </div>
    </div>
  );
}
