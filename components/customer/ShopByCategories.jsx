import { useMemo, useState } from "react";
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
  LuSearchX,
  LuSoup,
  LuUtensils,
  LuWheat,
  LuX,
} from "react-icons/lu";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useMenuData } from "@/context/MenuDataContext";
import { playFavoriteAddedSound, playFavoriteRemovedSound } from "@/lib/sounds";
import LazyImage from "./LazyImage";
import useInView from "@/hooks/useInView";
import {
  createInitialOpenSections,
  createMenuNavigatorEntries,
  expandSection,
  sectionId,
} from "./menuNavigation.mjs";

const PLACEHOLDER_IMAGE = "/emptyplate.webp";

const foodTraitForItem = (item, sectionTitle = "") => {
  const text = `${item.title} ${item.description ?? ""} ${sectionTitle}`.toLowerCase();

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

const matchesSearch = (item, sectionTitle, query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return `${item.title} ${item.description ?? ""} ${sectionTitle}`
    .toLowerCase()
    .includes(normalizedQuery);
};

export const getMenuSearchSuggestions = (sections, query, vegOnly = false) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const seen = new Set();
  const suggestions = [];

  sections.forEach((section) => {
    section.items.forEach((item) => {
      if (vegOnly && !item.isVeg) return;
      if (!matchesSearch(item, section.heading, normalizedQuery)) return;
      if (seen.has(item.id)) return;

      seen.add(item.id);
      suggestions.push({
        id: item.id,
        title: item.title,
        section: section.heading,
        image: item.imageUrl || PLACEHOLDER_IMAGE,
      });
    });
  });

  return suggestions.slice(0, 6);
};

const CONFETTI_PARTICLES = [
  { angle: 0, distance: 26, color: "#ef4f61", shape: "circle", delay: 0 },
  { angle: 36, distance: 30, color: "#f4c45f", shape: "square", delay: 0.02 },
  { angle: 72, distance: 23, color: "#32120d", shape: "circle", delay: 0.05 },
  { angle: 108, distance: 28, color: "#f4915f", shape: "square", delay: 0.01 },
  { angle: 144, distance: 25, color: "#ef4f61", shape: "circle", delay: 0.06 },
  { angle: 180, distance: 32, color: "#f4c45f", shape: "square", delay: 0.03 },
  { angle: 216, distance: 23, color: "#32120d", shape: "circle", delay: 0.02 },
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
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(item.id);
  const heartControls = useAnimation();
  const [isBursting, setIsBursting] = useState(false);

  const handleFavoriteClick = () => {
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

export function ProductCard({
  item,
  sectionTitle,
  quantity,
  onIncrement,
  onDecrement,
  isOrderingDisabled = false,
}) {
  const trait = foodTraitForItem(item, sectionTitle);
  const TraitIcon = trait.icon;
  const isSoldOut = item.isAvailable === false;

  return (
    <article className={`relative flex h-full flex-col bg-white ${isSoldOut ? "opacity-60" : ""}`}>
      <div className="relative h-[150px] w-full overflow-hidden rounded-[20px] bg-[#f4eee9]">
        <LazyImage
          src={item.imageUrl || PLACEHOLDER_IMAGE}
          alt=""
          aria-hidden="true"
          quality={75}
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover"
        />
        {isSoldOut ? (
          <span className="absolute inset-x-2 bottom-2 rounded-full bg-black/70 px-2 py-1 text-center text-[11px] font-black uppercase tracking-wide text-white">
            Sold out
          </span>
        ) : null}
      </div>
      <FavoriteButton item={item} sectionTitle={sectionTitle} />

      <div className="flex flex-1 flex-col px-1 pb-2 pt-1.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span
            aria-label={item.isVeg ? "Veg" : "Non veg"}
            className={`grid h-4 w-4 place-items-center rounded-[4px] border ${
              item.isVeg ? "border-[#32120d]" : "border-[#ef4f61]"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${item.isVeg ? "bg-[#32120d]" : "bg-[#ef4f61]"}`} />
          </span>

          {item.isBestseller ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff2d6] px-2 py-1 text-[11px] font-black text-[#8f2f1d]">
              Bestseller
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f4f1] px-2 py-1 text-[11px] font-black text-[#3c7c5b]">
              <TraitIcon className="h-3 w-3" />
              {trait.label}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-1.5">
          <h4 className="min-w-0 overflow-hidden text-[16px] font-black leading-[1.08] text-[#202020] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {item.title}
          </h4>
          {item.badgeText ? (
            <span className="shrink-0 rounded-full bg-[#ef4f61] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
              {item.badgeText}
            </span>
          ) : null}
        </div>

        <p className="min-h-[28px] overflow-hidden text-[11px] font-medium leading-[1.25] text-[#756b64] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {item.description || "Freshly prepared and packed for your order."}
        </p>

        <div className="mt-auto flex h-11 items-center justify-between gap-2 pt-1.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <p className="mt-0.5 inline-flex rounded-sm bg-[#ffdf3f] px-1.5 py-0.5 text-[16px] font-black leading-none text-black">
              ₹{item.price}
            </p>
            {item.oldPrice ? (
              <p className="text-[12px] font-bold leading-none text-[#8b8580] line-through">₹{item.oldPrice}</p>
            ) : null}
          </div>

          {isSoldOut ? (
            <span className="inline-flex h-10 min-w-[76px] items-center justify-center rounded-xl border border-[#d8d3cf] px-3 text-[12px] font-black text-[#8b8580]">
              Sold out
            </span>
          ) : quantity > 0 ? (
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
                disabled={isOrderingDisabled}
                whileTap={isOrderingDisabled ? undefined : { scale: 0.85 }}
                className="grid h-full w-8 place-items-center disabled:opacity-40"
              >
                <LuPlus className="h-4 w-4" />
              </motion.button>
            </div>
          ) : isOrderingDisabled ? (
            <span className="inline-flex h-10 min-w-[76px] items-center justify-center rounded-xl border border-[#d8d3cf] px-3 text-[12px] font-black text-[#8b8580]">
              Closed
            </span>
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

function ProductCardSkeleton() {
  return (
    <div className="flex h-[300px] flex-col overflow-hidden rounded-[20px] bg-white">
      <div className="h-[150px] w-full shrink-0 animate-pulse rounded-[20px] bg-[#f4eee9]" />
      <div className="flex flex-1 flex-col gap-2 px-1 pt-2.5">
        <div className="h-3 w-14 animate-pulse rounded-full bg-[#f4eee9]" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#f4eee9]" />
        <div className="h-3 w-full animate-pulse rounded-full bg-[#f4eee9]" />
        <div className="mt-auto h-9 w-full animate-pulse rounded-xl bg-[#f4eee9]" />
      </div>
    </div>
  );
}

// Only mounts the real product cards (and their images) once this grid
// scrolls near the viewport, so a long menu doesn't fetch every photo
// up front. `rootMargin` preloads a bit early so cards are ready before
// the reader actually reaches them.
function LazyItemGrid({ items, renderItem }) {
  const [ref, isInView] = useInView({ rootMargin: "600px" });

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4">
      {isInView
        ? items.map((item) => renderItem(item))
        : items.map((item) => <ProductCardSkeleton key={item.id} />)}
    </div>
  );
}

function CollapsibleSection({
  title,
  badgeText,
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
        <span className="inline-flex min-w-0 items-baseline gap-2">
          <span className="truncate">{title}</span>
          {badgeText ? (
            <span className="shrink-0 self-start rounded-full bg-[#ef4f61] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              {badgeText}
            </span>
          ) : null}
        </span>
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
          className="grid h-8 w-8 shrink-0 place-items-center bg-transparent text-white"
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
  const { sections, isLoading, profile } = useMenuData();
  const { cart, changeQuantity } = useCart();
  const isOrderingDisabled = profile ? profile.busyMode || !profile.isOpen : false;

  const recommendedItems = useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.filter((item) => item.isBestseller).map((item) => ({ ...item, sectionHeading: section.heading }))
      ),
    [sections]
  );

  const menuNavigatorEntries = useMemo(
    () => createMenuNavigatorEntries(recommendedItems, sections),
    [recommendedItems, sections]
  );

  const itemsByCategory = useMemo(
    () => ({
      Recommended: recommendedItems,
      ...Object.fromEntries(sections.map((section) => [section.heading, section.items])),
    }),
    [recommendedItems, sections]
  );

  const [openSections, setOpenSections] = useState(() => createInitialOpenSections(menuNavigatorEntries));

  const toggleSection = (title) => {
    setOpenSections((current) => ({
      ...current,
      [title]: !(current[title] ?? true),
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
        isOrderingDisabled={isOrderingDisabled}
        onIncrement={() => {
          if (item.isAvailable === false || isOrderingDisabled) return;
          changeQuantity(item, quantity + 1, sectionTitle);
        }}
        onDecrement={() => changeQuantity(item, quantity - 1, sectionTitle)}
      />
    );
  };

  const visibleRecommendedItems = vegOnly ? recommendedItems.filter((item) => item.isVeg) : recommendedItems;

  const searchedRecommendedItems = visibleRecommendedItems.filter((item) =>
    matchesSearch(item, "Recommended", searchQuery)
  );

  const visibleMenuSections = sections
    .map((section) => ({
      ...section,
      items: vegOnly ? section.items.filter((item) => item.isVeg) : section.items,
    }))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => matchesSearch(item, section.heading, searchQuery)),
    }))
    .filter((section) => section.items.length > 0);

  const hasResults = searchedRecommendedItems.length > 0 || visibleMenuSections.length > 0;
  const showRecommended = searchQuery.trim().length === 0 || searchedRecommendedItems.length > 0;

  if (isLoading) {
    return null;
  }

  if (sections.length === 0) {
    return (
      <section className="w-full bg-transparent px-4 pb-8 pt-8 text-center sm:px-6">
        <p className="text-lg font-black text-[#241610]">Menu coming soon</p>
        <p className="mt-1 text-sm font-semibold text-[#7d7169]">The restaurant is still setting up its menu.</p>
      </section>
    );
  }

  return (
    <section className="w-full bg-transparent px-4 pb-8 pt-2 sm:px-6 lg:pb-8 lg:pt-8">
      <div className="mx-auto max-w-3xl">
        {showRecommended && recommendedItems.length > 0 ? (
          <CollapsibleSection
            title="Recommended"
            isOpen={openSections.Recommended ?? true}
            onToggle={() => toggleSection("Recommended")}
            titleSize="text-[26px] sm:text-[32px]"
          >
            <LazyItemGrid
              items={searchedRecommendedItems}
              renderItem={(item) => renderProduct(item, "Recommended")}
            />
          </CollapsibleSection>
        ) : null}

        {!hasResults ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-[#f7f2ee] px-4 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#a99a8c]">
              <LuSearchX className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-black text-[#241610]">Item not found</p>
              <p className="mt-1 text-sm font-semibold text-[#7d7169]">
                We couldn&apos;t find that on the menu. Try a different search.
              </p>
            </div>
          </div>
        ) : null}

        <div className={`${showRecommended && recommendedItems.length > 0 ? "mt-8" : "mt-0"} space-y-7`}>
          {visibleMenuSections.map((section) => (
            <CollapsibleSection
              key={section.heading}
              title={section.heading}
              badgeText={section.badgeText}
              isOpen={openSections[section.heading] ?? true}
              onToggle={() => toggleSection(section.heading)}
            >
              <LazyItemGrid
                items={section.items}
                renderItem={(item) => renderProduct(item, section.heading)}
              />
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
