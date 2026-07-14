import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import {
  LuBicepsFlexed,
  LuCakeSlice,
  LuChevronDown,
  LuCupSoda,
  LuDrumstick,
  LuFish,
  LuFlame,
  LuHeart,
  LuMinus,
  LuPlus,
  LuSoup,
  LuUtensils,
  LuWheat,
  LuX,
} from "react-icons/lu";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { playFavoriteAddedSound, playFavoriteRemovedSound } from "@/lib/sounds";
import { getExactMenuImage } from "./menuImageMappings.mjs";
import {
  createInitialOpenSections,
  createMenuNavigatorEntries,
  expandSection,
  sectionId,
} from "./menuNavigation.mjs";

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
  kajuMasalaWithRoti: "/kajumasalawithroti.jpeg",
  kajuPaneerWithRoti: "/kajupannerroti.jpg",
  mughlaiChickenWithRoti: "/mughalichickenroti.jpg",
  fryMuttonMandi: "/frymuttonmandi.webp",
  muttonRoastMandi: "/muttonroastmandi.jpg",
  muttonGheeRoastMandi: "/gheerostmuttonmandi.webp",
  chickenAlFahamMandi: "/alfarmchickenmandi.webp",
  chickenFryMandi: "/chickenfrypiecemandi.webp",
  chickenGheeRoastMandi: "/gheeroastchickenmandi.jpg",
  tangdiKababMandi: "/kandikababmandi.webp",
  chickenMiniMandi: "/chickenminimandi.jpeg",
  chickenMalaiKebabMandi: "/malaikababmandi.png",
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
      menuItem("Chicken Fry piece Mandi", 249, "Deep fried chicken with traditional mandi spices."),
      menuItem("Chicken Ghee Roast Mandi", 269),
      menuItem("Chicken Juicy Mandi", 269),
      menuItem("Chicken Malai Kebab Mandi [Serves 2 Persons]", 349, "Chicken thigh charred on coal with Mediterranean spices."),
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

const orderedMenuSections = specialPlattersSection
  ? [specialPlattersSection, ...regularMenuSections]
  : regularMenuSections;

const menuNavigatorEntries = createMenuNavigatorEntries(
  recommendedItems,
  orderedMenuSections
);

const itemsByCategory = {
  Recommended: recommendedItems,
  ...Object.fromEntries(orderedMenuSections.map((section) => [section.heading, section.items])),
};

export const imageForItem = (item, sectionTitle = "") => {
  const exactImage = getExactMenuImage(item.title, sectionTitle);
  if (exactImage) return exactImage;

  const text = `${item.title} ${sectionTitle}`.toLowerCase();

  if (/bbq fish chefs special/.test(text)) return images.bbqFish;
  if (/chicken sizzler chefs special/.test(text)) return images.chickenSizzler;
  if (/garlic fish chefs special/.test(text)) return images.garlicFish;
  if (/mutton ghee roast chefs special/.test(text)) return images.muttonGheeRoast;
  if (/palak paneer with 2 rumali roti/.test(text)) return images.palakPaneerWithRoti;
  if (/butter chicken with 2 rumali roti/.test(text)) return images.butterChickenWithRumaliRoti;
  if (/kadhai chicken with 2 rumali roti/.test(text)) return images.kadhaiChickenWithRoti;
  if (/kaju masala with 2 rumali roti/.test(text)) return images.kajuMasalaWithRoti;
  if (/kaju paneer with 2 rumali roti/.test(text)) return images.kajuPaneerWithRoti;
  if (/mughlai chicken with 2 rumali roti/.test(text)) return images.mughlaiChickenWithRoti;
  if (/turkish chicken chefs special/.test(text)) return images.turkishChicken;
  if (/fry mutton mandi/.test(text)) return images.fryMuttonMandi;
  if (/mutton dum roast mandi|mutton dum roast single/.test(text)) return images.muttonRoastMandi;
  if (/mutton ghee roast mandi/.test(text)) return images.muttonGheeRoastMandi;
  if (/chicken al-faham mandi/.test(text)) return images.chickenAlFahamMandi;
  if (/chicken fry mandi/.test(text)) return images.chickenFryMandi;
  if (/chicken ghee roast mandi/.test(text)) return images.chickenGheeRoastMandi;
  if (/tangdi kabab mandi/.test(text)) return images.tangdiKababMandi;
  if (/chicken mini mandi/.test(text)) return images.chickenMiniMandi;
  if (/chicken malai kebab mandi/.test(text)) return images.chickenMalaiKebabMandi;
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

const CONFETTI_PARTICLES = [
  { angle: 0, distance: 26, color: "#ef4f61", shape: "circle", delay: 0 },
  { angle: 36, distance: 30, color: "#f4c45f", shape: "square", delay: 0.02 },
  { angle: 72, distance: 23, color: "#1c9b5f", shape: "circle", delay: 0.05 },
  { angle: 108, distance: 28, color: "#f4915f", shape: "square", delay: 0.01 },
  { angle: 144, distance: 25, color: "#ef4f61", shape: "circle", delay: 0.06 },
  { angle: 180, distance: 32, color: "#f4c45f", shape: "square", delay: 0.03 },
  { angle: 216, distance: 23, color: "#1c9b5f", shape: "circle", delay: 0.02 },
  { angle: 252, distance: 29, color: "#ef4f61", shape: "square", delay: 0.07 },
  { angle: 288, distance: 27, color: "#f4c45f", shape: "circle", delay: 0.01 },
  { angle: 324, distance: 24, color: "#f4915f", shape: "square", delay: 0.05 },
];

function ConfettiParticle({ angle, distance, color, shape, delay }) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * distance;
  const dy = Math.sin(rad) * distance;
  const isSquare = shape === "square";

  return (
    <motion.span
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{
        width: isSquare ? 5 : 4,
        height: isSquare ? 5 : 4,
        borderRadius: isSquare ? 1 : 999,
        backgroundColor: color,
      }}
      initial={{ opacity: 1, x: "-50%", y: "-50%", scale: 0.4, rotate: 0 }}
      animate={{
        opacity: 0,
        x: `calc(-50% + ${dx}px)`,
        y: `calc(-50% + ${dy}px)`,
        scale: 1,
        rotate: isSquare ? 220 : 0,
      }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    />
  );
}

function FavoriteButton({ item, sectionTitle }) {
  const router = useRouter();
  const { isLoggedIn, isHydrated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(item.id);
  const heartControls = useAnimation();
  const [isBursting, setIsBursting] = useState(false);

  const handleFavoriteClick = () => {
    if (isHydrated && !isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    const willFavorite = !favorited;
    toggleFavorite(item, sectionTitle);

    if (willFavorite) {
      playFavoriteAddedSound();
      heartControls.start({
        scale: [1, 1.45, 0.9, 1.12, 1],
        rotate: [0, -12, 8, 0],
        transition: { duration: 0.45, ease: "easeOut" },
      });
      setIsBursting(true);
      setTimeout(() => setIsBursting(false), 700);
    } else {
      playFavoriteRemovedSound();
      heartControls.start({ scale: [1, 0.85, 1], transition: { duration: 0.2 } });
    }
  };

  return (
    <button
      type="button"
      onClick={handleFavoriteClick}
      aria-pressed={favorited}
      aria-label={favorited ? `Remove ${item.title} from favourites` : `Save ${item.title} to favourites`}
      className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center overflow-visible rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-transform duration-150 active:scale-90"
    >
      <AnimatePresence>
        {isBursting
          ? CONFETTI_PARTICLES.map((particle) => (
              <ConfettiParticle key={particle.angle} {...particle} />
            ))
          : null}
      </AnimatePresence>
      <motion.span animate={heartControls} className="inline-flex">
        <LuHeart
          className={`h-4 w-4 transition-colors duration-150 ${
            favorited ? "fill-[#ef4f61] text-[#ef4f61]" : "text-[#8b8580]"
          }`}
        />
      </motion.span>
    </button>
  );
}

export function ProductCard({ item, sectionTitle, quantity, onIncrement, onDecrement }) {
  const trait = foodTraitForItem(item, sectionTitle);
  const TraitIcon = trait.icon;
  const isVeg = isVegItem(item, sectionTitle);

  return (
    <article className="relative flex h-full flex-col bg-white">
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
      <FavoriteButton item={item} sectionTitle={sectionTitle} />

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

        <h4 className="overflow-hidden text-[16px] font-black leading-[1.08] text-[#202020] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {item.title}
        </h4>

        <p className="min-h-[28px] overflow-hidden text-[11px] font-medium leading-[1.25] text-[#756b64] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
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
              <motion.button
                type="button"
                aria-label={`Remove ${item.title}`}
                onClick={onDecrement}
                whileTap={{ scale: 0.85 }}
                className="grid h-full w-8 place-items-center"
              >
                <LuMinus className="h-4 w-4" />
              </motion.button>
              <span className="grid overflow-hidden text-[14px] font-black">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={quantity}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="col-start-1 row-start-1 text-center"
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
              </span>
              <motion.button
                type="button"
                aria-label={`Add ${item.title}`}
                onClick={onIncrement}
                whileTap={{ scale: 0.85 }}
                className="grid h-full w-8 place-items-center"
              >
                <LuPlus className="h-4 w-4" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              type="button"
              aria-label={`Add ${item.title}`}
              onClick={onIncrement}
              whileTap={{ scale: 0.9 }}
              className="inline-flex h-10 min-w-[76px] items-center justify-center gap-1 rounded-xl border border-[#d8d3cf] bg-white px-3 text-[14px] font-black text-[#36a46a] transition-transform duration-200 active:scale-95"
            >
              ADD
              <LuPlus className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>
    </article>
  );
}

function CollapsibleSection({
  title,
  children,
  isOpen,
  onToggle,
  titleSize = "text-[22px]",
}) {
  return (
    <section
      id={sectionId(title)}
      className="scroll-mt-[150px]"
    >
      <motion.button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        whileTap={{ scale: 0.99 }}
        className={`mb-3 flex w-full items-center justify-between gap-3 text-left ${titleSize} font-semibold leading-tight text-[#202020]`}
      >
        <span>{title}</span>
        <LuChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </motion.button>

      {isOpen ? children : null}
    </section>
  );
}

function CategoryRow({ entry, items, isExpanded, onSelect, onToggleExpand }) {
  return (
    <div>
      <div className="flex items-center px-3">
        <button
          type="button"
          onClick={() => onSelect(entry.title)}
          className="min-w-0 rounded-xl py-3 text-left text-sm font-bold active:bg-white/10"
        >
          <span>{entry.title}</span>
        </button>
        <motion.button
          type="button"
          onClick={() => onToggleExpand(entry.title)}
          whileTap={{ scale: 0.88 }}
          aria-label={isExpanded ? `Hide ${entry.title} items` : `Preview ${entry.title} items`}
          aria-expanded={isExpanded}
          className="grid h-8 w-8 shrink-0 place-items-center bg-transparent text-[#128647]"
        >
          <motion.span
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <LuPlus className="h-4 w-4" />
          </motion.span>
        </motion.button>
        <span className="ml-auto mr-1 text-white/60">{entry.count}</span>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 py-1 pl-6 pr-3">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onSelect(entry.title)}
                  className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-[12px] font-semibold text-white/65 active:bg-white/10"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MenuNavigator({ entries, itemsByCategory, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTitle, setExpandedTitle] = useState(null);
  const rightEdge = "max(1.25rem, calc((100vw - 430px) / 2 + 1.25rem))";

  const selectCategory = (title) => {
    setIsOpen(false);
    onSelect(title);
  };

  const toggleExpand = (title) => {
    setExpandedTitle((current) => (current === title ? null : title));
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close menu categories"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/25"
        />
      ) : null}

      {isOpen ? (
        <nav
          id="menu-category-navigator"
          aria-label="Menu categories"
          style={{ right: rightEdge }}
          className="fixed bottom-[9.5rem] z-50 max-h-[62vh] w-[min(320px,calc(100vw-2.5rem))] overflow-hidden rounded-[24px] border border-white/20 bg-[#232329]/80 p-3 text-white shadow-[0_24px_55px_rgba(0,0,0,0.38)] backdrop-blur-[28px] backdrop-saturate-150"
        >
          <span className="pointer-events-none absolute inset-[1px] rounded-[23px] bg-gradient-to-b from-white/15 via-white/[0.03] to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="text-lg font-black">Menu</p>
              <button
                type="button"
                aria-label="Close menu categories"
                onClick={() => setIsOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(62vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {entries.map((entry) => (
                <CategoryRow
                  key={entry.title}
                  entry={entry}
                  items={itemsByCategory[entry.title] ?? []}
                  isExpanded={expandedTitle === entry.title}
                  onSelect={selectCategory}
                  onToggleExpand={toggleExpand}
                />
              ))}
            </div>
          </div>
        </nav>
      ) : null}

      <motion.button
        type="button"
        aria-label="Open menu navigator"
        aria-expanded={isOpen}
        aria-controls="menu-category-navigator"
        onClick={() => setIsOpen((current) => !current)}
        whileTap={{ scale: 0.93 }}
        style={{ right: rightEdge }}
        className="fixed bottom-[5.75rem] z-50 inline-flex h-12 items-center gap-1.5 overflow-hidden rounded-[18px] border border-white/30 bg-[#232329]/75 px-4 text-base font-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.26)] backdrop-blur-[22px] backdrop-saturate-150"
      >
        <span className="pointer-events-none absolute inset-[1px] rounded-[17px] bg-gradient-to-b from-white/15 via-white/[0.03] to-transparent" />
        <LuUtensils className="relative z-10 h-5 w-5" />
        <span className="relative z-10">Menu</span>
      </motion.button>
    </>
  );
}

export default function PopularChoices({ vegOnly = false, searchQuery = "" }) {
  const { cart, changeQuantity } = useCart();
  const [openSections, setOpenSections] = useState(() =>
    createInitialOpenSections(menuNavigatorEntries)
  );

  const toggleSection = (title) => {
    setOpenSections((current) => ({
      ...current,
      [title]: !current[title],
    }));
  };

  const navigateToSection = (title) => {
    setOpenSections((current) => expandSection(current, title));
    requestAnimationFrame(() => {
      document.getElementById(sectionId(title))?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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
        onIncrement={() => changeQuantity(item, quantity + 1, sectionTitle)}
        onDecrement={() => changeQuantity(item, quantity - 1, sectionTitle)}
      />
    );
  };

  const visibleRecommendedItems = vegOnly
    ? recommendedItems.filter((item) => isVegItem(item, "Recommended"))
    : recommendedItems;

  const searchedRecommendedItems = visibleRecommendedItems.filter((item) =>
    matchesSearch(item, "Recommended", searchQuery)
  );

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
    <section className="w-full bg-transparent px-4 pb-8 pt-2 sm:px-6 lg:pb-8 lg:pt-8">
      <div className="mx-auto max-w-3xl">
        {showRecommended ? (
          <CollapsibleSection
            title="Recommended"
            isOpen={openSections.Recommended}
            onToggle={() => toggleSection("Recommended")}
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
              isOpen={openSections[section.heading]}
              onToggle={() => toggleSection(section.heading)}
            >
              <div className="grid grid-cols-2 gap-4">
                {section.items.map((item) => renderProduct(item, section.heading))}
              </div>
            </CollapsibleSection>
          ))}
        </div>
      </div>
      <MenuNavigator
        entries={menuNavigatorEntries}
        itemsByCategory={itemsByCategory}
        onSelect={navigateToSection}
      />
    </section>
  );
}
