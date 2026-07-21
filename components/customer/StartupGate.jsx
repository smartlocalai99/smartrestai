import { useEffect, useState } from "react";
import BrandedSplash from "@/components/customer/BrandedSplash";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useMenuData } from "@/context/MenuDataContext";
import { usePayment } from "@/context/PaymentContext";

const FAIL_SAFE_MS = 8000;
const EXIT_MS = 250;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export default function StartupGate({ children }) {
  const { isLoading: isMenuLoading } = useMenuData();
  const { isHydrated: isAuthHydrated } = useAuth();
  const { isHydrated: isCartHydrated } = useCart();
  const { isHydrated: isFavoritesHydrated } = useFavorites();
  const { isLoadingAddresses } = useAddresses();
  const { isHydrated: isPaymentHydrated } = usePayment();
  const [phase, setPhase] = useState("visible");

  const isReady =
    !isMenuLoading &&
    isAuthHydrated &&
    isCartHydrated &&
    isFavoritesHydrated &&
    !isLoadingAddresses &&
    isPaymentHydrated;

  useEffect(() => {
    if (phase !== "visible") return undefined;

    const timer = window.setTimeout(
      () => setPhase(prefersReducedMotion() ? "hidden" : "exiting"),
      isReady ? 0 : FAIL_SAFE_MS
    );

    return () => window.clearTimeout(timer);
  }, [isReady, phase]);

  useEffect(() => {
    if (phase !== "exiting") return undefined;

    const timer = window.setTimeout(() => setPhase("hidden"), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const isVisible = phase !== "hidden";

  return (
    <>
      <div
        inert={isVisible ? true : undefined}
        aria-hidden={isVisible ? true : undefined}
      >
        {children}
      </div>
      {isVisible ? <BrandedSplash isExiting={phase === "exiting"} /> : null}
    </>
  );
}
