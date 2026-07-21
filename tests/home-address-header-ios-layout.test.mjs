import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("shows the signed-in customer's address in the home location control", async () => {
  const source = await readSource("components/customer/TopOfferBanner.js");

  assert.match(source, /import \{ useAddresses \} from "@\/context\/AddressContext"/);
  assert.match(source, /import \{ useAuth \} from "@\/context\/AuthContext"/);
  assert.match(source, /const \{ isLoggedIn \} = useAuth\(\)/);
  assert.match(source, /const \{ defaultAddress \} = useAddresses\(\)/);
  assert.match(
    source,
    /const displayAddress =\s*isLoggedIn && defaultAddress\?\.line\?\.trim\(\)\s*\? defaultAddress\.line\.trim\(\)\s*:\s*"Kadapa"/
  );
  assert.match(source, /onClick=\{\(\) => router\.push\("\/addresses"\)\}/);
  assert.match(source, /<IoLocationOutline className="h-5 w-5"/);
  assert.doesNotMatch(source, /<IoHome className="h-5 w-5"/);
  assert.match(source, /truncate text-sm font-black/);
  assert.match(source, /<IoChevronDown/);
  assert.match(
    source,
    /aria-label=\{`Change delivery location\. Current location: \$\{displayAddress\}`\}/
  );
});

test("opens and dismisses the Saved Addresses route from the bottom", async () => {
  const source = await readSource("pages/addresses.js");

  assert.match(source, /IoChevronBack/);
  assert.match(source, /const \[isClosing, setIsClosing\] = useState\(false\)/);
  assert.match(source, /const closeAddressPage = \(\) => setIsClosing\(true\)/);
  assert.match(source, /initial=\{\{ y: "100%" \}\}/);
  assert.match(source, /animate=\{\{ y: isClosing \? "100%" : 0 \}\}/);
  assert.match(source, /onAnimationComplete=\{handlePageAnimationComplete\}/);
  assert.match(source, /window\.history\.length > 1/);
  assert.match(source, /router\.back\(\)/);
  assert.match(source, /router\.replace\("\/"\)/);
  assert.match(source, /aria-label="Back to previous page"/);
});

test("does not reserve a separate bottom safe area in the installed app", async () => {
  const [shell, nav, addresses, globals, app, header, categories] =
    await Promise.all([
      readSource("components/customer/AppShell.js"),
      readSource("components/customer/BottomNav.js"),
      readSource("pages/addresses.js"),
      readSource("styles/globals.css"),
      readSource("pages/_app.js"),
      readSource("components/customer/TopOfferBanner.js"),
      readSource("components/customer/MenuCategories.js"),
    ]);

  assert.doesNotMatch(shell, /safe-area-inset-bottom/);
  assert.doesNotMatch(nav, /safe-area-inset-bottom/);
  assert.doesNotMatch(addresses, /safe-area-inset-bottom/);
  assert.match(shell, /pb-24/);
  assert.match(nav, /absolute inset-x-4 bottom-0 z-40/);
  assert.match(nav, /absolute inset-x-4 bottom-3 z-30/);
  assert.match(addresses, /rounded-t-\[28px\] bg-white p-5 pb-6/);

  assert.match(globals, /height:\s*100dvh/);
  assert.match(app, /viewport-fit=cover/);
  assert.match(header, /safe-area-inset-top/);
  assert.match(categories, /safe-area-inset-top/);
});
