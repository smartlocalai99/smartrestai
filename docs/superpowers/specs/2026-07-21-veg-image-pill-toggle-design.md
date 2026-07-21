# Veg Image Pill Toggle Design

## Status

This design supersedes the rolling-image behavior in `2026-07-21-rolling-veg-toggle-design.md`.

## Goal

Replace the home header's single flipping food image with a recognizable two-position toggle that always displays the supplied non-veg and veg images.

## Layout and Behavior

- Render a compact horizontal pill with `/nonveg.webp` on the left and `/veg.webp` on the right.
- Keep both food images visible, upright, and uncropped at all times.
- Place an animated white selection surface behind the active image.
- Start with Non Veg selected; this preserves the current full-menu behavior.
- Tapping the Veg half slides the selection surface right and enables the existing vegetarian-only filter.
- Tapping the Non Veg half slides it left and restores the full menu.
- Tapping anywhere on the overall switch toggles to the other state; each image half remains a clear visual target.

## Motion and Accessibility

- Animate only the selection surface with a short Motion spring; do not rotate, flip, replace, fade, or move either image.
- Keep a subtle whole-control press response.
- When reduced motion is requested, move the selection surface immediately.
- Retain `role="switch"`, `aria-checked`, a state-specific accessible label, and a minimum 44-pixel touch height.

## Verification

- Component tests cover both permanently visible images, initial non-veg selection, switching callback values, switch semantics, and state-specific labels.
- Source checks reject rotation-based image animation and confirm a layout-position spring is used for the selection surface.
- Run the complete test suite, changed-file ESLint, and the Next.js production build.
