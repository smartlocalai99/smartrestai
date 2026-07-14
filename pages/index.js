import { useMemo, useState } from "react";
import AppShell from "@/components/customer/AppShell";
import MenuCategories from "@/components/customer/MenuCategories";
import PageHead from "@/components/customer/PageHead";
import RestaurantInfo from "@/components/customer/RestaurantInfo";
import ShopByCategories, {
  getMenuSearchSuggestions,
} from "@/components/customer/ShopByCategories";
import TopOfferBanner, { HomeHeader } from "@/components/customer/TopOfferBanner";

export default function Home() {
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchSuggestions = useMemo(
    () => getMenuSearchSuggestions(searchQuery, vegOnly),
    [searchQuery, vegOnly]
  );

  return (
    <>
      <PageHead
        title="SmartRest - Kadapa"
        description="Order fresh Rayalaseema food straight from our Kadapa kitchen."
      />

      <AppShell
        contentClassName="bg-[#f5f5fa]"
        header={
          <HomeHeader
            vegOnly={vegOnly}
            onVegModeChange={setVegOnly}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchSuggestions={searchSuggestions}
          />
        }
      >
        <TopOfferBanner />
        <div className="bg-white">
          <MenuCategories />
          <ShopByCategories vegOnly={vegOnly} searchQuery={searchQuery} />
          <RestaurantInfo />
        </div>
      </AppShell>
    </>
  );
}
