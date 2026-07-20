import { useEffect, useMemo, useRef, useState } from "react";
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
import { getScrollParent } from "@/hooks/useInView";

export default function Home() {
  const { sections } = useMenuData();
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const topRef = useRef(null);

  const searchSuggestions = useMemo(
    () => getMenuSearchSuggestions(sections, searchQuery, vegOnly),
    [sections, searchQuery, vegOnly]
  );

  // Results render at the top of the page. If the reader had already
  // scrolled down before typing, a short results (or "not found") list
  // can leave them stranded past the end of the now-short content —
  // bring them back to where the results actually are.
  const hadQuery = useRef(false);
  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0;
    if (hasQuery && !hadQuery.current) {
      getScrollParent(topRef.current)?.scrollTo({ top: 0, behavior: "smooth" });
    }
    hadQuery.current = hasQuery;
  }, [searchQuery]);

  return (
    <>
      <PageHead
        title="SmartRest - Kadapa"
        description="Order fresh Rayalaseema food straight from our Kadapa kitchen."
      />

      <AppShell contentClassName="bg-[#f5f5fa]">
        <div ref={topRef} />
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
