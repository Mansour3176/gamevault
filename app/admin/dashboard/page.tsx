'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Package, Clock, Gamepad2 } from 'lucide-react';

interface Stats {
  revenue:   number;
  orders:    number;
  pending:   number;
  products:  number;
  breakdown: Record<string, number>;
  recent:    Order[];
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  Pending:    'bg-gold/15 text-gold border border-gold/30',
  Processing: 'bg-accent/15 text-accent border border-accent/30',
  Completed:  'bg-green/15 text-green border border-green/30',
  Cancelled:  'bg-red/15 text-red border border-red/30',
};

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  const cards = [
    { icon: TrendingUp, label: 'Total Revenue',   value: `${(stats?.revenue ?? 0).toLocaleString()} EGP`, color: 'text-green',  bg: 'bg-green/5' },
    { icon: Package,    label: 'Total Orders',     value: stats?.orders   ?? 0,                            color: 'text-accent', bg: 'bg-accent/5' },
    { icon: Clock,      label: 'Pending Orders',   value: stats?.pending  ?? 0,                            color: 'text-gold',   bg: 'bg-gold/5' },
    { icon: Gamepad2,   label: 'Active Products',  value: stats?.products ?? 0,                            color: 'text-accent2',bg: 'bg-accent2/5' },
  ];

  const breakdown = stats?.breakdown ?? {};
  const totalOrders = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-black text-gwhite uppercase">
            📊 <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-muted text-sm mt-1">Welcome back. Here's what's happening.</p>
        </div>
        {(stats?.pending ?? 0) > 0 && (
          <Link href="/admin/orders?status=Pending"
            className="flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold font-heading text-xs tracking-widest px-4 py-2 rounded hover:bg-gold/25 transition-colors uppercase">
            ⚡ {stats?.pending} Pending Orders
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-border rounded-lg p-6`}>
            <Icon size={28} className={`${color} mb-3`} />
            <div className={`font-heading text-3xl font-black ${color} mb-1`}>{value}</div>
            <div className="text-xs text-muted font-heading tracking-widest uppercase">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-heading text-sm font-bold text-gwhite tracking-widest uppercase">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-accent font-heading tracking-widest hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-card2">
                  {['Order #', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-heading text-[10px] text-muted tracking-widest uppercase border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.recent ?? []).map((o) => (
                  <tr key={o.id} className="border-b border-border hover:bg-white/[.02] transition-colors">
                    <td className="px-5 py-3.5 font-heading text-xs text-accent">{o.order_number}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-gwhite font-semibold">{o.customer_name}</div>
                      <div className="text-xs text-muted">{o.customer_email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-heading text-sm text-gwhite font-bold">{Number(o.total).toFixed(2)} EGP</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-heading text-[10px] font-bold tracking-widest px-2.5 py-1 rounded uppercase ${STATUS_STYLE[o.status] ?? ''}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
                {!stats?.recent?.length && (
                  <tr><td colSpan={5} className="text-center py-10 text-muted text-sm">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-sm font-bold text-gwhite tracking-widest uppercase mb-6">Order Status</h2>
          <div className="space-y-4">
            {[
              { s: 'Pending',    color: 'bg-gold' },
              { s: 'Processing', color: 'bg-accent' },
              { s: 'Completed',  color: 'bg-green' },
              { s: 'Cancelled',  color: 'bg-red' },
            ].map(({ s, color }) => {
              const count = breakdown[s] ?? 0;
              const pct   = Math.round((count / totalOrders) * 100);
              return (
                <div key={s}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-heading text-xs text-gtext tracking-widest uppercase">{s}</span>
                    <span className="font-heading text-sm font-bold text-gwhite">{count}</span>
                  </div>
                  <div className="h-2 bg-card2 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-heading text-xs text-muted tracking-widest uppercase mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/products?action=add"
                className="flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent font-heading text-xs tracking-widest px-4 py-2.5 rounded hover:bg-accent/20 transition-colors uppercase">
                + Add Product
              </Link>
              <Link href="/admin/orders?status=Pending"
                className="flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold font-heading text-xs tracking-widest px-4 py-2.5 rounded hover:bg-gold/20 transition-colors uppercase">
                ⏳ View Pending
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="font-heading text-accent tracking-widest text-sm animate-pulse">LOADING DASHBOARD...</div>
    </div>
  );
}
