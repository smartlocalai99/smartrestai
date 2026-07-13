import { useState } from "react";
import Image from "next/image";
import {
  LuBicepsFlexed,
  LuCakeSlice,
  LuChevronDown,
  LuCupSoda,
  LuDrumstick,
  LuFish,
  LuFlame,
  LuMinus,
  LuPlus,
  LuSoup,
  LuUtensils,
  LuWheat,
} from "react-icons/lu";

const images = {
  fish: "/fish.jpg",
  chilliFish: "/chillifish.jpg",
  grill: "/grill.jpg",
  chickenMandi: "/mandic.jpg",
  muttonMandi: "/muttonm.jpg",
  dessert: "/apricotdelight.jpg",
  roti: "/rotis.png",
  afghaniKababMandi: "/AfghaniKababMandi.jpeg",
  butterChickenRice: "/butterchickenrice.jpeg",
  miniChickenWingsMandi: "/MiniChickenWingsMandi.jpeg",
  chicken65Mandi: "/Chicken65Mandi.webp",
  chickenSheekKebabMandi: "/ChickenSheekKebabMandi.webp",
  malaiKababMandi: "/maialkababmandi.webp",
  chickenTikkaMandi: "/ChickenTikkaMandi.webp",
  fishFryMandi: "/FishFryMandiMini.webp",
  chickenJuicyMandi: "/chickenjuicymandi.jpg",
  muttonJuicyMandi: "/muttonjuicymandi.webp",
  paneerButterMasala: "/pannerbuttermasala.jpg",
  miniSpecialPlatter: "/minispecialplatter.webp",
  broastedMixPlatter: "/broastedmixplatter.webp",
  chickenMixPlatter: "/ChickenMixPlatter.webp",
  muttonMixPlatter: "/muttonmixplatter.webp",
  continentalSpecialPlatter: "/ContinentalSpecialPlatter.webp",
  seafoodPlatter: "/seafoodplatter.webp",
  bbqFish: "/bbqfish.jpeg",
  chickenSizzler: "/chickensiszler.webp",
  garlicFish: "/garlicfish.jpg",
  muttonGheeRoast: "/muttongheeroast.jpg",
  palakPaneerWithRoti: "/palakpannerwithroti.jpg",
  butterChickenWithRumaliRoti: "/butterchickenrrumalioti.jpg",
  turkishChicken: "/turkeshchicken.webp",
  kadhaiChickenWithRoti: "/kadaichickenwithroti.jpg",
};

const menuItem = (title, price, description = "") => ({
  id: title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  title,
  price,
  oldPrice: Math.ceil((price * 1.18) / 10) * 10,
  description,
});

const menuSections = [
  {
    heading: "Mini Pack",
    items: [
      menuItem(
        "Afghani Kabab Mandi (Serves 1)",
        189,
        "Tender Afghani-style kababs served with flavorful mandi rice."
      ),
      menuItem("Butter Chicken With Rice (Serves 1)", 169, "Creamy butter chicken with fluffy rice."),
      menuItem("Chicken Wings Mandi (Serves 1)", 179, "Juicy wings in fiery mandi sauce with rice."),
      menuItem("Chicken 65 Mandi (Serves 1)", 179, "Mini chicken 65 pieces cooked in flavorful mandi sauce."),
      menuItem("Chicken Sheek Kebab Mandi (Serves 1)", 199, "Chicken sheek kababs grilled with spices."),
      menuItem("Chicken Tikka Mandi (Serves 1)", 189, "Mini chicken tikka pieces with mandi rice."),
      menuItem("Fish Fry Mandi (Serves 1)", 209, "Crispy fried fish with flavorful mandi sauce."),
      menuItem("Malai Kebab Mandi (Serves 1)", 199, "Tender chicken in rich malai sauce."),
      menuItem("Mutton Sheekh Kebab Mandi (Serves 1)", 249, "Mutton skewers grilled with herbs and spices."),
    ],
  },
  {
    heading: "Continental Special Starters",
    items: [
      menuItem("BBQ Fish Chefs Special", 299, "Boneless fish fillet barbequed on coal."),
      menuItem("Chicken Sizzler Chefs Special", 279, "Tender chicken breast with stir-fried vegetables."),
      menuItem("Garlic Fish Chefs Special", 299, "Boneless fish fillet with garlic, barbequed on coal."),
      menuItem("Mutton Ghee Roast Chefs Special", 349, "Mutton tossed in a fiery blend of spices."),
      menuItem("Turkish Chicken Chefs Special", 279, "Marinated chicken with Turkish sauces and 2 rotis."),
    ],
  },
  {
    heading: "Curry Meals for One",
    items: [
      menuItem("Palak Paneer with 2 Rumali Rotis (Serves 1)", 149),
      menuItem("Butter Chicken with 2 Rumali Rotis (Serves 1)", 179, "Signature butter chicken with soft rumali rotis."),
      menuItem("Kadhai Chicken with 2 Rumali Rotis (Serves 1)", 179, "Spicy tomato-based kadhai chicken with rotis."),
      menuItem("Kaju Masala with 2 Rumali Rotis (Serves 1)", 159, "Creamy kaju masala with rumali rotis."),
      menuItem("Kaju Paneer with 2 Rumali Rotis (Serves 1)", 169, "Paneer in creamy cashew sauce with rotis."),
      menuItem("Mughlai Chicken with 2 Rumali Rotis (Serves 1)", 189, "Mild, creamy Mughlai chicken with rumali rotis."),
      menuItem("Paneer Butter Masala with 2 Rumali Rotis (Serves 1)", 169, "Paneer butter masala with rumali rotis."),
    ],
  },
  {
    heading: "Mutton Mandi",
    items: [
      menuItem("Fry Mutton Mandi", 329, "Deep fried mutton with traditional mandi spices."),
      menuItem("Mutton Juicy Mandi", 349, "Slow-cooked mutton with cashews and Middle Eastern spices."),
      menuItem("Mutton Dum Roast Mandi Full [4pc]", 799, "Tender mutton pieces roasted dum-style."),
      menuItem("Mutton Dum Roast Mandi Half [2pc]", 449, "Half portion of dum-style roasted mutton."),
      menuItem("Mutton Dum Roast Single", 249, "Single portion of dum-style roasted mutton."),
      menuItem("Mutton Ghee Roast Mandi", 369, "Mutton roasted in ghee for rich flavor."),
    ],
  },
  {
    heading: "Chicken Mandi",
    items: [
      menuItem("Chicken Al-faham Mandi", 269, "Chicken barbequed on slow heat with Middle Eastern spices."),
      menuItem("Chicken Fry Mandi", 249, "Deep fried chicken with traditional mandi spices."),
      menuItem("Chicken Ghee Roast Mandi", 269),
      menuItem("Chicken Juicy Mandi", 269),
      menuItem("Chicken Malai Kebab [Serves 2 Persons]", 349, "Chicken thigh charred on coal with Mediterranean spices."),
      menuItem("Chicken Mini Mandi", 199),
      menuItem("Tangdi Kabab Mandi", 279),
    ],
  },
  {
    heading: "Fish Mandi",
    items: [
      menuItem("Broasted Fish Mandi", 299, "Juicy fish marinated and broasted."),
      menuItem("Fish Fried Mandi", 289, "Fresh fish coated in grounded spices and fried."),
      menuItem("Grilled Fish Mandi [Serves 2]", 449, "Grilled fish coated in mandi spices."),
    ],
  },
  {
    heading: "Mix Mandi",
    items: [
      menuItem("Mixed Mandi (serves 4 Persons)", 999, "Mutton, chicken and fish served over mandi rice."),
      menuItem("Mixed Mandi (serves 8 Persons)", 1799, "Large mixed mandi for family dining."),
      menuItem("Mutton Raan Mandi", 1299, "Mutton with traditional mandi spices and smoky butter method."),
    ],
  },
  {
    heading: "Chicken Starters",
    items: [
      menuItem("Broasted Chicken Chefs Special", 299, "5 pcs with fries and 2 buns."),
      menuItem("Chicken 65", 219, "Crispy fried chicken cooked in rich spices."),
      menuItem("Chicken Al-faham", 249, "Chicken barbequed on slow heat with Middle Eastern spices."),
      menuItem("Chicken Tikka", 229, "Boneless chicken pieces marinated in spiced yogurt."),
      menuItem("Haryali Chicken", 239, "Chicken marinated with fresh herbs and spices."),
      menuItem("Labnies Cream Shawarma", 179),
      menuItem("Lahori Chicken Seekh Kebab [4 Pcs]", 249, "Minced chicken mixed with simple spices."),
      menuItem("Lebanese Cream Chicken", 279, "Chicken thigh charred on coal with Mediterranean spices."),
    ],
  },
  {
    heading: "Mutton Starters",
    items: [
      menuItem("Arabian Mutton Chops (5 Pcs)", 399, "Mutton chops marinated with secret spices."),
      menuItem("Botti Kebab", 299, "Mutton prepared on charcoal."),
      menuItem("Malai Mutton Chefs Special", 349, "Mutton charred on coal and coated in malai."),
      menuItem("Middle East Mutton Sheek Kebab Chefs Special", 329, "Ground mutton mixed with Arabian spices."),
      menuItem("Turkish Botti Kebab", 329, "Seasoned mutton kebab with herbs and spices."),
    ],
  },
  {
    heading: "Seafood Starters",
    items: [
      menuItem("Apollo Fish", 269, "Tender fish marinated in house spices."),
      menuItem("Broasted Fish (4 Pcs)", 299, "Crunchy broasted fish pieces."),
      menuItem("Crispy Fried Prawns Chefs Special", 329, "Jumbo prawns fried in a crispy batter."),
    ],
  },
  {
    heading: "Continental Curries",
    items: [
      menuItem("Paneer Butter Masala", 219, "Soft paneer in rich tomato-based curry."),
    ],
  },
  {
    heading: "Rotis",
    items: [
      menuItem("Butter Naan", 45),
      menuItem("Butter Tandoori Roti", 35),
      menuItem("Garlic Butter Naan", 65),
      menuItem("Rumali Roti", 30),
      menuItem("Rumali Roti (10 pcs)", 199),
      menuItem("Tandoori Roti", 30),
    ],
  },
  {
    heading: "Special Platters",
    items: [
      menuItem("Broasted Mix Platter", 699, "Chicken 4 pcs, fish 2 pcs, prawns, fries and 4 buns."),
      menuItem("Chicken Mix Platter", 749, "Chicken kebab, tikka, malai kabab, haryali and turkey flavors."),
      menuItem("Continental Mini Spl. Platter", 599, "Mutton sheekh, chicken kebab, garlic fish and crispy prawns."),
      menuItem(
        "Continental Special Platter",
        999,
        "Mutton chops + 1 meter kabab + turkish chicken + chicken malai kabab + boti kebab + mutton ghee roast + garlic fish + bbq fish + crispy prawns + dips"
      ),
      menuItem("Mutton Mix Platter", 899, "Chops, sheekh kabab, boti kabab, ghee roast, malai mutton, roti and dips."),
      menuItem("Seafood Platter", 799, "BBQ fish, garlic fish, crispy fried prawns and lemon garlic prawns."),
    ],
  },
  {
    heading: "Desserts",
    items: [
      menuItem("Cream Kunafa", 159, "Traditional Middle Eastern dessert with creamy filling."),
      menuItem("Qurbani Ka Meetha", 129, "Traditional apricot dessert topped with nuts."),
    ],
  },
  {
    heading: "Extra & Add Ons",
    items: [
      menuItem("Afghani Mutton Rosh", 249),
      menuItem("Chicken Faham (full Bird)", 499),
      menuItem("Chicken Faham (half Bird)", 279),
      menuItem("Chicken Fry", 149),
      menuItem("Fish Fry", 179),
      menuItem("Fried Onion", 39),
      menuItem("Mandi Rice", 89),
      menuItem("Mayonnaise", 29),
      menuItem("Mutton Dum Roast", 249),
      menuItem("Mutton Fry", 229),
      menuItem("Mutton Juicy", 249),
    ],
  },
  {
    heading: "Mojitto & Beverages",
    items: [
      menuItem("Arabic Champagne", 129, "Ginger ale, pineapple juice and lemon-lime soda."),
      menuItem("Blackcurrant Mojito", 109, "Blackcurrant puree with fresh mint."),
      menuItem("Blue Lagoon Mojito", 109, "Blue curaçao-style refreshing mojito."),
    ],
  },
  {
    heading: "Haleem",
    items: [
      menuItem("Chicken Haleem", 179),
      menuItem("Mutton Haleem", 219),
      menuItem("Special Haleem", 249),
      menuItem("Family Haleem", 399),
    ],
  },
];

const recommendedItems = [
  menuSections[4].items[3],
  menuSections[3].items[1],
  menuSections[10].items[0],
  menuSections[12].items[2],
];

const specialPlattersSection = menuSections.find(
  (section) => section.heading === "Special Platters"
);

const regularMenuSections = menuSections.filter(
  (section) => section.heading !== "Special Platters"
);

const imageForItem = (item, sectionTitle = "") => {
  const text = `${item.title} ${sectionTitle}`.toLowerCase();

  if (/bbq fish chefs special/.test(text)) return images.bbqFish;
  if (/chicken sizzler chefs special/.test(text)) return images.chickenSizzler;
  if (/garlic fish chefs special/.test(text)) return images.garlicFish;
  if (/mutton ghee roast chefs special/.test(text)) return images.muttonGheeRoast;
  if (/palak paneer with 2 rumali roti/.test(text)) return images.palakPaneerWithRoti;
  if (/butter chicken with 2 rumali roti/.test(text)) return images.butterChickenWithRumaliRoti;
  if (/kadhai chicken with 2 rumali roti/.test(text)) return images.kadhaiChickenWithRoti;
  if (/turkish chicken chefs special/.test(text)) return images.turkishChicken;
  if (/paneer butter masala/.test(text)) return images.paneerButterMasala;
  if (/continental mini spl\. platter/.test(text)) return images.miniSpecialPlatter;
  if (/broasted mix platter/.test(text)) return images.broastedMixPlatter;
  if (/chicken mix platter/.test(text)) return images.chickenMixPlatter;
  if (/mutton mix platter/.test(text)) return images.muttonMixPlatter;
  if (/continental special platter/.test(text)) return images.continentalSpecialPlatter;
  if (/seafood platter/.test(text)) return images.seafoodPlatter;
  if (/chicken 65 mandi/.test(text)) return images.chicken65Mandi;
  if (/chicken juicy mandi/.test(text)) return images.chickenJuicyMandi;
  if (/mutton juicy mandi/.test(text)) return images.muttonJuicyMandi;
  if (/chicken sheek kebab mandi/.test(text)) return images.chickenSheekKebabMandi;
  if (/mutton sheekh kebab mandi/.test(text)) return images.chickenSheekKebabMandi;
  if (/malai kebab mandi/.test(text)) return images.malaiKababMandi;
  if (/chicken tikka mandi/.test(text)) return images.chickenTikkaMandi;
  if (/fish fry mandi|fish fried mandi/.test(text)) return images.fishFryMandi;
  if (/afghani.*kabab.*mandi/.test(text)) return images.afghaniKababMandi;
  if (/butter chicken.*rice/.test(text)) return images.butterChickenRice;
  if (/chicken wings mandi/.test(text)) return images.miniChickenWingsMandi;
  if (/dessert|kunafa|qurbani|sweet|apricot/.test(text)) return images.dessert;
  if (/roti|naan|rumali/.test(text)) return images.roti;
  if (/mutton|raan|chops|botti/.test(text)) return images.muttonMandi;
  if (/fish|prawn|seafood|apollo/.test(text)) return text.includes("grill") || text.includes("bbq") ? images.grill : images.fish;
  if (/grill|alfaham|tikka|kebab|kabab|sizzler/.test(text)) return images.grill;
  if (/mandi|chicken|wings|65|faham|haleem/.test(text)) return images.chickenMandi;
  return images.chilliFish;
};

const foodTraitForItem = (item, sectionTitle = "") => {
  const text = `${item.title} ${sectionTitle}`.toLowerCase();

  if (/dessert|kunafa|qurbani|sweet|apricot/.test(text)) return { label: "Sweet", icon: LuCakeSlice };
  if (/mojito|champagne|beverage|soda|blue lagoon/.test(text)) return { label: "Drink", icon: LuCupSoda };
  if (/roti|naan|rumali/.test(text)) return { label: "Roti", icon: LuWheat };
  if (/fish|prawn|seafood|apollo/.test(text)) return { label: "Seafood", icon: LuFish };
  if (/mutton|raan|chops|botti/.test(text)) return { label: "Protein", icon: LuBicepsFlexed };
  if (/curry|masala|haleem|rosh/.test(text)) return { label: "Rich", icon: LuSoup };
  if (/65|spicy|fried|fry|ghee roast/.test(text)) return { label: "Spicy", icon: LuFlame };
  if (/chicken|tangdi|wings|kebab|kabab|tikka|faham/.test(text)) return { label: "Protein", icon: LuDrumstick };
  return { label: "Special", icon: LuUtensils };
};

const isVegItem = (item, sectionTitle = "") => {
  const text = `${item.title} ${sectionTitle}`.toLowerCase();

  if (/chicken|mutton|fish|prawn|seafood|kabab|kebab|wings|tangdi|faham|haleem|raan|chops|botti|broasted/.test(text)) {
    return false;
  }

  return /paneer|palak|kaju|roti|naan|rumali|dessert|kunafa|qurbani|mojito|champagne|beverage|mayonnaise|fried onion|mandi rice/.test(text);
};

const matchesSearch = (item, sectionTitle, query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return `${item.title} ${item.description} ${sectionTitle}`
    .toLowerCase()
    .includes(normalizedQuery);
};

export const getMenuSearchSuggestions = (query, vegOnly = false) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const seen = new Set();
  const suggestions = [];

  menuSections.forEach((section) => {
    section.items.forEach((item) => {
      if (vegOnly && !isVegItem(item, section.heading)) return;
      if (!matchesSearch(item, section.heading, normalizedQuery)) return;
      if (seen.has(item.id)) return;

      seen.add(item.id);
      suggestions.push({
        id: item.id,
        title: item.title,
        section: section.heading,
        image: imageForItem(item, section.heading),
      });
    });
  });

  return suggestions.slice(0, 6);
};

const sectionId = (heading) =>
  `section-${heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

function ProductCard({ item, sectionTitle, quantity, onIncrement, onDecrement }) {
  const trait = foodTraitForItem(item, sectionTitle);
  const TraitIcon = trait.icon;
  const isVeg = isVegItem(item, sectionTitle);

  return (
    <article className="flex h-full flex-col bg-white">
      <div className="relative h-[150px] w-full overflow-hidden rounded-[20px] bg-white">
        <Image
          src={imageForItem(item, sectionTitle)}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col px-1 pb-2 pt-1.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 text-[12px] font-black ${isVeg ? "text-[#1c9b5f]" : "text-[#ef4f61]"}`}>
            <span
              aria-label={isVeg ? "Veg" : "Non veg"}
              className={`grid h-4 w-4 place-items-center rounded-[4px] border ${isVeg ? "border-[#1c9b5f]" : "border-[#ef4f61]"}`}
            >
              <span className={`h-2 w-2 rounded-full ${isVeg ? "bg-[#1c9b5f]" : "bg-[#ef4f61]"}`} />
            </span>
            Bestseller
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f4f1] px-2 py-1 text-[11px] font-black text-[#3c7c5b]">
            <TraitIcon className="h-3 w-3" />
            {trait.label}
          </span>
        </div>

        <h4 className="min-h-[35px] overflow-hidden text-[16px] font-black leading-[1.08] text-[#202020] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {item.title}
        </h4>

        <p className="mt-1 min-h-[28px] overflow-hidden text-[11px] font-medium leading-[1.25] text-[#756b64] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {item.description || "Freshly prepared and packed for your order."}
        </p>

        <div className="mt-auto flex h-11 items-center justify-between gap-2 pt-1.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <p className="mt-0.5 inline-flex rounded-sm bg-[#ffdf3f] px-1.5 py-0.5 text-[16px] font-black leading-none text-black">
              ₹{item.price}
            </p>
            <p className="text-[12px] font-bold leading-none text-[#8b8580] line-through">
              ₹{item.oldPrice}
            </p>
          </div>

          {quantity > 0 ? (
            <div className="inline-flex h-10 min-w-[86px] items-center justify-between overflow-hidden rounded-xl border border-[#36a46a] bg-white text-[#36a46a]">
              <button
                type="button"
                aria-label={`Remove ${item.title}`}
                onClick={onDecrement}
                className="grid h-full w-8 place-items-center"
              >
                <LuMinus className="h-4 w-4" />
              </button>
              <span className="text-[14px] font-black">{quantity}</span>
              <button
                type="button"
                aria-label={`Add ${item.title}`}
                onClick={onIncrement}
                className="grid h-full w-8 place-items-center"
              >
                <LuPlus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label={`Add ${item.title}`}
              onClick={onIncrement}
              className="inline-flex h-10 min-w-[76px] items-center justify-center gap-1 rounded-xl border border-[#d8d3cf] bg-white px-3 text-[14px] font-black text-[#36a46a] transition-transform duration-200 active:scale-95"
            >
              ADD
              <LuPlus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CollapsibleSection({ title, children, titleSize = "text-[22px]" }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section
      id={sectionId(title)}
      className="scroll-mt-[150px]"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className={`mb-3 flex w-full items-center justify-between gap-3 text-left ${titleSize} font-semibold leading-tight text-[#202020]`}
      >
        <span>{title}</span>
        <LuChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {isOpen ? children : null}
    </section>
  );
}

export default function PopularChoices({
  vegOnly = false,
  cart = {},
  onCartChange = () => {},
  searchQuery = "",
}) {
  const changeQuantity = (item, nextQuantity) => {
    onCartChange((current) => {
      const updated = { ...current };
      if (nextQuantity <= 0) {
        delete updated[item.id];
      } else {
        updated[item.id] = { item, quantity: nextQuantity };
      }
      return updated;
    });
  };

  const renderProduct = (item, sectionTitle) => {
    const quantity = cart[item.id]?.quantity || 0;

    return (
      <ProductCard
        key={item.id}
        item={item}
        sectionTitle={sectionTitle}
        quantity={quantity}
        onIncrement={() => changeQuantity(item, quantity + 1)}
        onDecrement={() => changeQuantity(item, quantity - 1)}
      />
    );
  };

  const visibleRecommendedItems = vegOnly
    ? recommendedItems.filter((item) => isVegItem(item, "Recommended"))
    : recommendedItems;

  const searchedRecommendedItems = visibleRecommendedItems.filter((item) =>
    matchesSearch(item, "Recommended", searchQuery)
  );

  const orderedMenuSections = specialPlattersSection
    ? [specialPlattersSection, ...regularMenuSections]
    : regularMenuSections;

  const visibleMenuSections = orderedMenuSections
    .map((section) => ({
      ...section,
      items: vegOnly
        ? section.items.filter((item) => isVegItem(item, section.heading))
        : section.items,
    }))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        matchesSearch(item, section.heading, searchQuery)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const hasResults =
    searchedRecommendedItems.length > 0 || visibleMenuSections.length > 0;
  const showRecommended =
    searchQuery.trim().length === 0 || searchedRecommendedItems.length > 0;

  return (
    <section className="w-full bg-transparent px-4 pb-6 pt-2 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        {showRecommended ? (
          <CollapsibleSection
            title="Recommended"
            titleSize="text-[26px] sm:text-[32px]"
          >
            <div className="grid grid-cols-2 gap-4">
              {searchedRecommendedItems.map((item) => renderProduct(item, "Recommended"))}
            </div>
          </CollapsibleSection>
        ) : null}

        {!hasResults ? (
          <div className="mt-8 rounded-2xl bg-[#f7f2ee] px-4 py-6 text-center">
            <p className="text-lg font-black text-[#241610]">No dishes found</p>
            <p className="mt-1 text-sm font-semibold text-[#7d7169]">
              Try searching mandi, fish, roti, paneer, or dessert.
            </p>
          </div>
        ) : null}

        <div className={`${showRecommended ? "mt-8" : "mt-0"} space-y-7`}>
          {visibleMenuSections.map((section) => (
            <CollapsibleSection
              key={section.heading}
              title={section.heading}
            >
              <div className="grid grid-cols-2 gap-4">
                {section.items.map((item) => renderProduct(item, section.heading))}
              </div>
            </CollapsibleSection>
          ))}
        </div>
      </div>
    </section>
  );
}
