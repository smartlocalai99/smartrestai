-- The customer app hardcoded delivery fee to ₹0 for a while, independent of
-- restaurant_profile's delivery pricing columns. Now that checkout actually
-- reads those columns (lib/deliveryFee.mjs), reset them to ₹0 so switching
-- to the dynamic calculation doesn't silently start charging customers a
-- delivery fee the owner never explicitly set. The owner can set a real fee
-- any time from the owner app's Delivery pricing screen.
update public.restaurant_profile
set delivery_base_fee = 0,
    delivery_per_km_fee = 0
where id = 1;
