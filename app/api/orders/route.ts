import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const FREE_SHIPPING_MIN = 2000;
const SHIPPING_COST = 100;

// ─── POST /api/orders — place a new order ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, notes, items } = body;

    if (!name || !email || !items?.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify each product still exists and calculate totals server-side
    let subtotal = 0;
    const cleanItems: { id: string; name: string; price: number; qty: number; image_url?: string }[] = [];

    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('id, name, price, active')
        .eq('id', item.id)
        .eq('active', true)
        .single();

      if (!product) continue;

      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      cleanItems.push({
        id:        product.id,
        name:      product.name,
        price:     product.price,
        qty,
        image_url: item.image_url,
      });
      subtotal += product.price * qty;
    }

    if (!cleanItems.length) {
      return NextResponse.json({ success: false, error: 'No valid products in cart' }, { status: 400 });
    }

    const shipping     = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
    const total        = subtotal + shipping;
    const order_number = 'GV-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Save order to Supabase
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        customer_name:  name,
        customer_email: email,
        customer_phone: phone || null,
        items:          cleanItems,
        subtotal,
        shipping,
        total,
        notes: notes || null,
        status: 'Pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ success: false, error: 'Failed to save order' }, { status: 500 });
    }

    // ─── Telegram Notification ────────────────────────────────────────
    const tgToken  = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      const itemLines = cleanItems
        .map(i => `  • ${i.name} ×${i.qty} — ${(i.price * i.qty).toFixed(2)} EGP`)
        .join('\n');

      const tgMsg =
        `🎮 <b>NEW ORDER — ${order_number}</b>\n\n` +
        `👤 <b>Customer:</b> ${name}\n` +
        `📧 <b>Email:</b> ${email}\n` +
        `📱 <b>Phone:</b> ${phone || '—'}\n\n` +
        `🛒 <b>Items:</b>\n${itemLines}\n\n` +
        `💰 <b>Subtotal:</b> ${subtotal.toFixed(2)} EGP\n` +
        `🚚 <b>Shipping:</b> ${shipping === 0 ? 'FREE' : shipping.toFixed(2) + ' EGP'}\n` +
        `✅ <b>TOTAL:</b> ${total.toFixed(2)} EGP` +
        (notes ? `\n\n📝 <b>Notes:</b> ${notes}` : '');

      try {
        await fetch(
          `https://api.telegram.org/bot${tgToken}/sendMessage`,
          {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ chat_id: tgChatId, text: tgMsg, parse_mode: 'HTML' }),
          }
        );
      } catch (tgErr) {
        console.error('Telegram send failed:', tgErr); // non-fatal
      }
    }

    return NextResponse.json({ success: true, order_number, total });
  } catch (err) {
    console.error('Order API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
