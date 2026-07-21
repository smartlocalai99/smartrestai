import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export default function VegModeToggle({ vegOnly, onChange }) {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 30, mass: 0.7 };

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={vegOnly}
      aria-label={vegOnly ? "Switch to full menu" : "Switch to vegetarian menu"}
      onClick={() => onChange(!vegOnly)}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      className="relative h-8 w-24 shrink-0 overflow-hidden rounded-full bg-black/15 p-1 shadow-[0_6px_16px_rgba(35,12,8,0.18)] ring-1 ring-white/50 backdrop-blur-sm"
    >
      <span
        className={`pointer-events-none absolute inset-y-0 flex items-center text-[9px] font-black uppercase tracking-wide text-white transition-[right,left] duration-200 ${
          vegOnly ? "left-2.5" : "right-2.5"
        }`}
      >
        {vegOnly ? "Veg" : "Non-veg"}
      </span>

      <motion.span
        data-testid="veg-toggle-selector"
        data-position={vegOnly ? "right" : "left"}
        initial={false}
        animate={{ left: vegOnly ? 68 : 4 }}
        transition={transition}
        className="absolute top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow-[0_4px_10px_rgba(42,16,10,0.25)]"
      >
        {vegOnly ? (
          <Image
            src="/veg.webp"
            alt="Vegetarian menu"
            width={64}
            height={64}
            sizes="20px"
            className="h-5 w-5 object-contain"
          />
        ) : (
          <Image
            src="/nonveg.webp"
            alt="Non-veg menu"
            width={64}
            height={64}
            sizes="20px"
            className="h-5 w-5 object-contain"
          />
        )}
      </motion.span>
    </motion.button>
  );
}
