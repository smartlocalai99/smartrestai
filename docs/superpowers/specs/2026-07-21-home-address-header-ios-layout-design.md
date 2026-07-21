# Home Address Header and iOS Layout Design

## Goal

Make the home header show the customer’s saved delivery address, provide a clear route into address management, and remove the unwanted white strip below the installed iOS PWA.

## Home Header

The home location control reads from the existing authentication and address contexts. When a logged-in customer has saved addresses, it shows the default address, falling back to the first saved address if no record is marked as default. When the customer is logged out, the address data is still loading, or no address is saved, it shows `Kadapa`.

The control replaces the home icon with a location-pin icon. The address uses compact `text-sm` typography and truncates to one line so the veg-mode control always remains reachable. The button’s accessible label contains the displayed location.

The down chevron remains beside the text. The whole location control is one button, so tapping either the address or the arrow performs the same action.

## Navigation and Page Transition

Tapping the location control navigates to `/addresses` through the existing Pages Router. The existing protected-address flow remains authoritative: a logged-out customer is redirected through login before viewing or editing saved addresses.

The Saved Addresses page is wrapped in a page-level motion container that enters upward from below the viewport. When the page is dismissed with a new back control, it animates downward before calling `router.back()`. If there is no useful browser history, the control replaces the route with `/` so the customer is never stranded.

The existing address list, default selection, add/edit sheet, deletion, checkout redirect, and bottom navigation behavior stay unchanged.

## iOS PWA Bottom Layout

Preserve `viewport-fit=cover`, the dark top safe-area treatment, and safe-area-aware sticky offsets at the top of the home page. Remove bottom safe-area additions from the app shell’s scroll clearance and from the floating bottom navigation or checkout button positioning. The controls sit against their normal fixed spacing at the bottom of the app viewport, and the document no longer exposes a separate white safe-area strip.

The address add/edit form’s internal bottom padding is also changed to fixed padding so opening it does not recreate the unwanted extra bottom band. This intentionally allows iOS’s home indicator to overlay the application surface, matching the request to use no bottom safe-area reservation.

## Components and Data Flow

- `Home` continues to render `HomeLocationBar` without duplicating address state.
- `HomeLocationBar` consumes `useAuth` and `useAddresses`, derives the display text, and navigates with `useRouter`.
- `AddressContext.defaultAddress` remains the single source of truth for the selected delivery address.
- `Addresses` owns only its page entrance/dismissal animation; address persistence remains in `AddressContext`.
- Shared bottom spacing changes remain in `AppShell` and `BottomNav` so all customer routes behave consistently in the installed PWA.

## Error and Loading Behavior

Address-loading failures retain the existing `Kadapa` fallback in the header. The address-management page continues to show its existing readable errors. Navigation does not wait for address loading.

## Testing

Add focused regression coverage confirming that:

- the header uses authentication and default-address state;
- the displayed value falls back to `Kadapa`;
- the location-pin icon replaces the home icon;
- the location control navigates to `/addresses`;
- the address text uses compact typography and truncation;
- the Saved Addresses screen enters from the bottom and provides animated dismissal;
- bottom safe-area environment spacing is absent from the app shell, bottom navigation, checkout button, and address form;
- top safe-area handling and `viewport-fit=cover` remain intact.

Run the focused test in its failing and passing states, the complete test suite, ESLint on touched source files, a production build, and browser verification of the relevant mobile interactions.

## Non-Goals

- No compact address-picker overlay on the home screen.
- No new address storage model or geocoding behavior.
- No global route-transition framework.
- No typography changes outside the home address label.
- No changes to the top iOS status-area treatment.
