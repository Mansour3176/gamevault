'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  notes?: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  Pending:    'bg-gold/15 text-gold border border-gold/30',
  Processing: 'bg-accent/15 text-accent border border-accent/30',
  Completed:  'bg-green/15 text-green border border-green/30',
  Cancelled:  'bg-red/15 text-red border border-red/30',
};
const ALL_STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled'];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState('');
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [expanded,  setExpanded]  = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [page, setPage]                 = useState(1);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set('status', statusFilter);
    const res  = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res  = await fetch('/api/admin/orders', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`✅ Order updated to ${status}`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } else {
      showToast('❌ Update failed');
    }
    setUpdating(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black text-gwhite uppercase">📦 <span className="text-accent">Orders</span></h1>
          <p className="text-muted text-sm mt-1">{total} total orders</p>
        </div>
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {['', ...ALL_STATUSES].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`font-heading text-xs tracking-widest px-4 py-2 rounded-full border uppercase transition-all ${statusFilter === s ? 'bg-accent text-black border-accent' : 'border-border text-muted hover:border-accent hover:text-accent'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-card2 border-b border-border">
                {['Order #', 'Customer', 'Items', 'Subtotal', 'Ship', 'Total', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-heading text-[10px] text-muted tracking-widest uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16 text-muted font-heading text-sm tracking-widest animate-pulse">LOADING...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-muted">No orders found.</td></tr>
              ) : orders.map(o => (
                <>
                  <tr key={o.id}
                    className="border-b border-border hover:bg-white/[.02] transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td className="px-4 py-3.5 font-heading text-xs text-accent whitespace-nowrap">{o.order_number}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-sm text-gwhite font-semibold">{o.customer_name}</div>
                      <div className="text-xs text-muted">{o.customer_email}</div>
                      {o.customer_phone && <div className="text-xs text-muted">{o.customer_phone}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted max-w-[180px]">
                      {(o.items ?? []).slice(0, 2).map((item, i) => (
                        <div key={i} className="truncate">• {item.name?.substring(0, 28)} ×{item.qty}</div>
                      ))}
                      {(o.items ?? []).length > 2 && <div className="text-accent">+{(o.items ?? []).length - 2} more</div>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gtext whitespace-nowrap">{Number(o.subtotal).toFixed(2)} EGP</td>
                    <td className="px-4 py-3.5 text-sm text-gtext whitespace-nowrap">
                      {Number(o.shipping) === 0 ? <span className="text-green text-xs font-bold">FREE</span> : `${Number(o.shipping).toFixed(2)} EGP`}
                    </td>
                    <td className="px-4 py-3.5 font-heading text-sm font-bold text-gwhite whitespace-nowrap">{Number(o.total).toFixed(2)} EGP</td>
                    <td className="px-4 py-3.5">
                      <span className={`font-heading text-[10px] font-bold tracking-widest px-2.5 py-1 rounded uppercase whitespace-nowrap ${STATUS_STYLE[o.status] ?? ''}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })}<br />
                      {new Date(o.created_at).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <select
                          defaultValue={o.status}
                          className="bg-card2 border border-border text-gwhite text-xs font-heading rounded px-2 py-1.5 outline-none cursor-pointer"
                          id={`sel-${o.id}`}>
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          disabled={updating === o.id}
                          onClick={() => {
                            const sel = document.getElementById(`sel-${o.id}`) as HTMLSelectElement;
                            updateStatus(o.id, sel.value);
                          }}
                          className="bg-green/15 border border-green/30 text-green p-1.5 rounded hover:bg-green/25 transition-colors disabled:opacity-40">
                          <Check size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expanded === o.id && (
                    <tr key={`${o.id}-expanded`} className="bg-card2 border-b border-border">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="font-heading text-xs text-muted tracking-widest uppercase mb-2">All Items</p>
                            {(o.items ?? []).map((item, i) => (
                              <div key={i} className="flex justify-between text-xs text-gtext py-1 border-b border-border/50">
                                <span>{item.name}</span>
                                <span className="text-accent ml-4">×{item.qty} — {(item.price * item.qty).toFixed(2)} EGP</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="font-heading text-xs text-muted tracking-widest uppercase mb-2">Customer</p>
                            <p className="text-sm text-gwhite">{o.customer_name}</p>
                            <p className="text-xs text-muted">{o.customer_email}</p>
                            {o.customer_phone && <p className="text-xs text-muted">{o.customer_phone}</p>}
                          </div>
                          {o.notes && (
                            <div>
                              <p className="font-heading text-xs text-muted tracking-widest uppercase mb-2">Notes</p>
                              <p className="text-sm text-gtext">{o.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <span className="text-xs text-muted font-heading">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="border border-border text-muted p-2 rounded hover:border-accent hover:text-accent transition-colors disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                className="border border-border text-muted p-2 rounded hover:border-accent hover:text-accent transition-colors disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 toast-slide bg-card2 border border-border border-l-[3px] border-l-accent text-gwhite px-5 py-3.5 rounded-md text-sm shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
