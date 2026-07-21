-- Home-screen category shortcuts (Mandi / Starters / Rotis / Desserts row).
-- These used to be a fixed list hardcoded in the customer app, so renaming
-- or removing a menu section silently broke the "jump to section" link.
-- Store them as owner-editable rows instead, linked to menu_sections by id
-- so the jump target always follows the section even if it's renamed.

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  image_url text,
  section_id uuid references public.menu_sections(id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.menu_categories enable row level security;

grant select on table public.menu_categories to anon, authenticated;
grant insert, update, delete on table public.menu_categories to authenticated;
grant select, insert, update, delete on table public.menu_categories to service_role;

drop policy if exists "Public can read menu categories" on public.menu_categories;
create policy "Public can read menu categories" on public.menu_categories
  for select to anon, authenticated using (true);

drop policy if exists "Owner can manage menu categories" on public.menu_categories;
create policy "Owner can manage menu categories" on public.menu_categories
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

drop trigger if exists menu_categories_set_updated_at on public.menu_categories;
create trigger menu_categories_set_updated_at before update on public.menu_categories
for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.menu_categories;

-- Seed the four categories the customer app used to hardcode, linked to the
-- matching live section by title so they keep working after this migration.
insert into public.menu_categories (label, image_url, section_id, display_order)
select v.label, v.image_url, s.id, v.display_order
from (
  values
    ('Mandi', '/mandi9.png', 'Chicken Mandi', 0),
    ('Starters', '/starterimg.webp', 'Chicken Starters', 1),
    ('Rotis', '/rotis.png', 'Rotis', 2),
    ('Desserts', '/desert.png', 'Desserts', 3)
) as v(label, image_url, section_title, display_order)
left join public.menu_sections s on s.title = v.section_title
where not exists (select 1 from public.menu_categories);
