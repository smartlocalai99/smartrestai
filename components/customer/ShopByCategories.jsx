import Image from "next/image";
import Link from "next/link";
import { IoAdd, IoChevronForward } from "react-icons/io5";

const featuredPlatter = {
  title: "Continental Special Platter",
  href: "/category/special-platter",
  image: "/specialplatter.png",
  items:
    "Mutton chops + 1 meter kabab + turkish chicken + chicken malai kabab + boti kebab + mutton ghee roast + garlic fish + bbq fish + crispy prawns + dips",
};

const imageLoader = ({ src, width, quality }) => {
  if (src.startsWith("/")) {
    return src;
  }

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}&q=${quality || 85}`;
};

function SpecialPlatterCard({ category }) {
  return (
    <article className="relative min-h-[390px] overflow-hidden rounded-[32px] bg-[#32120d] shadow-[0_20px_45px_rgba(43,17,12,0.3)] sm:min-h-[430px]">
      <div className="pointer-events-none absolute -left-14 -top-16 h-56 w-56 rounded-full bg-[#f4c45f]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#8f2f1d]/45 blur-3xl" />

      <div className="pointer-events-none absolute -right-[84px] bottom-8 z-10 h-[250px] w-[250px] sm:-right-8 sm:h-[310px] sm:w-[310px]">
        <Image
          loader={imageLoader}
          src={category.image}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 640px) 260px, 330px"
          className="object-contain drop-shadow-2xl"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#32120d] via-[#32120d]/85 to-[#32120d]/20" />

      <Link
        href={category.href}
        aria-label={`View ${category.title}`}
        className="relative z-20 flex min-h-[390px] flex-col justify-between p-5 pr-[126px] sm:min-h-[430px] sm:p-7 sm:pr-[190px]"
      >
        <div>
          <span className="inline-flex rounded-full bg-[#f4c45f] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#3c1712] shadow-md">
            Signature
          </span>

          <h3 className="mt-3 max-w-[230px] text-[28px] font-black leading-[0.95] tracking-tight text-white sm:max-w-[340px] sm:text-[38px]">
            {category.title}
          </h3>

          <p className="mt-3 max-w-[235px] text-[12px] font-semibold leading-[1.45] text-white/78 sm:max-w-[360px] sm:text-[15px]">
            {category.items}
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
          View details
          <IoChevronForward className="h-3.5 w-3.5" />
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Add ${category.title}`}
        className="absolute bottom-5 right-5 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-[#f4c45f] px-5 text-[15px] font-black text-[#32120d] shadow-[0_14px_28px_rgba(0,0,0,0.28)] transition-transform duration-200 active:scale-95"
      >
        <IoAdd className="h-5 w-5" />
        Add
      </button>
    </article>
  );
}

export default function PopularChoices() {
  return (
    <section className="w-full bg-transparent px-4 pb-6 pt-2 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <h2 className="text-[26px] font-black tracking-tight text-[#241610] sm:text-[32px]">
            Signature Platter
          </h2>

          <p className="text-[15px] font-semibold text-[#7b6251] sm:text-[18px]">
            Continental-style grill favourites in one loaded tray
          </p>
        </div>

        <SpecialPlatterCard category={featuredPlatter} />
      </div>
    </section>
  );
}
