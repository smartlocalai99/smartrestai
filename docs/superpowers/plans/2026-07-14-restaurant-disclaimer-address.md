# Restaurant Disclaimer, Address, and Mobile Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the empty white area below the menu with a persistent Mandi King disclaimer/address panel and make mobile browser chrome use the app's dark brown.

**Architecture:** Add a focused presentational `RestaurantInfo` component after `ShopByCategories` in the existing home-page scroll container. Transfer final floating-control clearance from the white menu section to the cool-grey information panel, and reinforce the existing root theme color through the shared `PageHead` component.

**Tech Stack:** Next.js 16.2.10 Pages Router, React 19.2.4, Tailwind CSS 4, React Icons 5, Node.js `node:test`, ESLint 9.

## Global Constraints

- Preserve all menu data, image mappings, cart behavior, category collapse/navigation, search, Veg mode, product cards, Add controls, and category popup behavior.
- Preserve the compact glass Menu trigger and original glass bottom navigation.
- Use `#32120d` for the mobile top safe area and browser/PWA theme color.
- Render the four approved disclaimer statements and supplied Mandi King address exactly.
- Do not add Swiggy Seal, report-an-issue, map-link, FSSAI, or licensing content.
- Preserve unrelated dirty-worktree changes. Do not stage or commit implementation files unless explicitly requested.

---

### Task 1: Add the restaurant information panel and transfer bottom clearance

**Files:**
- Create: `components/customer/RestaurantInfo.js`
- Create: `tests/restaurant-info.test.mjs`
- Modify: `pages/index.js:1-40`
- Modify: `components/customer/ShopByCategories.jsx:679`

**Interfaces:**
- Produces: `RestaurantInfo()` React component with no props.
- Consumes: `LuMapPin` from `react-icons/lu`.
- Preserves: `ShopByCategories` public API and all Menu navigator behavior.

- [ ] **Step 1: Write the failing restaurant-panel regression tests**

Create `tests/restaurant-info.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("renders the approved Mandi King disclaimer and address", async () => {
  const source = await readSource("components/customer/RestaurantInfo.js");

  assert.match(source, /aria-label="Restaurant information"/);
  assert.match(source, /<ul/);
  assert.match(source, /All prices are set directly by the restaurant\./);
  assert.match(
    source,
    /All nutritional information is indicative, values are per serve as shared by the restaurant and may vary depending on the ingredients and portion size\./
  );
  assert.match(
    source,
    /An average active adult requires 2,000 kcal energy per day; however, calorie needs may vary\./
  );
  assert.match(source, /Dish details might be AI crafted for a better experience\./);
  assert.match(source, /MANDI KING - Arabian Restaurant/);
  assert.match(
    source,
    /Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue,\s*Ganagapeta, Kadapa, Andhra Pradesh 516001/
  );
  assert.match(source, /<LuMapPin aria-hidden="true"/);
  assert.doesNotMatch(source, /Swiggy Seal|Report an issue|FSSAI|License No/);
});

test("places the information panel after the menu and gives it final clearance", async () => {
  const [pageSource, menuSource, infoSource] = await Promise.all([
    readSource("pages/index.js"),
    readSource("components/customer/ShopByCategories.jsx"),
    readSource("components/customer/RestaurantInfo.js"),
  ]);

  assert.match(pageSource, /<ShopByCategories[^>]*\/>\s*<RestaurantInfo\s*\/>/s);
  assert.doesNotMatch(menuSource, /px-4 pb-40 pt-2/);
  assert.match(menuSource, /px-4 pb-8 pt-2/);
  assert.match(infoSource, /bg-\[#f5f5fa\][^"]*pb-40/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/restaurant-info.test.mjs`

Expected: FAIL with `ENOENT` for `components/customer/RestaurantInfo.js`, proving the new panel does not exist yet.

- [ ] **Step 3: Implement the focused restaurant information component**

Create `components/customer/RestaurantInfo.js`:

```jsx
import { LuMapPin } from "react-icons/lu";

const disclaimerItems = [
  "All prices are set directly by the restaurant.",
  "All nutritional information is indicative, values are per serve as shared by the restaurant and may vary depending on the ingredients and portion size.",
  "An average active adult requires 2,000 kcal energy per day; however, calorie needs may vary.",
  "Dish details might be AI crafted for a better experience.",
];

export default function RestaurantInfo() {
  return (
    <section
      aria-label="Restaurant information"
      className="border-t border-[#dedee7] bg-[#f5f5fa] px-5 pb-40 pt-7 text-[#5d5d68]"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-[18px] font-black text-[#4b4b55]">Disclaimer:</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-[14px] font-medium leading-6">
          {disclaimerItems.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-[#d6d6df] pt-7">
          <h2 className="text-[17px] font-black text-[#4b4b55]">
            MANDI KING - Arabian Restaurant
          </h2>
          <div className="mt-3 flex items-start gap-2 text-[14px] font-medium leading-6">
            <LuMapPin
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-[#9292a0]"
            />
            <address className="not-italic">
              Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue,
              Ganagapeta, Kadapa, Andhra Pradesh 516001
            </address>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Render the panel after the menu**

In `pages/index.js`, add:

```js
import RestaurantInfo from "@/components/customer/RestaurantInfo";
```

Then render it immediately after `ShopByCategories` inside the existing `bg-white` wrapper:

```jsx
<ShopByCategories vegOnly={vegOnly} searchQuery={searchQuery} />
<RestaurantInfo />
```

- [ ] **Step 5: Transfer the large bottom clearance from the menu to the panel**

In `components/customer/ShopByCategories.jsx`, change only the outer menu-section class:

```jsx
<section className="w-full bg-transparent px-4 pb-8 pt-2 sm:px-6 lg:pb-8 lg:pt-8">
```

Do not change the `MenuNavigator`, popup, product cards, or Add controls.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `node --test tests/restaurant-info.test.mjs tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs`

Expected: PASS, 10 tests passed and 0 failed.

---

### Task 2: Reinforce the dark-brown mobile browser theme color

**Files:**
- Modify: `tests/restaurant-info.test.mjs`
- Modify: `components/customer/PageHead.js:1-16`

**Interfaces:**
- Preserves: `PageHead({ title, description })`.
- Produces: page-level `<meta name="theme-color" content="#32120d" />` on every page using `PageHead`.

- [ ] **Step 1: Add a failing shared-theme regression test**

Append to `tests/restaurant-info.test.mjs`:

```js
test("uses the app brown for page-level mobile browser chrome", async () => {
  const source = await readSource("components/customer/PageHead.js");

  assert.match(
    source,
    /<meta name="theme-color" content="#32120d" \/>/
  );
  assert.match(source, /viewport-fit=cover/);
});
```

- [ ] **Step 2: Run the theme test and verify RED**

Run: `node --test tests/restaurant-info.test.mjs`

Expected: FAIL because `PageHead.js` contains the safe-area viewport setting but does not yet contain page-level theme-color metadata.

- [ ] **Step 3: Add the page-level theme-color metadata**

In `components/customer/PageHead.js`, render the following immediately after the description metadata:

```jsx
<meta name="theme-color" content="#32120d" />
```

Keep the existing viewport value, including `viewport-fit=cover`, unchanged. Do not change the already-correct `#32120d` values in `_document.js`, `styles/globals.css`, or `public/manifest.webmanifest`.

- [ ] **Step 4: Run all focused tests and verify GREEN**

Run: `node --test tests/restaurant-info.test.mjs tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs`

Expected: PASS, 11 tests passed and 0 failed.

- [ ] **Step 5: Run final verification**

Run:

```bash
npx eslint pages/index.js components/customer/RestaurantInfo.js components/customer/PageHead.js components/customer/ShopByCategories.jsx components/customer/menuNavigation.mjs tests/restaurant-info.test.mjs tests/menu-navigation.test.mjs tests/menu-image-mappings.test.mjs
npm run build
git diff --check
```

Expected: ESLint exits 0, Next.js production build exits 0, and `git diff --check` reports no whitespace errors.

Inspect the final diff to confirm that the Menu popup dimensions, compact glass trigger classes, product cards, Add controls, bottom navigation, menu data, and image mappings were not changed by this feature.
