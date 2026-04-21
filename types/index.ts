export interface Product {
  id: string;
  name: string;
  category: string;
  platform?: string;
  price: number;
  old_price?: number | null;
  description?: string;
  image_url?: string;
  badge?: 'Hot' | 'New' | 'Sale' | 'Ltd' | null;
  region?: string;
  stock?: number;
  active?: boolean;
  created_at?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  qty: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
export type BadgeType = 'Hot' | 'New' | 'Sale' | 'Ltd';
export type Category = 'Steam' | 'PlayStation' | 'Xbox' | 'Riot Games' | 'Nintendo' | 'Marvel Games' | 'Battle.net' | 'Gift Cards';
