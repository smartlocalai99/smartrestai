# Menu Image Mappings and Shawarma Removal Design

## Goal

Use the newly added photos for their exact Starter, Roti, Dessert, Add-on, Mojito, and Haleem menu items, and remove Shawarma from the menu. Preserve all other menu content and behavior.

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
- `Tandoori Roti` reuses `/buttertandooriroti.jpg`.

## Dessert mappings

- `Cream Kunafa` uses `/creamkunafa.jpg`.
- `Qurbani Ka Meetha` uses `/QubbaniKaMeetha.jpg`.

## Add-on mappings

- `Afghani Mutton Rosh` uses `/afganimuttonrosh.jpg`.
- `Chicken Faham (full Bird)` uses `/chcikenfahmfullbird.jpg`.
- `Chicken Faham (half Bird)` uses `/chickenfahamhalf.jpg`.
- `Chicken Fry` uses `/chickenfry.jpg`.
- `Fish Fry` uses `/fishfry.jpg`.
- `Fried Onion` uses `/friedonions.jpg`.
- `Mandi Rice` uses `/mandirice.jpg`.
- `Mayonnaise` uses `/Mayonnaise.jpg`.
- `Mutton Dum Roast` uses `/muttondhumroast.jpg`.
- `Mutton Fry` uses `/muttonfry.jpg`.
- `Mutton Juicy` reuses `/muttonjuicymandi.webp`.

## Mojito and beverage mappings

- `Blackcurrant Mojito` uses `/BlackcurrantMojito.jpg`.
- `Blue Lagoon Mojito` uses `/bluelagoonmajito.jpg`.
- `Arabic Champagne` uses `/ArabicChampagne.jpg`.

## Haleem mappings

- `Chicken Haleem` uses `/chickenhallem.jpg`.
- `Mutton Haleem` uses `/muttonhaleem.jpg`.
- `Special Haleem` uses `/speicalhaleem.jpg`.
- `Family Haleem` uses `/familyhaleem.jpg`.

## Implementation

Extend the existing exact title-and-section mapping module. Keep these mappings ahead of the broad image fallbacks so similarly named Mandi and meal items retain their current photos. Shared images are explicit only for the two Rumali Roti sizes, both Tandoori Roti variants, and Mutton Juicy. Remove only the Shawarma `menuItem` row from the Chicken Starters array.

## Verification

Extend the existing regression tests to confirm every mapping, all approved shared-image mappings, image-file existence, and the absence of `Labnies Cream Shawarma` from the source menu. Run the focused tests, targeted ESLint, the Next.js production build, and live page/image checks.
