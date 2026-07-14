import { useEffect } from "react";
import AppProviders from "@/context/AppProviders";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister()))
        )
        .then(() => caches?.keys?.())
        .then((keys) => Promise.all((keys || []).map((key) => caches.delete(key))))
        .catch(() => {});
      return;
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker);
    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
