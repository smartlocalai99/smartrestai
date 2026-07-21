import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("persistent providers publish their existing hydration state", async () => {
  const [cart, favorites, payment] = await Promise.all([
    readSource("context/CartContext.js"),
    readSource("context/FavoritesContext.js"),
    readSource("context/PaymentContext.js"),
  ]);

  assert.match(
    cart,
    /return \{[\s\S]*?clearAppliedOffer,[\s\S]*?isHydrated,[\s\S]*?\};[\s\S]*?\[cart, appliedOffer, isHydrated\]/
  );
  assert.match(
    favorites,
    /items: Object\.values\(favorites\),[\s\S]*?isHydrated,[\s\S]*?\[favorites, isHydrated\]/
  );
  assert.match(
    payment,
    /methodId: resolvedMethodId,[\s\S]*?setMethodId,[\s\S]*?method,[\s\S]*?methods,[\s\S]*?isHydrated,[\s\S]*?\[resolvedMethodId, methods, isHydrated\]/
  );
});
