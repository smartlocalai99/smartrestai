# Floating Menu Navigator Design

## Goal

Add a Zomato-style floating `Menu` button that opens a navigator containing every existing collapsible menu category and its dish count. Keep the existing category sections collapsible and change the normal bottom navigation footer to solid white.

## Floating button

- Display a compact dark-glass rounded `Menu` pill over the food list, above the bottom footer and aligned toward the lower-right side.
- Include a white fork-and-knife icon and white `Menu` label.
- Keep the button visible while the customer scrolls the food list.
- Position it above both the normal footer and the green checkout footer so the controls do not overlap.
- Use a 48px button height, tighter horizontal padding, a 20px icon, and a 16px label so it covers less of the product cards.
- Use a translucent dark background, subtle white border, backdrop blur, saturation, inner highlight, and soft shadow to create a smoky glass effect.
- Keep the opened category panel at its current size; only the floating trigger becomes smaller.

## Last-item clearance

- Add enough bottom space after the final category for its last row to scroll above the floating Menu pill and footer.
- The final product card's price and `ADD` control must remain fully visible and tappable at the bottom of the menu.
- Preserve the existing card layout and do not move or resize product controls.

## Category navigator

- Clicking the floating button opens a dark overlay panel above the button.
- The panel lists `Recommended` plus every category rendered by the existing collapsible menu.
- Each row displays the category title and its total dish count from the original menu data.
- Do not duplicate category names or counts in a separate hardcoded list.
- Clicking a category closes the panel, scrolls smoothly to that category, and expands it if it was collapsed.
- Clicking the backdrop or close control closes the panel without scrolling.

## Collapsible sections

- Keep every existing category section individually collapsible through its current heading and chevron.
- Move open/closed state into the parent menu component so the floating navigator can expand a selected section.
- Preserve the current initial state: sections are open when the page first loads.
- Filtering and searching continue to control which dish cards are rendered. The navigator counts remain total menu counts.

## Footer

- Change the normal four-item bottom navigation from translucent glass styling to a solid white background.
- Remove its gradient, blur, and translucent overlay layers.
- Preserve its rounded shape, labels, icons, layout, and behavior.
- Keep the green checkout footer unchanged when cart items are present.

## Accessibility and interaction

- Expose the button's open state with `aria-expanded` and connect it to the panel with `aria-controls`.
- Give the panel an accessible menu-navigation label.
- Keep all category rows and close controls as keyboard-operable buttons.
- Use the existing internal scroll container rather than window scrolling.

## Verification

- Add tests for category titles/counts, controlled collapse state, selected-category expansion, and solid-white footer styling.
- Verify the panel contains every existing collapsible category exactly once.
- Verify selecting a category closes the panel and scrolls to the corresponding section.
- Run targeted ESLint, the Next.js production build, and browser verification at mobile width.
