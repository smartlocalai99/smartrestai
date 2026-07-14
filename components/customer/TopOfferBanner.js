import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  IoArrowForward,
  IoChevronDown,
  IoHome,
  IoMicOutline,
  IoSearch,
} from "react-icons/io5";

function VegModeToggle({ vegOnly, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={vegOnly}
      aria-label="Veg or non-veg mode"
      onClick={() => onChange(!vegOnly)}
      className="flex h-11 w-[74px] shrink-0 flex-col items-center justify-center gap-1 rounded-full bg-black/10 px-2 backdrop-blur-sm"
    >
      <span className="w-full text-center text-[9px] font-black leading-none tracking-wide text-white drop-shadow">
        {vegOnly ? "VEG" : "NON VEG"}
      </span>

      <span className="relative h-5 w-11 rounded-full bg-white p-0.5 shadow-lg ring-1 ring-white/70">
        <span
          className={`block h-4 w-4 rounded-full shadow-md transition-transform duration-200 ${
            vegOnly ? "translate-x-6" : "translate-x-0"
          } ${vegOnly ? "bg-[#3f7a54]" : "bg-[#d79b3f]"}`}
        />
      </span>
    </button>
  );
}

function LocationHeader({ vegOnly, onVegModeChange }) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-4">
      <button
        type="button"
        aria-label="Change delivery location"
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
      </button>

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

        <button
          type="button"
          aria-label="Search by voice"
          className="grid h-8 w-8 place-items-center rounded-lg bg-black/5 text-black"
        >
          <IoMicOutline className="h-6 w-6" />
        </button>
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
                  <Image
                    src={suggestion.image}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
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

function OfferCopy() {
  return (
    <div className="relative z-10 max-w-[250px]">
      <p className="text-[18px] font-extrabold uppercase tracking-[0.12em] text-[#f4c45f]">
        Limited-time offer
      </p>

      <h1 className="mt-2 text-[35px] font-black leading-[0.95] tracking-tight text-white">
        Get Your
        <br />
        Mini Mandi
      </h1>

      <div className="mt-4 flex w-[240px] items-end">
        <span className="pb-1 text-[21px] font-extrabold text-white/55 line-through decoration-[#ff8a70] decoration-[3px]">
          ₹129
        </span>

        <span
          className="pl-2 font-serif text-[56px] font-black italic leading-none tracking-[-0.03em] text-[#ffbd2e] drop-shadow-[0_5px_0_#8f2f1d]"
          style={{
            WebkitTextStroke: "1.5px #fff4d1",
            paintOrder: "stroke fill",
          }}
        >
          ₹99
        </span>
      </div>

      <p className="mt-4 max-w-[225px] text-[15px] font-bold leading-5 text-white/85">
        A delicious mini mandi meal packed with flavour at a special price.
      </p>

      <button
        type="button"
        className="mt-5 flex h-10 items-center gap-2 rounded-full bg-[#f4c45f] px-5 text-sm font-black text-[#3a160f] shadow-xl shadow-black/20 transition-transform duration-200 active:scale-95"
      >
        Order Now
        <IoArrowForward className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function TopOfferBanner({
  vegOnly = false,
  onVegModeChange = () => {},
  searchQuery = "",
  onSearchChange = () => {},
  searchSuggestions = [],
}) {
  return (
    <>
      <section className="relative shrink-0 overflow-hidden bg-[#32120d] px-5 pb-5 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
        <LocationHeader
          vegOnly={vegOnly}
          onVegModeChange={onVegModeChange}
        />
      </section>

      <div className="sticky top-0 z-40 overflow-visible bg-[#32120d] px-5 pb-3 pt-[3px] text-white">
        <div className="relative z-10">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            suggestions={searchSuggestions}
            onSuggestionSelect={onSearchChange}
          />
        </div>
      </div>

      <section className="relative min-h-[355px] shrink-0 overflow-hidden bg-[#32120d] px-5 pb-8 text-white">
        <div className="pointer-events-none absolute -right-24 top-8 h-[310px] w-[310px] rounded-full bg-[#8f2f1d]/35 blur-3xl" />

        <Image
          src="/mandi99.png"
          alt="Mini mandi special offer"
          width={550}
          height={550}
          priority
          className="absolute left-[218px] top-[108px] w-[275px] max-w-none rotate-1 object-contain drop-shadow-2xl"
        />

        <OfferCopy />
      </section>
    </>
  );
}
