import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import * as restaurantData from "../lib/restaurantData.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("normalizes customer payments to Cash on Delivery and UPI only", () => {
  assert.equal(typeof restaurantData.normalizePaymentMethods, "function");
  assert.deepEqual(
    restaurantData.normalizePaymentMethods([
      { id: "cod", label: "Cash on Delivery", enabled: true },
      { id: "upi", label: "UPI", enabled: true },
      { id: "card", label: "Card", enabled: true },
    ]),
    [
      { id: "cod", label: "Cash on Delivery", enabled: true },
      { id: "upi", label: "UPI", enabled: true },
    ]
  );
});

test("replaces a stale Card selection with a supported payment method", () => {
  assert.equal(typeof restaurantData.resolvePaymentMethodId, "function");
  const methods = restaurantData.normalizePaymentMethods([]);

  assert.equal(restaurantData.resolvePaymentMethodId("card", methods), "cod");
  assert.equal(restaurantData.resolvePaymentMethodId("upi", methods), "upi");
});

test("renders rounded PhonePe, Google Pay, and Paytm logos without Card", async () => {
  const [page, checkout, help] = await Promise.all([
    read("pages/payment-methods.js"),
    read("pages/checkout.js"),
    read("pages/help.js"),
  ]);

  assert.match(page, /SiPhonepe/);
  assert.match(page, /FcGoogle/);
  assert.match(page, /SiPaytm/);
  assert.match(page, /label: "PhonePe"/);
  assert.match(page, /label: "Google Pay"/);
  assert.match(page, /label: "Paytm"/);
  assert.match(page, /aria-label=\{label\}/);
  assert.doesNotMatch(page, /IoCardOutline|card: IoCard/);
  assert.doesNotMatch(checkout, /IoCardOutline|card: IoCard/);
  assert.doesNotMatch(help, /UPI and cards/);
});

test("seeds and migrates the restaurant profile without Card", async () => {
  const files = await readdir(new URL("../supabase/migrations/", import.meta.url));
  const sql = (
    await Promise.all(
      files
        .filter((file) => file.endsWith(".sql"))
        .map((file) => read(`supabase/migrations/${file}`))
    )
  ).join("\n");
  const foundation = await read(
    "supabase/migrations/20260719034905_owner_app_foundation.sql"
  );

  assert.doesNotMatch(foundation, /"id":"card"/);
  assert.match(sql, /alter column payment_methods set default/);
  assert.match(sql, /update public\.restaurant_profile/);
});
