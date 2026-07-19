-- Owner app foundation: ownership/auth, restaurant profile, menu, offers,
-- riders, billing counters, cancellation reasons, storage, and the
-- additive columns the owner dashboard needs on existing customer tables.

-- ---------------------------------------------------------------------
-- Ownership (single-restaurant, single-owner bootstrap)
-- ---------------------------------------------------------------------

create table if not exists public.restaurant_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.restaurant_owners enable row level security;

grant select, insert on table public.restaurant_owners to authenticated;
grant select, insert, update, delete on table public.restaurant_owners to service_role;

drop policy if exists "Authenticated can check ownership" on public.restaurant_owners;
create policy "Authenticated can check ownership" on public.restaurant_owners
  for select to authenticated using (true);

-- The first person to sign in claims ownership; once the table has a row,
-- this policy blocks anyone else from inserting themselves.
drop policy if exists "First authenticated user claims ownership" on public.restaurant_owners;
create policy "First authenticated user claims ownership" on public.restaurant_owners
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and not exists (select 1 from public.restaurant_owners)
  );

create or replace function public.is_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.restaurant_owners where user_id = auth.uid()
  );
$$;

revoke execute on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

create or replace function public.hash_pin(pin text)
returns text
language sql
stable
as $$
  select crypt(pin, gen_salt('bf'));
$$;

revoke execute on function public.hash_pin(text) from public, anon;
grant execute on function public.hash_pin(text) to authenticated;

-- ---------------------------------------------------------------------
-- Restaurant profile (singleton row)
-- ---------------------------------------------------------------------

create table if not exists public.restaurant_profile (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'My Restaurant',
  description text,
  phone text,
  address_line text,
  lat double precision,
  lng double precision,
  logo_url text,
  banner_url text,
  is_open boolean not null default true,
  busy_mode boolean not null default false,
  min_order_amount numeric(10,2) not null default 0 check (min_order_amount >= 0),
  opening_time time,
  closing_time time,
  prep_time_minutes integer not null default 30 check (prep_time_minutes > 0),
  delivery_base_km numeric(6,2) not null default 3 check (delivery_base_km >= 0),
  delivery_base_fee numeric(10,2) not null default 40 check (delivery_base_fee >= 0),
  delivery_per_km_fee numeric(10,2) not null default 10 check (delivery_per_km_fee >= 0),
  free_delivery_min_amount numeric(10,2) check (free_delivery_min_amount is null or free_delivery_min_amount >= 0),
  payment_methods jsonb not null default '[
    {"id":"cod","label":"Cash on Delivery","enabled":true},
    {"id":"upi","label":"UPI","enabled":true},
    {"id":"card","label":"Card","enabled":true}
  ]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.restaurant_profile (id, name, address_line, lat, lng, opening_time, closing_time)
values (
  1,
  'MANDI KING - Arabian Restaurant',
  'Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue, Ganagapeta, Kadapa, Andhra Pradesh 516001',
  14.47924,
  78.82171,
  '10:00',
  '23:00'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------------

create table if not exists public.menu_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.menu_sections(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  old_price numeric(10,2) check (old_price is null or old_price >= 0),
  image_url text,
  is_veg boolean not null default true,
  is_bestseller boolean not null default false,
  is_available boolean not null default true,
  prep_time_minutes integer check (prep_time_minutes is null or prep_time_minutes > 0),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_section_idx on public.menu_items(section_id);

-- ---------------------------------------------------------------------
-- Offers
-- ---------------------------------------------------------------------

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  strike_price numeric(10,2) check (strike_price is null or strike_price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Delivery riders (owner-only data, not exposed to customer app)
-- ---------------------------------------------------------------------

create table if not exists public.delivery_riders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle_number text,
  photo_url text,
  is_active boolean not null default true,
  status text not null default 'available' check (status in ('available', 'busy', 'offline')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Billing counter logins (owner-only data; pin_hash never leaves the DB)
-- ---------------------------------------------------------------------

create table if not exists public.billing_counters (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  username text not null unique,
  pin_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Cancellation reasons
-- ---------------------------------------------------------------------

create table if not exists public.cancellation_reasons (
  id uuid primary key default gen_random_uuid(),
  reason text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.cancellation_reasons (reason, display_order)
select reason, display_order from (values
  ('Customer requested cancellation', 1),
  ('Item out of stock', 2),
  ('Restaurant too busy', 3),
  ('Delivery address unreachable', 4),
  ('Payment issue', 5)
) as seed(reason, display_order)
where not exists (select 1 from public.cancellation_reasons);

-- ---------------------------------------------------------------------
-- Additive columns on existing customer tables
-- ---------------------------------------------------------------------

alter table public.customer_addresses
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.customer_orders
  add column if not exists payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  add column if not exists cod_collected boolean not null default false,
  add column if not exists cancellation_reason text;

alter table public.customer_orders drop constraint if exists customer_orders_status_check;
alter table public.customer_orders
  add constraint customer_orders_status_check
  check (status in ('preparing', 'out_for_delivery', 'delivered', 'cancelled'));

-- ---------------------------------------------------------------------
-- updated_at triggers (reuses public.set_updated_at from earlier migration)
-- ---------------------------------------------------------------------

drop trigger if exists restaurant_profile_set_updated_at on public.restaurant_profile;
create trigger restaurant_profile_set_updated_at before update on public.restaurant_profile
for each row execute function public.set_updated_at();

drop trigger if exists menu_sections_set_updated_at on public.menu_sections;
create trigger menu_sections_set_updated_at before update on public.menu_sections
for each row execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at before update on public.offers
for each row execute function public.set_updated_at();

drop trigger if exists delivery_riders_set_updated_at on public.delivery_riders;
create trigger delivery_riders_set_updated_at before update on public.delivery_riders
for each row execute function public.set_updated_at();

drop trigger if exists billing_counters_set_updated_at on public.billing_counters;
create trigger billing_counters_set_updated_at before update on public.billing_counters
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS: public-readable, owner-writable tables
-- ---------------------------------------------------------------------

alter table public.restaurant_profile enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_items enable row level security;
alter table public.offers enable row level security;
alter table public.cancellation_reasons enable row level security;

grant select on table public.restaurant_profile to anon, authenticated;
grant insert, update, delete on table public.restaurant_profile to authenticated;
grant select, insert, update, delete on table public.restaurant_profile to service_role;

grant select on table public.menu_sections to anon, authenticated;
grant insert, update, delete on table public.menu_sections to authenticated;
grant select, insert, update, delete on table public.menu_sections to service_role;

grant select on table public.menu_items to anon, authenticated;
grant insert, update, delete on table public.menu_items to authenticated;
grant select, insert, update, delete on table public.menu_items to service_role;

grant select on table public.offers to anon, authenticated;
grant insert, update, delete on table public.offers to authenticated;
grant select, insert, update, delete on table public.offers to service_role;

grant select on table public.cancellation_reasons to anon, authenticated;
grant insert, update, delete on table public.cancellation_reasons to authenticated;
grant select, insert, update, delete on table public.cancellation_reasons to service_role;

drop policy if exists "Public can read restaurant profile" on public.restaurant_profile;
create policy "Public can read restaurant profile" on public.restaurant_profile
  for select to anon, authenticated using (true);
drop policy if exists "Owner can manage restaurant profile" on public.restaurant_profile;
create policy "Owner can manage restaurant profile" on public.restaurant_profile
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "Public can read menu sections" on public.menu_sections;
create policy "Public can read menu sections" on public.menu_sections
  for select to anon, authenticated using (true);
drop policy if exists "Owner can manage menu sections" on public.menu_sections;
create policy "Owner can manage menu sections" on public.menu_sections
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "Public can read menu items" on public.menu_items;
create policy "Public can read menu items" on public.menu_items
  for select to anon, authenticated using (true);
drop policy if exists "Owner can manage menu items" on public.menu_items;
create policy "Owner can manage menu items" on public.menu_items
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "Public can read offers" on public.offers;
create policy "Public can read offers" on public.offers
  for select to anon, authenticated using (true);
drop policy if exists "Owner can manage offers" on public.offers;
create policy "Owner can manage offers" on public.offers
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "Public can read cancellation reasons" on public.cancellation_reasons;
create policy "Public can read cancellation reasons" on public.cancellation_reasons
  for select to anon, authenticated using (true);
drop policy if exists "Owner can manage cancellation reasons" on public.cancellation_reasons;
create policy "Owner can manage cancellation reasons" on public.cancellation_reasons
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ---------------------------------------------------------------------
-- RLS: owner-only tables (never exposed to anon)
-- ---------------------------------------------------------------------

alter table public.delivery_riders enable row level security;
alter table public.billing_counters enable row level security;

grant select, insert, update, delete on table public.delivery_riders to authenticated;
grant select, insert, update, delete on table public.delivery_riders to service_role;

grant select, insert, update, delete on table public.billing_counters to authenticated;
grant select, insert, update, delete on table public.billing_counters to service_role;

drop policy if exists "Owner can manage delivery riders" on public.delivery_riders;
create policy "Owner can manage delivery riders" on public.delivery_riders
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "Owner can manage billing counters" on public.billing_counters;
create policy "Owner can manage billing counters" on public.billing_counters
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ---------------------------------------------------------------------
-- Storage: one public-read bucket, owner-only writes
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('restaurant-media', 'restaurant-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read restaurant media" on storage.objects;
create policy "Public read restaurant media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'restaurant-media');

drop policy if exists "Owner insert restaurant media" on storage.objects;
create policy "Owner insert restaurant media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'restaurant-media' and public.is_owner());

drop policy if exists "Owner update restaurant media" on storage.objects;
create policy "Owner update restaurant media" on storage.objects
  for update to authenticated
  using (bucket_id = 'restaurant-media' and public.is_owner())
  with check (bucket_id = 'restaurant-media' and public.is_owner());

drop policy if exists "Owner delete restaurant media" on storage.objects;
create policy "Owner delete restaurant media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'restaurant-media' and public.is_owner());
