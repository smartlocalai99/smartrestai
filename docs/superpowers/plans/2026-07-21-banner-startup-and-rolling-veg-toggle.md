# Banner Startup and Rolling Veg Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the login banner for the one-time white startup screen and replace the home VEG/NON VEG text switch with the supplied food images and a rolling transition.

**Architecture:** Preserve `StartupGate` as the single readiness owner and change only its presentational `BrandedSplash`. Keep the existing `vegOnly` state and filtering flow, but replace `VegModeToggle` visuals with keyed Motion images so selection transitions animate without changing data behavior.

**Tech Stack:** Next.js 16 Pages Router, React 19, Motion, Next Image, Vitest, Testing Library, Supabase CLI 2.109.1.

## Global Constraints

- The startup image is `/bannerlogin.png`, centered and uncropped on a pure white full-screen background.
- The startup gate appears once per root mount and keeps its existing timing, fade, readiness checks, reduced-motion behavior, and fail-safe.
- The initial toggle state uses `/nonveg.webp` and shows the full menu; `/veg.webp` enables the existing vegetarian-only filter.
- The control remains an accessible switch and uses no new dependency.
- Supabase migrations may be applied only after an authenticated dry-run shows exactly the expected pending files.

---

### Task 1: Banner Startup Presentation

**Files:**
- Modify: `test/StartupGate.test.jsx`
- Modify: `tests/pwa-branding.test.mjs`
- Modify: `components/customer/BrandedSplash.jsx`
- Modify: `styles/globals.css`
- Modify: `public/sw.js`

**Interfaces:**
- Consumes: `BrandedSplash({ isExiting: boolean, onLogoReady: () => void })` from `StartupGate`.
- Produces: the same component contract, now rendering `/bannerlogin.png` on white.

- [ ] **Step 1: Write failing startup assertions**

Update the component test to expect `src="/bannerlogin.png"`. Update the PWA source test to expect the banner asset, `background: #fff`, and the next cache name, while rejecting the old logo reference inside `BrandedSplash`.

- [ ] **Step 2: Verify the focused tests fail**

Run: `npx vitest run test/StartupGate.test.jsx && node --test tests/pwa-branding.test.mjs`

Expected: failure because `BrandedSplash` and the service worker still reference `/applogo.jpeg` and the splash is brown.

- [ ] **Step 3: Implement the banner splash**

Set the image source and native dimensions:

```jsx
<Image
  src="/bannerlogin.png"
  alt="Mandi Kings welcome banner"
  width={1600}
  height={800}
  sizes="(max-width: 430px) calc(100vw - 32px), 640px"
  preload
  unoptimized
  onLoad={onLogoReady}
  onError={onLogoReady}
  className="startup-splash__logo"
/>
```

Use `background: #fff`, center the image, and size it with `width: min(calc(100vw - 32px), 640px); height: auto; object-fit: contain`. Add `/bannerlogin.png` to `APP_SHELL`, keep `/applogo.jpeg` cached for the order-map marker, and increment the cache version.

- [ ] **Step 4: Verify the startup tests pass**

Run: `npx vitest run test/StartupGate.test.jsx && node --test tests/pwa-branding.test.mjs`

Expected: all startup and PWA branding tests pass.

### Task 2: Rolling Food-Image Switch

**Files:**
- Create: `test/VegModeToggle.test.jsx`
- Modify: `components/customer/TopOfferBanner.js`
- Modify: `tests/home-address-header-ios-layout.test.mjs`

**Interfaces:**
- Consumes: `VegModeToggle({ vegOnly: boolean, onChange: (next: boolean) => void })`.
- Produces: an exported switch component that displays `/nonveg.webp` when false and `/veg.webp` when true.

- [ ] **Step 1: Write the failing toggle component test**

Render `VegModeToggle` with `vegOnly={false}` and assert role `switch`, `aria-checked="false"`, the non-veg image, and an `onChange(true)` call after click. Rerender with `vegOnly={true}` and assert the veg image and state-specific accessible label.

- [ ] **Step 2: Verify the focused test fails**

Run: `npx vitest run test/VegModeToggle.test.jsx`

Expected: failure because `VegModeToggle` is not exported and does not render either supplied image.

- [ ] **Step 3: Implement the rolling switch**

Export `VegModeToggle`, import `Image`, `AnimatePresence`, and `useReducedMotion`, and render the keyed current image inside the switch. Use enter/exit variants with horizontal movement, rotation, opacity, and scale; use a spring transition when motion is allowed and a zero-duration transition when reduced motion is requested. Keep `whileTap={{ scale: 0.92 }}` and call `onChange(!vegOnly)`.

- [ ] **Step 4: Verify toggle behavior**

Run: `npx vitest run test/VegModeToggle.test.jsx && node --test tests/home-address-header-ios-layout.test.mjs`

Expected: all toggle and header-layout tests pass.

### Task 3: Full Verification and Supabase Deployment

**Files:**
- Verify: `supabase/migrations/20260721141159_customer_order_milestones.sql`
- Verify: `supabase/migrations/20260721142353_customer_payment_methods.sql`

**Interfaces:**
- Consumes: the authenticated linked Supabase project and the two existing migration files.
- Produces: remote migration history containing those two migrations, only after an exact dry-run review.

- [ ] **Step 1: Run local verification**

Run:

```bash
npm test
npx eslint components/customer/BrandedSplash.jsx components/customer/TopOfferBanner.js test/StartupGate.test.jsx test/VegModeToggle.test.jsx tests/pwa-branding.test.mjs tests/home-address-header-ios-layout.test.mjs
npm run build
git diff --check
```

Expected: all tests pass, ESLint exits without findings, the production build succeeds, and no whitespace errors are reported.

- [ ] **Step 2: Review the authenticated migration dry-run**

Run: `npm run db:push:dry`

Expected: exit 0 and only `20260721141159_customer_order_milestones.sql` plus `20260721142353_customer_payment_methods.sql` are pending.

- [ ] **Step 3: Apply and verify migrations**

Run: `npm run db:push`, then `npx supabase migration list --linked`.

Expected: exit 0 and both migration versions appear in local and remote history.
