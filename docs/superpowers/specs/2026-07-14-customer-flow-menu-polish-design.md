# Customer Flow and Menu Polish Design

**Date:** 2026-07-14

## Goal

Improve four customer-facing interactions: make logout reliably return home, tighten the space between menu item names and descriptions, replace typed coupon entry with tap-to-apply offers, and give the category Menu popup a glossy glass treatment with a primary-green plus beside each category name.

## Scope

This change affects the account logout action, home-page product cards, checkout coupon selection, and the existing floating category Menu popup. It does not change authentication storage, coupon discount mathematics, menu data, category counts, category navigation, product pricing, cart behavior, or the compact floating Menu trigger.

## Logout Flow

The current account handler clears authentication before navigation. That allows the account page's authentication guard to react and compete with the intended home navigation.

When the user taps `Log out`, first replace the current route with `/` while the account page is still authenticated. After the home route resolves, clear the stored authentication state. Use route replacement so the browser Back action does not reopen the protected account page.

If the route transition fails, do not clear authentication; the user remains safely on the account page and can retry.

## Product Name and Description Spacing

Product cards currently reserve a fixed 35px minimum height for every item name and add a top margin before the description. A one-line name therefore leaves a visible blank gap.

Remove the fixed minimum height from the item-name heading and remove the description's top margin. Keep the existing type sizes, line heights, two-line clamps, description minimum height, card layout, price area, and Add controls. One-line descriptions should begin directly below one-line names, while two-line names continue to clamp normally.

## Tap-to-Apply Coupons

Remove the manual promo-code input, Apply button, invalid-code error, and shake animation. Display available coupons as an inline list of tappable offer cards within the existing `Discount Coupon` section.

The initial available coupon is:

- Code: `SPICE10`
- Discount: 10 percent
- Supporting label: `Save 10% on this order`

Each offer card shows a tag icon, coupon code, supporting label, and a right-aligned state label. Before selection the state reads `Tap to apply`; after selection it reads `Applied`. Tapping the card applies the same existing 10 percent discount calculation. The selection remains local to the checkout page, matching the current behavior.

Structure coupon data as an array so additional offers can be added without rebuilding the UI. Do not automatically apply a coupon and do not open a separate popup or sheet.

## Glossy Category Menu Popup

Preserve the popup's current dimensions, maximum height, scrolling, close behavior, category order, counts, and navigation behavior.

Change only its visual treatment and row label layout:

- Use a translucent dark background rather than solid grey.
- Add strong backdrop blur and saturation.
- Use a subtle white border, soft outer shadow, and a non-interactive inner highlight to create a glossy glass surface.
- Keep text white and counts muted white.
- In every category row, render the category name and a plain `+` together on the left.
- Color only the plus with the app's primary green `#128647`.
- Give the plus no background, circle, border, or separate button behavior.
- Keep the item count independently right-aligned; the plus must not sit beside the count.

The plus is decorative and part of the existing category-selection button. Mark it hidden from assistive technology so the row's accessible label remains the category name and count context.

## Error Handling

- Logout only clears the user after successful home navigation.
- Coupon cards represent only known coupon data, so there is no invalid-code state.
- Existing checkout total safeguards remain unchanged.

## Testing and Verification

Add focused regression coverage that verifies:

- The account logout handler awaits `router.replace("/")` before calling `logout()`.
- Product item names no longer use `min-h-[35px]` and descriptions no longer use `mt-1`.
- The checkout no longer renders a promo-code input or manual Apply button.
- `SPICE10`, `Save 10% on this order`, `Tap to apply`, and `Applied` are present.
- Coupon selection still sets the 10 percent discount.
- The Menu popup uses translucent glass classes and retains its existing dimensions.
- The plus is adjacent to the category name, uses `#128647`, has no background wrapper, and remains separate from the right-aligned count.
- Existing menu navigation, image mappings, restaurant information, lint, and production build checks continue to pass.

## Non-Goals

- No server-side authentication or logout API changes.
- No coupon modal, coupon-entry field, automatic coupon selection, or coupon persistence.
- No new coupon codes beyond `SPICE10`.
- No changes to the floating Menu trigger, popup dimensions, category counts, or category navigation behavior.
- No product-card redesign beyond removing the name-to-description gap.
