import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  createInitialOpenSections,
  createMenuNavigatorEntries,
  expandSection,
  sectionId,
} from "../components/customer/menuNavigation.mjs";

const recommendedItems = [{ id: "one" }, { id: "two" }];
const sections = [
  { heading: "Chicken Mandi", items: [{}, {}, {}] },
  { heading: "Rotis", items: [{}, {}] },
];

test("creates one navigator row per collapsible category with counts", () => {
  assert.deepEqual(createMenuNavigatorEntries(recommendedItems, sections), [
    { title: "Recommended", count: 2 },
    { title: "Chicken Mandi", count: 3 },
    { title: "Rotis", count: 2 },
  ]);
});

test("starts every category open and expands a selected category immutably", () => {
  const entries = createMenuNavigatorEntries(recommendedItems, sections);
  const initial = createInitialOpenSections(entries);
  assert.deepEqual(initial, {
    Recommended: true,
    "Chicken Mandi": true,
    Rotis: true,
  });

  const collapsed = { ...initial, Rotis: false };
  const expanded = expandSection(collapsed, "Rotis");
  assert.equal(expanded.Rotis, true);
  assert.equal(collapsed.Rotis, false);
});

test("creates stable section ids", () => {
  assert.equal(sectionId("Extra & Add Ons"), "section-extra-add-ons");
});

test("uses a white app shell behind the original glass navigation", async () => {
  const [source, pageSource] = await Promise.all([
    readFile(
      new URL("../components/customer/BottomNav.js", import.meta.url),
      "utf8"
    ),
    readFile(new URL("../pages/index.js", import.meta.url), "utf8"),
  ]);

  assert.match(pageSource, /max-w-\[430px\][^\"]*bg-white/);
  assert.match(source, /bg-white\/\[0\.42\]/);
  assert.match(source, /backdrop-blur-\[42px\]/);
  assert.match(source, /bg-gradient-to-b/);
});

test("uses a compact glass Menu trigger with final-item clearance", async () => {
  const source = await readFile(
    new URL("../components/customer/ShopByCategories.jsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /aria-label="Open menu navigator"/);
  assert.match(source, /inline-flex h-12/);
  assert.match(source, /bg-\[#232329\]\/75/);
  assert.match(source, /backdrop-blur-\[22px\]/);
  assert.match(source, /LuUtensils className="[^"]*h-5 w-5"/);
  assert.match(source, /px-4 pb-40 pt-2/);
  assert.doesNotMatch(source, /inline-flex h-14 items-center gap-2/);
});
