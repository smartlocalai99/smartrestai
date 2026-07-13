import Image from "next/image";

const menuCategories = [
  { label: "Mandi", image: "/mandi9.png" },
  { label: "Starters", image: "/starter.png" },
  { label: "Rotis", image: "/rotis.png" },
  { label: "Desserts", image: "/desert.png" },
];

export default function MenuCategories({ compact = false }) {
  return (
    <section
      className={
        compact
          ? "sticky top-[67px] z-30 shrink-0 bg-white pt-4"
          : "sticky top-[67px] z-30 shrink-0 bg-white px-5 py-5"
      }
    >
      <div className="grid grid-cols-4 gap-4">
        {menuCategories.map((item) => (
          <button
            type="button"
            key={item.label}
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
