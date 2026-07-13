import { useMemo, useState } from "react";
import Head from "next/head";
import BottomNav from "@/components/customer/BottomNav";
import MenuCategories from "@/components/customer/MenuCategories";
import ShopByCategories, {
  getMenuSearchSuggestions,
} from "@/components/customer/ShopByCategories";
import TopOfferBanner from "@/components/customer/TopOfferBanner";

export default function Home() {
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const checkoutSummary = useMemo(
    () =>
      Object.values(cart).reduce(
        (summary, entry) => ({
          totalItems: summary.totalItems + entry.quantity,
          totalAmount: summary.totalAmount + entry.item.price * entry.quantity,
        }),
        { totalItems: 0, totalAmount: 0 }
      ),
    [cart]
  );

  const searchSuggestions = useMemo(
    () => getMenuSearchSuggestions(searchQuery, vegOnly),
    [searchQuery, vegOnly]
  );

  return (
    <>
      <Head>
        <title>SmartRest - Kadapa</title>
        <meta
          name="description"
          content="Order fresh Rayalaseema food straight from our Kadapa kitchen."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#32120d" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <main className="h-dvh w-screen touch-manipulation overflow-hidden overscroll-none bg-[#32120d] p-0 text-[#211712] [-webkit-tap-highlight-color:transparent] sm:grid sm:place-items-center sm:p-6">
        <section className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#32120d] shadow-2xl sm:rounded-[30px]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(7rem+env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TopOfferBanner
              vegOnly={vegOnly}
              onVegModeChange={setVegOnly}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchSuggestions={searchSuggestions}
            />
            <div className="bg-white">
              <MenuCategories />
              <ShopByCategories
                vegOnly={vegOnly}
                cart={cart}
                onCartChange={setCart}
                searchQuery={searchQuery}
              />
            </div>
          </div>
          <BottomNav checkoutSummary={checkoutSummary} />
        </section>
      </main>
    </>
  );
}
