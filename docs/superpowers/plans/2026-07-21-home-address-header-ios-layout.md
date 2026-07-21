# Home Address Header and iOS Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the signed-in customer’s default address in the home header, open Saved Addresses with a bottom-up page transition, and remove bottom safe-area whitespace from the installed iOS PWA.

**Architecture:** Keep saved-address selection in the existing `AddressContext` and let `HomeLocationBar` consume that source directly. Use a local Motion animation on the Saved Addresses route rather than installing a global transition system. Remove only bottom safe-area calculations from shared layout controls while preserving every top safe-area rule.

**Tech Stack:** Next.js 16 Pages Router, React 19, Motion, React Icons, Tailwind CSS 4, Node test runner, Vitest

## Global Constraints

- Preserve `viewport-fit=cover`, the dark top safe-area treatment, and safe-area-aware sticky offsets at the top of the home page.
- Display `Kadapa` when the customer is logged out, address data is loading, or no saved address exists.
- Use `AddressContext.defaultAddress` as the selected delivery-address source.
- Do not add a compact address-picker overlay or a global route-transition framework.
- Do not change typography outside the home address label.
- Keep existing address persistence, geocoding, checkout redirect, and address-management behavior unchanged.

---

### Task 1: Dynamic Home Address Control

**Files:**
- Create: `tests/home-address-header-ios-layout.test.mjs`
- Modify: `components/customer/TopOfferBanner.js:1-67`

**Interfaces:**
- Consumes: `useAuth(): { isLoggedIn: boolean }`, `useAddresses(): { defaultAddress: object | null }`, and `useRouter(): { push(path: string): Promise<boolean> }`.
- Produces: `HomeLocationBar` behavior that displays `defaultAddress.line` only for a logged-in customer and routes to `/addresses` when activated.

- [ ] **Step 1: Write the failing header regression test**

Create `tests/home-address-header-ios-layout.test.mjs` with:

```js
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
  assert.match(source, /aria-label=\{`Change delivery location\. Current location: \$\{displayAddress\}`\}/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/home-address-header-ios-layout.test.mjs`

Expected: FAIL because `TopOfferBanner.js` does not yet import or consume the address/auth contexts and still renders `IoHome` plus hard-coded `Kadapa`.

- [ ] **Step 3: Implement the dynamic location control**

In `components/customer/TopOfferBanner.js`, update the icon and context imports:

```js
import {
  IoChevronDown,
  IoLocationOutline,
  IoMicOutline,
  IoSearch,
} from "react-icons/io5";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
```

Replace `LocationHeader` with:

```jsx
function LocationHeader({ vegOnly, onVegModeChange }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { defaultAddress } = useAddresses();
  const displayAddress =
    isLoggedIn && defaultAddress?.line?.trim()
      ? defaultAddress.line.trim()
      : "Kadapa";

  return (
    <div className="relative z-10 flex items-center justify-between gap-4">
      <motion.button
        type="button"
        aria-label={`Change delivery location. Current location: ${displayAddress}`}
        onClick={() => router.push("/addresses")}
        whileTap={{ scale: 0.96 }}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-full text-left"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff7df] text-[#8f2f1d] shadow-lg">
          <IoLocationOutline className="h-5 w-5" aria-hidden="true" />
        </span>

        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-black leading-tight">
            {displayAddress}
          </span>
          <IoChevronDown className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        </span>
      </motion.button>

      <VegModeToggle vegOnly={vegOnly} onChange={onVegModeChange} />
    </div>
  );
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/home-address-header-ios-layout.test.mjs`

Expected: PASS for `shows the signed-in customer's address in the home location control`.

- [ ] **Step 5: Commit the header behavior**

```bash
git add tests/home-address-header-ios-layout.test.mjs components/customer/TopOfferBanner.js
git commit -m "Show saved address in home header"
```

### Task 2: Bottom-Up Saved Addresses Route

**Files:**
- Modify: `tests/home-address-header-ios-layout.test.mjs`
- Modify: `pages/addresses.js:1-390`

**Interfaces:**
- Consumes: `router.back()`, `router.replace("/")`, and the existing `Addresses` page content.
- Produces: `closeAddressPage(): void`, which animates the route to `y: "100%"` and navigates after the closing animation completes.

- [ ] **Step 1: Add the failing page-transition regression test**

Append to `tests/home-address-header-ios-layout.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/home-address-header-ios-layout.test.mjs`

Expected: the header test passes and the transition test FAILS because the address page has no route-level bottom animation or dedicated back button.

- [ ] **Step 3: Implement page entrance and animated dismissal**

Add `IoChevronBack` to the `react-icons/io5` import in `pages/addresses.js`. In `Addresses`, add:

```js
const [isClosing, setIsClosing] = useState(false);
const closeAddressPage = () => setIsClosing(true);
const handlePageAnimationComplete = () => {
  if (!isClosing) return;
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.replace("/");
};
```

Inside the return fragment, leave `PageHead` as the first child. Insert this opening container immediately before the existing `<AppShell showCheckoutButton={false}>`:

```jsx
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: isClosing ? "100%" : 0 }}
  transition={{ type: "spring", stiffness: 340, damping: 34 }}
  onAnimationComplete={handlePageAnimationComplete}
  className="h-full"
>
```

Keep the complete existing `AppShell` subtree unchanged inside it, then insert `</motion.div>` immediately after the existing `</AppShell>`.

Render this button as the first child of the existing `min-h-full` page surface, before `TabPageHeader`:

```jsx
<motion.button
  type="button"
  aria-label="Back to previous page"
  onClick={closeAddressPage}
  whileTap={{ scale: 0.9 }}
  className="absolute left-4 top-[calc(1.25rem+env(safe-area-inset-top))] z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
>
  <IoChevronBack className="h-5 w-5" aria-hidden="true" />
</motion.button>
```

Add `relative` to the page surface class so the button is positioned against the address page.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/home-address-header-ios-layout.test.mjs`

Expected: both tests PASS.

- [ ] **Step 5: Commit the route transition**

```bash
git add tests/home-address-header-ios-layout.test.mjs pages/addresses.js
git commit -m "Animate saved addresses from bottom"
```

### Task 3: Remove Bottom Safe-Area Whitespace

**Files:**
- Modify: `tests/home-address-header-ios-layout.test.mjs`
- Modify: `tests/menu-navigation.test.mjs:70-90`
- Modify: `components/customer/AppShell.js:20`
- Modify: `components/customer/BottomNav.js:22,78`
- Modify: `pages/addresses.js:76`

**Interfaces:**
- Consumes: the existing app-shell content clearance and floating navigation layout.
- Produces: fixed `pb-24`, `bottom-0`, `bottom-3`, and `pb-6` spacing with no `env(safe-area-inset-bottom)` references in application source.

- [ ] **Step 1: Add the failing bottom-safe-area regression**

Append to `tests/home-address-header-ios-layout.test.mjs`:

```js
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
```

Update the app-shell expectation in `tests/menu-navigation.test.mjs` from:

```js
assert.match(shellSource, /pb-\[calc\(6rem\+env\(safe-area-inset-bottom\)\)\]/);
```

to:

```js
assert.match(shellSource, /pb-24/);
assert.doesNotMatch(shellSource, /safe-area-inset-bottom/);
```

- [ ] **Step 2: Run the relevant tests and verify RED**

Run: `node --test tests/home-address-header-ios-layout.test.mjs tests/menu-navigation.test.mjs`

Expected: FAIL because the shell, bottom nav, checkout button, and address form still reserve `env(safe-area-inset-bottom)`.

- [ ] **Step 3: Replace bottom safe-area calculations with fixed spacing**

Make these exact class replacements:

```diff
- pb-[calc(6rem+env(safe-area-inset-bottom))]
+ pb-24

- absolute inset-x-4 bottom-[env(safe-area-inset-bottom)] z-40
+ absolute inset-x-4 bottom-0 z-40

- absolute inset-x-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30
+ absolute inset-x-4 bottom-3 z-30

- rounded-t-[28px] bg-white p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]
+ rounded-t-[28px] bg-white p-5 pb-6
```

- [ ] **Step 4: Run the relevant tests and verify GREEN**

Run: `node --test tests/home-address-header-ios-layout.test.mjs tests/menu-navigation.test.mjs`

Expected: all tests PASS.

- [ ] **Step 5: Commit the iOS bottom-layout fix**

```bash
git add tests/home-address-header-ios-layout.test.mjs tests/menu-navigation.test.mjs components/customer/AppShell.js components/customer/BottomNav.js pages/addresses.js
git commit -m "Remove iOS PWA bottom safe-area gap"
```

### Task 4: Full Verification and Visual QA

**Files:**
- Verify: `components/customer/TopOfferBanner.js`
- Verify: `pages/addresses.js`
- Verify: `components/customer/AppShell.js`
- Verify: `components/customer/BottomNav.js`
- Verify: `tests/home-address-header-ios-layout.test.mjs`

**Interfaces:**
- Consumes: all behavior delivered by Tasks 1–3.
- Produces: verified production-ready behavior with no additional source changes unless a verification step exposes a defect.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: all Vitest and Node regression tests PASS with no failures.

- [ ] **Step 2: Run focused linting**

Run: `npx eslint components/customer/TopOfferBanner.js pages/addresses.js components/customer/AppShell.js components/customer/BottomNav.js tests/home-address-header-ios-layout.test.mjs tests/menu-navigation.test.mjs`

Expected: exit code 0 with no lint errors.

- [ ] **Step 3: Build the production application**

Run: `npm run build`

Expected: Next.js completes the production build successfully and lists `/`, `/addresses`, and the other static routes.

- [ ] **Step 4: Verify the mobile UI in the browser**

Run `npm run dev`, open the home page at a 390 × 844 mobile viewport, and confirm:

1. Logged out: the location pin, `Kadapa`, compact text, and down chevron are visible.
2. Tap location: login protection works; after authentication, Saved Addresses enters upward from the viewport bottom.
3. Logged in with a saved default: the home header shows the saved address and truncates long text without covering the veg toggle.
4. Tap the address-page back control: the page moves down before returning.
5. At the bottom of Home and Saved Addresses: no separate white strip is reserved below application content.
6. Top status-area spacing, sticky search, and sticky categories remain correctly positioned.

- [ ] **Step 5: Review the final diff and commit any verification correction**

Run: `git diff --check && git status --short`

Expected: no whitespace errors. If verification required a correction, repeat its failing test first, apply the minimal fix, rerun Tasks 4.1–4.4, then commit only the correction with a specific message.
