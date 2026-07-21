import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMenuData } from "@/context/MenuDataContext";
import {
  normalizePaymentMethods,
  resolvePaymentMethodId,
} from "@/lib/restaurantData.mjs";

const PaymentContext = createContext(null);
const STORAGE_KEY = "smartrest_payment_method";

const NOTES = {
  cod: "Pay with cash when your order arrives.",
  upi: "Pay via GPay, PhonePe, Paytm or any UPI app at checkout.",
};

export function PaymentProvider({ children }) {
  const { profile } = useMenuData();
  const [methodId, setMethodId] = useState("cod");
  const [isHydrated, setIsHydrated] = useState(false);

  const methods = useMemo(() => {
    return normalizePaymentMethods(profile?.paymentMethods).map((method) => ({
      ...method,
      note: NOTES[method.id] ?? "",
    }));
  }, [profile]);
  const resolvedMethodId = resolvePaymentMethodId(methodId, methods);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setMethodId(stored);
      } catch {
        // ignore corrupt storage
      }
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, resolvedMethodId);
    } catch {
      // ignore storage failures
    }
  }, [resolvedMethodId, isHydrated]);

  const value = useMemo(() => {
    const method = methods.find((candidate) => candidate.id === resolvedMethodId) ?? methods[0];
    return {
      methodId: resolvedMethodId,
      setMethodId,
      method,
      methods,
      isHydrated,
    };
  }, [resolvedMethodId, methods, isHydrated]);

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export const usePayment = () => useContext(PaymentContext);
