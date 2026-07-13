import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: 1,
    title: "Chicken",
    href: "/category/chicken",
    background: "bg-[#E8E7FF]",
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop",
    imagePosition: "object-center",
  },
  {
    id: 2,
    title: "Fish &\nSeafood",
    href: "/category/fish-seafood",
    background: "bg-[#FFC9C9]",
    image:
      "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop",
    imagePosition: "object-center",
  },
  {
    id: 3,
    title: "Mutton",
    href: "/category/mutton",
    background: "bg-[#F5E5D7]",
    image:
      "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop",
    imagePosition: "object-center",
  },
  {
    id: 4,
    title: "Eggs",
    href: "/category/eggs",
    background: "bg-[#FFF8DE]",
    image:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop",
    imagePosition: "object-center",
  },
];

const externalImageLoader = ({ src, width, quality }) => {
  return `${src}&w=${width}&q=${quality || 80}`;
};

function CategoryCard({ category, priority }) {
  return (
    <Link
      href={category.href}
      aria-label={`Shop ${category.title.replace("\n", " ")}`}
      className={`
        group relative block
        h-[245px] overflow-hidden
        rounded-[32px]
        sm:h-[290px]
        lg:h-[340px]
        ${category.background}
      `}
    >
      <h3 className="relative z-20 whitespace-pre-line px-6 pt-7 text-[24px] font-extrabold leading-[1.12] text-black sm:text-[27px]">
        {category.title}
      </h3>

      <div className="absolute -bottom-4 -right-5 h-[76%] w-[88%] overflow-hidden rounded-tl-[90px] transition-transform duration-500 group-hover:scale-105">
        <Image
          loader={externalImageLoader}
          src={category.image}
          alt={category.title.replace("\n", " ")}
          fill
          priority={priority}
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 40vw, 320px"
          className={`object-cover ${category.imagePosition}`}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/10 via-transparent to-black/5" />
    </Link>
  );
}

export default function ShopByCategories() {
  return (
    <section className="w-full bg-transparent px-4 pb-6 pt-2 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5">
          <h2 className="text-[26px] font-black tracking-tight text-[#241610] sm:text-[32px]">
            Shop by categories
          </h2>

          <p className="mt-1 text-[15px] font-semibold text-[#7b6251] sm:text-[18px]">
            Freshest meat just for you
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
