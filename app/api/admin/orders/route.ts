import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

const COOKIE_NAME   = 'gv_admin_session';
const ADMIN_PASS    = process.env.ADMIN_PASSWORD ?? 'gamevault2026';
const SESSION_TOKEN = 'gv_' + Buffer.from(ADMIN_PASS).toString('base64');

function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return token === SESSION_TOKEN;
}

// GET /api/admin/orders?status=Pending&page=1
export async function GET(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? '';
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit  = 20;
  const from   = (page - 1) * limit;

  let query = supabaseAdmin.from('orders').select('*', { count: 'exact' });
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

  const { data: orders, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders: orders ?? [], total: count ?? 0, page, pages: Math.ceil((count ?? 0) / limit) });
}

// PATCH /api/admin/orders — update order status
export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  const allowed = ['Pending', 'Processing', 'Completed', 'Cancelled'];
  if (!id || !allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
