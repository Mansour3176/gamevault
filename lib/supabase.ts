import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key, bypasses RLS)
// Only use in API routes / server components
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const FREE_SHIPPING_MIN = 2000;
export const SHIPPING_COST = 100;

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} EGP`;
}

export function calcDiscount(price: number, oldPrice: number): number {
  return Math.round((1 - price / oldPrice) * 100);
}
