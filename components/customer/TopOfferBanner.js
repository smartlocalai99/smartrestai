import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "motion/react";
import {
  IoChevronDown,
  IoLocationOutline,
  IoMicOutline,
  IoSearch,
} from "react-icons/io5";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useMenuData } from "@/context/MenuDataContext";
import LazyImage from "./LazyImage";
import VegModeToggle from "./VegModeToggle";

function LocationHeader({ vegOnly, onVegModeChange, onLocationClick }) {
  const { isLoggedIn } = useAuth();
  const { defaultAddress } = useAddresses();
  const displayAddress =
    isLoggedIn && defaultAddress?.line?.trim()
      ? defaultAddress.line.trim()
      : "Kadapa";

  return (
    <div className="relative z-10 flex items-center justify-between gap-4">
      <motion.button
        type="button"
        aria-label={`Change delivery location. Current location: ${displayAddress}`}
        onClick={onLocationClick}
        whileTap={{ scale: 0.96 }}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-full text-left"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff7df] text-[#8f2f1d] shadow-lg">
          <IoLocationOutline className="h-5 w-5" aria-hidden="true" />
        </span>

        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-black leading-tight">
            {displayAddress}
          </span>
          <IoChevronDown className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        </span>
      </motion.button>

      <VegModeToggle vegOnly={vegOnly} onChange={onVegModeChange} />
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

export function HomeLocationBar({
  vegOnly = false,
  onVegModeChange = () => {},
  onLocationClick = () => {},
}) {
  return (
    <section className="relative shrink-0 overflow-hidden bg-[#32120d] px-5 pb-5 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
      <LocationHeader
        vegOnly={vegOnly}
        onVegModeChange={onVegModeChange}
        onLocationClick={onLocationClick}
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
    <section className="relative shrink-0 overflow-hidden">
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
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5">
          {offers.map((offer, index) => (
            <span
              key={offer.id}
              className={`h-1.5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${
                index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
