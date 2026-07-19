import { useState } from "react";
import Image from "next/image";

export default function LazyImage({
  src,
  alt = "",
  className = "",
  skeletonClassName = "bg-[#efe7de]",
  ...imageProps
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded ? (
        <div className={`absolute inset-0 animate-pulse ${skeletonClassName}`} aria-hidden="true" />
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
        {...imageProps}
      />
    </>
  );
}
