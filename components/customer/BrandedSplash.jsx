import Image from "next/image";

export default function BrandedSplash({ isExiting, onLogoReady }) {
  return (
    <div
      role="status"
      aria-label="Loading Mandi Kings"
      className={`startup-splash${isExiting ? " startup-splash--exiting" : ""}`}
    >
      <Image
        src="/pwa-icon-512.png"
        alt="Mandi Kings"
        width={512}
        height={512}
        sizes="260px"
        preload
        unoptimized
        onLoad={onLogoReady}
        onError={onLogoReady}
        className="startup-splash__logo"
      />
    </div>
  );
}
