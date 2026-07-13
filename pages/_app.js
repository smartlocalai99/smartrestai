import { Fraunces, Inter } from "next/font/google";
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
  return (
    <div className={`${fraunces.variable} ${inter.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
