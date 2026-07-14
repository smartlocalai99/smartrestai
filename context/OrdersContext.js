import { createContext, useContext, useEffect, useMemo, useState } from "react";

const OrdersContext = createContext(null);
const STORAGE_KEY = "smartrest_orders";

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setOrders(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore storage failures
    }
  }, [orders, isHydrated]);

  const placeOrder = (order) => {
    setOrders((current) => [order, ...current]);
  };

  const value = useMemo(() => ({ orders, placeOrder }), [orders]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export const useOrders = () => useContext(OrdersContext);
