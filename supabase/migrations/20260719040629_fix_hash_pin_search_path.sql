-- Pin search_path on hash_pin (flagged by db advisors: function_search_path_mutable)
-- and schema-qualify the pgcrypto calls it relies on.

create or replace function public.hash_pin(pin text)
returns text
language sql
stable
set search_path = ''
as $$
  select extensions.crypt(pin, extensions.gen_salt('bf'));
$$;

revoke execute on function public.hash_pin(text) from public, anon;
grant execute on function public.hash_pin(text) to authenticated;
