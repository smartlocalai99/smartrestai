import {
  IoHeartOutline,
  IoHome,
  IoPersonOutline,
  IoReceiptOutline,
} from "react-icons/io5";

const navItems = [
  { label: "Home", icon: IoHome, active: true },
  { label: "Fav", icon: IoHeartOutline },
  { label: "Orders", icon: IoReceiptOutline },
  { label: "Account", icon: IoPersonOutline },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="absolute inset-x-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 grid grid-cols-4 overflow-hidden rounded-[30px] border border-white/55 bg-white/20 px-2 py-2 shadow-[0_18px_45px_rgba(58,22,15,0.22)] backdrop-blur-[22px] backdrop-saturate-150"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-white/20 to-white/5" />
      <span className="pointer-events-none absolute inset-x-5 top-1 h-7 rounded-full bg-white/55 blur-lg" />
      <span className="pointer-events-none absolute inset-x-6 bottom-1 h-5 rounded-full bg-[#f4c45f]/10 blur-xl" />
      <span className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/45" />
      {navItems.map(({ label, icon: Icon, active }) => (
        <button
          type="button"
          key={label}
          aria-current={active ? "page" : undefined}
          className={`relative z-10 flex h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-black ${
            active ? "text-[#b3402a]" : "text-[#4f443b]"
          }`}
        >
          <Icon className="h-7 w-7 shrink-0" />
          <span className="leading-none">{label}</span>
        </button>
      ))}
    </nav>
  );
}
