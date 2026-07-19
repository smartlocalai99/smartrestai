import { useMemo, useState } from "react";
import AppShell from "@/components/customer/AppShell";
import MenuCategories from "@/components/customer/MenuCategories";
import PageHead from "@/components/customer/PageHead";
import RestaurantInfo from "@/components/customer/RestaurantInfo";
import ShopByCategories, {
  getMenuSearchSuggestions,
} from "@/components/customer/ShopByCategories";
import TopOfferBanner, {
  HomeLocationBar,
  HomeSearchBar,
} from "@/components/customer/TopOfferBanner";
import { useMenuData } from "@/context/MenuDataContext";

export default function Home() {
  const { sections } = useMenuData();
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchSuggestions = useMemo(
    () => getMenuSearchSuggestions(sections, searchQuery, vegOnly),
    [sections, searchQuery, vegOnly]
  );

  return (
    <>
      <PageHead
        title="SmartRest - Kadapa"
        description="Order fresh Rayalaseema food straight from our Kadapa kitchen."
      />

      <AppShell contentClassName="bg-[#f5f5fa]">
        <HomeLocationBar vegOnly={vegOnly} onVegModeChange={setVegOnly} />
        <HomeSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchSuggestions={searchSuggestions}
        />
        <TopOfferBanner />
        <div id="menu-section" className="bg-white">
          <MenuCategories />
          <ShopByCategories vegOnly={vegOnly} searchQuery={searchQuery} />
          <RestaurantInfo />
        </div>
      </AppShell>
    </>
  );
}
