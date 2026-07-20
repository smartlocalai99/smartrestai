-- Offers are now bundles of specific menu items sold together at a
-- special combined price, not just decorative banner copy.

create table if not exists public.offer_items (
  offer_id uuid not null references public.offers(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  primary key (offer_id, menu_item_id)
);

create index if not exists offer_items_offer_idx on public.offer_items(offer_id);
create index if not exists offer_items_menu_item_idx on public.offer_items(menu_item_id);

alter table public.offer_items enable row level security;

grant select on table public.offer_items to anon, authenticated;
grant insert, update, delete on table public.offer_items to authenticated;
grant select, insert, update, delete on table public.offer_items to service_role;

drop policy if exists "Public can read offer items" on public.offer_items;
create policy "Public can read offer items" on public.offer_items
  for select to anon, authenticated using (true);

drop policy if exists "Owner can manage offer items" on public.offer_items;
create policy "Owner can manage offer items" on public.offer_items
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

alter publication supabase_realtime add table public.offer_items;
