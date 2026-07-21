# Banner Login Startup Design

## Goal

Replace the one-time Mandi Kings startup logo with the existing login banner artwork while preserving the current startup readiness gate and never showing the loader again during client-side navigation.

## Design

- Keep `StartupGate` and its current timing, readiness checks, fade-out, reduced-motion behavior, and eight-second fail-safe unchanged.
- Update `BrandedSplash` to preload `/bannerlogin.png` with its native 1600×800 aspect ratio.
- Render the complete banner centered on a pure white (`#ffffff`) full-viewport surface using `object-contain`; do not crop or stretch it.
- The white surface covers the top and bottom safe-area/status-bar regions. No brown layer may appear behind or around the startup banner; the normal brown application theme returns only after the startup layer exits.
- Retain the accessible `Loading Mandi Kings` status and descriptive image alternative text.
- Update the service-worker application shell and cache version so installed PWAs receive the new startup artwork.

## Verification

- Component tests must verify that the one-time startup gate loads `/bannerlogin.png` and still exits only after readiness and image load.
- Source-contract tests must verify the white background, new cached banner asset, removal of the old splash logo reference, and absence of custom iOS startup images.
- Run the complete test suite, ESLint for changed files, and the Next.js production build.

## Supabase Deployment

After local verification, run the linked-project migration dry-run while authenticated. Apply the two pending migrations only if the dry-run lists the expected order-milestone and payment-method migrations without unexpected destructive statements.
