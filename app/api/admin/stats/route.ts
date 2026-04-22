import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

const COOKIE_NAME   = 'gv_admin_session';
const ADMIN_PASS    = process.env.ADMIN_PASSWORD ?? 'gamevault2026';
const SESSION_TOKEN = 'gv_' + Buffer.from(ADMIN_PASS).toString('base64');

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get(COOKIE_NAME)?.value !== SESSION_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [revenueRes, ordersRes, pendingRes, prodsRes, recentRes, statusRes] = await Promise.all([
    supabaseAdmin.from('orders').select('total').neq('status', 'Cancelled'),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
    supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(6),
    supabaseAdmin.from('orders').select('status'),
  ]);

  const revenue = (revenueRes.data ?? []).reduce((s: number, r: { total: number }) => s + Number(r.total), 0);

  const breakdown = { Pending: 0, Processing: 0, Completed: 0, Cancelled: 0 };
  (statusRes.data ?? []).forEach((r: { status: string }) => {
    if (r.status in breakdown) breakdown[r.status as keyof typeof breakdown]++;
  });

  return NextResponse.json({
    revenue,
    orders:   ordersRes.count  ?? 0,
    pending:  pendingRes.count ?? 0,
    products: prodsRes.count   ?? 0,
    breakdown,
    recent:   recentRes.data   ?? [],
  });
}
