# Rolling Veg Toggle Design

## Goal

Replace the current text-and-dot VEG/NON VEG switch in the home header with the supplied food images and a polished rolling transition.

## Behavior

- The initial non-veg state displays `/nonveg.webp` and keeps the current full-menu behavior.
- Tapping it changes to `/veg.webp` and enables the existing vegetarian-only menu filter.
- Tapping again returns to the non-veg image and the full menu.
- The control remains a semantic button with `role="switch"`, `aria-checked`, and a state-specific accessible label.

## Animation and Layout

- Use the existing Motion dependency; do not add a package.
- Keep a compact circular control in the current top-right header position.
- On selection, the outgoing dish rotates and rolls sideways while fading out; the incoming dish enters from the opposite side, rotates into place, and settles with a spring.
- Retain a small press-scale response for immediate touch feedback.
- Disable rolling and use an immediate image replacement when reduced motion is requested.
- Preserve the transparent image edges and avoid cropping the plate by using `object-contain`.

## Verification

- Add component coverage for initial non-veg state, image swapping, callback values, switch semantics, and accessible labels.
- Add a source-contract check for both supplied asset paths and rolling Motion variants.
- Run the complete test suite, changed-file ESLint, and the Next.js production build together with the approved banner-login startup change.
