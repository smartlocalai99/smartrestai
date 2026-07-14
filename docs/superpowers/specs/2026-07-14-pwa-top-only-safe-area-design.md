# PWA Top-Only Safe Area Design

## Goal

In the Home Screen-installed iPhone PWA, show `#32120d` only behind the time, network, Wi-Fi, and battery icons. Do not show the brand color in the bottom gesture safe area.

## Preserved Behavior

- Keep the installed name `Mandi Kings`.
- Keep the existing Mandi Kings logo splash images and startup links.
- Keep `viewport-fit=cover` so the web app can control safe-area backgrounds.
- Keep `apple-mobile-web-app-status-bar-style` as `black-translucent`, which is required for page color to appear behind iOS status icons.
- Keep the safe-area-aware sticky search and category offsets.

## Layout Change

Change the global document fallback background from `#32120d` to white so uncovered bottom safe-area pixels cannot inherit the brand color. Add a fixed, pointer-events-free `body::before` layer whose height is exactly `env(safe-area-inset-top)` and whose background is `#32120d`.

The top layer uses a high stacking level but ends precisely at the bottom of the top safe area. The sticky search already begins at `env(safe-area-inset-top)`, so the layer cannot cover the search bar or its suggestions. No bottom pseudo-element, bottom padding, or bottom safe-area brand background will be added.

## Testing

Update the existing mobile document-background regression to verify:

- the document fallback background is white;
- `body::before` exists;
- the layer is fixed at the top;
- its height is `env(safe-area-inset-top)`;
- its background is `#32120d`;
- it ignores pointer events; and
- there is no `body::after` bottom layer.

Retain the PWA branding assertions for `black-translucent`, `#32120d` manifest colors, Mandi Kings naming, and splash assets. Run all Node tests, focused ESLint, and the production build before committing or pushing.
