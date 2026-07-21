# Orders Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add status-aware Current Order and Previous Orders views with tabs, order-history cards, and the existing plate empty state.

**Architecture:** Keep Supabase persistence untouched and classify the loaded order snapshots in `lib/orderView.mjs`. Let `OrderTrackingExperience` own local tab state and render focused current/history panels while `pages/orders.js` continues to own authentication, loading, retry, and the all-orders-empty state.

**Tech Stack:** Next.js 16 Pages Router, React 19, Tailwind CSS, Vitest, React Testing Library, Supabase order snapshots

## Global Constraints

- `preparing` and `out_for_delivery` are current-order statuses.
- `delivered` and `cancelled` are previous-order statuses.
- Show tabs only when a current order exists.
- Keep the Previous Orders tab visible with a plate empty state when history is empty.
- Reuse `/emptyplate.webp`; add no dependency and no database migration.

---

### Task 1: Status-aware order grouping

**Files:**
- Modify: `test/orderView.test.mjs`
- Modify: `lib/orderView.mjs`

**Interfaces:**
- Consumes: order objects with `status` and `placedAt`
- Produces: `splitOrders(orders) -> { activeOrder, previousOrders }`

- [ ] **Step 1: Write the failing grouping tests**

Add cases proving a newer delivered order cannot replace an active order, delivered/cancelled records are history, and history-only input returns `activeOrder: null`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- test/orderView.test.mjs`
Expected: FAIL because the current implementation always chooses the newest record.

- [ ] **Step 3: Implement the classifier**

Sort snapshots by `placedAt`, select the newest order whose status is `preparing` or `out_for_delivery`, and place every other snapshot into `previousOrders` newest first.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm run test:unit -- test/orderView.test.mjs`
Expected: PASS.

### Task 2: Orders tabs, history cards, and empty states

**Files:**
- Modify: `test/OrderTrackingExperience.test.jsx`
- Modify: `components/customer/OrderTrackingExperience.jsx`

**Interfaces:**
- Consumes: `orders`, `accountPhone`, `splitOrders`, `createOrderView`
- Produces: accessible tab UI when current exists; history-only UI otherwise

- [ ] **Step 1: Write failing interaction tests**

Test that current tracking is the default, clicking Previous Orders shows order ID/image/bill amount, empty history shows `/emptyplate.webp`, and history-only input renders directly without a tablist.

- [ ] **Step 2: Run the focused component test and verify RED**

Run: `npm run test:unit -- test/OrderTrackingExperience.test.jsx`
Expected: FAIL because there are no tabs and history is currently appended below current tracking.

- [ ] **Step 3: Implement the minimal responsive UI**

Add `useState`, accessible tabs, separate current/history rendering, `Order #<id>` on every previous card, and the shared plate-style `EmptyState` when history is empty.

- [ ] **Step 4: Run the focused component test and verify GREEN**

Run: `npm run test:unit -- test/OrderTrackingExperience.test.jsx`
Expected: PASS.

### Task 3: Page integration and verification

**Files:**
- Modify only if required: `pages/orders.js`

**Interfaces:**
- Consumes: `OrderTrackingExperience`, existing `EmptyState`
- Produces: complete `/orders` states for loading, all-empty, current, and previous-only data

- [ ] **Step 1: Run all automated checks**

Run: `npm test && npm run lint && npm run build`
Expected: all commands exit 0.

- [ ] **Step 2: Review the diff against the design**

Confirm all approved states are represented, no Supabase schema or persistence code changed, and no unrelated files were modified.
