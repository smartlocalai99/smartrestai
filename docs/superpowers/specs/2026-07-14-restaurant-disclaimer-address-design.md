# Restaurant Disclaimer, Address, and Mobile Chrome Design

**Date:** 2026-07-14

## Goal

Replace the empty white space after the final menu category with a Swiggy-inspired restaurant information area. The area must show Mandi King's disclaimer and full address while preserving access to the last Add button, the floating Menu trigger, and the glass bottom navigation. The mobile safe area above the app must use the app's existing dark brown instead of white.

## Scope

This change affects the customer home page only. It does not change menu data, prices, cart behavior, category navigation, checkout behavior, product cards, or the category popup.

## Page Structure

Create a focused `RestaurantInfo` component and render it on the home page immediately after `ShopByCategories` inside the existing home scrollable area.

Reduce the menu list's large white bottom padding so the information panel follows the final category naturally. Use compact padding on the information panel and rely on the app shell's existing navigation clearance. This replaces the empty white block with useful content while still allowing the last content to scroll above the Menu trigger and bottom navigation.

## Restaurant Information Panel

The panel uses a very light cool-grey background similar to the reference screenshot, subtle top and internal divider lines, dark grey headings, and muted grey body text. It spans the content width and uses mobile-friendly horizontal padding. It is always visible rather than collapsible.

The panel contains these sections in order:

1. A `Disclaimer:` heading.
2. Four bullet points:
   - All prices are set directly by the restaurant.
   - All nutritional information is indicative, values are per serve as shared by the restaurant and may vary depending on the ingredients and portion size.
   - An average active adult requires 2,000 kcal energy per day; however, calorie needs may vary.
   - Dish details might be AI crafted for a better experience.
3. A divider.
4. The restaurant name: `MANDI KING - Arabian Restaurant`.
5. A location-pin icon followed by the full address: `Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue, Ganagapeta, Kadapa, Andhra Pradesh 516001`.

Do not add the Swiggy Seal row, report-an-issue row, FSSAI license row, or any license number because the user did not provide those details.

## Floating Controls and Bottom Spacing

The compact glass Menu trigger and the existing glass bottom navigation remain unchanged. The category popup dimensions and behavior also remain unchanged.

The shared app shell already reserves approximately 112px of bottom clearance for the navigation. Do not stack the previous 160px panel padding on top of that clearance. Use compact 32px bottom padding on the information panel and rely on the existing shell clearance for safe scrolling.

On the home page, set the scroll-area background to the panel's light grey `#f5f5fa`. The grey must continue through the app shell's reserved bottom clearance so there is no white strip beneath the disclaimer/address panel. The address must remain readable and scrollable above both floating controls.

## Mobile Top Safe Area

Use the app's existing dark brown `#32120d` for browser/PWA chrome and the area above the top banner.

Keep the root HTML/body background and manifest background aligned to `#32120d`. Reinforce the page-level `theme-color` metadata through the shared `PageHead` component so mobile browsers consistently receive the same color on customer pages. Preserve `viewport-fit=cover` and the top banner's safe-area padding so the brown header extends beneath the mobile status area without creating a white strip.

## Accessibility

- Use a semantic section with an accessible label for restaurant information.
- Render disclaimer points as a real unordered list.
- Mark the location icon as decorative because the full address is present as text.
- Maintain readable contrast and comfortable line height.

## Testing and Verification

Add a focused regression test that verifies:

- All four exact disclaimer statements are present.
- The exact Mandi King name and address are present.
- The restaurant information panel is rendered after `ShopByCategories` on the home page.
- The menu list no longer owns the large blank bottom clearance.
- The information panel uses compact 32px bottom padding rather than the previous 160px.
- The home scroll area uses `#f5f5fa`, allowing the existing app-shell bottom clearance to remain light grey with no white strip.
- Shared page metadata contains `theme-color` set to `#32120d`.
- Existing Menu navigator, image mapping, footer, lint, and production build checks continue to pass.

## Non-Goals

- No external map link or directions action.
- No report-an-issue workflow.
- No FSSAI or licensing content.
- No changes to the Menu popup, product cards, Add controls, or bottom navigation styling.
- No global reduction to `AppShell` bottom clearance because other customer pages rely on it.
