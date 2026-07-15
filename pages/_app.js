import { useEffect } from "react";
import Head from "next/head";
import AppProviders from "@/context/AppProviders";
import "@/styles/globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

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
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
          key="viewport"
        />
      </Head>
      <AppProviders>
        <Component {...pageProps} />
      </AppProviders>
    </>
  );
}
