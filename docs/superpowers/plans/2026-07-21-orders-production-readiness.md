# Orders Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a reliable map, free delivery, milestone timeline, gray history surface, one branded startup loader, and Cash on Delivery/UPI-only payment choices.

**Architecture:** Keep UI view derivation in pure helpers and persist authoritative order milestone timestamps at the PostgreSQL boundary with an additive trigger. Use the OpenStreetMap iframe as an eager map baseline and MapLibre as progressive enhancement, while profile and saved-address coordinates feed both layers. Centralize supported payment filtering in `PaymentContext` so every customer surface receives the same valid methods.

**Tech Stack:** Next.js 16.2 Pages Router, React 19, Tailwind CSS 4, MapLibre GL, Supabase/PostgreSQL, Vitest, React Testing Library, Node test runner

## Global Constraints

- Previous Orders uses `#f6f6f6` across its full content surface; cards remain white.
- Delivery is free for all new orders and adds exactly `0` to checkout totals.
- Timeline labels are exactly `Ordered`, `Picked up`, and `Delivered`.
- Unknown historical milestone times display `Completed`, never an invented timestamp.
- Use `/applogo.jpeg` for the restaurant marker.
- Expose only `cod` and `upi`; remove `card` from every customer surface and new profile seed.
- Use bundled `SiPhonepe`, `SiGooglepay`, and `SiPaytm`; add no package and no remote logo request.
- Remove custom iOS startup-image links but retain one root Mandi Kings loader.
- Create an additive migration locally; do not push it or deploy the app.

---

### Task 1: Add milestone persistence and order timeline derivation

**Files:**
- Create: `supabase/migrations/20260721141159_customer_order_milestones.sql`
- Modify: `lib/customerData.mjs`
- Modify: `lib/orderView.mjs`
- Modify: `test/customerData.test.mjs`
- Modify: `test/orderView.test.mjs`
- Modify: `tests/supabase-setup.test.mjs`

**Interfaces:**
- Consumes: database columns `ordered_at`, `picked_up_at`, `delivered_at`
- Produces: order fields `orderedAt`, `pickedUpAt`, `deliveredAt` and `timelineSteps`

- [ ] **Step 1: Write failing mapper, view-model, and migration contract tests**

Add assertions that row mapping carries all three timestamp fields, timeline completion follows status, pending stages say `Pending`, and missing completed timestamps say `Completed`. Add a migration contract test for additive columns plus a `before insert or update of status` trigger.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:unit -- test/customerData.test.mjs test/orderView.test.mjs && node --test tests/supabase-setup.test.mjs`
Expected: FAIL because milestone fields, timeline derivation, and migration do not exist.

- [ ] **Step 3: Implement the generated additive migration**

Fill `supabase/migrations/20260721141159_customer_order_milestones.sql`. It adds nullable timestamp columns, backfills `ordered_at = placed_at`, sets `ordered_at` non-null with `now()` default, and creates an ordinary PL/pgSQL trigger function with `set search_path = ''`. The trigger sets pickup/delivery timestamps only when the corresponding status is first reached.

- [ ] **Step 4: Implement mapper and timeline view model**

Map snake-case milestone columns in `customerData.mjs`. In `orderView.mjs`, return three timeline steps with `isComplete`, `isCurrent`, and a formatted `timeLabel` derived from stored timestamps.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm run test:unit -- test/customerData.test.mjs test/orderView.test.mjs && node --test tests/supabase-setup.test.mjs`
Expected: PASS.

### Task 2: Make the map reliable and data-driven

**Files:**
- Modify: `lib/orderTrackingMap.mjs`
- Modify: `components/customer/OrderTrackingMap.js`
- Modify: `styles/globals.css`
- Modify: `pages/orders.js`
- Modify: `components/customer/OrderTrackingExperience.jsx`
- Modify: `test/orderTrackingMap.test.mjs`
- Create: `test/OrderTrackingMap.test.jsx`

**Interfaces:**
- Consumes: `{ destination, restaurant }` where each may contain label/name, lat, and lng
- Produces: validated endpoints, visual route, bounds, fallback URL, logo marker, and eager fallback map

- [ ] **Step 1: Write failing endpoint and rendered fallback tests**

Test profile/saved-address coordinate priority, invalid-coordinate fallbacks, endpoint-based route geometry, immediate iframe presence, and `/applogo.jpeg` in the restaurant marker.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:unit -- test/orderTrackingMap.test.mjs test/OrderTrackingMap.test.jsx`
Expected: FAIL because the helper uses fixed endpoints and the component mounts the iframe only after failure.

- [ ] **Step 3: Implement pure endpoint derivation**

Add `createMapEndpoints({ destination, restaurant })`; update route, bounds, fallback URL, and map options to accept endpoints rather than global fixed points.

- [ ] **Step 4: Implement progressive map enhancement**

Render the fallback iframe eagerly. Mount MapLibre above it while loading, remove its opaque loading mask, fall back on import/WebGL/style errors or a shorter timeout, and construct an image-backed restaurant marker with accessible text.

- [ ] **Step 5: Wire real profile and order address data**

Read `profile` in `pages/orders.js`, pass it to `OrderTrackingExperience`, and pass the active order's address coordinates plus restaurant profile into `OrderTrackingMap`.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npm run test:unit -- test/orderTrackingMap.test.mjs test/OrderTrackingMap.test.jsx test/OrderTrackingExperience.test.jsx`
Expected: PASS.

### Task 3: Add free delivery, timeline UI, and history background

**Files:**
- Modify: `pages/checkout.js`
- Modify: `components/customer/OrderTrackingExperience.jsx`
- Modify: `pages/orders.js`
- Modify: `test/OrderTrackingExperience.test.jsx`
- Modify: `tests/supabase-customer-flow.test.mjs`
- Modify: `tests/empty-state-background.test.mjs`

**Interfaces:**
- Consumes: `createOrderView(...).timelineSteps`
- Produces: zero-fee persisted orders, `Delivery charges / FREE`, timeline, and gray Previous Orders surface

- [ ] **Step 1: Write failing UI and source-contract tests**

Assert current details show `Delivery charges`, `FREE`, and all three timeline labels/times. Assert checkout fixes `deliveryFee` at zero and total excludes it. Assert previous/history-only wrappers contain `bg-[#f6f6f6]`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:unit -- test/OrderTrackingExperience.test.jsx && node --test tests/supabase-customer-flow.test.mjs tests/empty-state-background.test.mjs`
Expected: FAIL because these UI rows and source contracts are absent.

- [ ] **Step 3: Implement the UI and checkout changes**

Set checkout `deliveryFee = 0`, calculate `total = subtotal - discount`, render `FREE` in checkout and current order details, add the vertical timeline, and apply a full-bleed gray background to previous panels.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm run test:unit -- test/OrderTrackingExperience.test.jsx && node --test tests/supabase-customer-flow.test.mjs tests/empty-state-background.test.mjs`
Expected: PASS.

### Task 4: Restrict payments and add UPI brand logos

**Files:**
- Modify: `context/PaymentContext.js`
- Modify: `pages/payment-methods.js`
- Modify: `pages/checkout.js`
- Modify: `pages/help.js`
- Modify: `supabase/migrations/20260719034905_owner_app_foundation.sql`
- Create: `test/PaymentMethods.test.jsx`
- Create: `test/paymentMethods.test.mjs`

**Interfaces:**
- Consumes: profile-driven `paymentMethods`
- Produces: `methods` containing only `cod` and `upi`, safe selected fallback, and branded UPI tiles

- [ ] **Step 1: Write failing payment filtering and rendering tests**

Test a pure supported-method normalizer with Card and stale selection inputs. Render the page with mocked payment context and assert PhonePe, Google Pay, Paytm labels while Card is absent.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:unit -- test/paymentMethods.test.mjs test/PaymentMethods.test.jsx`
Expected: FAIL because filtering helper and brand tiles do not exist.

- [ ] **Step 3: Implement supported-method normalization**

Export a pure `normalizePaymentMethods(methods)` from `PaymentContext.js`, filter to `cod` and `upi`, provide both methods in fallback data, and ensure `method` falls back even when local storage contains `card`.

- [ ] **Step 4: Implement logo tiles and remove Card references**

Use `SiPhonepe`, `SiGooglepay`, and `SiPaytm` in rounded labelled tiles under UPI. Remove Card icons/copy from payment page and checkout, update help copy, and remove Card from the profile seed.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm run test:unit -- test/paymentMethods.test.mjs test/PaymentMethods.test.jsx`
Expected: PASS.

### Task 5: Remove double splash and complete verification

**Files:**
- Modify: `pages/_document.js`
- Modify: `tests/pwa-branding.test.mjs`
- Verify: `components/customer/StartupGate.jsx`
- Verify: `test/StartupGate.test.jsx`

**Interfaces:**
- Consumes: root provider readiness
- Produces: one React Mandi Kings logo loader and no custom iOS startup-image layer

- [ ] **Step 1: Update the failing PWA contract**

Change the branding test to reject every `apple-touch-startup-image` link while requiring `/applogo.jpeg` in the root startup components.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/pwa-branding.test.mjs tests/initial-splash-integration.test.mjs && npm run test:unit -- test/StartupGate.test.jsx`
Expected: FAIL because `_document.js` still contains nine custom startup-image links.

- [ ] **Step 3: Remove only the native custom splash links**

Delete the `apple-touch-startup-image` block from `_document.js`; retain manifest, app icon, status-bar metadata, StartupGate, logo preload, readiness, fail-safe, and reduced-motion logic.

- [ ] **Step 4: Run all verification**

Run: `npm test`, then ESLint on touched files, `npm run build`, `npx supabase db push --linked --dry-run`, `git diff --check`, and `curl` the local `/orders` and `/payment-methods` routes.
Expected: all tests/build/touched-file lint/diff checks pass; the dry run recognizes exactly the new migration without applying it.
