-- ============================================================
-- GAMEVAULT — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PRODUCTS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  platform    TEXT,
  price       NUMERIC(10,2) NOT NULL,
  old_price   NUMERIC(10,2),
  description TEXT,
  image_url   TEXT,
  badge       TEXT CHECK (badge IN ('Hot','New','Sale','Ltd') OR badge IS NULL),
  region      TEXT DEFAULT 'Global',
  stock       INT DEFAULT 999,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number   TEXT NOT NULL UNIQUE,
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       NUMERIC(10,2) NOT NULL,
  shipping       NUMERIC(10,2) NOT NULL DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL,
  status         TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Processing','Completed','Cancelled')),
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Products: anyone can read, only service_role can write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products"  ON products FOR SELECT USING (active = TRUE);
CREATE POLICY "Service write products" ON products FOR ALL USING (auth.role() = 'service_role');

-- Orders: anyone can insert (checkout), only service_role can read all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Service read orders"  ON orders FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service update orders" ON orders FOR UPDATE USING (auth.role() = 'service_role');

-- ─── SAMPLE PRODUCTS ─────────────────────────────────────────
INSERT INTO products (name, category, platform, price, old_price, description, image_url, badge, region, stock) VALUES
('ARC Raiders — STEAM KEY',           'Steam',       'Steam',    1650.00, NULL,    'A third-person co-op shooter. Fight back against deadly machines descending from space.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8mq5.webp', 'New',  'Global', 50),
('Elden Ring — STEAM KEY',            'Steam',       'Steam',    1200.00, 1500.00, 'Rise, Tarnished. An epic dark fantasy action RPG by FromSoftware and George R.R. Martin.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp', 'Sale', 'Global', 30),
('Cyberpunk 2077 — STEAM KEY',        'Steam',       'Steam',     750.00, 1000.00, 'Open-world RPG set in Night City. You are V, a mercenary after a unique implant.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4hk6.webp', 'Sale', 'Global', 99),
('GTA V Premium — STEAM KEY',         'Steam',       'Steam',     450.00, NULL,    'Grand Theft Auto V for PC. Explore Los Santos in up to 4K resolution.', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1lds.webp', 'Hot',  'Global', 200),
('EA SPORTS FC 26 Standard — PS5/PS4','PlayStation',  'PS5/PS4',   950.00, NULL,    'EA SPORTS FC 26 with HyperMotion V. Arabic & English.',                               'https://images.igdb.com/igdb/image/upload/t_cover_big/co9k5l.webp', 'New',  'Global', 100),
('Spider-Man 2 — PS5 Digital',        'PlayStation',  'PS5',      1200.00, 1500.00, 'Swing through New York as Peter Parker and Miles Morales. Marvel adventure.',         'https://images.igdb.com/igdb/image/upload/t_cover_big/co7dln.webp', 'Hot',  'Global', 25),
('God of War Ragnarök — PS5',         'PlayStation',  'PS5',      1100.00, 1400.00, 'Kratos and Atreus fight for the fate of the Nine Realms in this epic sequel.',        'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp', 'Sale', 'Global', 40),
('PlayStation Store Card $20 — USA',  'Gift Cards',   'PlayStation', 1000.00, NULL, '$20 PSN credit for USA accounts. Redeem for games, DLC & subscriptions.',            'https://images.igdb.com/igdb/image/upload/t_cover_big/co55xq.webp', 'Hot',  'USA',    300),
('PlayStation Store 100 AED — UAE',   'Gift Cards',   'PlayStation',  850.00, NULL, '100 AED PSN credit for UAE accounts.',                                               'https://images.igdb.com/igdb/image/upload/t_cover_big/co55xq.webp', NULL,   'UAE',    200),
('Riot Points — 10€ EU',              'Riot Games',   'Riot',      600.00, NULL,    'Add RP for League of Legends, Valorant, TFT and more. EU region.',                   'https://images.igdb.com/igdb/image/upload/t_cover_big/co8lh5.webp', NULL,   'EU',     999),
('Valorant Points — 1000 VP',         'Riot Games',   'Valorant',  350.00, NULL,    'Unlock skins and cosmetics in Valorant. 1000 VP added to your account.',             'https://images.igdb.com/igdb/image/upload/t_cover_big/co6aqc.webp', 'Hot',  'Global', 999),
('Valorant Points — 2050 VP',         'Riot Games',   'Valorant',  650.00, NULL,    '2050 Valorant Points. Unlock weapon skins, player cards and sprays.',                'https://images.igdb.com/igdb/image/upload/t_cover_big/co6aqc.webp', NULL,   'Global', 999),
('Marvel Rivals — 1000 Lattices',     'Marvel Games', 'PC',        550.00, 575.00,  'Premium currency for Marvel Rivals. Unlock hero skins, emotes and name cards.',     'https://images.igdb.com/igdb/image/upload/t_cover_big/co9ewp.webp', 'Sale', 'Global', 999),
('Marvel Rivals — 3000 Lattices',     'Marvel Games', 'PC',       1550.00, NULL,    '3000 Lattices for Marvel Rivals. Enough for a full premium hero bundle.',            'https://images.igdb.com/igdb/image/upload/t_cover_big/co9ewp.webp', 'New',  'Global', 999),
('Xbox Game Pass Ultimate — 1 Month', 'Xbox',         'Xbox',      450.00, NULL,    'Hundreds of games + EA Play + Live Gold. Play on console, PC and cloud.',            'https://images.igdb.com/igdb/image/upload/t_cover_big/co4lxf.webp', 'Hot',  'Global', 200),
('Xbox Game Pass Ultimate — 3 Months','Xbox',         'Xbox',     1200.00, 1350.00, '3 months of Xbox Game Pass Ultimate. New games added every week.',                   'https://images.igdb.com/igdb/image/upload/t_cover_big/co4lxf.webp', 'Sale', 'Global', 150),
('Nintendo eShop Card — $20 USA',     'Nintendo',     'Nintendo', 1100.00, NULL,    'Add $20 to your Nintendo eShop account. USA region.',                                'https://images.igdb.com/igdb/image/upload/t_cover_big/co55xq.webp', NULL,   'USA',    100),
('Call of Duty Points — 2400 CP',     'Battle.net',   'Battle.net', 750.00, NULL,   'Use CP to buy the Battle Pass and store bundles in Call of Duty.',                   'https://images.igdb.com/igdb/image/upload/t_cover_big/co7hnd.webp', 'Hot',  'Global', 500),
('Diablo IV — Battle.net Key',        'Battle.net',   'Battle.net', 900.00, 1200.00,'Enter Sanctuary as one of five powerful classes. Slay demons and loot gear.',        'https://images.igdb.com/igdb/image/upload/t_cover_big/co6cl0.webp', 'Sale', 'Global', 60),
('Fortnite — 2800 V-Bucks',           'Gift Cards',   'PC/Console', 680.00, NULL,   '2800 V-Bucks to spend in Fortnite. Buy outfits, emotes and the Battle Pass.',       'https://images.igdb.com/igdb/image/upload/t_cover_big/co6cl0.webp', NULL,   'Global', 999);
