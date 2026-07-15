create extension if not exists pgcrypto;

create table if not exists public.customers (
  phone text primary key check (phone ~ '^[0-9]{10}$'),
  name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_phone text not null references public.customers(phone) on delete cascade,
  label text not null,
  address_line text not null,
  landmark text,
  contact_phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customer_addresses_one_default
  on public.customer_addresses(customer_phone) where is_default;
create index if not exists customer_addresses_phone_idx
  on public.customer_addresses(customer_phone);

create table if not exists public.customer_orders (
  id text primary key,
  customer_phone text not null references public.customers(phone) on delete restrict,
  items jsonb not null,
  total_items integer not null check (total_items > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount numeric(10,2) not null default 0 check (discount >= 0),
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'preparing',
  delivery_address jsonb not null,
  payment_method jsonb,
  placed_at timestamptz not null default now()
);

create index if not exists customer_orders_phone_placed_idx
  on public.customer_orders(customer_phone, placed_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists customer_addresses_set_updated_at on public.customer_addresses;
create trigger customer_addresses_set_updated_at before update on public.customer_addresses
for each row execute function public.set_updated_at();

-- Explicit Data API grants are required for projects created after May 30, 2026.
grant select, insert, update, delete on table public.customers to anon, authenticated, service_role;
grant select, insert, update, delete on table public.customer_addresses to anon, authenticated, service_role;
grant select, insert, update, delete on table public.customer_orders to anon, authenticated, service_role;

alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_orders enable row level security;

-- Development-only public client access. Replace when real OTP auth is enabled.
drop policy if exists "Development-only public client access" on public.customers;
create policy "Development-only public client access" on public.customers
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "Development-only public client access" on public.customer_addresses;
create policy "Development-only public client access" on public.customer_addresses
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "Development-only public client access" on public.customer_orders;
create policy "Development-only public client access" on public.customer_orders
  for all to anon, authenticated using (true) with check (true);
