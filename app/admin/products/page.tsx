'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Eye, EyeOff, Trash2, Plus, X, Save } from 'lucide-react';
import { Product } from '@/types';

const CATEGORIES = ['Steam','PlayStation','Xbox','Riot Games','Nintendo','Marvel Games','Battle.net','Gift Cards'];
const BADGES     = ['', 'Hot', 'New', 'Sale', 'Ltd'];
const REGIONS    = ['Global','EU','NA','ME','UAE','EGY','USA','TR'];

const EMPTY_FORM = {
  name: '', category: 'Steam', platform: '', price: '', old_price: '',
  description: '', image_url: '', badge: '', region: 'Global', stock: '999', active: true,
};

type FormData = typeof EMPTY_FORM;

const BADGE_STYLE: Record<string, string> = {
  Hot:  'bg-red/20 text-red border border-red/30',
  New:  'bg-accent/20 text-accent border border-accent/30',
  Sale: 'bg-gold/20 text-gold border border-gold/30',
  Ltd:  'bg-accent2/20 text-accent2 border border-accent2/30',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState<FormData>(EMPTY_FORM);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');
  const [search,   setSearch]   = useState('');
  const [confirm,  setConfirm]  = useState<string | null>(null); // id to delete
  const [showForm, setShowForm] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function startEdit(p: Product) {
    setForm({
      name:        p.name,
      category:    p.category,
      platform:    p.platform ?? '',
      price:       String(p.price),
      old_price:   p.old_price ? String(p.old_price) : '',
      description: p.description ?? '',
      image_url:   p.image_url ?? '',
      badge:       p.badge ?? '',
      region:      p.region ?? 'Global',
      stock:       String(p.stock ?? 999),
      active:      p.active !== false,
    });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      showToast('⚠️ Name, category and price are required.');
      return;
    }
    setSaving(true);
    try {
      const method = editId ? 'PATCH' : 'POST';
      const body   = editId ? { id: editId, ...form } : form;
      const res    = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success || data.product) {
        showToast(editId ? '✅ Product updated!' : '✅ Product added!');
        resetForm();
        loadProducts();
      } else {
        showToast('❌ ' + (data.error ?? 'Failed'));
      }
    } catch {
      showToast('❌ Network error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    await fetch('/api/admin/products', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: p.id, active: !p.active }),
    });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  async function deleteProduct(id: string) {
    const res  = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('🗑 Product deleted.');
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      showToast('❌ Delete failed');
    }
    setConfirm(null);
  }

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-gwhite uppercase">🎮 <span className="text-accent">Products</span></h1>
          <p className="text-muted text-sm mt-1">{products.length} total products</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-accent text-black font-heading font-bold text-xs tracking-widest px-5 py-2.5 rounded hover:bg-[#00b8e0] transition-colors uppercase">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* ─── FORM ─── */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-bold text-gwhite uppercase">
              {editId ? '✏️ Edit Product' : '+ Add New Product'}
            </h2>
            <button onClick={resetForm} className="text-muted hover:text-gwhite transition-colors"><X size={18} /></button>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* Full-width: Name */}
              <div className="lg:col-span-3">
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Product Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Elden Ring — STEAM KEY"
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent transition-colors font-body" />
              </div>

              {/* Category */}
              <div>
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent cursor-pointer font-body">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Platform */}
              <div>
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Platform</label>
                <input type="text" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                  placeholder="Steam / PS5 / Valorant"
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent transition-colors font-body" />
              </div>

              {/* Region */}
              <div>
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Region</label>
                <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent cursor-pointer font-body">
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Price (EGP) *</label>
                <input type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent transition-colors font-body" />
              </div>

              {/* Old price */}
              <div>
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Old Price (EGP) — for discount</label>
                <input type="number" step="0.01" min="0" value={form.old_price} onChange={e => setForm(f => ({ ...f, old_price: e.target.value }))}
                  placeholder="Leave empty if no discount"
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent transition-colors font-body" />
              </div>

              {/* Badge */}
              <div>
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Badge</label>
                <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent cursor-pointer font-body">
                  <option value="">— None —</option>
                  {BADGES.slice(1).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Stock</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent transition-colors font-body" />
              </div>

              {/* Active */}
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${form.active ? 'bg-accent' : 'bg-border'}`}
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="font-heading text-xs text-gtext tracking-widest uppercase">Active in Store</span>
                </label>
              </div>

              {/* Image URL - full width */}
              <div className="lg:col-span-3">
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Image URL</label>
                <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://images.igdb.com/..."
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent transition-colors font-body" />
              </div>

              {/* Description - full width */}
              <div className="lg:col-span-3">
                <label className="block font-heading text-[10px] text-muted tracking-widest uppercase mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Product description..."
                  className="w-full bg-card2 border border-border text-gwhite px-4 py-2.5 rounded text-sm outline-none focus:border-accent transition-colors resize-none font-body" />
              </div>
            </div>

            {/* Image preview */}
            {form.image_url && (
              <div className="mt-4 flex items-center gap-4">
                <img src={form.image_url} alt="Preview" className="w-16 h-20 object-cover rounded border border-border bg-card2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span className="text-xs text-muted font-heading tracking-widest">IMAGE PREVIEW</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-accent text-black font-heading font-bold text-xs tracking-widest px-8 py-3 rounded hover:bg-[#00b8e0] transition-colors disabled:opacity-50 uppercase">
                <Save size={14} />
                {saving ? 'SAVING...' : editId ? 'SAVE CHANGES' : 'ADD PRODUCT'}
              </button>
              <button type="button" onClick={resetForm}
                className="border border-border text-muted font-heading text-xs tracking-widest px-6 py-3 rounded hover:border-red hover:text-red transition-colors uppercase">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── PRODUCTS TABLE ─── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-heading text-sm font-bold text-gwhite tracking-widest uppercase">{filtered.length} Products</h2>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search products..."
            className="bg-card2 border border-border text-gwhite text-xs px-3 py-2 rounded outline-none focus:border-accent transition-colors font-body" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-card2 border-b border-border">
                {['', 'Name', 'Category', 'Platform', 'Price', 'Old Price', 'Badge', 'Region', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-heading text-[10px] text-muted tracking-widest uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-16 text-muted font-heading text-sm tracking-widest animate-pulse">LOADING...</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}
                  className={`border-b border-border hover:bg-white/[.02] transition-colors ${!p.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <img src={p.image_url ?? ''} alt={p.name}
                      className="w-9 h-12 object-cover rounded bg-card2 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36x48/111620/00D4FF?text=G'; }} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gwhite font-semibold max-w-[200px]">
                    <div className="truncate">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gtext">{p.category}</td>
                  <td className="px-4 py-3 text-xs text-muted">{p.platform ?? '—'}</td>
                  <td className="px-4 py-3 font-heading text-sm text-accent font-bold whitespace-nowrap">{Number(p.price).toFixed(2)} EGP</td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {p.old_price ? <span className="line-through">{Number(p.old_price).toFixed(2)} EGP</span> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {p.badge
                      ? <span className={`font-heading text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase ${BADGE_STYLE[p.badge] ?? ''}`}>{p.badge}</span>
                      : <span className="text-muted text-xs">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{p.region ?? 'Global'}</td>
                  <td className="px-4 py-3 font-heading text-sm text-gtext">{p.stock ?? 999}</td>
                  <td className="px-4 py-3">
                    <span className={`font-heading text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase ${p.active ? 'bg-green/15 text-green border border-green/30' : 'bg-red/15 text-red border border-red/30'}`}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => startEdit(p)} title="Edit"
                        className="bg-card2 border border-border p-1.5 rounded hover:border-accent hover:text-accent text-muted transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => toggleActive(p)} title={p.active ? 'Hide' : 'Show'}
                        className="bg-card2 border border-border p-1.5 rounded hover:border-gold hover:text-gold text-muted transition-colors">
                        {p.active ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => setConfirm(p.id)} title="Delete"
                        className="bg-card2 border border-border p-1.5 rounded hover:border-red hover:text-red text-muted transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center py-12 text-muted">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card2 border border-border rounded-lg p-8 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-heading text-lg font-bold text-gwhite mb-2">Delete Product?</h3>
            <p className="text-muted text-sm mb-6">This is permanent and cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => deleteProduct(confirm)}
                className="bg-red/80 hover:bg-red text-white font-heading text-xs tracking-widest px-6 py-2.5 rounded transition-colors uppercase">
                Yes, Delete
              </button>
              <button onClick={() => setConfirm(null)}
                className="border border-border text-muted font-heading text-xs tracking-widest px-6 py-2.5 rounded hover:border-accent hover:text-accent transition-colors uppercase">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 toast-slide bg-card2 border border-border border-l-[3px] border-l-accent text-gwhite px-5 py-3.5 rounded-md text-sm shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
