# Menu Image Mappings Design

## Goal

Use the newly added dish photos for their exact menu items without changing menu names, descriptions, prices, or layout.

## Image mappings

- `Chicken 65` in `Chicken Starters` uses `/chicken65.jpg`.
- `Chicken Tikka` in `Chicken Starters` uses `/chickentiika.jpg`.
- `Chicken 65 Mandi (Serves 1)` keeps `/Chicken65Mandi.webp`.
- `Chicken Tikka Mandi (Serves 1)` keeps `/ChickenTikkaMandi.webp`.
- Both `Mixed Mandi (serves 4 Persons)` and `Mixed Mandi (serves 8 Persons)` use the single shared image `/mixmandi.jpg`.
- `Broasted Fish Mandi` uses `/broastedfishmandi.webp`.
- `Fish Fried Mandi` uses `/fishfrymandi.jpg`.
- `Grilled Fish Mandi [Serves 2]` uses `/grilledfishmandi.jpg`.
- `Mutton Raan Mandi` uses `/muttonraanmandi.jpg`.
- `Chicken Fry piece Mandi` uses `/chickenfrypiecemandi.webp`.

## Implementation

Add named entries to the existing `images` object and place exact matching rules in `imageForItem` before broader Mandi, meat, fish, and grilled-food fallbacks. Keep the current menu data structure and `next/image` rendering unchanged.

## Verification

Add a focused regression test that confirms:

- Starter Chicken 65 and Chicken Tikka receive their new starter photos.
- Their Mini Pack Mandi variants retain their existing distinct photos.
- Both Mixed Mandi serving sizes resolve to the same `/mixmandi.jpg` path.
- Each remaining newly added Mandi photo resolves to its exact dish.

Run the focused test, lint the touched source and test files, and run the production build.
