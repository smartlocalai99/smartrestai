# Address Page Bottom Navigation Design

## Goal

Keep the standard glossy bottom navigation available on the Saved Addresses page so customers can move to Home, Favorites, Orders, or Account without first leaving address management.

## Current Behavior

`pages/addresses.js` already renders inside `AppShell`, and `AppShell` always mounts `BottomNav`. However, `BottomNav` replaces the four-item navigation with the green checkout button whenever the cart contains items. This makes the normal navigation unavailable on the address page for customers with an active cart.

## Approved Design

Add an opt-in control to `AppShell` that lets a page suppress the checkout-button substitution while preserving the shared bottom-navigation component. The Saved Addresses page will enable that control, causing `BottomNav` to render Home, Fav, Orders, and Account regardless of cart contents.

The default behavior remains unchanged everywhere else: pages continue to show the checkout button when the cart contains items. The add/edit address sheet remains a full-screen overlay and may cover the navigation while the customer is editing.

## Interface

- `AppShell` receives an optional `showCheckoutButton` boolean prop that defaults to `true`.
- `AppShell` forwards that value to `BottomNav`.
- `BottomNav` only renders `CheckoutButton` when `showCheckoutButton` is true and the cart contains items.
- `pages/addresses.js` renders `<AppShell showCheckoutButton={false}>`.

## Testing

Add a focused source-level regression test confirming that:

- the address page disables checkout-button substitution;
- the shared shell forwards the new option; and
- the bottom nav guards checkout rendering with the option.

Run the focused Node test, ESLint on the touched application files, and the production build.
