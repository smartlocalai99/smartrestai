alter table public.customer_orders
  add column if not exists ordered_at timestamptz,
  add column if not exists picked_up_at timestamptz,
  add column if not exists delivered_at timestamptz;

update public.customer_orders
set ordered_at = placed_at
where ordered_at is null;

alter table public.customer_orders
  alter column ordered_at set default now(),
  alter column ordered_at set not null;

create or replace function public.set_customer_order_milestones()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ordered_at is null then
    new.ordered_at := coalesce(new.placed_at, now());
  end if;

  if new.status in ('out_for_delivery', 'delivered') and new.picked_up_at is null then
    new.picked_up_at := now();
  end if;

  if new.status = 'delivered' and new.delivered_at is null then
    new.delivered_at := now();
  end if;

  return new;
end;
$$;

revoke execute on function public.set_customer_order_milestones()
from public, anon, authenticated;

drop trigger if exists customer_orders_set_milestones on public.customer_orders;
create trigger customer_orders_set_milestones
before insert or update of status on public.customer_orders
for each row execute function public.set_customer_order_milestones();
