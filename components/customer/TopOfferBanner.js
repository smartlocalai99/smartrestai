import { useState } from "react";
import Image from "next/image";
import {
  IoArrowForward,
  IoChevronDown,
  IoHome,
  IoMicOutline,
  IoNotificationsOutline,
  IoSearch,
} from "react-icons/io5";

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

      <button
        type="button"
        aria-label="Notifications"
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff7df] text-[#211712] shadow-lg"
      >
        <IoNotificationsOutline className="h-6 w-6" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#d79b3f] ring-2 ring-[#fff7df]" />
      </button>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="grid h-[52px] grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-xl bg-white px-3 text-[#211712] shadow-xl">
      <IoSearch className="h-6 w-6 shrink-0 text-[#b3402a]" />
      <input
        type="text"
        placeholder="Restaurant name or a dish..."
        aria-label="Search the menu"
        className="min-w-0 bg-transparent text-base font-semibold outline-none placeholder:text-[#8f8780]"
      />
      <span className="h-7 w-px bg-[#211712]/10" />
      <button
        type="button"
        aria-label="Search by voice"
        className="grid h-8 w-8 place-items-center rounded-lg bg-[#b3402a]/10 text-[#b3402a]"
      >
        <IoMicOutline className="h-6 w-6" />
      </button>
    </div>
  );
}

function VegModeToggle() {
  const [vegOnly, setVegOnly] = useState(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={vegOnly}
      aria-label="Veg only mode"
      onClick={() => setVegOnly((value) => !value)}
      className="flex h-[52px] w-full flex-col items-center justify-center gap-1"
    >
      <span className="w-full text-center text-[11px] font-black leading-[1.05] tracking-wide text-white drop-shadow">
        VEG
        <br />
        MODE
      </span>
      <span
        className={`relative h-6 w-12 rounded-full p-0.5 shadow-lg ring-1 ring-white/60 transition-colors ${
          vegOnly ? "bg-[#d79b3f]" : "bg-white/80"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            vegOnly ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function OfferCopy() {
  return (
    <div className="relative z-10 mt-11 max-w-[210px]">
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
    <section className="relative shrink-0 overflow-hidden rounded-b-[34px] bg-[#3a160f] px-5 pb-8 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_54%,rgba(238,192,106,0.3),transparent_30%),radial-gradient(circle_at_8%_12%,rgba(196,73,42,0.65),transparent_32%),linear-gradient(135deg,#5b2115_0%,#30120d_52%,#120a07_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 to-transparent" />
      <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_20%_65%,rgba(215,155,63,0.18),transparent_42%)]" />
      <Image
        src="/mandi99.png"
        alt=""
        aria-hidden="true"
        width={1500}
        height={1024}
        priority
        className="absolute left-48 top-36 w-[304px] max-w-none rotate-1 drop-shadow-2xl"
      />

      <LocationHeader />

      <div className="relative z-10 mt-5 grid grid-cols-[minmax(0,1fr)_72px] gap-3">
        <SearchBar />
        <VegModeToggle />
      </div>

      <OfferCopy />
    </section>
  );
}
