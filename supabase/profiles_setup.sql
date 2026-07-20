-- ============================================================
-- UrsaDeFi Multi-Account Foundation
-- Run this once in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Profiles table (one row per XRPL wallet = one account)
CREATE TABLE IF NOT EXISTS public.profiles (
  wallet_address  TEXT PRIMARY KEY,
  public_key      TEXT,
  username        TEXT,
  company_name    TEXT,
  website         TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  city_state_zip  TEXT,
  country         TEXT DEFAULT 'United States',
  ein             TEXT,
  tagline         TEXT,
  logo_data_url   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles (updated_at DESC);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies for wallet-first MVP (anon key + app filters by wallet)
-- Anyone can read a profile by wallet_address (needed for public invoice headers later)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

-- Anyone can insert their own profile (first connect)
DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
CREATE POLICY "profiles_insert_all"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Anyone can update (app only updates the row for the connected wallet)
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
CREATE POLICY "profiles_update_all"
  ON public.profiles FOR UPDATE
  USING (true);

-- 5. Ensure invoices + clients tables also have wallet isolation helpers
-- (These assume the tables already exist from earlier setup)

-- Invoices: allow select/insert/update/delete by app (wallet filtered in app code)
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_all" ON public.invoices;
CREATE POLICY "invoices_all"
  ON public.invoices FOR ALL
  USING (true)
  WITH CHECK (true);

-- Clients
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_all" ON public.clients;
CREATE POLICY "clients_all"
  ON public.clients FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Done. After running:
-- 1. Confirm tables appear under Table Editor
-- 2. Redeploy the app if needed
-- 3. Connect a wallet → a row should appear in profiles
-- ============================================================
