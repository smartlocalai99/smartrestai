# Dish Image Mappings Design

## Goal

Show the supplied dish-specific images for Paneer Butter Masala and Continental Mini Spl. Platter in the customer menu.

## Scope

- Add `/pannerbuttermasala.jpg` and `/minispecialplatter.webp` to the existing image registry in `components/customer/ShopByCategories.jsx`.
- Update `imageForItem` with specific matches before its generic keyword fallbacks.
- Use `/pannerbuttermasala.jpg` for both the standalone Paneer Butter Masala dish and the Paneer Butter Masala mini curry meal.
- Use `/minispecialplatter.webp` for Continental Mini Spl. Platter.
- Do not add duplicate menu records, change prices or descriptions, or alter the current layout.

## Data Flow

The existing menu item is passed to `imageForItem`. Exact dish-name matching selects the new asset; all unmatched dishes continue through the current fallback rules.

## Error Handling

Both assets already exist under `public/`. Existing generic fallbacks remain unchanged for every other dish.

## Verification

- Run the relevant lint check for `components/customer/ShopByCategories.jsx`.
- Run the production build.
- Confirm both asset paths and exact matching rules are present and ordered before generic curry, platter, and keyword fallbacks.
