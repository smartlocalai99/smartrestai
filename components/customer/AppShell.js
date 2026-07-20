import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/customer/BottomNav";

export default function AppShell({
  children,
  contentClassName = "",
  showCheckoutButton = true,
}) {
  const { checkoutSummary } = useCart();

  return (
    <main className="fixed inset-0 touch-manipulation overflow-hidden overscroll-none bg-[#32120d] p-0 text-[#211712] [-webkit-tap-highlight-color:transparent]">
      <section className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-50 bg-[#32120d]"
          style={{ height: "env(safe-area-inset-top)" }}
        />
        {/* Backdrop for the floating nav dock — sized to exactly match the
            content's bottom padding below, so it never covers real content,
            only the reserved gap the nav already floats above. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-[#32120d]"
          style={{ height: "calc(6rem + env(safe-area-inset-bottom))" }}
        />
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(6rem+env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${contentClassName}`}
        >
          {children}
        </div>
        <BottomNav
          checkoutSummary={checkoutSummary}
          showCheckoutButton={showCheckoutButton}
        />
      </section>
    </main>
  );
}
