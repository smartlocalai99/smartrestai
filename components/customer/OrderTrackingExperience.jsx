import { IoBicycleOutline, IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import LazyImage from "@/components/customer/LazyImage";
import OrderTrackingMap from "@/components/customer/OrderTrackingMap";
import {
  createOrderView,
  formatRupees,
  splitOrders,
} from "@/lib/orderView.mjs";

const RIDER = {
  name: "Ravi Kumar",
  role: "Your delivery partner",
};

function PreviousOrderCard({ order, accountPhone }) {
  const view = createOrderView(order, accountPhone);

  return (
    <article className="rounded-[22px] border border-[#f0e9e0] bg-white p-4 shadow-[0_10px_24px_rgba(43,17,12,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#fff4de] px-2.5 py-1 text-[11px] font-black text-[#a56a10]">
          {view.statusLabel}
        </span>
        <time className="text-[11px] font-bold text-[#8b8580]">{view.placedAtLabel}</time>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex shrink-0 -space-x-3">
          {view.itemRows.slice(0, 3).map((row) => (
            <span
              key={row.key}
              className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#f4eee9]"
            >
              <LazyImage src={row.item.imageUrl || "/emptyplate.webp"} alt="" sizes="44px" className="object-cover" />
            </span>
          ))}
        </div>
        <p className="min-w-0 flex-1 text-[13px] font-bold leading-5 text-[#5f554c]">
          {view.itemRows.map((row) => row.title).join(", ") || "Order items unavailable"}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#f4eee9] pt-3">
        <span className="text-[12px] font-semibold text-[#7d7169]">
          {view.totalItems} item{view.totalItems === 1 ? "" : "s"}
        </span>
        <span className="text-[15px] font-black text-[#241610]">
          ₹{formatRupees(view.total)}
        </span>
      </div>
    </article>
  );
}

export default function OrderTrackingExperience({ orders, accountPhone = "" }) {
  const { activeOrder, previousOrders } = splitOrders(orders);

  if (!activeOrder) return null;

  const active = createOrderView(activeOrder, accountPhone);

  return (
    <div className="px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-2">
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(43,17,12,0.12)]">
        <OrderTrackingMap destinationLabel={active.address} />

        <div className="relative -mt-8 rounded-t-[30px] bg-white px-5 pb-5 pt-5">
          <div className="flex items-center gap-3 border-b border-[#eee8e2] pb-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f7eee8] text-[#b3402a]">
              <IoBicycleOutline className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-black text-[#241610]">{RIDER.name}</p>
              <p className="text-[12px] font-semibold text-[#8b8580]">{RIDER.role}</p>
            </div>
            <span className="max-w-[110px] break-all text-right text-[11px] font-bold text-[#8b8580]">
              {active.contact}
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-[#eee8e2] py-4">
            <div className="flex min-w-0 gap-2">
              <IoLocationSharp className="mt-0.5 h-5 w-5 shrink-0 text-[#b63b2d]" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#a99a8c]">Delivery Address</p>
                <p className="mt-1 break-words text-[13px] font-black leading-5 text-[#241610]">
                  {active.address}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <IoTimeOutline className="mt-0.5 h-5 w-5 shrink-0 text-[#b63b2d]" />
              <div>
                <p className="text-[11px] font-bold text-[#a99a8c]">Estimate Time</p>
                <p className="mt-1 whitespace-nowrap text-[13px] font-black text-[#241610]">
                  30–40 min
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-black text-[#241610]">Order Details</h2>
              <span className="rounded-full bg-[#fff4de] px-2.5 py-1 text-[10px] font-black text-[#a56a10]">
                {active.statusLabel}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {active.itemRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-start justify-between gap-4 text-[13px]"
                >
                  <span className="min-w-0 font-semibold leading-5 text-[#5f554c]">
                    {row.quantity} {row.title}
                  </span>
                  <span className="shrink-0 font-bold text-[#5f554c]">
                    ₹{formatRupees(row.lineTotal)}
                  </span>
                </div>
              ))}
              {active.itemRows.length === 0 ? (
                <p className="text-[13px] font-semibold text-[#8b8580]">
                  Order items unavailable
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#ddd4cc] pt-3 text-[15px] font-black text-[#241610]">
              <span>Total Amount</span>
              <span>₹{formatRupees(active.total)}</span>
            </div>
          </div>
        </div>
      </section>

      {previousOrders.length > 0 ? (
        <section aria-label="Previous Orders" className="mt-7">
          <h2 className="mb-3 text-[18px] font-black text-[#241610]">Previous Orders</h2>
          <div className="space-y-3">
            {previousOrders.map((order) => (
              <PreviousOrderCard key={order.id} order={order} accountPhone={accountPhone} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
