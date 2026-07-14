import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("navigates home before clearing authentication on logout", async () => {
  const source = await readSource("pages/account.js");
  const match = source.match(
    /const handleLogout = async \(\) => \{([\s\S]*?)\n  \};/
  );

  assert.ok(match, "logout handler must be asynchronous");
  const body = match[1];
  assert.match(body, /await router\.replace\("\/"\);/);
  assert.ok(body.indexOf("router.replace") < body.indexOf("logout()"));
  assert.doesNotMatch(body, /router\.push/);
});

test("places product descriptions directly below item names", async () => {
  const source = await readSource("components/customer/ShopByCategories.jsx");

  assert.doesNotMatch(source, /min-h-\[35px\]/);
  assert.doesNotMatch(source, /className="mt-1 min-h-\[28px\]/);
  assert.match(source, /<p className="min-h-\[28px\]/);
  assert.match(source, /\[-webkit-line-clamp:2\]/);
});

test("shows available coupons as tap-to-apply cards", async () => {
  const source = await readSource("pages/checkout.js");

  assert.match(source, /const AVAILABLE_COUPONS = \[/);
  assert.match(source, /code: "SPICE10", rate: 0\.1/);
  assert.match(source, /description: "Save 10% on this order"/);
  assert.match(source, /AVAILABLE_COUPONS\.map\(\(coupon\) =>/);
  assert.match(source, /setAppliedCoupon\(coupon\)/);
  assert.match(source, /Tap to apply/);
  assert.match(source, /Applied/);
  assert.match(
    source,
    /Math\.round\(subtotal \* appliedCoupon\.rate\)/
  );
  assert.doesNotMatch(source, /couponInput|couponError|useAnimation/);
  assert.doesNotMatch(source, /placeholder="Promo Code"|<input/);
});

test("uses a glossy category popup with the preview plus beside the name", async () => {
  const source = await readSource("components/customer/ShopByCategories.jsx");

  assert.match(
    source,
    /max-h-\[62vh\] w-\[min\(320px,calc\(100vw-2\.5rem\)\)\]/
  );
  assert.match(source, /border-white\/20 bg-\[#232329\]\/80/);
  assert.match(source, /backdrop-blur-\[28px\]/);
  assert.match(source, /backdrop-saturate-150/);
  assert.match(source, /pointer-events-none absolute inset-\[1px\]/);
  assert.match(
    source,
    /\{entry\.title\}[\s\S]*?text-\[#128647\][\s\S]*?<LuPlus[\s\S]*?ml-auto mr-1 text-white\/60[\s\S]*?\{entry\.count\}/
  );
  assert.doesNotMatch(source, /rounded-full bg-\[#b3402a\] text-white/);
  assert.match(
    source,
    /onClick=\{\(\) => onToggleExpand\(entry\.title\)\}/
  );
});
