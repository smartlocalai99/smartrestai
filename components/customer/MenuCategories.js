import Image from "next/image";
import { motion } from "motion/react";
import { useMenuData } from "@/context/MenuDataContext";
import { sectionId } from "./menuNavigation.mjs";

function resolveTargetId(category, sections) {
  const section = category.sectionId
    ? sections.find((candidate) => candidate.id === category.sectionId)
    : sections.find((candidate) => candidate.heading === category.sectionTitle);
  return section ? sectionId(section.heading) : null;
}

export default function MenuCategories({ compact = false }) {
  const { categories, sections } = useMenuData();

  const scrollToSection = (targetId) => {
    if (!targetId) return;
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
        {categories.map((category) => (
          <motion.button
            type="button"
            key={category.id}
            onClick={() => scrollToSection(resolveTargetId(category, sections))}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="flex min-w-0 flex-col items-center gap-3 text-[13px] font-black text-[#5f554c]"
          >
            <span className={`relative w-full ${compact ? "h-[68px]" : "h-[80px]"}`}>
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.label}
                  fill
                  sizes="25vw"
                  className="object-contain"
                />
              ) : null}
            </span>
            {category.label}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
