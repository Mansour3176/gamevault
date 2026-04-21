import { supabaseAdmin } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import Link from 'next/link';

const CAT_ICONS: Record<string, string> = {
  Steam: '🎮', PlayStation: '🎯', Xbox: '🟢', 'Riot Games': '⚡',
  Nintendo: '🔴', 'Gift Cards': '🎁', 'Marvel Games': '🦸', 'Battle.net': '💀',
};

export const revalidate = 60; // ISR — revalidate every 60s

async function getProducts() {
  const [hotRes, newRes, catsRes] = await Promise.all([
    supabaseAdmin.from('products').select('*').eq('active', true).eq('badge', 'Hot').order('created_at', { ascending: false }).limit(4),
    supabaseAdmin.from('products').select('*').eq('active', true).eq('badge', 'New').order('created_at', { ascending: false }).limit(4),
    supabaseAdmin.from('products').select('category').eq('active', true),
  ]);
  const cats = [...new Set((catsRes.data ?? []).map((r: { category: string }) => r.category))].sort();
  return { hot: hotRes.data ?? [], newArrivals: newRes.data ?? [], cats };
}

export default async function HomePage() {
  const { hot, newArrivals, cats } = await getProducts();

  return (
    <>
      {/* ─── TICKER ─── */}
      <div className="bg-accent text-black font-heading text-xs font-bold tracking-widest overflow-hidden h-8 flex items-center">
        <div className="ticker-track">
          {['INSTANT DELIVERY','STEAM · PLAYSTATION · XBOX · RIOT GAMES','FREE DELIVERY OVER 2000 EGP','ALL REGIONS AVAILABLE','SECURE PAYMENT','24/7 SUPPORT','INSTANT DELIVERY','STEAM · PLAYSTATION · XBOX · RIOT GAMES','FREE DELIVERY OVER 2000 EGP','ALL REGIONS AVAILABLE','SECURE PAYMENT','24/7 SUPPORT'].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[88vh] flex items-center px-10 md:px-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hero-grid-bg" />
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 60% 80% at 65% 50%, rgba(0,212,255,.08) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(124,58,237,.12) 0%, transparent 60%)'}} />

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent font-heading text-xs tracking-widest px-4 py-1.5 rounded-sm mb-8 uppercase">
            <span className="pulse-dot text-[8px]">●</span> NOW IN STOCK — DROP 2026
          </div>
          <h1 className="font-heading text-[clamp(52px,8vw,96px)] font-black leading-[.93] text-gwhite uppercase mb-6">
            LEVEL<br />UP YOUR<br /><span className="text-accent text-glow">GAME</span>
          </h1>
          <p className="text-gtext text-lg leading-relaxed mb-10 max-w-md">
            Digital game keys &amp; gift cards for every platform. Instant delivery, all regions, unbeatable prices in EGP.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="bg-accent text-black font-heading font-bold text-sm tracking-widest px-8 py-4 rounded hover:bg-[#00b8e0] transition-all hover:shadow-lg hover:-translate-y-0.5 uppercase">
              Shop Now →
            </Link>
            <Link href="/products?badge=Sale" className="border border-border text-gwhite font-heading font-bold text-sm tracking-widest px-8 py-4 rounded hover:border-accent hover:text-accent transition-all uppercase">
              View Deals
            </Link>
          </div>
        </div>

        {/* Floating mini cards */}
        {hot.slice(0, 4).map((p: Product, i: number) => (
          <Link key={p.id} href="/products"
            className={`hidden xl:block absolute right-20 bg-card border border-border rounded-lg overflow-hidden w-36 hover:border-accent/30 transition-all float-${i + 1}`}
            style={{ top: `${20 + (i % 2) * 28}%`, right: `${8 + Math.floor(i / 2) * 11}%` }}>
            <img src={p.image_url || ''} alt={p.name} className="w-full aspect-[3/4] object-cover" onError={() => {}} />
            <div className="p-2">
              <div className="font-heading text-[10px] text-gwhite font-semibold truncate">{p.name.split(' — ')[0]}</div>
              <div className="text-accent text-xs font-bold mt-0.5">{p.price.toFixed(2)} EGP</div>
            </div>
          </Link>
        ))}
      </section>

      {/* ─── CATEGORY PILLS ─── */}
      <div className="flex gap-3 overflow-x-auto px-10 pb-14 -mt-4 scrollbar-none" style={{scrollbarWidth:'none'}}>
        {cats.map((cat) => (
          <Link key={cat} href={`/products?cat=${encodeURIComponent(cat)}`}
            className="flex-shrink-0 flex items-center gap-2.5 bg-card border border-border text-gtext font-heading text-xs font-semibold tracking-widest px-6 py-3 rounded hover:border-accent hover:text-accent transition-all hover:-translate-y-0.5 uppercase">
            <span className="text-base">{CAT_ICONS[cat] ?? '🕹️'}</span>{cat}
          </Link>
        ))}
      </div>

      {/* ─── FLASH SALE BANNER ─── */}
      <div className="mx-10 mb-16 bg-card border border-border rounded-lg p-10 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2" style={{background:'radial-gradient(ellipse at right, rgba(0,212,255,.1), transparent)'}} />
        <div className="relative">
          <h2 className="font-heading text-4xl font-black text-gwhite uppercase mb-3">🔥 Flash Sale<br/>Active Now</h2>
          <p className="text-muted max-w-sm leading-relaxed">Limited-time discounts on top titles. Don&apos;t miss the best digital deals in Egypt.</p>
          <Link href="/products?badge=Sale" className="inline-block mt-6 bg-accent text-black font-heading font-bold text-sm tracking-widest px-8 py-4 rounded hover:bg-[#00b8e0] transition-all uppercase">
            View All Deals →
          </Link>
        </div>
        <CountdownTimer hours={48} />
      </div>

      {/* ─── HOT PRODUCTS ─── */}
      <section className="px-10 pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-4xl font-black text-gwhite uppercase">🔥 <span className="text-accent">Hot</span> Right Now</h2>
            <p className="text-muted text-sm mt-1">Most popular games this week</p>
          </div>
          <Link href="/products?badge=Hot" className="font-heading text-sm text-accent tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {hot.map((p: Product) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ─── NEW ARRIVALS ─── */}
      <section className="px-10 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-heading text-4xl font-black text-gwhite uppercase">✨ <span className="text-accent">New</span> Arrivals</h2>
            <p className="text-muted text-sm mt-1">Just dropped to the store</p>
          </div>
          <Link href="/products?badge=New" className="font-heading text-sm text-accent tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {newArrivals.map((p: Product) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <div className="mx-10 mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-lg overflow-hidden border border-border" style={{background:'var(--border)',gap:'1px'}}>
        {[
          { icon: '⚡', title: 'Instant Delivery',  desc: 'Keys sent to your email within minutes' },
          { icon: '🌍', title: 'All Regions',       desc: 'Global, EU, NA, ME, Turkey, Egypt & more' },
          { icon: '🔒', title: '100% Secure',       desc: 'Safe and encrypted checkout process' },
          { icon: '💬', title: '24/7 Support',      desc: 'WhatsApp & Telegram around the clock' },
        ].map(f => (
          <div key={f.title} className="bg-card hover:bg-card2 transition-colors p-8 flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">{f.icon}</span>
            <div>
              <div className="font-heading text-sm font-bold text-gwhite mb-1">{f.title}</div>
              <div className="text-xs text-muted leading-relaxed">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── CLIENT COUNTDOWN ─────────────────────────────────────────────
function CountdownTimer({ hours }: { hours: number }) {
  return (
    <div className="relative" id="countdown-wrapper">
      <CountdownClient hours={hours} />
    </div>
  );
}

// Inline client component for the countdown
import CountdownClient from '@/components/CountdownClient';
