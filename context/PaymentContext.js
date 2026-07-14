import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PaymentContext = createContext(null);
const STORAGE_KEY = "smartrest_payment_method";

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", note: "Pay with cash when your order arrives." },
  { id: "upi", label: "UPI", note: "Pay via GPay, PhonePe, Paytm or any UPI app at checkout." },
  { id: "card", label: "Credit / Debit Card", note: "Pay securely by card at checkout." },
];

export function PaymentProvider({ children }) {
  const [methodId, setMethodId] = useState("cod");
  const [isHydrated, setIsHydrated] = useState(false);

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

  const value = useMemo(
    () => ({
      methodId,
      setMethodId,
      method: PAYMENT_METHODS.find((m) => m.id === methodId) ?? PAYMENT_METHODS[0],
    }),
    [methodId]
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export const usePayment = () => useContext(PaymentContext);
