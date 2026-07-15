# Order Tracking Experience Design

## Goal

Redesign the authenticated `/orders` page to closely follow the supplied mobile delivery-tracking reference. The page must feature the newest order as the active order, use the order's real stored customer data and items, identify MANDI KING as the restaurant, and keep older orders available below.

## Scope

This change covers the customer Orders page plus the basket, favourites, and orders empty states. Focused helpers or tests may be added to support them. It will not add paid map services, live rider tracking, address geocoding, chat, calling, or database migrations.

## Page Structure

The page remains inside the existing customer `AppShell`, retains the Orders bottom-navigation destination, and uses the current mobile-width layout.

When orders exist, the page has two sections:

1. The newest order is rendered as the active delivery experience.
2. All remaining orders are rendered below under `Previous Orders`, newest first.

The existing authenticated, loading, retry, and no-orders states remain available.

## Active Delivery

The active delivery is a single rounded composition inspired by the reference screenshot:

- A map occupies the upper portion.
- A delivery-partner sheet visually overlaps the bottom edge of the map.
- The sheet shows rider details, delivery information, itemized order details, and the total.

The temporary delivery partner is a local constant:

- Name: `Ravi Kumar`
- Role: `Your delivery partner`

No fake rider phone number or fake messaging destination will be introduced. The reference's circular communication controls may be shown as non-interactive visual controls only if they are clearly disabled and accessible; otherwise they will be omitted.

## Map Behavior

The page uses a free OpenStreetMap-based map presentation from OpenFreeMap. It must require no API key, billing account, or secret.

The restaurant origin is fixed to:

`MANDI KING - Arabian restaurant, Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue, Ganagapeta, Kadapa, Andhra Pradesh 516001`

The restaurant marker is placed using a checked coordinate for that address. The order's stored `deliveryAddress.line` is displayed as the destination label.

Current saved addresses contain text but no coordinates. Therefore this version does not claim to calculate a real road route or live ETA. It displays a screenshot-style red delivery path and destination marker as a visual tracking treatment over the map. The UI must not label this path as live navigation. Accurate customer placement and routing are deferred until latitude and longitude are captured with saved addresses.

The map is decorative tracking context rather than the primary source of order information. It must have a text alternative identifying the restaurant origin and the stored delivery destination. Map loading failure must not hide the delivery sheet or order details; a styled fallback surface will preserve the two endpoint labels.

## Order Data

The active order uses existing stored fields without demo replacements:

- `order.items` supplies item titles, quantities, unit prices, and images through the existing `imageForItem` selector.
- `order.deliveryAddress.line` supplies the delivery address.
- `order.deliveryAddress.phone`, when present, supplies the delivery contact number.
- The authenticated user's phone is the fallback contact number.
- `order.status`, `order.placedAt`, `order.totalItems`, and `order.total` supply status, timing, counts, and amount.

Item rows show quantity and title on the left and `quantity × item.price` on the right. The final total uses the stored order total so discounts and delivery fees remain reflected correctly.

The estimate is presented as an app estimate, not live traffic data. Preparing orders use `30–40 min`; non-active historical statuses do not show a live estimate.

Status labels are derived from stored status values, with safe human-readable formatting for unknown values instead of always displaying `Preparing`.

## Previous Orders

Every order after the newest appears under `Previous Orders`. Each compact card includes:

- Human-readable status
- Order date and time
- Up to three existing item images
- Ordered item names
- Total item count
- Stored total amount

Previous-order cards do not pretend to be live deliveries. No reorder or detail-page behavior is added in this change.

## Component Boundaries

`pages/orders.js` remains the route and data-state coordinator. Focused local components or a small customer component module may be used for:

- Active-delivery map presentation
- Rider and delivery information sheet
- Order item rows
- Previous-order cards

Pure formatting helpers cover status, dates, money, contact fallback, and active/previous-order selection. These helpers should be testable without rendering the complete page.

## Responsive and Visual Requirements

- Match the supplied reference's map-over-sheet silhouette, rounded top corners, generous whitespace, red route accent, circular marker treatment, and two-column address/estimate row.
- Keep the existing MANDI KING customer palette and typography so the page feels native to the app.
- Support narrow mobile widths without horizontal scrolling.
- Long customer addresses and item titles wrap instead of being silently lost.
- The previous-orders list remains comfortably above the fixed bottom navigation and device safe area.
- Controls and text maintain accessible contrast, labels, and touch sizes.

## Error and Empty States

- Order-fetch failures retain the clean error message and Retry action.
- Map-provider failure falls back locally without turning the whole Orders page into an error state.
- Missing delivery address displays `Delivery address unavailable`.
- Missing contact phone displays the authenticated account phone when available, then `Contact unavailable`.
- An order with an empty items array still displays its stored item count and total without crashing.

## Branded Empty States

The existing `public/emptyplate.webp` artwork becomes the shared visual for the three food-related empty states only: basket, favourites, and orders. Address management keeps its current icon-based empty state.

`EmptyState` accepts an optional image source while preserving its existing icon behavior for other consumers. Every image-based empty state uses `#f6f6f6` across its full content area. The image treatment uses a large responsive plate and subtle entrance animation with no border, shadow, glow, halo, or framed container. Copy remains warm and the CTA remains prominent and green.

The exact empty-state copy is:

- Basket title: `Your basket is waiting`
- Basket message: `The feast hasn’t started yet. Pick something delicious and let’s fill this plate.`
- Basket CTA: `Explore the menu`
- Favourites title: `Save room for your favourites`
- Favourites message: `Tap the heart on dishes you love and they’ll be waiting for you here.`
- Favourites CTA: `Discover dishes`
- Orders title: `Your first feast awaits`
- Orders message: `Place your first order and follow every delicious detail from our kitchen to your doorstep.`
- Orders CTA: `Start your order`

The artwork uses meaningful alternative text on each screen. Empty-state content must fit above the bottom navigation on common mobile heights without horizontal overflow.

## Testing and Verification

Implementation follows test-first development.

Automated coverage will verify the pure order-view derivation behavior, including:

- Newest order selected as active and the remainder kept as previous orders
- Stored status converted to a readable label
- Ordered item line totals derived from quantity and item price
- Delivery address and contact fallbacks
- Empty and malformed optional fields handled safely
- Image-based and icon-based `EmptyState` variants render correctly
- Basket, favourites, and orders use their exact approved copy and CTA labels

Verification will include targeted tests, ESLint on touched files, a production build, and browser inspection at mobile and wider viewport sizes. Browser inspection must confirm the active order uses real stored items/address data and that previous orders appear only when older orders exist.

## Deferred Work

- Persisting customer latitude and longitude
- Geocoding text addresses
- Accurate road routing and traffic-aware ETA
- Live rider location
- Working rider chat and calling
- Reorder and order-detail actions
