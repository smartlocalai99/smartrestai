import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("renders the approved disclaimer and the owner-managed restaurant profile", async () => {
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
  assert.match(
    source,
    /Dish details might be AI crafted for a better experience\./
  );
  // Name/address/hours come from the owner-managed restaurant profile, not
  // hardcoded copy — see context/MenuDataContext.js.
  assert.match(source, /useMenuData/);
  assert.match(source, /\{profile\.name\}/);
  assert.match(source, /\{profile\.addressLine\}/);
  assert.match(source, /profile\.isOpen/);
  assert.match(source, /profile\.busyMode/);
  assert.match(source, /<LuMapPin aria-hidden="true"/);
  assert.doesNotMatch(source, /Swiggy Seal|Report an issue|FSSAI|License No/);
  assert.doesNotMatch(source, /MANDI KING - Arabian Restaurant/);
});

test("places the information panel after the menu and gives it final clearance", async () => {
  const [pageSource, menuSource, infoSource] = await Promise.all([
    readSource("pages/index.js"),
    readSource("components/customer/ShopByCategories.jsx"),
    readSource("components/customer/RestaurantInfo.js"),
  ]);

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
});

test("uses the app brown for page-level mobile browser chrome", async () => {
  const source = await readSource("components/customer/PageHead.js");

  assert.match(source, /<meta name="theme-color" content="#32120d" \/>/);
});
