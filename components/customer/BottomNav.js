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
      className="relative mx-4 mb-[calc(0.75rem+env(safe-area-inset-bottom))] mt-3 grid shrink-0 grid-cols-4 overflow-hidden rounded-[28px] border border-white/45 bg-white/35 px-2 py-2 shadow-2xl shadow-[#3a160f]/15 backdrop-blur-2xl"
    >
      <span className="pointer-events-none absolute inset-x-3 top-1 h-8 rounded-full bg-white/35 blur-md" />
      <span className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/35" />
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
