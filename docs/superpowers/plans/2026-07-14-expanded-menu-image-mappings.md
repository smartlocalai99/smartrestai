# Expanded Menu Image Mappings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply every approved exact menu-image mapping and remove Labnies Cream Shawarma without affecting other menu content or behavior.

**Architecture:** Extend the existing pure `getExactMenuImage(itemTitle, sectionTitle)` lookup so each menu row resolves before broad regex fallbacks. Keep menu data in `ShopByCategories.jsx`, removing only the Shawarma row, and extend the Node regression test to cover mappings, asset existence, and removal.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, ES modules, Node.js built-in `node:test`, ESLint 9.

## Global Constraints

- Preserve all existing uncommitted source and image changes.
- Do not change menu names, prices, descriptions, layout, search, or cart behavior except removing `Labnies Cream Shawarma`.
- Both Rumali Roti sizes share `/rumaliroti.jpg`.
- Butter Tandoori Roti and Tandoori Roti share `/buttertandooriroti.jpg`.
- Mutton Juicy reuses `/muttonjuicymandi.webp`.
- Do not commit or stage the user's implementation changes unless explicitly requested.

---

### Task 1: Extend exact mappings and remove Shawarma

**Files:**
- Modify: `tests/menu-image-mappings.test.mjs`
- Modify: `components/customer/menuImageMappings.mjs`
- Modify: `components/customer/ShopByCategories.jsx:158-168`

**Interfaces:**
- Consumes: exact menu item title and section heading.
- Produces: `getExactMenuImage(itemTitle, sectionTitle) => string | null` and a menu without `Labnies Cream Shawarma`.

- [ ] **Step 1: Extend the regression test before production code**

Append these rows to the existing `mappings` table in `tests/menu-image-mappings.test.mjs`:

```js
  ["Broasted Chicken Chefs Special", "Chicken Starters", "/boastedchicken.webp"],
  ["Chicken Al-faham", "Chicken Starters", "/chickenalfahm.jpg"],
  ["Haryali Chicken", "Chicken Starters", "/hariyalichicken.jpg"],
  ["Lahori Chicken Seekh Kebab [4 Pcs]", "Chicken Starters", "/chickenseekkabab.jpg"],
  ["Lebanese Cream Chicken", "Chicken Starters", "/lebanescreamchicken.jpg"],
  ["Arabian Mutton Chops (5 Pcs)", "Mutton Starters", "/arabicmuttonchops.jpg"],
  ["Botti Kebab", "Mutton Starters", "/muttonbotikakab.jpg"],
  ["Malai Mutton Chefs Special", "Mutton Starters", "/malaimutton.jpg"],
  ["Middle East Mutton Sheek Kebab Chefs Special", "Mutton Starters", "/muttonsheekkababmiddleeast.jpg"],
  ["Turkish Botti Kebab", "Mutton Starters", "/turkishbotikabab.jpg"],
  ["Apollo Fish", "Seafood Starters", "/apolofish.jpg"],
  ["Broasted Fish (4 Pcs)", "Seafood Starters", "/friedfish.jpg"],
  ["Crispy Fried Prawns Chefs Special", "Seafood Starters", "/friedpranws.jpg"],
  ["Butter Naan", "Rotis", "/butternaan.jpg"],
  ["Butter Tandoori Roti", "Rotis", "/buttertandooriroti.jpg"],
  ["Garlic Butter Naan", "Rotis", "/garlicbutternaan.jpg"],
  ["Rumali Roti", "Rotis", "/rumaliroti.jpg"],
  ["Rumali Roti (10 pcs)", "Rotis", "/rumaliroti.jpg"],
  ["Tandoori Roti", "Rotis", "/buttertandooriroti.jpg"],
  ["Cream Kunafa", "Desserts", "/creamkunafa.jpg"],
  ["Qurbani Ka Meetha", "Desserts", "/QubbaniKaMeetha.jpg"],
  ["Afghani Mutton Rosh", "Extra & Add Ons", "/afganimuttonrosh.jpg"],
  ["Chicken Faham (full Bird)", "Extra & Add Ons", "/chcikenfahmfullbird.jpg"],
  ["Chicken Faham (half Bird)", "Extra & Add Ons", "/chickenfahamhalf.jpg"],
  ["Chicken Fry", "Extra & Add Ons", "/chickenfry.jpg"],
  ["Fish Fry", "Extra & Add Ons", "/fishfry.jpg"],
  ["Fried Onion", "Extra & Add Ons", "/friedonions.jpg"],
  ["Mandi Rice", "Extra & Add Ons", "/mandirice.jpg"],
  ["Mayonnaise", "Extra & Add Ons", "/Mayonnaise.jpg"],
  ["Mutton Dum Roast", "Extra & Add Ons", "/muttondhumroast.jpg"],
  ["Mutton Fry", "Extra & Add Ons", "/muttonfry.jpg"],
  ["Mutton Juicy", "Extra & Add Ons", "/muttonjuicymandi.webp"],
  ["Arabic Champagne", "Mojitto & Beverages", "/ArabicChampagne.jpg"],
  ["Blackcurrant Mojito", "Mojitto & Beverages", "/BlackcurrantMojito.jpg"],
  ["Blue Lagoon Mojito", "Mojitto & Beverages", "/bluelagoonmajito.jpg"],
  ["Chicken Haleem", "Haleem", "/chickenhallem.jpg"],
  ["Mutton Haleem", "Haleem", "/muttonhaleem.jpg"],
  ["Special Haleem", "Haleem", "/speicalhaleem.jpg"],
  ["Family Haleem", "Haleem", "/familyhaleem.jpg"],
```

Add a source-level regression test because menu data is currently private to the JSX module:

```js
import { readFile } from "node:fs/promises";

test("removes Labnies Cream Shawarma from the menu", async () => {
  const source = await readFile(
    new URL("../components/customer/ShopByCategories.jsx", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /Labnies Cream Shawarma/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/menu-image-mappings.test.mjs`

Expected: FAIL because the first new mapping returns `null`, and the Shawarma source assertion fails.

- [ ] **Step 3: Add the exact production mappings**

Append these entries to `exactMenuImages` in `components/customer/menuImageMappings.mjs`:

```js
  ["Chicken Starters::Broasted Chicken Chefs Special", "/boastedchicken.webp"],
  ["Chicken Starters::Chicken Al-faham", "/chickenalfahm.jpg"],
  ["Chicken Starters::Haryali Chicken", "/hariyalichicken.jpg"],
  ["Chicken Starters::Lahori Chicken Seekh Kebab [4 Pcs]", "/chickenseekkabab.jpg"],
  ["Chicken Starters::Lebanese Cream Chicken", "/lebanescreamchicken.jpg"],
  ["Mutton Starters::Arabian Mutton Chops (5 Pcs)", "/arabicmuttonchops.jpg"],
  ["Mutton Starters::Botti Kebab", "/muttonbotikakab.jpg"],
  ["Mutton Starters::Malai Mutton Chefs Special", "/malaimutton.jpg"],
  ["Mutton Starters::Middle East Mutton Sheek Kebab Chefs Special", "/muttonsheekkababmiddleeast.jpg"],
  ["Mutton Starters::Turkish Botti Kebab", "/turkishbotikabab.jpg"],
  ["Seafood Starters::Apollo Fish", "/apolofish.jpg"],
  ["Seafood Starters::Broasted Fish (4 Pcs)", "/friedfish.jpg"],
  ["Seafood Starters::Crispy Fried Prawns Chefs Special", "/friedpranws.jpg"],
  ["Rotis::Butter Naan", "/butternaan.jpg"],
  ["Rotis::Butter Tandoori Roti", "/buttertandooriroti.jpg"],
  ["Rotis::Garlic Butter Naan", "/garlicbutternaan.jpg"],
  ["Rotis::Rumali Roti", "/rumaliroti.jpg"],
  ["Rotis::Rumali Roti (10 pcs)", "/rumaliroti.jpg"],
  ["Rotis::Tandoori Roti", "/buttertandooriroti.jpg"],
  ["Desserts::Cream Kunafa", "/creamkunafa.jpg"],
  ["Desserts::Qurbani Ka Meetha", "/QubbaniKaMeetha.jpg"],
  ["Extra & Add Ons::Afghani Mutton Rosh", "/afganimuttonrosh.jpg"],
  ["Extra & Add Ons::Chicken Faham (full Bird)", "/chcikenfahmfullbird.jpg"],
  ["Extra & Add Ons::Chicken Faham (half Bird)", "/chickenfahamhalf.jpg"],
  ["Extra & Add Ons::Chicken Fry", "/chickenfry.jpg"],
  ["Extra & Add Ons::Fish Fry", "/fishfry.jpg"],
  ["Extra & Add Ons::Fried Onion", "/friedonions.jpg"],
  ["Extra & Add Ons::Mandi Rice", "/mandirice.jpg"],
  ["Extra & Add Ons::Mayonnaise", "/Mayonnaise.jpg"],
  ["Extra & Add Ons::Mutton Dum Roast", "/muttondhumroast.jpg"],
  ["Extra & Add Ons::Mutton Fry", "/muttonfry.jpg"],
  ["Extra & Add Ons::Mutton Juicy", "/muttonjuicymandi.webp"],
  ["Mojitto & Beverages::Arabic Champagne", "/ArabicChampagne.jpg"],
  ["Mojitto & Beverages::Blackcurrant Mojito", "/BlackcurrantMojito.jpg"],
  ["Mojitto & Beverages::Blue Lagoon Mojito", "/bluelagoonmajito.jpg"],
  ["Haleem::Chicken Haleem", "/chickenhallem.jpg"],
  ["Haleem::Mutton Haleem", "/muttonhaleem.jpg"],
  ["Haleem::Special Haleem", "/speicalhaleem.jpg"],
  ["Haleem::Family Haleem", "/familyhaleem.jpg"],
```

- [ ] **Step 4: Remove only the Shawarma menu row**

Delete this line from the `Chicken Starters` items array in `components/customer/ShopByCategories.jsx`:

```js
      menuItem("Labnies Cream Shawarma", 179),
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `node --test tests/menu-image-mappings.test.mjs`

Expected: PASS, 3 tests passed and 0 failed.

- [ ] **Step 6: Run code-quality and production verification**

Run: `npx eslint components/customer/ShopByCategories.jsx components/customer/menuImageMappings.mjs tests/menu-image-mappings.test.mjs`

Expected: exit code 0 with no lint errors.

Run: `npm run build`

Expected: exit code 0 with a successful Next.js production build.

- [ ] **Step 7: Verify the live rendered menu and assets**

Request the running local page, confirm all mapped filenames appear in server-rendered HTML, confirm each mapped image returns HTTP 200, and confirm `Labnies Cream Shawarma` is absent.

- [ ] **Step 8: Review the final workspace diff**

Run: `git diff --check` and inspect `ShopByCategories.jsx`, `menuImageMappings.mjs`, and `menu-image-mappings.test.mjs`.

Expected: no whitespace errors, every approved mapping is present, and no unrelated user change is removed.
