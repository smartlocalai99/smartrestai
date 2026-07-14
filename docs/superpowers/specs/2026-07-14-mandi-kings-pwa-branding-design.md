# Mandi Kings PWA Branding Design

## Goal

Make the installed customer PWA display the name **Mandi Kings**, show the existing Mandi Kings crown logo during launch, and use the brand color `#32120d` behind the iPhone status icons.

## Existing Assets

The repository already contains the approved Mandi Kings logo in `public/applogo.jpeg`, matching PWA icons, an Apple touch icon, and eight portrait iPhone splash images under `public/splash/`. The splash images have been visually checked and already show the real crown logo centered on the brand-color background. These assets will be reused without image regeneration.

## Install Identity

Update `public/manifest.webmanifest` so both `name` and `short_name` are `Mandi Kings`. Update its description to reference Mandi Kings. Update the Apple install metadata in `pages/_document.js` so `application-name` and `apple-mobile-web-app-title` are also `Mandi Kings`.

This scope changes the installed-app identity only. Existing page titles that end in `SmartRest` are not part of this change.

## Splash Screen

Keep the eight device-specific `apple-touch-startup-image` links and their existing logo artwork. Add one unqualified startup-image link before the device-specific links, using `public/splash/iphone-1290x2796.png` as a fallback for iPhones whose dimensions do not match the current media queries. Matching device-specific links remain the preferred assets.

## Status Bar

Keep `theme-color`, the manifest theme/background colors, and the HTML/body background at `#32120d`. Change `apple-mobile-web-app-status-bar-style` from `black` to `black-translucent`. With the existing `viewport-fit=cover` setting and dark document background, the installed PWA can paint `#32120d` behind the native network, battery, and time icons instead of requesting a solid black bar.

Normal Safari browser chrome remains controlled by iOS. This design targets the Home Screen-installed PWA shown in the request.

## Cache Refresh

Bump the service-worker cache name from `smartrest-v3` to `smartrest-v4` so a newly loaded deployment removes stale cached PWA metadata and icon assets. Add the splash fallback asset to the application shell cache.

Because iOS captures install metadata and launch images, the user must remove the old Home Screen installation and add the deployed app to the Home Screen again after this update.

## Testing and Delivery

Add a Node regression test that validates:

- manifest name and short name are `Mandi Kings`;
- Apple install metadata uses `Mandi Kings`;
- status-bar style is `black-translucent`;
- the fallback and device-specific splash links exist;
- all referenced splash files exist and are non-empty;
- brand colors remain `#32120d`; and
- the service-worker cache is `smartrest-v4` and includes the fallback splash asset.

Run focused Node tests, ESLint on touched JavaScript/tests, and the Next.js production build. Commit the implementation and push the `main` branch to `origin` only after all verification passes.
