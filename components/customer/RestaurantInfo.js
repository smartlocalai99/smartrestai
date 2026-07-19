import { LuClock, LuMapPin } from "react-icons/lu";
import { useMenuData } from "@/context/MenuDataContext";

const disclaimerItems = [
  "All prices are set directly by the restaurant.",
  "All nutritional information is indicative, values are per serve as shared by the restaurant and may vary depending on the ingredients and portion size.",
  "An average active adult requires 2,000 kcal energy per day; however, calorie needs may vary.",
  "Dish details might be AI crafted for a better experience.",
];

function formatTime(time) {
  if (!time) return null;
  const [hourStr, minute] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

export default function RestaurantInfo() {
  const { profile } = useMenuData();

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

        {profile ? (
          <div className="mt-7 border-t border-[#d6d6df] pt-7">
            <h2 className="text-[17px] font-black text-[#4b4b55]">{profile.name}</h2>

            {profile.addressLine ? (
              <div className="mt-3 flex items-start gap-2 text-[14px] font-medium leading-6">
                <LuMapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#9292a0]" />
                <address className="not-italic">{profile.addressLine}</address>
              </div>
            ) : null}

            {profile.openingTime && profile.closingTime ? (
              <div className="mt-2 flex items-start gap-2 text-[14px] font-medium leading-6">
                <LuClock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#9292a0]" />
                <span>
                  {formatTime(profile.openingTime)} – {formatTime(profile.closingTime)} daily ·{" "}
                  <span className={profile.isOpen && !profile.busyMode ? "text-[#3c7c5b]" : "text-[#c0392b]"}>
                    {profile.busyMode ? "Busy right now" : profile.isOpen ? "Open now" : "Closed"}
                  </span>
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
