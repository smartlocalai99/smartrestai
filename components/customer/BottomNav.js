import { useRouter } from "next/router";
import { motion } from "motion/react";
import {
  IoChevronForward,
  IoHeartOutline,
  IoHome,
  IoPersonOutline,
  IoReceiptOutline,
  IoRestaurantOutline,
} from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Home", href: "/", icon: IoHome, protected: false },
  { label: "Fav", href: "/favorites", icon: IoHeartOutline, protected: false },
  { label: "Orders", href: "/orders", icon: IoReceiptOutline, protected: false },
  { label: "Account", href: "/account", icon: IoPersonOutline, protected: false },
];

function CheckoutButton({ summary, onClick }) {
  return (
    <div className="absolute inset-x-4 bottom-[env(safe-area-inset-bottom)] z-40">
      <button
        type="button"
        onClick={onClick}
        className="flex h-[72px] w-full items-center justify-between rounded-[30px] bg-[#32120d] px-5 text-white shadow-[0_18px_38px_rgba(50,18,13,0.32)] transition-transform duration-200 active:scale-[0.98]"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
            <IoRestaurantOutline className="h-6 w-6" />
          </span>
          <span className="text-left">
            <span className="block text-sm font-black leading-none">
              {summary.totalItems} item{summary.totalItems === 1 ? "" : "s"} added
            </span>
            <span className="mt-1 block text-xs font-bold leading-none text-white/80">
              ₹{summary.totalAmount} total
            </span>
          </span>
        </span>

        <span className="flex items-center gap-1 text-base font-black">
          Checkout
          <IoChevronForward className="h-5 w-5" />
        </span>
      </button>
    </div>
  );
}

export default function BottomNav({
  checkoutSummary,
  showCheckoutButton = true,
}) {
  const router = useRouter();
  const { isLoggedIn, isHydrated } = useAuth();

  const goTo = (href, requiresAuth) => {
    if (requiresAuth && isHydrated && !isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    router.push(href);
  };

  if (showCheckoutButton && checkoutSummary?.totalItems > 0) {
    return (
      <CheckoutButton
        summary={checkoutSummary}
        onClick={() => goTo("/checkout", false)}
      />
    );
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="absolute inset-x-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 grid grid-cols-4 overflow-hidden rounded-[26px] border border-white/45 bg-white/[0.42] px-2 py-1.5 backdrop-blur-[42px] backdrop-saturate-150"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/35 to-white/15" />
      <span className="pointer-events-none absolute inset-x-5 top-1 h-7 rounded-full bg-white/60 blur-lg" />
      <span className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/45" />
      {navItems.map(({ label, href, icon: Icon, protected: requiresAuth }) => {
        const isActive = router.pathname === href;

        return (
          <motion.button
            type="button"
            key={label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => goTo(href, requiresAuth)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={`relative z-10 flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-black transition-colors duration-150 ${isActive ? "text-[#b3402a]" : "text-black"
              }`}
          >
            <Icon className="h-6 w-6 shrink-0" />
            <span className="leading-none">{label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
