# Initial Branded Splash and Startup Performance Design

## Goal

Replace the home page's plain `Loading menu…` state with a polished, full-screen Mandi Kings splash shown only during the app's initial launch or refresh. Reveal the application once its critical startup state has settled, without adding an artificial delay. Make focused startup-performance improvements that are safe, measurable, and directly related to this flow.

## Scope

This change covers the initial customer-app boot experience, readiness coordination among existing providers, the splash presentation, and targeted menu-data startup optimization. It does not add route-transition loaders, redesign application pages, or broadly refactor unrelated code.

## Startup Readiness

Add a small readiness coordinator inside the existing provider tree. It will consider the initial app boot settled when:

- the restaurant profile, menu, and offers request has completed, successfully or with its existing fallback/error behavior;
- authentication hydration has completed;
- cart, favorites, and payment preference hydration from browser storage has completed; and
- the initial saved-address lookup has completed after authentication settles.

Remote order history will continue loading in the background because it is not required to make the home experience usable. Startup failures must resolve their readiness flag in `finally` paths so errors cannot trap the user behind the splash. An eight-second safety timeout will also dismiss the splash if an underlying request never settles.

Readiness applies only to the first mount of the application shell. Client-side page navigation and later realtime menu refreshes will not show the splash again.

## Splash Presentation

Create a dedicated startup splash component rendered above the application at the root of the provider tree. While startup is pending, it will cover the complete viewport, including safe-area regions, with the existing deep brand background and display the Mandi Kings logo responsively at a restrained maximum width.

The logo will use a gentle opacity-and-scale breathing animation. When readiness completes, the overlay will perform a 250-millisecond opacity fade before unmounting. The page underneath will not be interactive while the overlay is present. A `prefers-reduced-motion` media query will disable breathing and remove the exit animation.

The image will use the repository's existing brand asset through Next's image component, include meaningful alternative text, declare responsive sizing, and be requested with initial-load priority. The logo will also be included in the service worker's app-shell cache so installed-app launches can display it without waiting for the network.

## Focused Performance Work

The startup work will remain narrow and evidence-driven:

- remove the now-redundant inline `Loading menu…` branch from the menu component while preserving empty-menu and error-settled behavior;
- expose existing provider hydration/loading states through their context values instead of duplicating reads or introducing another state store;
- keep the provider values memoized where the readiness consumer would otherwise create avoidable rerenders;
- coalesce overlapping realtime menu refresh requests so a burst of database events does not launch redundant profile/menu/offer fetch batches; and
- update the service-worker cache version when adding the logo asset.

No artificial minimum splash duration, new animation dependency, global state library, or unrelated codebase-wide optimization will be introduced.

## Component and Data Flow

1. Existing providers begin their normal hydration and initial requests.
2. A `StartupGate` inside all required providers reads their readiness flags.
3. The application remains mounted underneath a full-screen `BrandedSplash`, preserving state and avoiding a second mount.
4. When every critical flag settles, or the safety timeout expires, the gate starts the short exit animation.
5. After the exit animation, the splash unmounts and cannot reappear during client-side navigation or realtime updates.

## Error Handling

Existing domain-specific error and fallback behavior remains authoritative. The splash does not show an error message or retry UI; it only reflects whether initial work has settled. Rejected menu, authentication, or address work marks that provider ready after storing its existing error state. The safety timeout protects against stalled network calls and reveals the usable fallback interface.

## Testing and Verification

Implementation will follow test-driven development. Tests will first establish that:

- the branded splash is visible while critical startup state is pending;
- it exits after all required readiness states settle;
- it does not wait for order-history loading;
- it does not reappear for later provider refreshes or client-side navigation;
- its accessible logo and reduced-motion styling are present;
- the menu no longer renders the old loading text; and
- overlapping menu refresh signals are coalesced rather than issuing parallel duplicate batches.

After targeted tests pass, run the full test suite, lint, and a production build. Visually verify the initial launch at mobile width and confirm that the logo remains centered, the safe areas are covered, the animation is subtle, and the underlying app cannot be interacted with until reveal.
