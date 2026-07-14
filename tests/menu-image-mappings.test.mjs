import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { getExactMenuImage } from "../components/customer/menuImageMappings.mjs";

const mappings = [
  ["Chicken 65", "Chicken Starters", "/chicken65.jpg"],
  ["Chicken Tikka", "Chicken Starters", "/chickentiika.jpg"],
  ["Chicken 65 Mandi (Serves 1)", "Mini Pack", "/Chicken65Mandi.webp"],
  ["Chicken Tikka Mandi (Serves 1)", "Mini Pack", "/ChickenTikkaMandi.webp"],
  ["Broasted Fish Mandi", "Fish Mandi", "/broastedfishmandi.webp"],
  ["Fish Fried Mandi", "Fish Mandi", "/fishfrymandi.jpg"],
  ["Grilled Fish Mandi [Serves 2]", "Fish Mandi", "/grilledfishmandi.jpg"],
  ["Mixed Mandi (serves 4 Persons)", "Mix Mandi", "/mixmandi.jpg"],
  ["Mixed Mandi (serves 8 Persons)", "Mix Mandi", "/mixmandi.jpg"],
  ["Mutton Raan Mandi", "Mix Mandi", "/muttonraanmandi.jpg"],
  ["Chicken Fry piece Mandi", "Chicken Mandi", "/chickenfrypiecemandi.webp"],
  ["Broasted Chicken Chefs Special", "Chicken Starters", "/boastedchicken.webp"],
  ["Chicken Al-faham", "Chicken Starters", "/chickenalfahm.jpg"],
  ["Haryali Chicken", "Chicken Starters", "/hariyalichicken.jpg"],
  ["Lahori Chicken Seekh Kebab [4 Pcs]", "Chicken Starters", "/chickenseekkabab.jpg"],
  ["Lebanese Cream Chicken", "Chicken Starters", "/lebanescreamchicken.jpg"],
  ["Arabian Mutton Chops (5 Pcs)", "Mutton Starters", "/arabicmuttonchops.jpg"],
  ["Botti Kebab", "Mutton Starters", "/muttonbotikakab.jpg"],
  ["Malai Mutton Chefs Special", "Mutton Starters", "/malaimutton.jpg"],
  ["Middle East Mutton Sheek Kebab Chefs Special", "Mutton Starters", "/muttonsheekkababmiddleeast.jpg"],
  ["Turkish Botti Kebab", "Mutton Starters", "/turkishbotikabab.jpg"],
  ["Apollo Fish", "Seafood Starters", "/apolofish.jpg"],
  ["Broasted Fish (4 Pcs)", "Seafood Starters", "/friedfish.jpg"],
  ["Crispy Fried Prawns Chefs Special", "Seafood Starters", "/friedpranws.jpg"],
  ["Butter Naan", "Rotis", "/butternaan.jpg"],
  ["Butter Tandoori Roti", "Rotis", "/buttertandooriroti.jpg"],
  ["Garlic Butter Naan", "Rotis", "/garlicbutternaan.jpg"],
  ["Rumali Roti", "Rotis", "/rumaliroti.jpg"],
  ["Rumali Roti (10 pcs)", "Rotis", "/rumaliroti.jpg"],
  ["Tandoori Roti", "Rotis", "/buttertandooriroti.jpg"],
  ["Cream Kunafa", "Desserts", "/creamkunafa.jpg"],
  ["Qurbani Ka Meetha", "Desserts", "/QubbaniKaMeetha.jpg"],
  ["Afghani Mutton Rosh", "Extra & Add Ons", "/afganimuttonrosh.jpg"],
  ["Chicken Faham (full Bird)", "Extra & Add Ons", "/chcikenfahmfullbird.jpg"],
  ["Chicken Faham (half Bird)", "Extra & Add Ons", "/chickenfahamhalf.jpg"],
  ["Chicken Fry", "Extra & Add Ons", "/chickenfry.jpg"],
  ["Fish Fry", "Extra & Add Ons", "/fishfry.jpg"],
  ["Fried Onion", "Extra & Add Ons", "/friedonions.jpg"],
  ["Mandi Rice", "Extra & Add Ons", "/mandirice.jpg"],
  ["Mayonnaise", "Extra & Add Ons", "/Mayonnaise.jpg"],
  ["Mutton Dum Roast", "Extra & Add Ons", "/muttondhumroast.jpg"],
  ["Mutton Fry", "Extra & Add Ons", "/muttonfry.jpg"],
  ["Mutton Juicy", "Extra & Add Ons", "/muttonjuicymandi.webp"],
  ["Arabic Champagne", "Mojitto & Beverages", "/ArabicChampagne.jpg"],
  ["Blackcurrant Mojito", "Mojitto & Beverages", "/BlackcurrantMojito.jpg"],
  ["Blue Lagoon Mojito", "Mojitto & Beverages", "/bluelagoonmajito.jpg"],
  ["Chicken Haleem", "Haleem", "/chickenhallem.jpg"],
  ["Mutton Haleem", "Haleem", "/muttonhaleem.jpg"],
  ["Special Haleem", "Haleem", "/speicalhaleem.jpg"],
  ["Family Haleem", "Haleem", "/familyhaleem.jpg"],
];

test("maps newly photographed dishes to their exact images", async () => {
  for (const [title, section, expectedImage] of mappings) {
    assert.equal(getExactMenuImage(title, section), expectedImage);
    await access(new URL(`../public${expectedImage}`, import.meta.url));
  }
});

test("does not override similarly named dishes in other sections", () => {
  assert.equal(getExactMenuImage("Chicken Tikka", "Mini Pack"), null);
  assert.equal(getExactMenuImage("Chicken 65", "Recommended"), null);
});

test("removes Labnies Cream Shawarma from the menu", async () => {
  const source = await readFile(
    new URL("../components/customer/ShopByCategories.jsx", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /Labnies Cream Shawarma/);
});
