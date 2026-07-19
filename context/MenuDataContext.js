import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/utils/supabase.js";
import { getRestaurantProfile, listActiveMenu, listActiveOffers } from "@/lib/restaurantData.mjs";

const MenuDataContext = createContext(null);

export function MenuDataProvider({ children }) {
  const client = useMemo(() => getSupabase(), []);
  const [profile, setProfile] = useState(null);
  const [sections, setSections] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function refetch() {
      Promise.all([getRestaurantProfile(client), listActiveMenu(client), listActiveOffers(client)])
        .then(([nextProfile, nextSections, nextOffers]) => {
          if (cancelled) return;
          setProfile(nextProfile);
          setSections(nextSections);
          setOffers(nextOffers);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }

    refetch();

    const channel = client
      .channel("public:menu-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_profile" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_sections" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, refetch)
      .subscribe();

    return () => {
      cancelled = true;
      client.removeChannel(channel);
    };
  }, [client]);

  const value = useMemo(
    () => ({ profile, sections, offers, isLoading }),
    [profile, sections, offers, isLoading]
  );

  return <MenuDataContext.Provider value={value}>{children}</MenuDataContext.Provider>;
}

export function useMenuData() {
  const ctx = useContext(MenuDataContext);
  if (!ctx) throw new Error("useMenuData must be used within MenuDataProvider");
  return ctx;
}
