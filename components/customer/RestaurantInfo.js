import { LuMapPin } from "react-icons/lu";

const disclaimerItems = [
  "All prices are set directly by the restaurant.",
  "All nutritional information is indicative, values are per serve as shared by the restaurant and may vary depending on the ingredients and portion size.",
  "An average active adult requires 2,000 kcal energy per day; however, calorie needs may vary.",
  "Dish details might be AI crafted for a better experience.",
];

export default function RestaurantInfo() {
  return (
    <section
      aria-label="Restaurant information"
      className="border-t border-[#dedee7] bg-[#f5f5fa] px-5 pb-8 pt-7 text-[#5d5d68]"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-[18px] font-black text-[#4b4b55]">Disclaimer:</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-[14px] font-medium leading-6">
          {disclaimerItems.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-[#d6d6df] pt-7">
          <h2 className="text-[17px] font-black text-[#4b4b55]">
            MANDI KING - Arabian Restaurant
          </h2>
          <div className="mt-3 flex items-start gap-2 text-[14px] font-medium leading-6">
            <LuMapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#9292a0]" />
            <address className="not-italic">
              Door No 1, Trunk Rd, near SBI Bank, beside 2nd Gandhi Statue,
              Ganagapeta, Kadapa, Andhra Pradesh 516001
            </address>
          </div>
        </div>
      </div>
    </section>
  );
}
