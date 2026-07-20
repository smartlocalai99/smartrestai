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
    /\{entry\.title\}[\s\S]*?text-white[\s\S]*?<LuPlus[\s\S]*?ml-auto mr-1 text-white\/60[\s\S]*?\{entry\.count\}/
  );
  assert.doesNotMatch(source, /rounded-full bg-\[#b3402a\] text-white/);
  assert.match(
    source,
    /onClick=\{\(\) => onToggleExpand\(entry\.title\)\}/
  );
});

test("keeps primary navigation available on the saved addresses page", async () => {
  const [addresses, appShell, bottomNav] = await Promise.all([
    readSource("pages/addresses.js"),
    readSource("components/customer/AppShell.js"),
    readSource("components/customer/BottomNav.js"),
  ]);

  assert.match(addresses, /<AppShell showCheckoutButton=\{false\}>/);
  assert.match(appShell, /showCheckoutButton = true/);
  assert.match(
    appShell,
    /<BottomNav[\s\S]*?showCheckoutButton=\{showCheckoutButton\}/
  );
  assert.match(bottomNav, /showCheckoutButton = true/);
  assert.match(
    bottomNav,
    /if \(showCheckoutButton && checkoutSummary\?\.totalItems > 0\)/
  );
});

test("keeps the document background neutral so iOS safe areas don't leak brand color", async () => {
  const source = await readSource("styles/globals.css");

  // The document background used to be the brand maroon (#32120d), but on an
  // installed iOS PWA with viewport-fit=cover that color bled into the
  // bottom safe area (behind the home indicator) whenever a page's own
  // content didn't fully cover it. Each page paints its own top safe-area
  // background (see TopOfferBanner/TabPageHeader), so the shared document
  // background stays neutral white and nothing extra shows at the bottom.
  assert.match(source, /html,[\s\S]*?body,[\s\S]*?#__next\s*\{/);
  assert.match(source, /background:\s*#fff/);
  assert.doesNotMatch(source, /body::before\s*\{/);
});

test("sends viewport-fit cover globally before protected pages hydrate", async () => {
  const [app, pageHead] = await Promise.all([
    readSource("pages/_app.js"),
    readSource("components/customer/PageHead.js"),
  ]);

  assert.match(app, /import Head from "next\/head"/);
  assert.match(app, /<meta[\s\S]*?name="viewport"[\s\S]*?viewport-fit=cover/);
  assert.doesNotMatch(pageHead, /name="viewport"/);
});

test("keeps PWA sticky navigation below the phone status area without an overlay", async () => {
  const [globals, topOfferBanner, menuCategories] = await Promise.all([
    readSource("styles/globals.css"),
    readSource("components/customer/TopOfferBanner.js"),
    readSource("components/customer/MenuCategories.js"),
  ]);

  assert.doesNotMatch(globals, /body::before\s*\{/);
  assert.match(
    topOfferBanner,
    /sticky top-\[env\(safe-area-inset-top\)\] z-40/
  );
  assert.match(
    menuCategories,
    /sticky top-\[calc\(67px\+env\(safe-area-inset-top\)\)\] z-30/
  );
});
