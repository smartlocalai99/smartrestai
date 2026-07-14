import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "smartrest_cart";

export const DELIVERY_FEE = 40;

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage failures (private browsing, quota, etc.)
    }
  }, [cart, isHydrated]);

  const changeQuantity = (item, nextQuantity, sectionTitle = "") => {
    setCart((current) => {
      const updated = { ...current };
      if (nextQuantity <= 0) {
        delete updated[item.id];
      } else {
        updated[item.id] = { item, quantity: nextQuantity, sectionTitle };
      }
      return updated;
    });
  };

  const clearCart = () => setCart({});

  const value = useMemo(() => {
    const items = Object.values(cart);
    const checkoutSummary = items.reduce(
      (summary, entry) => ({
        totalItems: summary.totalItems + entry.quantity,
        totalAmount: summary.totalAmount + entry.item.price * entry.quantity,
      }),
      { totalItems: 0, totalAmount: 0 }
    );

    return {
      cart,
      setCart,
      changeQuantity,
      clearCart,
      items,
      checkoutSummary,
    };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
