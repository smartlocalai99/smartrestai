# Orders Production Readiness Design

## Goal

Finish the customer Orders experience with a dependable map, free delivery pricing, real order milestone timestamps, consistent previous-order styling, and a single branded app-loading moment.

## Previous Orders Styling

The Previous Orders panel uses `#f6f6f6` across the full available content area, including the history-only state where no current order exists. Individual previous-order cards remain white for contrast. The empty history plate state uses the same background without a white strip around it.

## Reliable Delivery Map

The map renders an eager OpenStreetMap fallback underneath MapLibre from the first paint. MapLibre progressively replaces it when its style and tiles load; a provider error or timeout reveals the already-loading fallback instead of leaving a spinner or blank surface.

Endpoint data follows this priority:

- Restaurant coordinates, name, and address come from `restaurant_profile`.
- If the profile is unavailable, use the existing MANDI KING Ganagapeta constants.
- Customer coordinates come from the order's captured `deliveryAddress.lat` and `deliveryAddress.lng`.
- Legacy orders without coordinates use the existing display-only Kadapa customer point and keep the non-live tracking disclaimer.

The restaurant marker uses `/applogo.jpeg` in a circular, high-contrast marker. The customer uses a distinct location marker. Both markers remain visible over MapLibre and the fallback treatment. The route is explicitly visual rather than live navigation.

## Free Delivery

Delivery is free for new customer orders. Checkout no longer calculates or adds a delivery amount: `deliveryFee` is persisted as `0`, and the total remains `subtotal - discount`. Checkout and current-order details show `Delivery charges` with `FREE`; no extra amount is added.

Previously persisted order totals remain untouched. Previous-order cards continue to display their stored bill amount so historical billing records are not rewritten.

## Payment Methods

Customer payment choices are limited to `Cash on Delivery` and `UPI`. `Card` is removed from the Payment Methods page, checkout selector, customer-side fallback configuration, help copy, and the restaurant-profile seed used for new environments.

The payment context filters the profile-driven list to `cod` and `upi`, so an existing Supabase profile that still contains an enabled Card entry cannot reintroduce it. If local storage contains the removed `card` selection, the selected method safely falls back to the first supported option and the valid replacement is persisted.

The UPI payment card includes three compact rounded logo tiles for PhonePe, Google Pay, and Paytm. Use the brand icons already bundled through `react-icons/si`, with accessible labels and recognizable brand colors; do not add remote image requests or another package. The same supported method set is used at checkout, while the richer logo row is specific to the Payment Methods screen so checkout stays compact.

## Order Timeline

The current-order details include a vertical three-step timeline:

1. `Ordered`
2. `Picked up`
3. `Delivered`

`preparing` completes Ordered, `out_for_delivery` completes Ordered and Picked up, and `delivered` completes all three. Pending stages show `Pending` instead of an invented time.

A new additive Supabase migration adds `ordered_at`, `picked_up_at`, and `delivered_at` to `customer_orders`. Existing rows receive `ordered_at = placed_at`; pickup and delivery values remain null when their true historical time is unknown. A database trigger records pickup and delivery times when status transitions occur, so future updates from any owner/billing client create authoritative timestamps. Existing completed rows with missing milestone timestamps display `Completed` rather than a fake timestamp.

The customer data mapper carries these fields as `orderedAt`, `pickedUpAt`, and `deliveredAt`. Pure order-view helpers convert them into timeline steps and formatted labels.

## Branded Initial Loading

Remove the custom `apple-touch-startup-image` links that cause an additional iOS splash before the React loader. Keep one root-level Mandi Kings logo loader using `/applogo.jpeg` while initial providers hydrate. It appears only during the initial application mount, fades once ready, and never returns during client-side route changes or later provider refreshes. The eight-second fail-safe and reduced-motion behavior remain.

This preserves visible brand feedback while eliminating the double-splash experience. The PWA manifest icons and app identity remain unchanged.

## Component and Data Boundaries

- `pages/orders.js` supplies restaurant profile data to the order experience.
- `OrderTrackingExperience` owns tabs, background selection, timeline presentation, and bill rows.
- `OrderTrackingMap` owns progressive map loading and endpoint markers.
- `orderTrackingMap.mjs` derives validated endpoint coordinates, route geometry, bounds, and fallback URLs.
- `orderView.mjs` derives timeline steps and monetary display values.
- `checkout.js` enforces free delivery for new orders.
- `PaymentContext` enforces the supported Cash on Delivery and UPI method set.
- `payment-methods.js` renders the rounded UPI brand-logo row and no Card option.
- `customerData.mjs` maps milestone timestamps between Supabase and the customer model.
- A new migration records milestone times at the database boundary.

## Error Handling and Accessibility

- A failed MapLibre import, style request, WebGL initialization, or load timeout leaves the fallback map visible.
- Missing or invalid coordinates fall back without crashing.
- Map endpoints and the visual-only route disclaimer remain available as text alternatives.
- Timeline steps expose their label, state, and timestamp as ordinary readable text; color is not the only status signal.
- Restaurant-logo marker alternative text identifies MANDI KING.

## Verification

Test-first coverage must prove:

- Map endpoint derivation uses profile and saved-address coordinates with safe fallbacks.
- The fallback map is present before MapLibre becomes ready.
- The restaurant marker uses `/applogo.jpeg`.
- Checkout persists zero delivery fee and excludes it from totals.
- Current order details display `Delivery charges` and `FREE`.
- Payment methods and checkout expose only Cash on Delivery and UPI.
- The UPI card renders accessible PhonePe, Google Pay, and Paytm logo tiles.
- A stale locally stored Card selection falls back to a supported method.
- Timeline status and timestamps derive correctly, including legacy missing-time fallbacks.
- Previous-order and history-only surfaces use `#f6f6f6`.
- Custom iOS startup-image links are absent while one root logo loader remains.

Run focused tests, the complete unit and legacy suites, ESLint on touched files, a production build, and a local `/orders` route check. Repository-wide lint failures outside the touched files are reported separately rather than silently attributed to this work.

## Deployment Boundary

The repository receives the additive migration, but this task does not push database changes or deploy the application. Deployment remains an explicit follow-up action because it changes shared external state.
