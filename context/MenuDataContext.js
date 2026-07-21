import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/utils/supabase.js";
import {
  getRestaurantProfile,
  listActiveCategories,
  listActiveMenu,
  listActiveOffers,
} from "@/lib/restaurantData.mjs";
import { createTrailingRefresh } from "@/lib/trailingRefresh.mjs";

const MenuDataContext = createContext(null);

// Same four categories the app used to hardcode. Used only until the
// menu_categories table has rows (e.g. its migration hasn't run yet, or the
// owner hasn't saved any categories), so the home screen never goes blank.
const FALLBACK_CATEGORIES = [
  { id: "fallback-mandi", label: "Mandi", imageUrl: "/mandi9.png", sectionId: null, sectionTitle: "Chicken Mandi" },
  { id: "fallback-starters", label: "Starters", imageUrl: "/starterimg.webp", sectionId: null, sectionTitle: "Chicken Starters" },
  { id: "fallback-rotis", label: "Rotis", imageUrl: "/rotis.png", sectionId: null, sectionTitle: "Rotis" },
  { id: "fallback-desserts", label: "Desserts", imageUrl: "/desert.png", sectionId: null, sectionTitle: "Desserts" },
];

export function MenuDataProvider({ children }) {
  const client = useMemo(() => getSupabase(), []);
  const [profile, setProfile] = useState(null);
  const [sections, setSections] = useState([]);
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const refetch = createTrailingRefresh(async () => {
      try {
        const [nextProfile, nextSections, nextOffers] = await Promise.all([
          getRestaurantProfile(client),
          listActiveMenu(client),
          listActiveOffers(client),
        ]);
        if (cancelled) return;
        setProfile(nextProfile);
        setSections(nextSections);
        setOffers(nextOffers);
      } catch {
        // Existing fallback state remains usable.
      } finally {
        if (!cancelled) setIsLoading(false);
      }

      // Fetched separately: menu_categories may not exist yet (migration not
      // applied), and that shouldn't block the rest of the menu from loading.
      try {
        const nextCategories = await listActiveCategories(client);
        if (!cancelled && nextCategories.length > 0) setCategories(nextCategories);
      } catch {
        // Keep FALLBACK_CATEGORIES.
      }
    });

    refetch();

    const channel = client
      .channel("public:menu-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_profile" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_sections" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_categories" }, refetch)
      .subscribe();

    return () => {
      cancelled = true;
      client.removeChannel(channel);
    };
  }, [client]);

  const value = useMemo(
    () => ({ profile, sections, offers, categories, isLoading }),
    [profile, sections, offers, categories, isLoading]
  );

  return <MenuDataContext.Provider value={value}>{children}</MenuDataContext.Provider>;
}

export function useMenuData() {
  const ctx = useContext(MenuDataContext);
  if (!ctx) throw new Error("useMenuData must be used within MenuDataProvider");
  return ctx;
}
