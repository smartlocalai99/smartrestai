# Customer Flow and Menu Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make logout return home reliably, tighten product name/description spacing, replace typed coupon entry with tap-to-apply offers, and polish the category Menu popup while moving its preview plus beside each name.

**Architecture:** Keep each behavior in its existing component and add one source-level regression suite covering the four requested changes. Preserve current data and calculations: the account page still uses `useAuth`, checkout still computes discounts from `appliedCoupon.rate`, and the Menu popup retains its preview state, dimensions, counts, and navigation callbacks.

**Tech Stack:** Next.js 16.2.10 Pages Router, React 19.2.4, Motion 12.42.2, Tailwind CSS 4, React Icons 5, Node.js `node:test`, ESLint 9.

## Global Constraints

- Preserve authentication storage and the shared protected-route hook.
- Preserve coupon discount mathematics, checkout totals, and the single `SPICE10` 10-percent offer.
- Preserve menu data, image mappings, category counts, category navigation, item previews, product pricing, cart behavior, and Add controls.
- Preserve the compact floating Menu trigger and popup dimensions.
- The interactive preview plus remains accessible and continues to rotate/toggle expanded category items.
- Preserve unrelated dirty-worktree changes. Do not stage or commit implementation files unless explicitly requested.

---

### Task 1: Navigate home before clearing authentication

**Files:**
- Create: `tests/customer-flow-menu-polish.test.mjs`
- Modify: `pages/account.js:44-48`

**Interfaces:**
- Consumes: `router.replace(path) => Promise<boolean>` and `logout() => void`.
- Preserves: the account page and `AuthContext` APIs.

- [ ] **Step 1: Write the failing logout-order test**

Create `tests/customer-flow-menu-polish.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("navigates home before clearing authentication on logout", async () => {
  const source = await readSource("pages/account.js");
  const match = source.match(
    /const handleLogout = async \(\) => \{([\s\S]*?)\n  \};/
  );

  assert.ok(match, "logout handler must be asynchronous");
  const body = match[1];
  assert.match(body, /await router\.replace\("\/"\);/);
  assert.ok(body.indexOf("router.replace") < body.indexOf("logout()"));
  assert.doesNotMatch(body, /router\.push/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: FAIL with `logout handler must be asynchronous` because the current handler clears authentication first and uses `router.push`.

- [ ] **Step 3: Implement ordered logout navigation**

Replace the account handler with:

```js
const handleLogout = async () => {
  await router.replace("/");
  logout();
};
```

Do not add a catch that clears authentication after failed navigation.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: PASS, 1 test passed and 0 failed.

---

### Task 2: Remove the product name-to-description gap

**Files:**
- Modify: `tests/customer-flow-menu-polish.test.mjs`
- Modify: `components/customer/ShopByCategories.jsx:545-553`

**Interfaces:**
- Preserves: `ProductCard` props, text sizes, two-line clamps, description minimum height, price area, and Add controls.
- Changes: only the forced title minimum height and description top margin.

- [ ] **Step 1: Add a failing product-spacing test**

Append:

```js
test("places product descriptions directly below item names", async () => {
  const source = await readSource("components/customer/ShopByCategories.jsx");

  assert.doesNotMatch(source, /min-h-\[35px\]/);
  assert.doesNotMatch(source, /className="mt-1 min-h-\[28px\]/);
  assert.match(source, /<p className="min-h-\[28px\]/);
  assert.match(source, /\[-webkit-line-clamp:2\]/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: FAIL because the product title uses `min-h-[35px]` and the description uses `mt-1`.

- [ ] **Step 3: Remove only the forced gap classes**

Use these final classes:

```jsx
<h4 className="overflow-hidden text-[16px] font-black leading-[1.08] text-[#202020] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
```

```jsx
<p className="min-h-[28px] overflow-hidden text-[11px] font-medium leading-[1.25] text-[#756b64] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: PASS, 2 tests passed and 0 failed.

---

### Task 3: Replace manual promo entry with tappable coupon cards

**Files:**
- Modify: `tests/customer-flow-menu-polish.test.mjs`
- Modify: `pages/checkout.js:1-28,183-212,371-422`

**Interfaces:**
- Produces: `AVAILABLE_COUPONS: Array<{ code: string, rate: number, description: string }>`.
- Consumes: `appliedCoupon` in the unchanged discount formula.
- Preserves: checkout totals, order placement, and coupon-local state.

- [ ] **Step 1: Add a failing tappable-coupon test**

Append:

```js
test("shows available coupons as tap-to-apply cards", async () => {
  const source = await readSource("pages/checkout.js");

  assert.match(source, /const AVAILABLE_COUPONS = \[/);
  assert.match(source, /code: "SPICE10", rate: 0\.1/);
  assert.match(source, /description: "Save 10% on this order"/);
  assert.match(source, /AVAILABLE_COUPONS\.map\(\(coupon\) =>/);
  assert.match(source, /setAppliedCoupon\(coupon\)/);
  assert.match(source, /Tap to apply/);
  assert.match(source, /Applied/);
  assert.match(
    source,
    /Math\.round\(subtotal \* appliedCoupon\.rate\)/
  );
  assert.doesNotMatch(source, /couponInput|couponError|useAnimation/);
  assert.doesNotMatch(source, /placeholder="Promo Code"|<input/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: FAIL because checkout still uses a coupon input, Apply button, error state, and shake animation.

- [ ] **Step 3: Replace coupon data and state handling**

Change the Motion import to:

```js
import { AnimatePresence, motion } from "motion/react";
```

Replace `COUPONS` with:

```js
const AVAILABLE_COUPONS = [
  { code: "SPICE10", rate: 0.1, description: "Save 10% on this order" },
];
```

Keep only the applied coupon state:

```js
const [appliedCoupon, setAppliedCoupon] = useState(null);
```

Replace the existing coupon handler with:

```js
const handleApplyCoupon = (coupon) => {
  setAppliedCoupon(coupon);
};
```

Remove `couponInput`, `couponError`, `couponShake`, and all invalid-code logic.

- [ ] **Step 4: Replace the input UI with offer cards**

Replace the current contents below `Discount Coupon` with:

```jsx
<div className="mt-2 space-y-2">
  {AVAILABLE_COUPONS.map((coupon) => {
    const isApplied = appliedCoupon?.code === coupon.code;

    return (
      <motion.button
        type="button"
        key={coupon.code}
        aria-pressed={isApplied}
        onClick={() => handleApplyCoupon(coupon)}
        whileTap={{ scale: 0.98 }}
        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
          isApplied
            ? "border-[#128647] bg-[#ecfff4]"
            : "border-[#e4dcd2] bg-white"
        }`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7f0e8] text-[#b3402a]">
          <IoPricetagOutline className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-black text-[#241610]">
            {coupon.code}
          </span>
          <span className="mt-0.5 block text-[11px] font-semibold text-[#8b8580]">
            {coupon.description}
          </span>
        </span>
        <span className={`shrink-0 text-[11px] font-black ${isApplied ? "text-[#128647]" : "text-[#8b8580]"}`}>
          {isApplied ? "Applied" : "Tap to apply"}
        </span>
      </motion.button>
    );
  })}
</div>
```

- [ ] **Step 5: Run the tests and verify GREEN**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: PASS, 3 tests passed and 0 failed.

---

### Task 4: Make the category popup glossy and move the preview plus

**Files:**
- Modify: `tests/customer-flow-menu-polish.test.mjs`
- Modify: `components/customer/ShopByCategories.jsx:652-775`

**Interfaces:**
- Preserves: `CategoryRow({ entry, items, isExpanded, onSelect, onToggleExpand })`.
- Preserves: Menu popup width, maximum height, vertical position, item preview animation, count, and category navigation.
- Changes: popup glass classes and category-row visual ordering only.

- [ ] **Step 1: Add a failing Menu-popup polish test**

Append:

```js
test("uses a glossy category popup with the preview plus beside the name", async () => {
  const source = await readSource("components/customer/ShopByCategories.jsx");

  assert.match(source, /max-h-\[62vh\] w-\[min\(320px,calc\(100vw-2\.5rem\)\)\]/);
  assert.match(source, /border-white\/20 bg-\[#232329\]\/80/);
  assert.match(source, /backdrop-blur-\[28px\]/);
  assert.match(source, /backdrop-saturate-150/);
  assert.match(source, /pointer-events-none absolute inset-\[1px\]/);
  assert.match(
    source,
    /\{entry\.title\}[\s\S]*?text-\[#128647\][\s\S]*?<LuPlus[\s\S]*?ml-auto mr-1 text-white\/60[\s\S]*?\{entry\.count\}/
  );
  assert.doesNotMatch(source, /rounded-full bg-\[#b3402a\] text-white/);
  assert.match(source, /onClick=\{\(\) => onToggleExpand\(entry\.title\)\}/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/customer-flow-menu-polish.test.mjs`

Expected: FAIL because the popup is solid, the preview plus is a red circle after the count, and the glass highlight is missing.

- [ ] **Step 3: Move and restyle the interactive preview plus**

Replace the top of `CategoryRow` with:

```jsx
<div className="flex items-center px-3">
  <button
    type="button"
    onClick={() => onSelect(entry.title)}
    className="min-w-0 rounded-xl py-3 text-left text-sm font-bold active:bg-white/10"
  >
    <span>{entry.title}</span>
  </button>
  <motion.button
    type="button"
    onClick={() => onToggleExpand(entry.title)}
    whileTap={{ scale: 0.88 }}
    aria-label={isExpanded ? `Hide ${entry.title} items` : `Preview ${entry.title} items`}
    aria-expanded={isExpanded}
    className="grid h-8 w-8 shrink-0 place-items-center bg-transparent text-[#128647]"
  >
    <motion.span
      animate={{ rotate: isExpanded ? 45 : 0 }}
      transition={{ duration: 0.2 }}
      className="inline-flex"
    >
      <LuPlus className="h-4 w-4" />
    </motion.span>
  </motion.button>
  <span className="ml-auto mr-1 text-white/60">{entry.count}</span>
</div>
```

Keep the existing expandable item-preview block unchanged.

- [ ] **Step 4: Apply the glossy popup surface without resizing it**

Use this nav class:

```jsx
className="fixed bottom-[calc(10.75rem+env(safe-area-inset-bottom))] z-50 max-h-[62vh] w-[min(320px,calc(100vw-2.5rem))] overflow-hidden rounded-[24px] border border-white/20 bg-[#232329]/80 p-3 text-white shadow-[0_24px_55px_rgba(0,0,0,0.38)] backdrop-blur-[28px] backdrop-saturate-150"
```

Inside the nav, place this highlight before the existing header and list:

```jsx
<span className="pointer-events-none absolute inset-[1px] rounded-[23px] bg-gradient-to-b from-white/15 via-white/[0.03] to-transparent" />
```

Wrap the header and scrollable list in:

```jsx
<div className="relative z-10">
  {/* existing header and list */}
</div>
```

- [ ] **Step 5: Run all focused tests and verify GREEN**

Run: `node --test tests/customer-flow-menu-polish.test.mjs tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs tests/restaurant-info.test.mjs`

Expected: PASS, 15 tests passed and 0 failed.

- [ ] **Step 6: Run final verification**

Run:

```bash
npx eslint pages/account.js pages/checkout.js components/customer/ShopByCategories.jsx tests/customer-flow-menu-polish.test.mjs tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs tests/restaurant-info.test.mjs
npm run build
git diff --check
```

Expected: ESLint exits 0, the Next.js production build exits 0, and `git diff --check` reports no whitespace errors.

Inspect the final source to confirm the compact Menu trigger, popup dimensions, preview behavior, coupon discount formula, product-card controls, and authentication storage were not changed.
