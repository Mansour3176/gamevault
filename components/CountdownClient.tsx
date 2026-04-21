'use client';

import { useEffect, useState } from 'react';

const END = Date.now() + 48 * 3600 * 1000; // 48 hours from first load

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function CountdownClient({ hours = 48 }: { hours?: number }) {
  const [end]   = useState(() => Date.now() + hours * 3600 * 1000);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="flex items-center gap-3">
      {[{ v: h, l: 'HRS' }, { v: m, l: 'MIN' }, { v: s, l: 'SEC' }].map(({ v, l }, i) => (
        <div key={l} className="flex items-center gap-3">
          <div className="bg-bg2 border border-border rounded-lg px-5 py-4 text-center min-w-[72px]">
            <span className="font-heading text-4xl font-black text-accent block leading-none">{pad(v)}</span>
            <span className="font-heading text-[10px] text-muted tracking-widest mt-1 block">{l}</span>
          </div>
          {i < 2 && <span className="font-heading text-3xl text-border font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}
