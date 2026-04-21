'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';

export function Navbar() {
  const { itemCount, openCart } = useCartStore();
  const count = itemCount();

  return (
    <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur-xl border-b border-border h-16 flex items-center px-6 md:px-10 gap-8">
      {/* Logo */}
      <Link href="/" className="font-heading text-2xl font-black text-gwhite tracking-widest flex-shrink-0">
        GAME<span className="text-accent">VAULT</span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8 flex-1">
        {[
          { href: '/',                       label: 'Home'        },
          { href: '/products',               label: 'All Games'   },
          { href: '/products?cat=Steam',     label: 'Steam'       },
          { href: '/products?cat=PlayStation',label: 'PlayStation'},
          { href: '/products?cat=Riot+Games',label: 'Riot Games'  },
          { href: '/products?cat=Xbox',      label: 'Xbox'        },
          { href: '/products?cat=Gift+Cards',label: 'Gift Cards'  },
        ].map(l => (
          <Link key={l.href} href={l.href}
            className="font-heading text-xs font-semibold tracking-widest text-muted hover:text-accent transition-colors uppercase">
            {l.label}
          </Link>
        ))}
      </div>

      {/* Cart button */}
      <button onClick={openCart}
        className="ml-auto flex items-center gap-2 bg-accent text-black font-heading font-bold text-xs tracking-widest px-5 py-2 rounded hover:bg-[#00b8e0] transition-colors relative">
        <ShoppingCart size={15} />
        CART
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </nav>
  );
}
