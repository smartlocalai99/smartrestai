# Home Address Sheet and Startup Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Home’s address-page navigation with an in-place bottom selector and ensure the cached Mandi Kings logo paints before the startup splash exits.

**Architecture:** Home owns the address sheet’s visibility while a focused `HomeAddressSheet` consumes the existing address context and persists selection through `setDefault`. The full `/addresses` route returns to normal page behavior. Startup uses the already cached raw logo URL and gates splash exit on app readiness, logo readiness, and a short minimum display interval.

**Tech Stack:** Next.js 16 Pages Router, React 19, Motion, React Icons, Supabase through the existing `AddressContext`, Vitest, Testing Library, Node test runner

## Global Constraints

- Do not add or change a Supabase schema, migration, RLS policy, or customer-data API.
- Use `AddressContext.setDefault(id)` as the only saved-address selection mutation.
- Keep the existing `Kadapa` fallback, compact header text, location icon, and iOS bottom-safe-area fix.
- Keep full add/edit/delete behavior on `/addresses`; the Home sheet is a selector plus a management link.
- Load startup artwork from the service-worker-cached `/applogo.jpeg` path.
- Do not hide the splash before the logo has loaded and the minimum visible duration has elapsed.

---

### Task 1: Home Address Bottom Sheet

**Files:**
- Create: `components/customer/HomeAddressSheet.jsx`
- Create: `test/HomeAddressSheet.test.jsx`
- Modify: `pages/index.js`
- Modify: `components/customer/TopOfferBanner.js`
- Modify: `pages/addresses.js`
- Modify: `tests/home-address-header-ios-layout.test.mjs`

**Interfaces:**
- Consumes: `useAddresses(): { addresses, defaultAddress, setDefault, isLoadingAddresses, isMutatingAddress, addressError }`, `useAuth(): { isLoggedIn }`, `router.push("/addresses")`, `onClose(): void`.
- Produces: `HomeAddressSheet({ onClose })` and `HomeLocationBar({ onLocationClick })`.

- [ ] **Step 1: Write failing bottom-sheet behavior tests**

Create `test/HomeAddressSheet.test.jsx` with mocked auth, address context, and router. Cover these exact behaviors:

```jsx
it("shows saved addresses and selects a new default before closing", async () => {
  render(<HomeAddressSheet onClose={onClose} />);
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(screen.getByText("10 Main Road, Kadapa")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Work, 20 Market Road/i })).toHaveAttribute(
    "aria-checked",
    "false"
  );
  await user.click(screen.getByRole("button", { name: /Work, 20 Market Road/i }));
  expect(setDefault).toHaveBeenCalledWith("work-1");
  expect(onClose).toHaveBeenCalledOnce();
});

it("shows Kadapa when no saved address is available", () => {
  addressesState.addresses = [];
  addressesState.defaultAddress = null;
  render(<HomeAddressSheet onClose={onClose} />);
  expect(screen.getByText("Kadapa")).toBeInTheDocument();
});

it("opens full address management only from the sheet action", async () => {
  render(<HomeAddressSheet onClose={onClose} />);
  await user.click(screen.getByRole("button", { name: "Add or manage addresses" }));
  expect(push).toHaveBeenCalledWith("/addresses");
  expect(onClose).toHaveBeenCalledOnce();
});
```

Update the source regression to reject `onClick={() => router.push("/addresses")}` in `TopOfferBanner.js`, require `onClick={onLocationClick}`, require `HomeAddressSheet` on Home inside `AnimatePresence`, and reject `isClosing`, `IoChevronBack`, and the route-level `initial={{ y: "100%" }}` from `pages/addresses.js`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run test/HomeAddressSheet.test.jsx && node --test tests/home-address-header-ios-layout.test.mjs`

Expected: FAIL because `HomeAddressSheet` does not exist and the header still navigates directly to `/addresses`.

- [ ] **Step 3: Implement the focused selector**

Create `HomeAddressSheet` as a fixed `motion.div` backdrop with a bottom-aligned `motion.section`. Render loading feedback, compact saved-address radio buttons, a selected checkmark, the `Kadapa` fallback, `addressError`, a close button, and `Add or manage addresses`. Implement selection as:

```js
const handleSelect = async (address) => {
  if (address.id === defaultAddress?.id) {
    onClose();
    return;
  }
  try {
    await setDefault(address.id);
    onClose();
  } catch {
    // AddressContext publishes the readable error and the sheet stays open.
  }
};
```

In `pages/index.js`, own `isAddressSheetOpen`, pass `onLocationClick={() => setIsAddressSheetOpen(true)}` to `HomeLocationBar`, and render the sheet after `AppShell`:

```jsx
<AnimatePresence>
  {isAddressSheetOpen ? (
    <HomeAddressSheet key="home-address-sheet" onClose={() => setIsAddressSheetOpen(false)} />
  ) : null}
</AnimatePresence>
```

Change `LocationHeader` and `HomeLocationBar` to accept and invoke `onLocationClick`. Remove the local `useRouter` use from `LocationHeader` while retaining the offer-card router.

Restore `pages/addresses.js` to direct `<AppShell showCheckoutButton={false}>` rendering: remove `IoChevronBack`, `isClosing`, the closing handlers, route-level motion wrapper, back button, and title-padding wrapper. Retain fixed `pb-6` on its add/edit sheet.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npx vitest run test/HomeAddressSheet.test.jsx && node --test tests/home-address-header-ios-layout.test.mjs`

Expected: all address selector tests PASS.

- [ ] **Step 5: Commit the corrected interaction**

```bash
git add components/customer/HomeAddressSheet.jsx test/HomeAddressSheet.test.jsx pages/index.js components/customer/TopOfferBanner.js pages/addresses.js tests/home-address-header-ios-layout.test.mjs
git commit -m "Open saved addresses in home bottom sheet"
```

### Task 2: Reliable Startup Logo Paint

**Files:**
- Modify: `components/customer/BrandedSplash.jsx`
- Modify: `components/customer/StartupGate.jsx`
- Modify: `test/StartupGate.test.jsx`
- Modify: `tests/initial-splash-integration.test.mjs`

**Interfaces:**
- Consumes: cached `/applogo.jpeg`, `onLogoReady(): void`, existing app-readiness booleans.
- Produces: `BrandedSplash({ isExiting, onLogoReady })` and a splash that exits only after app readiness, logo readiness, and `MIN_VISIBLE_MS = 900`.

- [ ] **Step 1: Write failing splash timing and asset-delivery tests**

Update `test/StartupGate.test.jsx` so the mocked image forwards `onLoad`, records `unoptimized`, and tests:

```jsx
it("keeps the splash until the cached logo paints and the minimum time passes", () => {
  const view = render(<StartupGate><button>Open menu</button></StartupGate>);
  setReady();
  view.rerender(<StartupGate><button>Open menu</button></StartupGate>);
  act(() => vi.advanceTimersByTime(900));
  expect(screen.getByRole("status", { name: "Loading Mandi Kings" })).toBeInTheDocument();
  fireEvent.load(screen.getByAltText("Mandi Kings"));
  act(() => vi.advanceTimersByTime(0));
  expect(screen.getByRole("status", { name: "Loading Mandi Kings" })).toHaveClass(
    "startup-splash--exiting"
  );
});
```

Add source assertions requiring `MIN_VISIBLE_MS = 900`, `logoReady`, `minimumElapsed`, `onLogoReady`, and `unoptimized`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run test/StartupGate.test.jsx && node --test tests/initial-splash-integration.test.mjs`

Expected: FAIL because the splash exits at `0ms` readiness and the image is not forced to the raw cached URL.

- [ ] **Step 3: Implement paint-aware startup timing**

In `BrandedSplash`, add `onLogoReady`, pass it to both `onLoad` and `onError`, and add `unoptimized` to the Next Image so its request stays `/applogo.jpeg`.

In `StartupGate`, add:

```js
const MIN_VISIBLE_MS = 900;
const [logoReady, setLogoReady] = useState(false);
const [minimumElapsed, setMinimumElapsed] = useState(false);
```

Start a one-shot minimum-duration timer. Change the readiness exit timer to `0ms` only when `isReady && logoReady && minimumElapsed`; retain the independent eight-second fail-safe and 250ms fade. Pass `onLogoReady={() => setLogoReady(true)}` to `BrandedSplash`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npx vitest run test/StartupGate.test.jsx && node --test tests/initial-splash-integration.test.mjs`

Expected: all startup tests PASS, including the eight-second fail-safe and reduced-motion behavior.

- [ ] **Step 5: Commit the logo fix**

```bash
git add components/customer/BrandedSplash.jsx components/customer/StartupGate.jsx test/StartupGate.test.jsx tests/initial-splash-integration.test.mjs
git commit -m "Wait for startup logo before revealing app"
```

### Task 3: Full Verification

**Files:**
- Verify all files modified in Tasks 1 and 2.

**Interfaces:**
- Consumes: both completed behaviors.
- Produces: a clean, tested, production-buildable branch.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all Vitest and Node tests PASS with zero failures.

- [ ] **Step 2: Run focused lint**

Run: `npx eslint components/customer/HomeAddressSheet.jsx components/customer/TopOfferBanner.js components/customer/BrandedSplash.jsx components/customer/StartupGate.jsx pages/index.js pages/addresses.js test/HomeAddressSheet.test.jsx test/StartupGate.test.jsx tests/home-address-header-ios-layout.test.mjs tests/initial-splash-integration.test.mjs`

Expected: exit code 0 with no lint errors.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Next.js completes successfully and prerenders `/` and `/addresses`.

- [ ] **Step 4: Verify runtime routes and final diff**

Run the app locally and verify `/`, `/addresses`, `/applogo.jpeg`, and the service worker return HTTP 200. Confirm `git diff --check` has no output and `git status --short` contains no uncommitted files.
