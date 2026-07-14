import Image from "next/image";
import { motion } from "motion/react";

const menuCategories = [
  { label: "Mandi", image: "/mandi9.png", targetId: "section-chicken-mandi" },
  { label: "Starters", image: "/starter.png", targetId: "section-chicken-starters" },
  { label: "Rotis", image: "/rotis.png", targetId: "section-rotis" },
  { label: "Desserts", image: "/desert.png", targetId: "section-desserts" },
];

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
          ? "sticky top-[67px] z-30 shrink-0 bg-white "
          : "sticky top-[67px] z-30 shrink-0 bg-white px-2 "
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
            <span className={`relative w-full ${compact ? "h-[82px]" : "h-[96px]"}`}>
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
