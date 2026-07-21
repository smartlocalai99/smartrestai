# Home Address Header and iOS Layout Design

## Goal

Make the home header show the customer’s saved delivery address, open a compact address selector from the bottom of the Home screen, and remove the unwanted white strip below the installed iOS PWA.

## Home Header

The home location control reads from the existing authentication and address contexts. When a logged-in customer has saved addresses, it shows the default address, falling back to the first saved address if no record is marked as default. When the customer is logged out, the address data is still loading, or no address is saved, it shows `Kadapa`.

The control replaces the home icon with a location-pin icon. The address uses compact `text-sm` typography and truncates to one line so the veg-mode control always remains reachable. The button’s accessible label contains the displayed location.

The down chevron remains beside the text. The whole location control is one button, so tapping either the address or the arrow opens the same bottom sheet.

## Home Address Selector

Tapping the location control opens an in-place modal sheet from the bottom of the Home screen instead of navigating away. A dimmed backdrop covers the Home content, and tapping the backdrop or the sheet close control dismisses it.

For a logged-in customer, the sheet lists all saved addresses in a compact selection layout. Each row shows the saved label and address line, with the current default visibly selected. Tapping another row calls the existing `setDefault(address.id)` operation; after it succeeds, the sheet closes and the Home header reflects the new default address. While selection is saving, address controls are disabled. Existing context errors remain visible in the sheet.

When the customer is logged out or has no saved address, the sheet shows `Kadapa` as the current fallback rather than an empty list. The sheet always includes an `Add or manage addresses` action. That action uses the existing protected `/addresses` flow, so logged-out customers are sent through login and authenticated customers can add, edit, or delete addresses on the established management page.

The Saved Addresses page itself returns to its original normal route behavior. It does not receive a route-level slide animation or a new back button. Its existing list, default selection, add/edit sheet, deletion, checkout redirect, and bottom navigation behavior remain unchanged.

## iOS PWA Bottom Layout

Preserve `viewport-fit=cover`, the dark top safe-area treatment, and safe-area-aware sticky offsets at the top of the home page. Remove bottom safe-area additions from the app shell’s scroll clearance and from the floating bottom navigation or checkout button positioning. The controls sit against their normal fixed spacing at the bottom of the app viewport, and the document no longer exposes a separate white safe-area strip.

The address add/edit form’s internal bottom padding is also changed to fixed padding so opening it does not recreate the unwanted extra bottom band. This intentionally allows iOS’s home indicator to overlay the application surface, matching the request to use no bottom safe-area reservation.

## Components and Data Flow

- `Home` continues to render `HomeLocationBar` without duplicating address state.
- `HomeLocationBar` consumes `useAuth` and `useAddresses`, derives the display text, and owns the open/closed state for the Home address selector.
- A focused `HomeAddressSheet` component renders the address choices, selection state, fallback, error, dismissal controls, and management action.
- `AddressContext.defaultAddress` remains the single source of truth for the selected delivery address.
- The existing `/addresses` route remains responsible for full address management; address persistence remains in `AddressContext`.
- Shared bottom spacing changes remain in `AppShell` and `BottomNav` so all customer routes behave consistently in the installed PWA.

## Error and Loading Behavior

Address-loading failures retain the existing `Kadapa` fallback in the header. The bottom sheet shows loading feedback while addresses hydrate and the existing readable context error if loading or selection fails. A failed default-address change leaves the sheet open so the customer can retry. Navigation to full address management does not wait for address loading.

## Testing

Add focused regression coverage confirming that:

- the header uses authentication and default-address state;
- the displayed value falls back to `Kadapa`;
- the location-pin icon replaces the home icon;
- the location control opens the Home bottom sheet without changing routes;
- the address text uses compact typography and truncation;
- the sheet lists saved addresses, marks the default, changes the default on selection, and dismisses after success;
- the sheet shows `Kadapa` when no saved address is available;
- the sheet provides an `Add or manage addresses` route into the existing protected page;
- the Saved Addresses page has no added route-level animation or back button;
- bottom safe-area environment spacing is absent from the app shell, bottom navigation, checkout button, and address form;
- top safe-area handling and `viewport-fit=cover` remain intact.

Run the focused test in its failing and passing states, the complete test suite, ESLint on touched source files, a production build, and browser verification of the relevant mobile interactions.

## Non-Goals

- No full address editor or deletion controls inside the Home selector.
- No new address storage model or geocoding behavior.
- No global route-transition framework.
- No typography changes outside the home address label.
- No changes to the top iOS status-area treatment.
