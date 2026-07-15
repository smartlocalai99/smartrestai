import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createOrder, listOrders } from "@/lib/customerData.mjs";

const OrdersContext = createContext(null);
const STORAGE_KEY = "smartrest_orders";

function readLegacyOrders() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function OrdersProvider({ children }) {
  const { user, isHydrated: isAuthHydrated } = useAuth();
  const phone = user?.phone;
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const refreshOrders = async () => {
    if (!phone) return [];
    setIsLoadingOrders(true);
    setOrdersError("");
    try {
      const remoteOrders = await listOrders(phone);
      setOrders(remoteOrders);
      return remoteOrders;
    } catch (error) {
      setOrdersError("Could not load your orders. Please try again.");
      throw error;
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isAuthHydrated) return undefined;
    let active = true;

    async function loadOrders() {
      await Promise.resolve();
      if (!phone) {
        if (active) {
          setOrders([]);
          setOrdersError("");
          setIsLoadingOrders(false);
        }
        return;
      }

      setIsLoadingOrders(true);
      setOrdersError("");
      try {
        let remoteOrders = await listOrders(phone);
        const legacyOrders = readLegacyOrders();

        if (remoteOrders.length === 0 && legacyOrders.length > 0) {
          for (const order of legacyOrders) {
            try {
              await createOrder(phone, order);
            } catch (error) {
              if (error?.code !== "23505") throw error;
            }
          }
          remoteOrders = await listOrders(phone);
          window.localStorage.removeItem(STORAGE_KEY);
        }

        if (active) setOrders(remoteOrders);
      } catch {
        if (active) setOrdersError("Could not load your orders. Please try again.");
      } finally {
        if (active) setIsLoadingOrders(false);
      }
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, [isAuthHydrated, phone]);

  const placeOrder = async (order) => {
    if (!phone) throw new Error("Log in to place an order.");
    setOrdersError("");
    try {
      const savedOrder = await createOrder(phone, order);
      setOrders((current) => [savedOrder, ...current]);
      return savedOrder;
    } catch (error) {
      setOrdersError("Could not place your order. Your cart is still safe.");
      throw error;
    }
  };

  const value = {
    orders,
    placeOrder,
    refreshOrders,
    isLoadingOrders,
    ordersError,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export const useOrders = () => useContext(OrdersContext);
