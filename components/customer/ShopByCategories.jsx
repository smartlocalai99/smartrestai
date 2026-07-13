import Image from "next/image";
import { IoAdd, IoStar } from "react-icons/io5";

const fishImage = "/fish.jpg";
const chilliFishImage = "/chillifish.jpg";
const grillImage = "/grill.jpg";

const recommendedItems = [
  { title: "Mini Mandi Meal", price: "Rs 99", oldPrice: "Rs 129", image: fishImage },
  {
    title: "Continental Special Platter",
    price: "Rs 999",
    oldPrice: "Rs 1199",
    image: chilliFishImage,
  },
  { title: "Grill Fish Special", price: "Rs 289", oldPrice: "Rs 349", image: grillImage },
];

const cardImages = [fishImage, chilliFishImage, grillImage];

const cardPair = (first, second, offset = 0) => [
  { ...first, image: cardImages[offset % cardImages.length] },
  { ...second, image: cardImages[(offset + 1) % cardImages.length] },
];

const menuSections = [
  {
    heading: "Mini Curry Meal (7)",
    cards: cardPair(
      { title: "Mini Chicken Curry", price: "Rs 129", oldPrice: "Rs 169" },
      { title: "Mini Mutton Curry", price: "Rs 159", oldPrice: "Rs 199" },
      0
    ),
  },
  {
    heading: "Continental Special Starters (5)",
    cards: cardPair(
      { title: "Turkish Chicken", price: "Rs 249", oldPrice: "Rs 299" },
      { title: "Chicken Malai Kabab", price: "Rs 229", oldPrice: "Rs 279" },
      1
    ),
  },
  {
    heading: "Mutton Mandi (6)",
    cards: cardPair(
      { title: "Mutton Ghee Roast Mandi", price: "Rs 329", oldPrice: "Rs 389" },
      { title: "Mutton Chops Mandi", price: "Rs 349", oldPrice: "Rs 419" },
      2
    ),
  },
  {
    heading: "Chicken Mandi (7)",
    cards: cardPair(
      { title: "Chicken Mandi", price: "Rs 239", oldPrice: "Rs 289" },
      { title: "Turkish Chicken Mandi", price: "Rs 279", oldPrice: "Rs 329" },
      0
    ),
  },
  {
    heading: "Fish Mandi (3)",
    cards: cardPair(
      { title: "Garlic Fish Mandi", price: "Rs 299", oldPrice: "Rs 349" },
      { title: "BBQ Fish Mandi", price: "Rs 319", oldPrice: "Rs 379" },
      1
    ),
  },
  {
    heading: "Mix Mandi (3)",
    cards: cardPair(
      { title: "Mix Mandi Bowl", price: "Rs 369", oldPrice: "Rs 429" },
      { title: "Family Mix Mandi", price: "Rs 699", oldPrice: "Rs 799" },
      2
    ),
  },
  {
    heading: "Chicken Starters (8)",
    cards: cardPair(
      { title: "Chicken Malai Kabab", price: "Rs 229", oldPrice: "Rs 279" },
      { title: "Boti Kebab", price: "Rs 219", oldPrice: "Rs 259" },
      0
    ),
  },
  {
    heading: "Mutton Starters (5)",
    cards: cardPair(
      { title: "Mutton Chops", price: "Rs 329", oldPrice: "Rs 389" },
      { title: "Mutton Ghee Roast", price: "Rs 349", oldPrice: "Rs 399" },
      1
    ),
  },
  {
    heading: "Seafood Starters (3)",
    cards: cardPair(
      { title: "Garlic Fish", price: "Rs 269", oldPrice: "Rs 319" },
      { title: "Crispy Prawns", price: "Rs 289", oldPrice: "Rs 349" },
      2
    ),
  },
  {
    heading: "Continental Curries (1)",
    cards: cardPair(
      { title: "Continental Chicken Curry", price: "Rs 259", oldPrice: "Rs 319" },
      { title: "Creamy Kabab Curry", price: "Rs 279", oldPrice: "Rs 339" },
      0
    ),
  },
  {
    heading: "Rotis (6)",
    cards: cardPair(
      { title: "Butter Roti", price: "Rs 35", oldPrice: "Rs 45" },
      { title: "Garlic Naan", price: "Rs 55", oldPrice: "Rs 69" },
      1
    ),
  },
  {
    heading: "Special Platters (6)",
    cards: cardPair(
      { title: "Continental Special Platter", price: "Rs 999", oldPrice: "Rs 1199" },
      { title: "BBQ Family Platter", price: "Rs 899", oldPrice: "Rs 1099" },
      2
    ),
  },
  {
    heading: "Desserts (2)",
    cards: cardPair(
      { title: "Royal Dessert", price: "Rs 129", oldPrice: "Rs 159" },
      { title: "Sweet Bowl", price: "Rs 99", oldPrice: "Rs 129" },
      0
    ),
  },
  {
    heading: "Extra & Add Ons (11)",
    cards: cardPair(
      { title: "Extra Dips", price: "Rs 29", oldPrice: "Rs 39" },
      { title: "Extra Rice", price: "Rs 69", oldPrice: "Rs 89" },
      1
    ),
  },
  {
    heading: "Mojitto & Beverages (7)",
    cards: cardPair(
      { title: "Classic Mojitto", price: "Rs 99", oldPrice: "Rs 129" },
      { title: "Fresh Lime Soda", price: "Rs 79", oldPrice: "Rs 99" },
      2
    ),
  },
  {
    heading: "Haleem (4)",
    cards: cardPair(
      { title: "Chicken Haleem", price: "Rs 179", oldPrice: "Rs 219" },
      { title: "Mutton Haleem", price: "Rs 219", oldPrice: "Rs 269" },
      0
    ),
  },
];

function ProductCard({ item }) {
  return (
    <article className="bg-white shadow-[0_10px_24px_rgba(31,16,10,0.12)]">
      <div className="relative h-[150px] w-full overflow-hidden rounded-[20px] bg-[#f2e5d3]">
        <Image
          src={item.image}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover"
        />
      </div>

      <div className="p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] font-black text-[#ef4f61]">
            Bestseller
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-[#dff4ef] px-2 py-1 text-[11px] font-black text-[#329981]">
            <IoStar className="h-3 w-3" />
            3.6
          </span>
        </div>

        <h4 className="min-h-[40px] text-[17px] font-black leading-[1.15] text-[#202020]">
          {item.title}
        </h4>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[13px] font-bold text-[#8b8580] line-through">
              {item.oldPrice}
            </p>
            <p className="inline-flex rounded-sm bg-[#ffdf3f] px-1.5 py-0.5 text-[17px] font-black text-black">
              {item.price}
            </p>
          </div>

          <button
            type="button"
            aria-label={`Add ${item.title}`}
            className="inline-flex h-10 min-w-[76px] items-center justify-center gap-1 rounded-xl border border-[#d8d3cf] bg-white px-3 text-[14px] font-black text-[#36a46a] shadow-sm transition-transform duration-200 active:scale-95"
          >
            ADD
            <IoAdd className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PopularChoices() {
  return (
    <section className="w-full bg-transparent px-4 pb-6 pt-2 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <h2 className="text-[26px] font-black tracking-tight text-[#241610] sm:text-[32px]">
            Recommended
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recommendedItems.map((item) => (
            <ProductCard
              key={item.title}
              item={item}
            />
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-[26px] font-black tracking-tight text-[#241610] sm:text-[32px]">
            Chef Fav
          </h2>

          <div className="space-y-7">
            {menuSections.map((section, index) => (
              <section key={section.heading}>
                <h3
                  className={`mb-3 text-[22px] font-semibold leading-tight ${
                    index === 0 ? "text-[#ef4f61]" : "text-[#202020]"
                  }`}
                >
                  {section.heading}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {section.cards.map((item) => (
                    <ProductCard
                      key={item.title}
                      item={item}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
