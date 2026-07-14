import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/customer/BottomNav";

export default function AppShell({ children, contentClassName = "" }) {
  const { checkoutSummary } = useCart();

  return (
    <main className="h-dvh w-screen touch-manipulation overflow-hidden overscroll-none bg-[#32120d] p-0 text-[#211712] [-webkit-tap-highlight-color:transparent] sm:grid sm:place-items-center sm:p-6">
      <section className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-2xl sm:rounded-[30px]">
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(7rem+env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${contentClassName}`}
        >
          {children}
        </div>
        <BottomNav checkoutSummary={checkoutSummary} />
      </section>
    </main>
  );
}
