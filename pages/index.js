import Head from "next/head";
import BottomNav from "@/components/customer/BottomNav";
import MenuCategories from "@/components/customer/MenuCategories";
import ShopByCategories from "@/components/customer/ShopByCategories";
import TopOfferBanner from "@/components/customer/TopOfferBanner";

export default function Home() {
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
      </Head>

      <main className="h-dvh w-screen touch-manipulation overflow-hidden overscroll-none bg-[#32120d] p-0 text-[#211712] [-webkit-tap-highlight-color:transparent] sm:grid sm:place-items-center sm:p-6">
        <section className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-2xl sm:rounded-[30px]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(7rem+env(safe-area-inset-bottom))]">
            <TopOfferBanner />
            <MenuCategories />
            <ShopByCategories />
          </div>
          <BottomNav />
        </section>
      </main>
    </>
  );
}
