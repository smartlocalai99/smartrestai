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
  assert.match(
    source,
    /Dish details might be AI crafted for a better experience\./
  );
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
  assert.match(source, /viewport-fit=cover/);
});
