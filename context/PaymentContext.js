import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMenuData } from "@/context/MenuDataContext";

const PaymentContext = createContext(null);
const STORAGE_KEY = "smartrest_payment_method";

const FALLBACK_METHODS = [{ id: "cod", label: "Cash on Delivery", enabled: true }];

const NOTES = {
  cod: "Pay with cash when your order arrives.",
  upi: "Pay via GPay, PhonePe, Paytm or any UPI app at checkout.",
  card: "Pay securely by card at checkout.",
};

export function PaymentProvider({ children }) {
  const { profile } = useMenuData();
  const [methodId, setMethodId] = useState("cod");
  const [isHydrated, setIsHydrated] = useState(false);

  const methods = useMemo(() => {
    const list = profile?.paymentMethods?.length ? profile.paymentMethods : FALLBACK_METHODS;
    return list.map((m) => ({ ...m, note: NOTES[m.id] ?? "" }));
  }, [profile]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setMethodId(stored);
    } catch {
      // ignore corrupt storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, methodId);
    } catch {
      // ignore storage failures
    }
  }, [methodId, isHydrated]);

  const value = useMemo(() => {
    const method = methods.find((m) => m.id === methodId) ?? methods[0];
    return { methodId, setMethodId, method, methods };
  }, [methodId, methods]);

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export const usePayment = () => useContext(PaymentContext);
