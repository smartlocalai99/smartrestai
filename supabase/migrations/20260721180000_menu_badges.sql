-- Short owner-set badge text (e.g. "OFFER", "NEW", "50% OFF") shown as a
-- small red highlight on a menu section's title and/or on a specific item.
-- Free text so the owner decides what it says; null/empty means no badge.

alter table public.menu_sections
  add column if not exists badge_text text;

alter table public.menu_items
  add column if not exists badge_text text;
