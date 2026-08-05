-- Polymarket arb bot paper decisions (dry-run tracking)
-- Run this in Supabase SQL editor once.

create table if not exists public.poly_arb_decisions (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  ts timestamptz,
  action text not null,
  mode text default 'dry-run',
  question text,
  reason text,
  market_id text,
  net_edge text,
  gross_edge text,
  total_cost text,
  est_profit_usdc text,
  shares text,
  yes_avg text,
  no_avg text,
  yes_ask text,
  no_ask text,
  combined_ask text,
  yes_depth_usdc text,
  no_depth_usdc text,
  volume_24h double precision,
  fee_rate text,
  fees_enabled boolean,
  candidates_scanned integer,
  near_misses integer,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists poly_arb_decisions_created_at_idx
  on public.poly_arb_decisions (created_at desc);

create index if not exists poly_arb_decisions_action_idx
  on public.poly_arb_decisions (action);

alter table public.poly_arb_decisions enable row level security;

drop policy if exists "Allow public read poly_arb_decisions" on public.poly_arb_decisions;
create policy "Allow public read poly_arb_decisions"
  on public.poly_arb_decisions for select
  using (true);
