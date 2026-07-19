-- Let the customer app subscribe to live changes so owner edits (menu,
-- offers, restaurant status/hours) reflect without a manual refresh.

alter publication supabase_realtime add table
  public.restaurant_profile,
  public.menu_sections,
  public.menu_items,
  public.offers;
