alter function public.set_updated_at() set search_path = '';

revoke execute on function public.set_updated_at() from public, anon, authenticated;
