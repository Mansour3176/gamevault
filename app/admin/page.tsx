'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'login', password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError('Wrong password. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4"
      style={{ backgroundImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,212,255,.06), transparent)' }}>
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-10 text-center">
        {/* Logo */}
        <div className="font-heading text-3xl font-black text-gwhite tracking-widest mb-1">
          GAME<span className="text-accent">VAULT</span>
        </div>
        <div className="font-heading text-xs text-muted tracking-widest uppercase mb-8">Admin Dashboard</div>

        {/* Lock icon */}
        <div className="text-5xl mb-8">🔐</div>

        {error && (
          <div className="bg-red/10 border border-red/30 text-red text-sm font-heading px-4 py-3 rounded mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="text-left">
          <label className="block font-heading text-xs text-muted tracking-widest uppercase mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            className="w-full bg-bg2 border border-border text-gwhite px-4 py-3 rounded text-base outline-none focus:border-accent transition-colors mb-5 font-body"
          />
          <button type="submit" disabled={loading}
            className="w-full bg-accent text-black font-heading font-bold text-sm tracking-widest py-3.5 rounded hover:bg-[#00b8e0] transition-colors disabled:opacity-50 uppercase">
            {loading ? 'LOGGING IN...' : 'LOGIN →'}
          </button>
        </form>

        <a href="/" className="block mt-6 text-xs text-muted hover:text-accent transition-colors font-heading tracking-widest uppercase">
          ← Back to Store
        </a>
      </div>
    </div>
  );
}
