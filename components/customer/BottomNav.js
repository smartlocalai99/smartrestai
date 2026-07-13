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
      className="mx-4 mb-[calc(0.75rem+env(safe-area-inset-bottom))] mt-3 grid shrink-0 grid-cols-4 rounded-[26px] border border-[#211712]/10 bg-[#fffaf0]/95 px-2 py-2 shadow-xl"
    >
      {navItems.map(({ label, icon: Icon, active }) => (
        <button
          type="button"
          key={label}
          aria-current={active ? "page" : undefined}
          className={`flex h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold ${
            active ? "text-[#f04455]" : "text-[#6f6660]"
          }`}
        >
          <Icon className="h-7 w-7 shrink-0" />
          <span className="leading-none">{label}</span>
        </button>
      ))}
    </nav>
  );
}
