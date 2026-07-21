import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("extends the branded empty-state background to the bottom navigation", async () => {
  const [emptyState, favorites, orders, orderExperience] = await Promise.all([
    readFile(new URL("../components/customer/EmptyState.jsx", import.meta.url), "utf8"),
    readFile(new URL("../pages/favorites.js", import.meta.url), "utf8"),
    readFile(new URL("../pages/orders.js", import.meta.url), "utf8"),
    readFile(
      new URL("../components/customer/OrderTrackingExperience.jsx", import.meta.url),
      "utf8"
    ),
  ]);

  assert.match(emptyState, /imageSrc \? "flex-1 self-stretch bg-\[#f6f6f6\]"/);
  assert.match(favorites, /items\.length === 0 \? "bg-\[#f6f6f6\]" : "bg-white"/);
  assert.match(
    favorites,
    /<AppShell contentClassName={isEmpty \? "bg-\[#f6f6f6\]" : ""}>/
  );
  assert.match(favorites, /className={`flex min-h-full flex-col/);
  assert.match(
    orders,
    /!isLoadingOrders && orders\.length === 0 \? "bg-\[#f6f6f6\]" : "bg-white"/
  );
  assert.match(
    orders,
    /<AppShell contentClassName={isEmpty \? "bg-\[#f6f6f6\]" : ""}>/
  );
  assert.match(orders, /className={`flex min-h-full flex-col/);
  assert.match(orderExperience, /data-testid="previous-orders-surface"/);
  assert.match(orderExperience, /bg-\[#f6f6f6\]/);
});
