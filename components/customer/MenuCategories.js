import Image from "next/image";
import { motion } from "motion/react";

const menuCategories = [
  {
    label: "Mandi",
    image: "/mandi9.png",
    targetId: "section-chicken-mandi",
    height: { compact: "h-[68px]", normal: "h-[80px]" },
  },
  {
    label: "Starters",
    image: "/starterimg.webp",
    targetId: "section-chicken-starters",
    height: { compact: "h-[68px]", normal: "h-[80px]" },
  },
  { label: "Rotis", image: "/rotis.png", targetId: "section-rotis" },
  { label: "Desserts", image: "/desert.png", targetId: "section-desserts" },
];

const DEFAULT_HEIGHT = { compact: "h-[82px]", normal: "h-[96px]" };

export default function MenuCategories({ compact = false }) {
  const scrollToSection = (targetId) => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section
      className={
        compact
          ? "sticky top-[calc(67px+env(safe-area-inset-top))] z-30 shrink-0 bg-white "
          : "sticky top-[calc(67px+env(safe-area-inset-top))] z-30 shrink-0 bg-white px-2 "
      }
    >
      <div className="grid grid-cols-4 gap-4">
        {menuCategories.map((item) => (
          <motion.button
            type="button"
            key={item.label}
            onClick={() => scrollToSection(item.targetId)}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="flex min-w-0 flex-col items-center gap-3 text-[13px] font-black text-[#5f554c]"
          >
            <span
              className={`relative w-full ${
                compact
                  ? item.height?.compact || DEFAULT_HEIGHT.compact
                  : item.height?.normal || DEFAULT_HEIGHT.normal
              }`}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  sizes="25vw"
                  className="object-contain"
                />
              ) : null}
            </span>
            {item.label}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
