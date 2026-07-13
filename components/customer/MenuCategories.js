import Image from "next/image";

const menuCategories = [
  { label: "Mandi", image: "/mandi9.png" },
  { label: "Starters", image: "/starter.png" },
  { label: "Rotis", image: "/rotis.png" },
  { label: "Desserts", image: "/desert.png" },
];

export default function MenuCategories() {
  return (
    <section className="shrink-0 px-5 py-5">
      <div className="grid grid-cols-4 gap-4">
        {menuCategories.map((item) => (
          <button
            type="button"
            key={item.label}
            className="flex min-w-0 flex-col items-center gap-3 text-[13px] font-black text-[#5f554c]"
          >
            <span className="relative h-[96px] w-full">
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
