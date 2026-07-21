import Image from "next/image";

export default function BrandedSplash({ isExiting }) {
  return (
    <div
      role="status"
      aria-label="Loading Mandi Kings"
      className={`startup-splash${isExiting ? " startup-splash--exiting" : ""}`}
    >
      <Image
        src="/applogo.jpeg"
        alt="Mandi Kings"
        width={2560}
        height={1280}
        sizes="(max-width: 430px) 80vw, 360px"
        preload
        className="startup-splash__logo"
      />
    </div>
  );
}
