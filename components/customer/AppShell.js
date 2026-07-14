import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/customer/BottomNav";

export default function AppShell({
  children,
  header,
  contentClassName = "",
  showCheckoutButton = true,
}) {
  const { checkoutSummary } = useCart();

  return (
    <main className="h-dvh w-full touch-manipulation overflow-hidden overscroll-none bg-[#32120d] p-0 text-[#211712] [-webkit-tap-highlight-color:transparent]">
      <section className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white">
        {header ? <div className="shrink-0">{header}</div> : null}
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(7rem+env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${contentClassName}`}
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
