'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { useToast } from './Toaster';
import { X } from 'lucide-react';

export function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, subtotal, shipping, total, clearCart } = useCartStore();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) { toast('⚠️ Please fill your name and email'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image_url: i.image_url })) }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        setSuccess(data.order_number);
      } else {
        toast('❌ ' + (data.error ?? 'Order failed. Try again.'));
      }
    } catch {
      toast('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSuccess(null);
    setForm({ name: '', email: '', phone: '', notes: '' });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      <div className="relative bg-bg2 border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
        <button onClick={handleClose} className="absolute top-4 right-4 text-muted hover:text-gwhite transition-colors">
          <X size={20} />
        </button>

        {success ? (
          // Success state
          <div className="text-center py-6">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="font-heading text-2xl font-bold text-green mb-2">Order Placed!</h2>
            <div className="font-heading text-xl text-accent my-4">{success}</div>
            <p className="text-muted leading-relaxed">
              Thank you, <strong className="text-gwhite">{form.name}</strong>!<br />
              Your game key will be sent to <strong className="text-gwhite">{form.email}</strong> shortly.
            </p>
            <button onClick={handleClose}
              className="mt-6 bg-accent text-black font-heading font-bold text-sm tracking-widest px-8 py-3 rounded hover:bg-[#00b8e0] transition-colors uppercase">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-heading text-2xl font-bold text-gwhite mb-6">Complete Your Order</h2>

            {/* Order summary */}
            <div className="bg-card rounded p-4 mb-6">
              <p className="font-heading text-xs text-muted tracking-widest uppercase mb-3">Order Summary</p>
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-sm text-gtext mb-1.5">
                  <span className="truncate mr-2">{i.name.substring(0, 38)}{i.name.length > 38 ? '...' : ''} ×{i.qty}</span>
                  <span className="flex-shrink-0">{(i.price * i.qty).toFixed(2)} EGP</span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-muted mt-2 pt-2 border-t border-border">
                <span>Shipping</span>
                <span>{shipping() === 0 ? 'FREE' : `${shipping().toFixed(2)} EGP`}</span>
              </div>
              <div className="flex justify-between font-heading text-lg font-bold text-accent mt-2 pt-2 border-t border-border">
                <span>Total</span><span>{total().toFixed(2)} EGP</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {[
                { name: 'name',  label: 'Full Name *',       type: 'text',  placeholder: 'Ahmed Mohamed' },
                { name: 'email', label: 'Email Address *',   type: 'email', placeholder: 'ahmed@example.com' },
                { name: 'phone', label: 'Phone Number',      type: 'tel',   placeholder: '+20 1xx xxx xxxx' },
              ].map(f => (
                <div key={f.name} className="mb-4">
                  <label className="block font-heading text-xs text-muted tracking-widest uppercase mb-1.5">{f.label}</label>
                  <input type={f.type} name={f.name} value={form[f.name as keyof typeof form]} onChange={handleInput}
                    placeholder={f.placeholder} required={f.label.includes('*')}
                    className="w-full bg-card border border-border text-gwhite px-4 py-3 rounded text-sm outline-none focus:border-accent transition-colors font-body" />
                </div>
              ))}
              <div className="mb-6">
                <label className="block font-heading text-xs text-muted tracking-widest uppercase mb-1.5">Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleInput} rows={3}
                  placeholder="Any special instructions..." className="w-full bg-card border border-border text-gwhite px-4 py-3 rounded text-sm outline-none focus:border-accent transition-colors resize-none font-body" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-accent text-black font-heading font-bold text-sm tracking-widest py-4 rounded hover:bg-[#00b8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase">
                {loading ? 'PROCESSING...' : 'PLACE ORDER →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
