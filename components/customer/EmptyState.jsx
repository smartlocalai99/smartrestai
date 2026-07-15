import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "motion/react";

export default function EmptyState({
  icon: Icon,
  imageSrc,
  imageAlt = "",
  title,
  message,
  ctaLabel,
  ctaHref,
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex min-h-[430px] flex-col items-center justify-center px-7 py-10 text-center ${
        imageSrc ? "flex-1 self-stretch bg-[#f6f6f6]" : ""
      }`}
    >
      {imageSrc ? (
        <motion.div
          initial={{ scale: 0.82, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.05 }}
          className="relative h-48 w-full max-w-[330px]"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="330px"
            className="object-contain"
            priority
          />
        </motion.div>
      ) : Icon ? (
        <motion.span
          initial={{ scale: 0.7, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
          className="grid h-20 w-20 place-items-center rounded-full bg-[#f7f0e8]"
        >
          <Icon className="h-9 w-9 text-[#b3402a]" />
        </motion.span>
      ) : null}

      <p className="mt-4 text-[21px] font-black text-[#241610]">{title}</p>
      <p className="mt-2 max-w-[290px] text-[13px] font-semibold leading-5 text-[#7d7169]">
        {message}
      </p>

      {ctaLabel ? (
        <button
          type="button"
          onClick={() => router.push(ctaHref)}
          className="mt-6 rounded-full bg-[#32120d] px-7 py-3.5 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(50,18,13,0.28)] transition-transform duration-150 active:scale-95"
        >
          {ctaLabel}
        </button>
      ) : null}
    </motion.div>
  );
}
