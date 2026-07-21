# Initial Branded Splash and Startup Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a subtly animated Mandi Kings splash only during initial app startup, reveal the mounted app when critical state settles, and eliminate redundant menu refresh work.

**Architecture:** Existing providers remain the source of truth for readiness. A focused `StartupGate` consumes their loading flags inside the complete provider tree, renders the app inert beneath a fixed `BrandedSplash`, and permanently removes the overlay after readiness or an eight-second fail-safe. A small framework-independent trailing refresh coordinator coalesces realtime menu bursts.

**Tech Stack:** Next.js 16.2 Pages Router, React 19.2, Next Image, Tailwind CSS 4 plus global CSS, Vitest/Testing Library, Node test runner, service worker Cache API.

## Global Constraints

- The splash appears only on initial application mount, never on client-side navigation or later realtime refreshes.
- Critical readiness includes menu/profile/offers, auth, cart, favorites, payment preference, and initial addresses; it excludes order history.
- There is no artificial minimum splash duration.
- The fail-safe timeout is exactly eight seconds.
- The standard exit fade is 250 milliseconds; reduced-motion users get no breathing or exit animation.
- Use the existing `/applogo.jpeg` asset and existing `#32120d` brand background.
- Do not add an animation package, state library, or broad unrelated refactor.
- Follow the installed Next.js 16 Image documentation: use `preload`, not deprecated `priority`, and provide an accurate responsive `sizes` value.

---

## File Map

- Create `components/customer/BrandedSplash.jsx`: visual-only full-viewport splash and Next Image configuration.
- Create `components/customer/StartupGate.jsx`: readiness aggregation, timeout, exit phase, inert application wrapper, and one-mount lifecycle.
- Create `lib/trailingRefresh.mjs`: framework-independent coalescing of overlapping async refresh requests.
- Create `test/PersistenceReadiness.test.jsx`: provider readiness contract tests.
- Create `test/StartupGate.test.jsx`: behavioral tests for pending, ready, timeout, reduced motion, and one-time display.
- Create `test/trailingRefresh.test.mjs`: concurrency behavior tests for the refresh coordinator.
- Create `tests/initial-splash-integration.test.mjs`: source-level wiring, accessibility/CSS, and old-loader regression checks consistent with the repository's legacy tests.
- Modify `context/CartContext.js`: expose `isHydrated` through the memoized value.
- Modify `context/FavoritesContext.js`: expose `isHydrated` through the memoized value.
- Modify `context/PaymentContext.js`: expose `isHydrated` through the memoized value.
- Modify `context/AppProviders.js`: mount `StartupGate` inside all providers.
- Modify `context/MenuDataContext.js`: use the refresh coordinator for initial and realtime loading.
- Modify `components/customer/ShopByCategories.jsx`: stop rendering `Loading menu…` under the global splash.
- Modify `styles/globals.css`: splash layout, breathing/fade animation, and reduced-motion rules.
- Modify `public/sw.js`: cache the logo and advance the cache version.
- Modify `tests/pwa-branding.test.mjs`: assert the new startup logo cache entry/version.

---

### Task 1: Publish Persistence Readiness Contracts

**Files:**
- Create: `test/PersistenceReadiness.test.jsx`
- Modify: `context/CartContext.js:90-120`
- Modify: `context/FavoritesContext.js:41-49`
- Modify: `context/PaymentContext.js:44-47`

**Interfaces:**
- Produces: `useCart().isHydrated: boolean`
- Produces: `useFavorites().isHydrated: boolean`
- Produces: `usePayment().isHydrated: boolean`
- Consumes: existing provider-local `isHydrated` state; no new storage reads.

- [ ] **Step 1: Write the failing provider contract tests**

Create `test/PersistenceReadiness.test.jsx`:

```jsx
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/context/CartContext";
import { FavoritesProvider, useFavorites } from "@/context/FavoritesContext";
import { PaymentProvider, usePayment } from "@/context/PaymentContext";

vi.mock("@/context/MenuDataContext", () => ({
  useMenuData: () => ({ profile: null }),
}));

function ReadyValue({ useValue }) {
  const value = useValue();
  return <output>{String(value.isHydrated)}</output>;
}

describe("persistent provider readiness", () => {
  beforeEach(() => window.localStorage.clear());

  it.each([
    ["cart", CartProvider, useCart],
    ["favorites", FavoritesProvider, useFavorites],
    ["payment", PaymentProvider, usePayment],
  ])("publishes hydration for %s", async (_name, Provider, useValue) => {
    render(
      <Provider>
        <ReadyValue useValue={useValue} />
      </Provider>
    );

    await waitFor(() => expect(screen.getByText("true")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `npm run test:unit -- test/PersistenceReadiness.test.jsx`

Expected: FAIL because each consumer renders `undefined` instead of `true`.

- [ ] **Step 3: Expose the existing flags with no duplicate state**

Add `isHydrated` to the object returned by each provider's existing `useMemo`. Update the dependency list only where needed:

```js
// CartContext value
return {
  cart,
  setCart,
  changeQuantity,
  clearCart,
  items,
  checkoutSummary,
  appliedOffer: isOfferValid ? appliedOffer : null,
  offerDiscount,
  applyOffer,
  clearAppliedOffer,
  isHydrated,
};
}, [cart, appliedOffer, isHydrated]);
```

```js
// FavoritesContext value
() => ({
  favorites,
  toggleFavorite,
  isFavorite: (id) => Boolean(favorites[id]),
  items: Object.values(favorites),
  isHydrated,
}),
[favorites, isHydrated]
```

```js
// PaymentContext value
const method = methods.find((m) => m.id === methodId) ?? methods[0];
return { methodId, setMethodId, method, methods, isHydrated };
}, [methodId, methods, isHydrated]);
```

- [ ] **Step 4: Run the targeted tests and confirm GREEN**

Run: `npm run test:unit -- test/PersistenceReadiness.test.jsx`

Expected: 3 tests PASS with no warnings.

- [ ] **Step 5: Commit the readiness contracts**

```bash
git add test/PersistenceReadiness.test.jsx context/CartContext.js context/FavoritesContext.js context/PaymentContext.js
git commit -m "Expose startup hydration readiness"
```

---

### Task 2: Build the Branded Startup Gate

**Files:**
- Create: `test/StartupGate.test.jsx`
- Create: `components/customer/BrandedSplash.jsx`
- Create: `components/customer/StartupGate.jsx`
- Modify: `styles/globals.css`

**Interfaces:**
- Consumes: `useMenuData().isLoading`, `useAuth().isHydrated`, `useCart().isHydrated`, `useFavorites().isHydrated`, `useAddresses().isLoadingAddresses`, and `usePayment().isHydrated`.
- Produces: `BrandedSplash({ isExiting: boolean })`.
- Produces: `StartupGate({ children: ReactNode })`, which keeps `children` mounted and removes its overlay permanently after initial readiness or timeout.

- [ ] **Step 1: Write failing gate behavior tests**

Create `test/StartupGate.test.jsx`:

```jsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StartupGate from "@/components/customer/StartupGate";

const readiness = vi.hoisted(() => ({
  menuLoading: true,
  authHydrated: false,
  cartHydrated: false,
  favoritesHydrated: false,
  addressesLoading: true,
  paymentHydrated: false,
}));

vi.mock("@/context/MenuDataContext", () => ({
  useMenuData: () => ({ isLoading: readiness.menuLoading }),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ isHydrated: readiness.authHydrated }),
}));
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ isHydrated: readiness.cartHydrated }),
}));
vi.mock("@/context/FavoritesContext", () => ({
  useFavorites: () => ({ isHydrated: readiness.favoritesHydrated }),
}));
vi.mock("@/context/AddressContext", () => ({
  useAddresses: () => ({ isLoadingAddresses: readiness.addressesLoading }),
}));
vi.mock("@/context/PaymentContext", () => ({
  usePayment: () => ({ isHydrated: readiness.paymentHydrated }),
}));
vi.mock("next/image", () => ({
  default: ({ preload, alt = "", ...props }) => (
    <img alt={alt} data-preload={String(preload)} {...props} />
  ),
}));

const setReady = () => Object.assign(readiness, {
  menuLoading: false,
  authHydrated: true,
  cartHydrated: true,
  favoritesHydrated: true,
  addressesLoading: false,
  paymentHydrated: true,
});

describe("StartupGate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(readiness, {
      menuLoading: true,
      authHydrated: false,
      cartHydrated: false,
      favoritesHydrated: false,
      addressesLoading: true,
      paymentHydrated: false,
    });
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  afterEach(() => vi.useRealTimers());

  it("covers and disables the mounted app while startup is pending", () => {
    render(<StartupGate><button>Open menu</button></StartupGate>);

    expect(screen.getByRole("status", { name: "Loading Mandi Kings" })).toBeInTheDocument();
    expect(screen.getByAltText("Mandi Kings")).toHaveAttribute("src", "/applogo.jpeg");
    expect(screen.getByAltText("Mandi Kings")).toHaveAttribute("data-preload", "true");
    expect(screen.getByRole("button", { name: "Open menu" }).parentElement).toHaveAttribute("inert");
  });

  it("fades out when critical state settles and never returns", () => {
    const view = render(<StartupGate><button>Open menu</button></StartupGate>);
    setReady();
    view.rerender(<StartupGate><button>Open menu</button></StartupGate>);

    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("status", { name: "Loading Mandi Kings" })).toHaveClass("startup-splash--exiting");
    act(() => vi.advanceTimersByTime(250));
    expect(screen.queryByRole("status", { name: "Loading Mandi Kings" })).not.toBeInTheDocument();

    readiness.menuLoading = true;
    view.rerender(<StartupGate><button>Open menu</button></StartupGate>);
    expect(screen.queryByRole("status", { name: "Loading Mandi Kings" })).not.toBeInTheDocument();
  });

  it("reveals the app after the eight-second fail-safe", () => {
    render(<StartupGate><button>Open menu</button></StartupGate>);
    act(() => vi.advanceTimersByTime(8000));
    act(() => vi.advanceTimersByTime(250));
    expect(screen.queryByRole("status", { name: "Loading Mandi Kings" })).not.toBeInTheDocument();
  });

  it("skips the exit animation when reduced motion is requested", () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    const view = render(<StartupGate><button>Open menu</button></StartupGate>);
    setReady();
    view.rerender(<StartupGate><button>Open menu</button></StartupGate>);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.queryByRole("status", { name: "Loading Mandi Kings" })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests and confirm RED**

Run: `npm run test:unit -- test/StartupGate.test.jsx`

Expected: FAIL because `components/customer/StartupGate.jsx` does not exist.

- [ ] **Step 3: Implement the visual-only splash**

Create `components/customer/BrandedSplash.jsx`:

```jsx
import Image from "next/image";

export default function BrandedSplash({ isExiting }) {
  return (
    <div
      role="status"
      aria-label="Loading Mandi Kings"
      className={`startup-splash${isExiting ? " startup-splash--exiting" : ""}`}
    >
      <Image
        src="/applogo.jpeg"
        alt="Mandi Kings"
        width={2560}
        height={1280}
        sizes="(max-width: 430px) 80vw, 360px"
        preload
        className="startup-splash__logo"
      />
    </div>
  );
}
```

- [ ] **Step 4: Implement readiness and one-time lifecycle**

Create `components/customer/StartupGate.jsx`:

```jsx
import { useEffect, useState } from "react";
import BrandedSplash from "@/components/customer/BrandedSplash";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useMenuData } from "@/context/MenuDataContext";
import { usePayment } from "@/context/PaymentContext";

const FAIL_SAFE_MS = 8000;
const EXIT_MS = 250;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export default function StartupGate({ children }) {
  const { isLoading: isMenuLoading } = useMenuData();
  const { isHydrated: isAuthHydrated } = useAuth();
  const { isHydrated: isCartHydrated } = useCart();
  const { isHydrated: isFavoritesHydrated } = useFavorites();
  const { isLoadingAddresses } = useAddresses();
  const { isHydrated: isPaymentHydrated } = usePayment();
  const [phase, setPhase] = useState("visible");

  const isReady =
    !isMenuLoading &&
    isAuthHydrated &&
    isCartHydrated &&
    isFavoritesHydrated &&
    !isLoadingAddresses &&
    isPaymentHydrated;

  useEffect(() => {
    if (phase !== "visible") return undefined;
    const timer = window.setTimeout(
      () => setPhase(prefersReducedMotion() ? "hidden" : "exiting"),
      isReady ? 0 : FAIL_SAFE_MS
    );
    return () => window.clearTimeout(timer);
  }, [isReady, phase]);

  useEffect(() => {
    if (phase !== "exiting") return undefined;
    const timer = window.setTimeout(() => setPhase("hidden"), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const isVisible = phase !== "hidden";

  return (
    <>
      <div inert={isVisible ? true : undefined} aria-hidden={isVisible ? true : undefined}>
        {children}
      </div>
      {isVisible ? <BrandedSplash isExiting={phase === "exiting"} /> : null}
    </>
  );
}
```

- [ ] **Step 5: Add splash animation and reduced-motion CSS**

Append to `styles/globals.css`:

```css
.startup-splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: max(24px, env(safe-area-inset-top)) 24px
    max(24px, env(safe-area-inset-bottom));
  background: #32120d;
  opacity: 1;
  transition: opacity 250ms ease-out;
}

.startup-splash--exiting {
  pointer-events: none;
  opacity: 0;
}

.startup-splash__logo {
  width: min(80vw, 360px);
  height: auto;
  animation: startup-logo-breathe 1800ms ease-in-out infinite;
}

@keyframes startup-logo-breathe {
  0%, 100% { opacity: 0.88; transform: scale(0.985); }
  50% { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .startup-splash { transition: none; }
  .startup-splash__logo { animation: none; }
}
```

- [ ] **Step 6: Run the gate tests and confirm GREEN**

Run: `npm run test:unit -- test/StartupGate.test.jsx`

Expected: 4 tests PASS with no React attribute warnings.

- [ ] **Step 7: Commit the isolated startup gate**

```bash
git add test/StartupGate.test.jsx components/customer/BrandedSplash.jsx components/customer/StartupGate.jsx styles/globals.css
git commit -m "Add branded startup splash gate"
```

---

### Task 3: Wire the Gate Into Initial App Startup

**Files:**
- Create: `tests/initial-splash-integration.test.mjs`
- Modify: `context/AppProviders.js:1-20`
- Modify: `components/customer/ShopByCategories.jsx:578-584`

**Interfaces:**
- Consumes: `StartupGate({ children })` from Task 2.
- Produces: a provider tree whose innermost child is `<StartupGate>{children}</StartupGate>`.
- Preserves: empty menu copy after `isLoading` becomes false.

- [ ] **Step 1: Write failing integration assertions**

Create `tests/initial-splash-integration.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("mounts one startup gate inside all application providers", async () => {
  const source = await readSource("context/AppProviders.js");
  const gate = await readSource("components/customer/StartupGate.jsx");
  assert.match(source, /import StartupGate from "@\/components\/customer\/StartupGate"/);
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
  const [component, styles] = await Promise.all([
    readSource("components/customer/BrandedSplash.jsx"),
    readSource("styles/globals.css"),
  ]);
  assert.match(component, /preload/);
  assert.doesNotMatch(component, /priority/);
  assert.match(component, /sizes="\(max-width: 430px\) 80vw, 360px"/);
  assert.match(styles, /@keyframes startup-logo-breathe/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
```

- [ ] **Step 2: Run the integration test and confirm RED**

Run: `node --test tests/initial-splash-integration.test.mjs`

Expected: FAIL because `AppProviders` does not import/mount `StartupGate` and the old loading copy remains.

- [ ] **Step 3: Mount the gate without remounting page content**

Update `context/AppProviders.js` by importing `StartupGate` and changing only the reducer seed:

```jsx
import StartupGate from "@/components/customer/StartupGate";

export default function AppProviders({ children }) {
  return providers.reduceRight(
    (tree, Provider) => <Provider>{tree}</Provider>,
    <StartupGate>{children}</StartupGate>
  );
}
```

This placement is inside every provider, so all readiness hooks are valid, while the page remains mounted underneath the overlay.

- [ ] **Step 4: Remove the redundant inline loading text**

Replace the loading branch in `components/customer/ShopByCategories.jsx` with:

```jsx
if (isLoading) {
  return null;
}
```

Do not change the following `sections.length === 0` branch.

- [ ] **Step 5: Run focused integration and unit tests**

Run: `node --test tests/initial-splash-integration.test.mjs && npm run test:unit -- test/StartupGate.test.jsx test/PersistenceReadiness.test.jsx`

Expected: all 10 assertions/tests PASS.

- [ ] **Step 6: Commit the application wiring**

```bash
git add tests/initial-splash-integration.test.mjs context/AppProviders.js components/customer/ShopByCategories.jsx
git commit -m "Show splash during initial app readiness"
```

---

### Task 4: Coalesce Realtime Menu Refresh Bursts

**Files:**
- Create: `test/trailingRefresh.test.mjs`
- Create: `lib/trailingRefresh.mjs`
- Modify: `context/MenuDataContext.js:14-45`

**Interfaces:**
- Produces: `createTrailingRefresh(task: () => Promise<void>): () => Promise<void>`.
- Behavior: one task runs immediately; any number of calls while it is active request exactly one trailing task; a later idle call starts a new task.
- Consumes: the existing menu provider's async profile/menu/offers batch.

- [ ] **Step 1: Write the failing concurrency test**

Create `test/trailingRefresh.test.mjs`:

```js
import { describe, expect, it, vi } from "vitest";
import { createTrailingRefresh } from "@/lib/trailingRefresh.mjs";

const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

describe("createTrailingRefresh", () => {
  it("coalesces overlapping calls into one trailing refresh", async () => {
    const first = deferred();
    const second = deferred();
    const task = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockResolvedValue(undefined);
    const refresh = createTrailingRefresh(task);

    const running = refresh();
    refresh();
    refresh();
    expect(task).toHaveBeenCalledTimes(1);

    first.resolve();
    await first.promise;
    await Promise.resolve();
    expect(task).toHaveBeenCalledTimes(2);

    second.resolve();
    await running;
    await refresh();
    expect(task).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 2: Run the helper test and confirm RED**

Run: `npm run test:unit -- test/trailingRefresh.test.mjs`

Expected: FAIL because `lib/trailingRefresh.mjs` does not exist.

- [ ] **Step 3: Implement the minimal trailing coordinator**

Create `lib/trailingRefresh.mjs`:

```js
export function createTrailingRefresh(task) {
  let current = null;
  let trailingRequested = false;

  return function refresh() {
    if (current) {
      trailingRequested = true;
      return current;
    }

    current = (async () => {
      do {
        trailingRequested = false;
        await task();
      } while (trailingRequested);
    })().finally(() => {
      current = null;
    });

    return current;
  };
}
```

- [ ] **Step 4: Run the helper test and confirm GREEN**

Run: `npm run test:unit -- test/trailingRefresh.test.mjs`

Expected: 1 test PASS.

- [ ] **Step 5: Integrate the coordinator into menu data loading**

Import the helper in `context/MenuDataContext.js`:

```js
import { createTrailingRefresh } from "@/lib/trailingRefresh.mjs";
```

Replace the effect-local `refetch` function with a coordinated task while preserving cancellation and settled loading behavior:

```js
const refetch = createTrailingRefresh(async () => {
  try {
    const [nextProfile, nextSections, nextOffers] = await Promise.all([
      getRestaurantProfile(client),
      listActiveMenu(client),
      listActiveOffers(client),
    ]);
    if (cancelled) return;
    setProfile(nextProfile);
    setSections(nextSections);
    setOffers(nextOffers);
  } catch {
    // Existing fallback state remains usable.
  } finally {
    if (!cancelled) setIsLoading(false);
  }
});
```

Keep the initial `refetch()`, all four realtime handlers, and cleanup unchanged.

- [ ] **Step 6: Run focused and full unit tests**

Run: `npm run test:unit -- test/trailingRefresh.test.mjs test/StartupGate.test.jsx test/PersistenceReadiness.test.jsx`

Expected: 8 tests PASS.

- [ ] **Step 7: Commit the refresh optimization**

```bash
git add test/trailingRefresh.test.mjs lib/trailingRefresh.mjs context/MenuDataContext.js
git commit -m "Coalesce realtime menu refreshes"
```

---

### Task 5: Cache the Startup Logo and Complete Verification

**Files:**
- Modify: `tests/pwa-branding.test.mjs:36-40`
- Modify: `public/sw.js:1-10`

**Interfaces:**
- Consumes: `/applogo.jpeg` used by `BrandedSplash`.
- Produces: service-worker app shell cache `smartrest-v6` containing `/applogo.jpeg`.

- [ ] **Step 1: Update the cache test first**

Change the final test in `tests/pwa-branding.test.mjs` to:

```js
test("refreshes cached PWA branding assets", async () => {
  const source = await readSource("public/sw.js");
  assert.match(source, /const CACHE_NAME = "smartrest-v6"/);
  assert.match(source, /"\/applogo\.jpeg"/);
  assert.match(source, /"\/splash\/iphone-1290x2796\.png"/);
});
```

- [ ] **Step 2: Run the cache test and confirm RED**

Run: `node --test tests/pwa-branding.test.mjs`

Expected: the cache refresh test FAILS because the worker still uses `smartrest-v5` and does not list `/applogo.jpeg`.

- [ ] **Step 3: Update the service-worker app shell**

In `public/sw.js`, change the cache version and add the logo once:

```js
const CACHE_NAME = "smartrest-v6";
const APP_SHELL = [
  "/manifest.webmanifest",
  "/applogo.jpeg",
  "/pwa-icon-192.png",
  "/pwa-icon-512.png",
  "/pwa-icon-192-maskable.png",
  "/pwa-icon-512-maskable.png",
  "/apple-touch-icon.png",
  "/splash/iphone-1290x2796.png"
];
```

- [ ] **Step 4: Run cache and integration tests**

Run: `node --test tests/pwa-branding.test.mjs tests/initial-splash-integration.test.mjs`

Expected: all tests PASS.

- [ ] **Step 5: Run complete automated verification**

Run: `npm test`

Expected: unit and legacy suites PASS.

Run: `npm run lint`

Expected: exit 0 with no errors.

Run: `npm run build`

Expected: Next.js production build completes successfully with no deprecated `priority` warning.

- [ ] **Step 6: Verify the initial experience in the in-app browser**

Start the production server with `npm run start`, open the app at a mobile viewport no wider than 430 px, and perform a hard refresh with network throttling sufficient to observe startup. Confirm:

- the deep brand background covers the full viewport and safe areas;
- the logo is centered, sharp, uncropped, and gently breathes;
- no `Loading menu…` text or half-interactive page appears;
- the splash fades as soon as critical state settles;
- the page is usable after the eight-second fail-safe during a deliberately stalled request;
- navigating to another route does not show the splash again; and
- emulated reduced motion removes the breathing and exit fade.

- [ ] **Step 7: Inspect the final diff and commit**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only intended Task 5 changes remain uncommitted.

```bash
git add tests/pwa-branding.test.mjs public/sw.js
git commit -m "Cache branded startup artwork"
```
