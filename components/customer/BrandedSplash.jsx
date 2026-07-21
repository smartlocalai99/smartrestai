import Image from "next/image";

export default function BrandedSplash({ isExiting, onLogoReady }) {
  return (
    <div
      role="status"
      aria-label="Loading Mandi Kings"
      className={`startup-splash${isExiting ? " startup-splash--exiting" : ""}`}
    >
      <Image
        src="/bannerlogin.png"
        alt="Mandi Kings welcome banner"
        width={1600}
        height={800}
        sizes="(max-width: 430px) calc(100vw - 32px), 640px"
        preload
        unoptimized
        onLoad={onLogoReady}
        onError={onLogoReady}
        className="startup-splash__logo"
      />
    </div>
  );
}
