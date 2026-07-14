import { useRouter } from "next/router";
import { motion } from "motion/react";

export default function EmptyState({ icon: Icon, title, message, ctaLabel, ctaHref }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center px-8 py-24 text-center"
    >
      <motion.span
        initial={{ scale: 0.7, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-[#f7f0e8]"
      >
        <Icon className="h-9 w-9 text-[#b3402a]" />
      </motion.span>

      <p className="mt-5 text-[19px] font-black text-[#241610]">{title}</p>
      <p className="mt-2 max-w-[260px] text-[13px] font-semibold leading-5 text-[#7d7169]">
        {message}
      </p>

      {ctaLabel ? (
        <button
          type="button"
          onClick={() => router.push(ctaHref)}
          className="mt-6 rounded-full bg-[#128647] px-6 py-3 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(18,134,71,0.28)] transition-transform duration-150 active:scale-95"
        >
          {ctaLabel}
        </button>
      ) : null}
    </motion.div>
  );
}
