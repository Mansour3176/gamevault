'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { FREE_SHIPPING_MIN, SHIPPING_COST } from './supabase';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: () => number;
  shipping: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({ items: get().items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) });
        } else {
          set({ items: [...get().items, { ...item, qty: 1 }] });
        }
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      updateQty: (id, qty) => {
        if (qty < 1) return get().removeItem(id);
        set({ items: get().items.map((i) => i.id === id ? { ...i, qty } : i) });
      },

      clearCart: () => set({ items: [] }),
      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal:  () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      shipping:  () => get().subtotal() >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST,
      total:     () => get().subtotal() + get().shipping(),
      itemCount: () => get().items.reduce((s, i) => s + i.qty, 0),
    }),
    { name: 'gamevault-cart' }
  )
);
