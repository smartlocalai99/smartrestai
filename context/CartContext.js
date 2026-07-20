import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "smartrest_cart";
const OFFER_STORAGE_KEY = "smartrest_applied_offer";

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
      const storedOffer = window.localStorage.getItem(OFFER_STORAGE_KEY);
      if (storedOffer) setAppliedOffer(JSON.parse(storedOffer));
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

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedOffer) {
        window.localStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify(appliedOffer));
      } else {
        window.localStorage.removeItem(OFFER_STORAGE_KEY);
      }
    } catch {
      // ignore storage failures
    }
  }, [appliedOffer, isHydrated]);

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

  const clearCart = () => {
    setCart({});
    setAppliedOffer(null);
  };

  const clearAppliedOffer = () => setAppliedOffer(null);

  // Adds every item bundled in this offer to the cart (leaving quantities
  // that are already higher untouched) and remembers the offer so checkout
  // can price those items at the bundle price instead of their sum.
  const applyOffer = (offer) => {
    setCart((current) => {
      const updated = { ...current };
      for (const item of offer.items) {
        const existingQuantity = updated[item.id]?.quantity ?? 0;
        updated[item.id] = {
          item,
          quantity: Math.max(existingQuantity, 1),
          sectionTitle: `Offer: ${offer.title}`,
        };
      }
      return updated;
    });
    setAppliedOffer({
      id: offer.id,
      title: offer.title,
      itemIds: offer.items.map((item) => item.id),
      strikePrice: offer.strikePrice,
      salePrice: offer.salePrice,
    });
  };

  const value = useMemo(() => {
    const items = Object.values(cart);
    const checkoutSummary = items.reduce(
      (summary, entry) => ({
        totalItems: summary.totalItems + entry.quantity,
        totalAmount: summary.totalAmount + entry.item.price * entry.quantity,
      }),
      { totalItems: 0, totalAmount: 0 }
    );

    const isOfferValid = Boolean(
      appliedOffer && appliedOffer.itemIds.every((id) => (cart[id]?.quantity ?? 0) > 0)
    );
    const offerDiscount =
      isOfferValid && appliedOffer.strikePrice != null
        ? Math.max(appliedOffer.strikePrice - appliedOffer.salePrice, 0)
        : 0;

    return {
      cart,
      setCart,
      changeQuantity,
      clearCart,
      items,
      checkoutSummary,
      appliedOffer: isOfferValid ? appliedOffer : null,
      offerDiscount,
      applyOffer,
      clearAppliedOffer,
    };
  }, [cart, appliedOffer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
