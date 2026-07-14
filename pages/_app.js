import { useEffect } from "react";
import { Fraunces, Inter } from "next/font/google";
import AppProviders from "@/context/AppProviders";
import "@/styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
  style: ["italic", "normal"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    <div className={`${fraunces.variable} ${inter.variable}`}>
      <AppProviders>
        <Component {...pageProps} />
      </AppProviders>
    </div>
  );
}
