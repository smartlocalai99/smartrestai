import { useState } from "react";
import Image from "next/image";
import {
  IoArrowForward,
  IoChevronDown,
  IoHome,
  IoMicOutline,
  IoSearch,
} from "react-icons/io5";

function VegModeToggle() {
  const [vegOnly, setVegOnly] = useState(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={vegOnly}
      aria-label="Veg or non-veg mode"
      onClick={() => setVegOnly((value) => !value)}
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

function LocationHeader() {
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
          <span className="truncate text-xl font-black leading-none">Kadapa</span>
          <IoChevronDown className="mt-0.5 h-4 w-4 shrink-0" />
        </span>
      </button>

      <VegModeToggle />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="grid h-[52px] grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-xl bg-[#4b1b12] px-3 text-[#fff7df] shadow-xl">
      <IoSearch className="h-6 w-6 shrink-0 text-[#f4c45f]" />
      <input
        type="text"
        placeholder="Restaurant name or a dish..."
        aria-label="Search the menu"
        className="min-w-0 bg-transparent text-base font-semibold outline-none placeholder:text-[#d8b99b]"
      />
      <span className="h-7 w-px bg-[#f4c45f]/20" />
      <button
        type="button"
        aria-label="Search by voice"
        className="grid h-8 w-8 place-items-center rounded-lg bg-[#f4c45f]/15 text-[#f4c45f]"
      >
        <IoMicOutline className="h-6 w-6" />
      </button>
    </div>
  );
}

function OfferCopy() {
  return (
    <div className="relative z-10 max-w-[210px]">
      <p className="text-[34px] font-black leading-[0.98] tracking-tight">
        Get Mini
        <br />
        Mandi at 99
      </p>
      <p className="mt-2 text-base font-extrabold leading-5 text-white/90">
        Fresh mandi bowl, limited-time app offer.
      </p>
      <button
        type="button"
        className="mt-5 flex h-10 items-center gap-2 rounded-full bg-[#f4c45f] px-5 text-sm font-black text-[#3a160f] shadow-xl shadow-black/20"
      >
        Order Now
        <IoArrowForward className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function TopOfferBanner() {
  return (
    <>
      <section className="relative shrink-0 overflow-hidden bg-[#32120d] px-5 pb-5 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
        <LocationHeader />
      </section>

      <div className="sticky top-0 z-40 overflow-hidden bg-[#32120d] px-5  text-white">
        <div className="relative z-10">
          <SearchBar />
        </div>
      </div>

      <section className="relative shrink-0 overflow-hidden bg-[#32120d] px-5 pb-8 pt-7 text-white">
        <Image
          src="/mandi99.png"
          alt=""
          aria-hidden="true"
          width={1500}
          height={1024}
          priority
          className="absolute left-48 top-12 w-[304px] max-w-none rotate-1 drop-shadow-2xl"
        />

        <OfferCopy />
      </section>
    </>
  );
}
