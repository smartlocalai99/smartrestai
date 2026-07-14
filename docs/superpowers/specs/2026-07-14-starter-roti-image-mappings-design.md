# Starter and Roti Image Mappings Design

## Goal

Use the newly added photos for their exact Chicken Starter, Mutton Starter, Seafood Starter, and Roti menu items, and remove Shawarma from the menu. Preserve all other menu content and behavior.

## Chicken Starter mappings

- `Broasted Chicken Chefs Special` uses `/boastedchicken.webp`.
- `Chicken Al-faham` uses `/chickenalfahm.jpg`.
- `Haryali Chicken` uses `/hariyalichicken.jpg`.
- `Lahori Chicken Seekh Kebab [4 Pcs]` uses `/chickenseekkabab.jpg`.
- `Lebanese Cream Chicken` uses `/lebanescreamchicken.jpg`.
- Remove `Labnies Cream Shawarma` entirely.

## Mutton Starter mappings

- `Arabian Mutton Chops (5 Pcs)` uses `/arabicmuttonchops.jpg`.
- `Botti Kebab` uses `/muttonbotikakab.jpg`.
- `Malai Mutton Chefs Special` uses `/malaimutton.jpg`.
- `Middle East Mutton Sheek Kebab Chefs Special` uses `/muttonsheekkababmiddleeast.jpg`.
- `Turkish Botti Kebab` uses `/turkishbotikabab.jpg`.

## Seafood Starter mappings

- `Apollo Fish` uses `/apolofish.jpg`.
- `Broasted Fish (4 Pcs)` uses `/friedfish.jpg`.
- `Crispy Fried Prawns Chefs Special` uses `/friedpranws.jpg`.

## Roti mappings

- `Butter Naan` uses `/butternaan.jpg`.
- `Butter Tandoori Roti` uses `/buttertandooriroti.jpg`.
- `Garlic Butter Naan` uses `/garlicbutternaan.jpg`.
- `Rumali Roti` and `Rumali Roti (10 pcs)` share `/rumaliroti.jpg`.

## Implementation

Extend the existing exact title-and-section mapping module. Keep these mappings ahead of the broad image fallbacks so similarly named Mandi and meal items retain their current photos. Remove only the Shawarma `menuItem` row from the Chicken Starters array.

## Verification

Extend the existing regression tests to confirm every mapping, both shared Rumali Roti mappings, image-file existence, and the absence of `Labnies Cream Shawarma` from the source menu. Run the focused tests, targeted ESLint, the Next.js production build, and live page/image checks.
