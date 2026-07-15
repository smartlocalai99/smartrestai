import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourceFiles = [
  "styles/globals.css",
  "pages/checkout.js",
  "pages/notifications.js",
  "pages/payment-methods.js",
  "pages/addresses.js",
  "pages/orders.js",
  "pages/login.js",
  "components/customer/BottomNav.js",
  "components/customer/EmptyState.jsx",
  "components/customer/ShopByCategories.jsx",
];

test("uses the primary brown instead of legacy green UI tokens", async () => {
  const sources = await Promise.all(
    sourceFiles.map(async (file) => ({
      file,
      source: await readFile(new URL(`../${file}`, import.meta.url), "utf8"),
    }))
  );

  for (const { file, source } of sources) {
    assert.doesNotMatch(
      source,
      /#128647|#1c9b5f|#ecfff4|#eafff2|#c9d9cf|rgba\(18,\s*134,\s*71/gi,
      `${file} still contains a legacy green UI token`
    );
  }

  const menu = sources.find(({ file }) => file.endsWith("ShopByCategories.jsx")).source;
  assert.match(menu, /text-\[#32120d\][\s\S]*?<LuPlus/);
});
