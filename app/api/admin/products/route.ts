import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

const COOKIE_NAME   = 'gv_admin_session';
const ADMIN_PASS    = process.env.ADMIN_PASSWORD ?? 'gamevault2026';
const SESSION_TOKEN = 'gv_' + Buffer.from(ADMIN_PASS).toString('base64');

function isAdmin() {
  return cookies().get(COOKIE_NAME)?.value === SESSION_TOKEN;
}

// GET /api/admin/products
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

// POST /api/admin/products — create product
export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, category, platform, price, old_price, description, image_url, badge, region, stock, active } = body;

  if (!name || !category || !price) {
    return NextResponse.json({ error: 'Name, category and price are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      name, category,
      platform:  platform  || null,
      price:     parseFloat(price),
      old_price: old_price ? parseFloat(old_price) : null,
      description: description || null,
      image_url:   image_url   || null,
      badge:       badge       || null,
      region:      region      || 'Global',
      stock:       parseInt(stock ?? 999, 10),
      active:      active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, product: data });
}

// PATCH /api/admin/products — update product
export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Clean up fields
  if ('price'     in fields) fields.price     = parseFloat(fields.price);
  if ('old_price' in fields) fields.old_price = fields.old_price ? parseFloat(fields.old_price) : null;
  if ('stock'     in fields) fields.stock     = parseInt(fields.stock, 10);
  if ('badge'     in fields && !fields.badge) fields.badge = null;
  if ('platform'  in fields && !fields.platform) fields.platform = null;

  const { error } = await supabaseAdmin.from('products').update(fields).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/products?id=xxx
export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
