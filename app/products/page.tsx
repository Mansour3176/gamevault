import { supabaseAdmin } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import Link from 'next/link';

export const revalidate = 60;

const CAT_ICONS: Record<string, string> = {
  Steam: '🎮', PlayStation: '🎯', Xbox: '🟢', 'Riot Games': '⚡',
  Nintendo: '🔴', 'Gift Cards': '🎁', 'Marvel Games': '🦸', 'Battle.net': '💀',
};

interface PageProps {
  searchParams: { cat?: string; badge?: string; q?: string; sort?: string };
}

async function getProducts(cat: string, badge: string, q: string, sort: string) {
  let query = supabaseAdmin.from('products').select('*').eq('active', true);
  if (cat)   query = query.eq('category', cat);
  if (badge) query = query.eq('badge', badge);
  if (q)     query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

  if (sort === 'price_asc')  query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else if (sort === 'name') query = query.order('name', { ascending: true });
  else query = query.order('created_at', { ascending: false });

  const { data } = await query;
  return data ?? [];
}

async function getCategories() {
  const { data } = await supabaseAdmin.from('products').select('category').eq('active', true);
  return [...new Set((data ?? []).map((r: { category: string }) => r.category))].sort();
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const cat   = searchParams.cat   ?? '';
  const badge = searchParams.badge ?? '';
  const q     = searchParams.q     ?? '';
  const sort  = searchParams.sort  ?? 'newest';

  const [products, cats] = await Promise.all([
    getProducts(cat, badge, q, sort),
    getCategories(),
  ]);

  function buildHref(params: Record<string, string>) {
    const merged = { cat, badge, q, sort, ...params };
    const filtered = Object.fromEntries(Object.entries(merged).filter(([, v]) => v));
    return '/products?' + new URLSearchParams(filtered).toString();
  }

  return (
    <>
      {/* ─── TICKER ─── */}
      <div className="bg-accent text-black font-heading text-xs font-bold tracking-widest overflow-hidden h-8 flex items-center">
        <div className="ticker-track">
          {['INSTANT DELIVERY','STEAM · PLAYSTATION · XBOX · RIOT GAMES','FREE DELIVERY OVER 2000 EGP','ALL REGIONS AVAILABLE','INSTANT DELIVERY','STEAM · PLAYSTATION · XBOX · RIOT GAMES','FREE DELIVERY OVER 2000 EGP','ALL REGIONS AVAILABLE'].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-10 pb-20 flex gap-8 items-start">
        {/* ─── SIDEBAR ─── */}
        <aside className="hidden lg:block w-60 flex-shrink-0 bg-card border border-border rounded-lg p-6 sticky top-24">
          <p className="font-heading text-xs font-bold text-gwhite tracking-widest uppercase mb-4">Categories</p>
          {cats.map((c) => (
            <Link key={c} href={buildHref({ cat: c, badge: '' })}
              className={`flex items-center justify-between px-2.5 py-2 rounded mx-[-10px] text-sm transition-all mb-0.5 ${cat === c ? 'bg-accent/10 text-accent' : 'text-gtext hover:bg-card2 hover:text-gwhite'}`}>
              <span>{CAT_ICONS[c] ?? '🕹️'} {c}</span>
            </Link>
          ))}

          <div className="border-t border-border my-5" />
          <p className="font-heading text-xs font-bold text-gwhite tracking-widest uppercase mb-4">Deals</p>
          {[{b:'Hot',icon:'🔥'},{b:'New',icon:'✨'},{b:'Sale',icon:'💰'},{b:'Ltd',icon:'⭐'}].map(({b,icon}) => (
            <Link key={b} href={buildHref({ badge: b, cat: '' })}
              className={`flex items-center justify-between px-2.5 py-2 rounded mx-[-10px] text-sm transition-all mb-0.5 ${badge === b ? 'bg-accent/10 text-accent' : 'text-gtext hover:bg-card2 hover:text-gwhite'}`}>
              <span>{icon} {b}</span>
            </Link>
          ))}

          {(cat || badge || q) && (
            <Link href="/products" className="block mt-4 w-full text-center border border-border text-muted hover:border-red hover:text-red text-xs font-heading tracking-widest uppercase py-2 rounded transition-all">
              ✕ Clear Filters
            </Link>
          )}
        </aside>

        {/* ─── MAIN ─── */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="font-heading text-xl font-bold text-gwhite">
              <span className="text-accent">{products.length}</span> Products
              {cat && <span className="text-muted text-base"> in {cat}</span>}
              {q  && <span className="text-muted text-base"> for &ldquo;{q}&rdquo;</span>}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <form className="relative">
                <input type="text" name="q" defaultValue={q} placeholder="Search games..."
                  className="bg-card border border-border text-gwhite text-sm rounded px-4 py-2.5 pl-9 outline-none focus:border-accent transition-colors w-56 font-body"
                  style={{fontFamily: 'var(--font-body)'}} />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
                {cat   && <input type="hidden" name="cat"   value={cat} />}
                {badge && <input type="hidden" name="badge" value={badge} />}
              </form>
              <form>
                <select name="sort" defaultValue={sort} onChange={() => {}}
                  className="bg-card border border-border text-gwhite text-xs font-heading rounded px-3 py-2.5 outline-none cursor-pointer"
                  style={{fontFamily: 'var(--font-heading)'}}>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="name">A → Z</option>
                </select>
                {cat   && <input type="hidden" name="cat"   value={cat} />}
                {badge && <input type="hidden" name="badge" value={badge} />}
                {q     && <input type="hidden" name="q"     value={q} />}
                <button type="submit" className="hidden" />
              </form>
            </div>
          </div>

          {/* Badge pills */}
          <div className="flex gap-2 flex-wrap mb-8">
            <Link href={buildHref({ badge: '' })}
              className={`px-4 py-1.5 rounded-full font-heading text-xs tracking-widest border transition-all uppercase ${!badge ? 'bg-accent text-black border-accent' : 'border-border text-muted hover:border-accent hover:text-accent'}`}>
              All
            </Link>
            {[{b:'Hot',icon:'🔥'},{b:'New',icon:'✨'},{b:'Sale',icon:'💰'},{b:'Ltd',icon:'⭐'}].map(({b,icon}) => (
              <Link key={b} href={buildHref({ badge: b })}
                className={`px-4 py-1.5 rounded-full font-heading text-xs tracking-widest border transition-all uppercase ${badge === b ? 'bg-accent text-black border-accent' : 'border-border text-muted hover:border-accent hover:text-accent'}`}>
                {icon} {b}
              </Link>
            ))}
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="text-center py-24 text-muted">
              <div className="text-5xl mb-4">😕</div>
              <p className="font-heading text-lg">No games found.</p>
              <p className="text-sm mt-1">Try a different search or filter.</p>
              <Link href="/products" className="inline-block mt-6 text-accent font-heading text-sm tracking-widest">← Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p: Product) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
