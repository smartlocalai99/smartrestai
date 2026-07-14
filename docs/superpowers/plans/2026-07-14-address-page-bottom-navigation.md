# Address Page Bottom Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the standard glossy bottom navigation visible on the Saved Addresses page even when the cart contains items.

**Architecture:** Preserve `AppShell` as the single owner of the page viewport and bottom navigation. Add a default-on `showCheckoutButton` option that flows from `AppShell` into `BottomNav`, and disable only the checkout substitution from `pages/addresses.js`.

**Tech Stack:** Next.js 16.2.10 Pages Router, React 19, JavaScript/JSX, Node test runner, ESLint.

## Global Constraints

- Preserve checkout-button behavior on every page except Saved Addresses.
- Keep the existing glossy navigation styling and routes unchanged.
- Keep the address add/edit sheet as a full-screen overlay.
- Preserve unrelated dirty-worktree changes.

---

### Task 1: Make checkout substitution configurable for Saved Addresses

**Files:**
- Modify: `components/customer/AppShell.js`
- Modify: `components/customer/BottomNav.js`
- Modify: `pages/addresses.js`
- Test: `tests/customer-flow-menu-polish.test.mjs`

**Interfaces:**
- Consumes: `AppShell({ children, contentClassName, showCheckoutButton })` with `showCheckoutButton` defaulting to `true`.
- Produces: `BottomNav({ checkoutSummary, showCheckoutButton })`, rendering checkout only when `showCheckoutButton && checkoutSummary?.totalItems > 0`.

- [ ] **Step 1: Write the failing regression test**

Append this test to `tests/customer-flow-menu-polish.test.mjs`:

```js
test("keeps primary navigation available on the saved addresses page", async () => {
  const [addresses, appShell, bottomNav] = await Promise.all([
    readSource("pages/addresses.js"),
    readSource("components/customer/AppShell.js"),
    readSource("components/customer/BottomNav.js"),
  ]);

  assert.match(addresses, /<AppShell showCheckoutButton=\{false\}>/);
  assert.match(appShell, /showCheckoutButton = true/);
  assert.match(appShell, /<BottomNav[\s\S]*?showCheckoutButton=\{showCheckoutButton\}/);
  assert.match(bottomNav, /showCheckoutButton = true/);
  assert.match(
    bottomNav,
    /if \(showCheckoutButton && checkoutSummary\?\.totalItems > 0\)/
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: FAIL because the address page does not yet set `showCheckoutButton={false}`.

- [ ] **Step 3: Add the default-on shell and navigation option**

Update `AppShell` to accept and forward the option:

```diff
-export default function AppShell({ children, contentClassName = "" }) {
+export default function AppShell({
  children,
  contentClassName = "",
  showCheckoutButton = true,
}) {
@@
-        <BottomNav checkoutSummary={checkoutSummary} />
+        <BottomNav
+          checkoutSummary={checkoutSummary}
+          showCheckoutButton={showCheckoutButton}
+        />
```

Update `BottomNav` to guard checkout substitution:

```diff
-export default function BottomNav({ checkoutSummary }) {
+export default function BottomNav({
  checkoutSummary,
  showCheckoutButton = true,
}) {
@@
-  if (checkoutSummary?.totalItems > 0) {
+  if (showCheckoutButton && checkoutSummary?.totalItems > 0) {
```

Opt the address page into persistent navigation:

```diff
-      <AppShell>
+      <AppShell showCheckoutButton={false}>
```

- [ ] **Step 4: Run focused verification**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: all tests pass.

Run: `npx eslint components/customer/AppShell.js components/customer/BottomNav.js pages/addresses.js tests/customer-flow-menu-polish.test.mjs`

Expected: exit code 0 with no lint errors.

- [ ] **Step 5: Run production verification**

Run: `npm run build`

Expected: Next.js production build completes successfully and includes `/addresses`.
