import { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "smartrest_favorites";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage failures
    }
  }, [favorites, isHydrated]);

  const toggleFavorite = (item, sectionTitle = "") => {
    setFavorites((current) => {
      const updated = { ...current };
      if (updated[item.id]) {
        delete updated[item.id];
      } else {
        updated[item.id] = { item, sectionTitle };
      }
      return updated;
    });
  };

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite: (id) => Boolean(favorites[id]),
      items: Object.values(favorites),
      isHydrated,
    }),
    [favorites, isHydrated]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
