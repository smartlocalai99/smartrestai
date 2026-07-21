import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mounts one startup gate inside all application providers", async () => {
  const source = await readSource("context/AppProviders.js");
  const gate = await readSource("components/customer/StartupGate.jsx");

  assert.match(
    source,
    /import StartupGate from "@\/components\/customer\/StartupGate"/
  );
  assert.match(
    source,
    /providers\.reduceRight\([\s\S]*?<StartupGate>\{children\}<\/StartupGate>[\s\S]*?\)/
  );
  assert.doesNotMatch(gate, /useOrders|isLoadingOrders/);
});

test("replaces the inline menu loading copy with the global splash", async () => {
  const source = await readSource("components/customer/ShopByCategories.jsx");

  assert.doesNotMatch(source, /Loading menu/);
  assert.match(source, /if \(isLoading\) \{\s*return null;\s*\}/);
  assert.match(source, /Menu coming soon/);
});

test("defines branded motion with a reduced-motion override", async () => {
  const [component, gate, styles] = await Promise.all([
    readSource("components/customer/BrandedSplash.jsx"),
    readSource("components/customer/StartupGate.jsx"),
    readSource("styles/globals.css"),
  ]);

  assert.match(component, /preload/);
  assert.match(component, /unoptimized/);
  assert.match(component, /onLogoReady/);
  assert.doesNotMatch(component, /priority/);
  assert.match(
    component,
    /sizes="\(max-width: 430px\) calc\(100vw - 32px\), 640px"/
  );
  assert.match(gate, /const MIN_VISIBLE_MS = 900/);
  assert.match(gate, /logoReady/);
  assert.match(gate, /minimumElapsed/);
  assert.match(gate, /onLogoReady/);
  assert.match(styles, /@keyframes startup-logo-breathe/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
