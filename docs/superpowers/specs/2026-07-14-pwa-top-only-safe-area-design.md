# PWA Top-Only Safe Area Design

## Goal

Restore the safe-area behavior that existed immediately before commit `fb713a9`: a non-transparent iOS status bar with no newly exposed bottom safe-area color, while retaining the Mandi Kings name and splash assets added later.

## Preserved Behavior

- Keep the installed name `Mandi Kings`.
- Keep the existing Mandi Kings logo splash images and startup links.
- Keep `viewport-fit=cover` and the existing page layout unchanged.
- Keep the safe-area-aware sticky search and category offsets.

## Layout Change

Change only `apple-mobile-web-app-status-bar-style` from `black-translucent` back to `black`, matching the exact pre-`fb713a9` implementation. Do not add top or bottom pseudo-elements, do not change the global background, and do not change any component safe-area padding or sticky offsets.

The Mandi Kings install name, manifest colors, splash fallback, logo assets, and service-worker cache remain unchanged.

## Testing

Update the PWA branding regression to require `content="black"` and reject `black-translucent`. Retain the assertions for `#32120d` manifest colors, Mandi Kings naming, and splash assets. Run all Node tests, focused ESLint, and the production build before committing or pushing.
