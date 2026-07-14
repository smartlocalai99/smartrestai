# Restaurant Information Bottom Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining white bottom area and reduce excessive space after the Mandi King address without affecting navigation safety.

**Architecture:** Keep the shared `AppShell` bottom clearance unchanged because other customer pages use it. On the home page only, pass the information panel's light-grey background into the scroll container and reduce `RestaurantInfo` bottom padding from 160px to 32px.

**Tech Stack:** Next.js 16.2.10 Pages Router, React 19.2.4, Tailwind CSS 4, Node.js `node:test`, ESLint 9.

## Global Constraints

- Preserve the shared `AppShell` bottom clearance of `calc(7rem + env(safe-area-inset-bottom))`.
- Preserve the compact glass Menu trigger, glass bottom navigation, disclaimer copy, restaurant address, menu data, product cards, and Add controls.
- Use `#f5f5fa` through the home page's reserved bottom area; no white strip may remain below `RestaurantInfo`.
- Use 32px (`pb-8`) bottom padding inside `RestaurantInfo`, replacing 160px (`pb-40`).
- Preserve unrelated dirty-worktree changes. Do not stage or commit implementation files unless explicitly requested.

---

### Task 1: Remove the remaining white bottom area

**Files:**
- Modify: `tests/restaurant-info.test.mjs:35-49`
- Modify: `pages/index.js:21-40`
- Modify: `components/customer/RestaurantInfo.js:10-15`

**Interfaces:**
- Consumes: existing `AppShell({ children, contentClassName })` support.
- Preserves: `RestaurantInfo()` and all existing component APIs.
- Produces: home-only light-grey scroll clearance with compact panel padding.

- [ ] **Step 1: Update the regression test for compact grey clearance**

Replace the spacing assertions in `tests/restaurant-info.test.mjs` with:

```js
assert.match(
  pageSource,
  /<AppShell contentClassName="bg-\[#f5f5fa\]">/
);
assert.match(
  pageSource,
  /<ShopByCategories[^>]*\/>\s*<RestaurantInfo\s*\/>/s
);
assert.doesNotMatch(menuSource, /px-4 pb-40 pt-2/);
assert.match(menuSource, /px-4 pb-8 pt-2/);
assert.match(infoSource, /bg-\[#f5f5fa\][^"]*pb-8/);
assert.doesNotMatch(infoSource, /pb-40/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/restaurant-info.test.mjs`

Expected: FAIL because the home page does not pass `contentClassName="bg-[#f5f5fa]"` and `RestaurantInfo` still uses `pb-40`.

- [ ] **Step 3: Color the home scroll clearance light grey**

In `pages/index.js`, change only the home shell opening tag:

```jsx
<AppShell contentClassName="bg-[#f5f5fa]">
```

This colors the existing app-shell bottom padding on the home page without changing the shared clearance or other pages.

- [ ] **Step 4: Reduce the panel's internal bottom padding**

In `components/customer/RestaurantInfo.js`, change only the section class:

```jsx
className="border-t border-[#dedee7] bg-[#f5f5fa] px-5 pb-8 pt-7 text-[#5d5d68]"
```

- [ ] **Step 5: Run all focused tests and verify GREEN**

Run: `node --test tests/restaurant-info.test.mjs tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs`

Expected: PASS, 11 tests passed and 0 failed.

- [ ] **Step 6: Run final verification**

Run:

```bash
npx eslint pages/index.js components/customer/RestaurantInfo.js tests/restaurant-info.test.mjs
npm run build
git diff --check
```

Expected: ESLint exits 0, the Next.js production build exits 0, and `git diff --check` reports no whitespace errors.

Inspect the final source to confirm `AppShell` still owns `pb-[calc(7rem+env(safe-area-inset-bottom))]`, the home page supplies `bg-[#f5f5fa]`, and no `pb-40` remains in `RestaurantInfo`.
