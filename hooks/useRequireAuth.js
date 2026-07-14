import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function useRequireAuth() {
  const router = useRouter();
  const { isLoggedIn, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isHydrated, isLoggedIn, router]);

  return { isReady: isHydrated && isLoggedIn };
}
