# Menu Image Mappings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Fish Mandi, both Mix Mandi sizes, and the newly photographed Chicken Starters render their exact dish images while preserving separate Mini Pack Mandi photos.

**Architecture:** Put the exact title-and-section overrides in a small pure ES module so they can be tested with Node's built-in test runner. `ShopByCategories.jsx` will consult this exact mapping before its existing broad regex fallbacks, leaving the rest of the menu behavior unchanged.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, ES modules, Node.js built-in `node:test`, ESLint 9.

## Global Constraints

- Do not change menu names, descriptions, prices, layout, or cart behavior.
- Keep `Chicken 65 Mandi (Serves 1)` on `/Chicken65Mandi.webp` and `Chicken Tikka Mandi (Serves 1)` on `/ChickenTikkaMandi.webp`.
- Both Mixed Mandi serving sizes must use the single shared `/mixmandi.jpg` image.
- Preserve all existing uncommitted user changes.

---

### Task 1: Add exact menu image mappings

**Files:**
- Create: `components/customer/menuImageMappings.mjs`
- Create: `tests/menu-image-mappings.test.mjs`
- Modify: `components/customer/ShopByCategories.jsx:1-325`

**Interfaces:**
- Consumes: `item.title` and the current menu section heading passed by `imageForItem`.
- Produces: `getExactMenuImage(itemTitle, sectionTitle) => string | null`.

- [ ] **Step 1: Write the failing mapping test**

Create `tests/menu-image-mappings.test.mjs` with table-driven assertions for Chicken Starters, Mini Pack variants, Fish Mandi, both Mixed Mandi sizes, Mutton Raan, and Chicken Fry Piece. Also assert that every returned `/public` path exists.

```js
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { getExactMenuImage } from "../components/customer/menuImageMappings.mjs";

const mappings = [
  ["Chicken 65", "Chicken Starters", "/chicken65.jpg"],
  ["Chicken Tikka", "Chicken Starters", "/chickentiika.jpg"],
  ["Chicken 65 Mandi (Serves 1)", "Mini Pack", "/Chicken65Mandi.webp"],
  ["Chicken Tikka Mandi (Serves 1)", "Mini Pack", "/ChickenTikkaMandi.webp"],
  ["Broasted Fish Mandi", "Fish Mandi", "/broastedfishmandi.webp"],
  ["Fish Fried Mandi", "Fish Mandi", "/fishfrymandi.jpg"],
  ["Grilled Fish Mandi [Serves 2]", "Fish Mandi", "/grilledfishmandi.jpg"],
  ["Mixed Mandi (serves 4 Persons)", "Mix Mandi", "/mixmandi.jpg"],
  ["Mixed Mandi (serves 8 Persons)", "Mix Mandi", "/mixmandi.jpg"],
  ["Mutton Raan Mandi", "Mix Mandi", "/muttonraanmandi.jpg"],
  ["Chicken Fry piece Mandi", "Chicken Mandi", "/chickenfrypiecemandi.webp"],
];

test("maps newly photographed dishes to their exact images", async () => {
  for (const [title, section, expectedImage] of mappings) {
    assert.equal(getExactMenuImage(title, section), expectedImage);
    await access(new URL(`../public${expectedImage}`, import.meta.url));
  }
});

test("does not override similarly named dishes in other sections", () => {
  assert.equal(getExactMenuImage("Chicken Tikka", "Mini Pack"), null);
  assert.equal(getExactMenuImage("Chicken 65", "Recommended"), null);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/menu-image-mappings.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `components/customer/menuImageMappings.mjs`.

- [ ] **Step 3: Add the minimal exact mapping module**

Create `components/customer/menuImageMappings.mjs`:

```js
const exactMenuImages = new Map([
  ["Chicken Starters::Chicken 65", "/chicken65.jpg"],
  ["Chicken Starters::Chicken Tikka", "/chickentiika.jpg"],
  ["Mini Pack::Chicken 65 Mandi (Serves 1)", "/Chicken65Mandi.webp"],
  ["Mini Pack::Chicken Tikka Mandi (Serves 1)", "/ChickenTikkaMandi.webp"],
  ["Fish Mandi::Broasted Fish Mandi", "/broastedfishmandi.webp"],
  ["Fish Mandi::Fish Fried Mandi", "/fishfrymandi.jpg"],
  ["Fish Mandi::Grilled Fish Mandi [Serves 2]", "/grilledfishmandi.jpg"],
  ["Mix Mandi::Mixed Mandi (serves 4 Persons)", "/mixmandi.jpg"],
  ["Mix Mandi::Mixed Mandi (serves 8 Persons)", "/mixmandi.jpg"],
  ["Mix Mandi::Mutton Raan Mandi", "/muttonraanmandi.jpg"],
  ["Chicken Mandi::Chicken Fry piece Mandi", "/chickenfrypiecemandi.webp"],
]);

export const getExactMenuImage = (itemTitle, sectionTitle) =>
  exactMenuImages.get(`${sectionTitle}::${itemTitle}`) ?? null;
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/menu-image-mappings.test.mjs`

Expected: PASS, 2 tests passed and 0 failed.

- [ ] **Step 5: Integrate the exact mapper before regex fallbacks**

At the top of `components/customer/ShopByCategories.jsx`, import the helper:

```js
import { getExactMenuImage } from "./menuImageMappings.mjs";
```

At the start of `imageForItem`, resolve and return an exact image before the existing regex rules:

```js
const imageForItem = (item, sectionTitle = "") => {
  const exactImage = getExactMenuImage(item.title, sectionTitle);
  if (exactImage) return exactImage;

  const text = `${item.title} ${sectionTitle}`.toLowerCase();
```

- [ ] **Step 6: Verify source quality and production compilation**

Run: `node --test tests/menu-image-mappings.test.mjs`

Expected: PASS, 2 tests passed and 0 failed.

Run: `npx eslint components/customer/ShopByCategories.jsx components/customer/menuImageMappings.mjs tests/menu-image-mappings.test.mjs`

Expected: exit code 0 with no lint errors.

Run: `npm run build`

Expected: exit code 0 and a successful Next.js production build.

- [ ] **Step 7: Review the final diff**

Run: `git diff --check && git diff -- components/customer/ShopByCategories.jsx components/customer/menuImageMappings.mjs tests/menu-image-mappings.test.mjs`

Expected: no whitespace errors; diff contains only the exact-image helper, tests, and two-line component integration in addition to the user's existing menu edits.
