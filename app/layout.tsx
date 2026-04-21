import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Toaster } from '@/components/Toaster';

export const metadata: Metadata = {
  title: 'GAMEVAULT — Digital Keys. Instant Delivery.',
  description: "Egypt's #1 destination for digital game keys and gift cards. Steam, PlayStation, Xbox, Riot Games. All regions, instant delivery, EGP pricing.",
  keywords: 'game keys, steam, playstation, xbox, valorant, egypt, digital games, EGP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <CartDrawer />
        <Toaster />
        {children}
        <footer className="bg-bg2 border-t border-border mt-20">
          <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="font-heading text-2xl font-black text-gwhite mb-2">
                GAME<span className="text-accent">VAULT</span>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                Egypt&apos;s #1 destination for digital game keys and gift cards. All platforms, all regions. Instant delivery guaranteed.
              </p>
            </div>
            <div>
              <h4 className="font-heading text-xs font-bold text-gwhite tracking-widest uppercase mb-4">Shop</h4>
              {['Steam','PlayStation','Xbox','Riot Games','Gift Cards'].map(c => (
                <a key={c} href={`/products?cat=${encodeURIComponent(c)}`} className="block text-sm text-muted hover:text-accent transition-colors mb-2">{c}</a>
              ))}
            </div>
            <div>
              <h4 className="font-heading text-xs font-bold text-gwhite tracking-widest uppercase mb-4">Support</h4>
              {['How it Works','Regions Guide','FAQ','Contact Us'].map(l => (
                <a key={l} href="#" className="block text-sm text-muted hover:text-accent transition-colors mb-2">{l}</a>
              ))}
            </div>
            <div>
              <h4 className="font-heading text-xs font-bold text-gwhite tracking-widest uppercase mb-4">Follow Us</h4>
              {['📱 WhatsApp','✈️ Telegram','📘 Facebook','📸 Instagram'].map(s => (
                <a key={s} href="#" className="block text-sm text-muted hover:text-accent transition-colors mb-2">{s}</a>
              ))}
            </div>
          </div>
          <div className="border-t border-border px-6 py-5 max-w-7xl mx-auto flex flex-wrap justify-between gap-4">
            <p className="text-xs text-muted">© 2026 GAMEVAULT. All rights reserved.</p>
            <p className="text-xs text-muted">Secure Payments · Instant Delivery · All Regions</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
