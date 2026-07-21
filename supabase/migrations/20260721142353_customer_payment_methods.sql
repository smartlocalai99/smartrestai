alter table public.restaurant_profile
alter column payment_methods set default '[
  {"id":"cod","label":"Cash on Delivery","enabled":true},
  {"id":"upi","label":"UPI","enabled":true}
]'::jsonb;

update public.restaurant_profile
set payment_methods = '[
  {"id":"cod","label":"Cash on Delivery","enabled":true},
  {"id":"upi","label":"UPI","enabled":true}
]'::jsonb;
