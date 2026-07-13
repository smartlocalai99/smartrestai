import Image from "next/image";

const menuCategories = [
  { label: "Mandi", image: "/mandi9.png", targetId: "section-chicken-mandi-7" },
  { label: "Starters", image: "/starter.png", targetId: "section-chicken-starters-8" },
  { label: "Rotis", image: "/rotis.png", targetId: "section-rotis-6" },
  { label: "Desserts", image: "/desert.png", targetId: "section-desserts-2" },
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
          <button
            type="button"
            key={item.label}
            onClick={() => scrollToSection(item.targetId)}
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
          </button>
        ))}
      </div>
    </section>
  );
}
