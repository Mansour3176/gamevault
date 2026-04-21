'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Gamepad2, LogOut, ExternalLink,
  ChevronRight, AlertCircle,
} from 'lucide-react';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders',    label: 'Orders',     icon: Package },
  { href: '/admin/products',  label: 'Products',   icon: Gamepad2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [verified,  setVerified]  = useState<boolean | null>(null);
  const [pending,   setPending]   = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  // Verify auth on mount
  useEffect(() => {
    fetch('/api/admin/auth', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'verify' }),
    })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) router.replace('/admin');
        else setVerified(true);
      })
      .catch(() => router.replace('/admin'));
  }, [router]);

  // Poll pending orders count
  useEffect(() => {
    if (!verified) return;
    const load = () =>
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(d => setPending(d.pending ?? 0))
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [verified]);

  async function handleLogout() {
    await fetch('/api/admin/auth', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'logout' }),
    });
    router.replace('/admin');
  }

  if (verified === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-heading text-accent tracking-widest text-sm animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ─── SIDEBAR ─── */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 bg-bg2 border-r border-border flex flex-col fixed top-0 bottom-0 left-0 z-30 transition-all duration-200`}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <div>
              <div className="font-heading text-lg font-black text-gwhite">GAME<span className="text-accent">VAULT</span></div>
              <div className="font-heading text-[10px] text-muted tracking-widest mt-0.5">ADMIN PANEL</div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} className="text-muted hover:text-gwhite transition-colors flex-shrink-0">
            <ChevronRight size={16} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-5 py-3 font-heading text-xs font-semibold tracking-widest uppercase transition-all ${active ? 'text-accent bg-accent/8 border-l-2 border-accent' : 'text-muted hover:text-gwhite hover:bg-white/4'}`}>
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="flex-1">{label}</span>
                )}
                {!collapsed && label === 'Orders' && pending > 0 && (
                  <span className="bg-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-5 py-4 border-t border-border space-y-2">
          <Link href="/" target="_blank"
            className={`flex items-center gap-2 text-xs font-heading text-muted hover:text-accent transition-colors uppercase tracking-widest ${collapsed ? 'justify-center' : ''}`}>
            <ExternalLink size={14} />
            {!collapsed && 'View Store'}
          </Link>
          <button onClick={handleLogout}
            className={`flex items-center gap-2 text-xs font-heading text-muted hover:text-red transition-colors uppercase tracking-widest ${collapsed ? 'justify-center' : ''}`}>
            <LogOut size={14} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-60'} transition-all duration-200 overflow-auto min-h-screen`}>
        {children}
      </main>
    </div>
  );
}
