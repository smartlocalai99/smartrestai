import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import { IoChevronDown, IoHome, IoMicOutline, IoSearch } from "react-icons/io5";
import { useCart } from "@/context/CartContext";
import { useMenuData } from "@/context/MenuDataContext";
import LazyImage from "./LazyImage";

function VegModeToggle({ vegOnly, onChange }) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={vegOnly}
      aria-label="Veg or non-veg mode"
      onClick={() => onChange(!vegOnly)}
      whileTap={{ scale: 0.92 }}
      className="flex h-11 w-[74px] shrink-0 flex-col items-center justify-center gap-1 rounded-full bg-black/10 px-2 backdrop-blur-sm"
    >
      <span className="w-full text-center text-[9px] font-black leading-none tracking-wide text-white drop-shadow">
        {vegOnly ? "VEG" : "NON VEG"}
      </span>

      <span className="relative h-5 w-11 rounded-full bg-white p-0.5 shadow-lg ring-1 ring-white/70">
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 32 }}
          className={`absolute top-0.5 h-4 w-4 rounded-full shadow-md ${
            vegOnly ? "bg-[#3f7a54]" : "bg-[#d79b3f]"
          }`}
          style={{ left: vegOnly ? 26 : 2 }}
        />
      </span>
    </motion.button>
  );
}

function LocationHeader({ vegOnly, onVegModeChange }) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-4">
      <motion.button
        type="button"
        aria-label="Change delivery location"
        whileTap={{ scale: 0.96 }}
        className="flex min-w-0 items-center gap-2 rounded-full"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff7df] text-[#8f2f1d] shadow-lg">
          <IoHome className="h-5 w-5" />
        </span>

        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xl font-black leading-none">
            Kadapa
          </span>
          <IoChevronDown className="mt-0.5 h-4 w-4 shrink-0" />
        </span>
      </motion.button>

      <VegModeToggle
        vegOnly={vegOnly}
        onChange={onVegModeChange}
      />
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  suggestions = [],
  onSuggestionSelect = () => {},
}) {
  const searchRef = useRef(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const hasSuggestions =
    isSuggestionsOpen && value.trim().length > 0 && suggestions.length > 0;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      ref={searchRef}
      className="relative"
    >
      <div className="grid h-[52px] grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-xl bg-white px-3 text-black shadow-xl">
        <IoSearch className="h-6 w-6 shrink-0 text-black" />

        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsSuggestionsOpen(true);
          }}
          onFocus={() => setIsSuggestionsOpen(true)}
          placeholder="Restaurant name or a dish..."
          aria-label="Search the menu"
          className="min-w-0 bg-transparent text-base font-semibold text-black outline-none placeholder:text-black/45"
        />

        <span className="h-7 w-px bg-black/10" />

        <motion.button
          type="button"
          aria-label="Search by voice"
          whileTap={{ scale: 0.88 }}
          className="grid h-8 w-8 place-items-center rounded-lg bg-black/5 text-black"
        >
          <IoMicOutline className="h-6 w-6" />
        </motion.button>
      </div>

      {hasSuggestions ? (
        <div className="absolute inset-x-0 top-[58px] z-50 max-h-64 overflow-y-auto rounded-xl bg-white p-1 text-black shadow-2xl ring-1 ring-black/5">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion.id}
              onClick={() => {
                onSuggestionSelect(suggestion.title);
                setIsSuggestionsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left active:bg-black/5"
            >
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f4eee9]">
                {suggestion.image ? (
                  <LazyImage src={suggestion.image} alt="" aria-hidden="true" sizes="44px" className="object-cover" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black leading-tight text-[#201814]">
                  {suggestion.title}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-semibold text-[#7b7169]">
                  {suggestion.section}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OfferCard({ offer, onOrderNow }) {
  return (
    <button
      type="button"
      aria-label={`Order ${offer.title}`}
      onClick={() => onOrderNow(offer)}
      className="relative aspect-[16/9] w-full shrink-0 snap-center overflow-hidden bg-[#32120d] transition-opacity duration-150 active:opacity-90"
    >
      <LazyImage
        src={offer.imageUrl || "/emptyplate.webp"}
        alt={offer.title}
        sizes="430px"
        quality={75}
        priority
        skeletonClassName="bg-[#32120d]"
        className="object-cover"
      />
    </button>
  );
}

export function HomeLocationBar({ vegOnly = false, onVegModeChange = () => {} }) {
  return (
    <section className="relative shrink-0 overflow-hidden bg-[#32120d] px-5 pb-5 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
      <LocationHeader
        vegOnly={vegOnly}
        onVegModeChange={onVegModeChange}
      />
    </section>
  );
}

export function HomeSearchBar({
  searchQuery = "",
  onSearchChange = () => {},
  searchSuggestions = [],
}) {
  return (
    <div className="sticky top-[env(safe-area-inset-top)] z-40 overflow-visible bg-[#32120d] px-5 pb-3 pt-[3px] text-white">
      <div className="relative z-10">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          suggestions={searchSuggestions}
          onSuggestionSelect={onSearchChange}
        />
      </div>
    </div>
  );
}

export default function TopOfferBanner() {
  const { offers } = useMenuData();
  const { applyOffer } = useCart();
  const router = useRouter();
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleOrderNow = (offer) => {
    applyOffer(offer);
    router.push("/checkout");
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || offers.length < 2) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), offers.length - 1));
  };

  if (offers.length === 0) return null;

  return (
    <section className="relative shrink-0 overflow-hidden bg-[#32120d]">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onOrderNow={handleOrderNow} />
        ))}
      </div>

      {offers.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5 py-2.5">
          {offers.map((offer, index) => (
            <span
              key={offer.id}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === activeIndex ? "w-5 bg-[#f4c45f]" : "w-1.5 bg-white/25"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
