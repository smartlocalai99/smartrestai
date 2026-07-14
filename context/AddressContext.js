import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AddressContext = createContext(null);
const STORAGE_KEY = "smartrest_addresses";

const makeId = () => Math.random().toString(36).slice(2, 10);

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setAddresses(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      // ignore storage failures
    }
  }, [addresses, isHydrated]);

  const addAddress = (data) => {
    setAddresses((current) => {
      const entry = { id: makeId(), ...data };
      const next = current.length === 0 ? [{ ...entry, isDefault: true }] : [...current, entry];
      return next;
    });
  };

  const updateAddress = (id, data) => {
    setAddresses((current) => current.map((addr) => (addr.id === id ? { ...addr, ...data } : addr)));
  };

  const removeAddress = (id) => {
    setAddresses((current) => {
      const wasDefault = current.find((addr) => addr.id === id)?.isDefault;
      const next = current.filter((addr) => addr.id !== id);
      if (wasDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
      return next;
    });
  };

  const setDefault = (id) => {
    setAddresses((current) => current.map((addr) => ({ ...addr, isDefault: addr.id === id })));
  };

  const value = useMemo(
    () => ({
      addresses,
      addAddress,
      updateAddress,
      removeAddress,
      setDefault,
      defaultAddress: addresses.find((addr) => addr.isDefault) ?? addresses[0] ?? null,
    }),
    [addresses]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export const useAddresses = () => useContext(AddressContext);
