# Orders Tabs Design

## Goal

Make the Orders page immediately distinguish a customer's live order from completed or cancelled order history.

## Approved behavior

- Treat `preparing` and `out_for_delivery` as current-order statuses.
- Treat `delivered` and `cancelled` as previous-order statuses.
- When a current order exists, show a compact two-tab control: `Current Order` and `Previous Orders`.
- Open `Current Order` by default and preserve the existing tracking UI inside it.
- Keep the `Previous Orders` tab visible even when its list is empty; selecting it shows the existing plate-style empty state.
- Previous-order cards show the order ID, food imagery, placed date/status, item summary, item count, and bill amount.
- When no current order exists but previous orders do, omit the tab control and show `Previous Orders` directly.
- When neither current nor previous orders exist, show the existing plate-style empty state and its order CTA.

## Data and state

The existing Supabase order records remain unchanged. `splitOrders` becomes the single classifier for current and previous orders and sorts each group newest first. The page owns only the selected tab; it resets to `Current Order` whenever a current order appears and otherwise uses `Previous Orders`.

## Component structure

- `pages/orders.js` retains authentication, loading, retry, and top-level empty handling.
- `OrderTrackingExperience` owns the tab control and chooses between the current tracking panel and previous-order list.
- The existing current tracking markup and previous card visual language are reused.
- The shared `EmptyState` component supplies the plate artwork for no-history and no-orders states.

## Accessibility and responsive behavior

The tab control uses `role="tablist"`, tabs expose selected state, and panels are labelled by their tabs. Buttons remain full-width and touch-friendly on the mobile layout.

## Verification

Unit tests cover status-aware grouping, default/current tab behavior, history tab content, empty history, history-only rendering, and order-card fields. The full test suite, lint, and production build must pass.
