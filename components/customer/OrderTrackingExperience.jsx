import { useState } from "react";
import { IoBicycleOutline, IoCall, IoLocationSharp, IoTimeOutline } from "react-icons/io5";
import EmptyState from "@/components/customer/EmptyState";
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
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-[#241610]">Order #{view.id}</p>
          <span className="mt-1 inline-flex rounded-full bg-[#fff4de] px-2.5 py-1 text-[10px] font-black text-[#a56a10]">
            {view.statusLabel}
          </span>
        </div>
        <time className="text-[11px] font-bold text-[#8b8580]">{view.placedAtLabel}</time>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex shrink-0 -space-x-3">
          {view.itemRows.slice(0, 3).map((row) => (
            <span
              key={row.key}
              className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#f4eee9]"
            >
              <LazyImage
                src={row.item.imageUrl || "/emptyplate.webp"}
                alt={row.title}
                sizes="44px"
                className="object-cover"
              />
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
        <div className="text-right">
          <p className="text-[10px] font-bold text-[#9b8f86]">Bill amount</p>
          <p className="text-[15px] font-black text-[#241610]">₹{formatRupees(view.total)}</p>
        </div>
      </div>
    </article>
  );
}

function CurrentOrder({ order, accountPhone, restaurantProfile }) {
  const active = createOrderView(order, accountPhone);
  const hasContact = Boolean(active.contact) && active.contact !== "Contact unavailable";
  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_45px_rgba(43,17,12,0.12)]">
        <OrderTrackingMap
          destination={order.deliveryAddress}
          restaurant={restaurantProfile}
        />

        <div className="relative -mt-8 rounded-t-[30px] bg-white px-5 pb-5 pt-5">
          <div className="flex items-center gap-3 border-b border-[#eee8e2] pb-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f7eee8] text-[#b3402a]">
              <IoBicycleOutline className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-black text-[#241610]">{RIDER.name}</p>
              <p className="text-[12px] font-semibold text-[#8b8580]">{RIDER.role}</p>
            </div>
            {hasContact ? (
              <a
                href={`tel:${active.contact}`}
                aria-label={`Call ${RIDER.name}`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#32120d] text-white transition-transform duration-150 active:scale-95"
              >
                <IoCall className="h-[18px] w-[18px]" />
              </a>
            ) : (
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4eee9] text-[#c9c0b7]"
              >
                <IoCall className="h-[18px] w-[18px]" />
              </span>
            )}
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

            <div className="mt-4 flex items-center justify-between border-t border-[#f4eee9] pt-3 text-[13px] font-bold">
              <span className="text-[#5f554c]">Delivery charges</span>
              <span className="text-[#3c7c5b]">FREE</span>
            </div>

            <div className="mt-4 border-t border-[#f4eee9] pt-4">
              <h3 className="text-[15px] font-black text-[#241610]">Order timeline</h3>
              <ol className="mt-3">
                {active.timelineSteps.map((step, index) => (
                  <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < active.timelineSteps.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[7px] top-4 h-[calc(100%-0.25rem)] w-0.5 ${
                          step.isComplete ? "bg-[#32120d]" : "bg-[#e4dcd2]"
                        }`}
                      />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={`relative z-[1] mt-1 h-4 w-4 shrink-0 rounded-full border-[3px] ${
                        step.isComplete
                          ? "border-[#32120d] bg-[#32120d]"
                          : "border-[#d8cec6] bg-white"
                      } ${step.isCurrent ? "ring-4 ring-[#32120d]/10" : ""}`}
                    />
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                      <span
                        className={`text-[12px] font-black ${
                          step.isComplete ? "text-[#241610]" : "text-[#9b8f86]"
                        }`}
                      >
                        {step.label}
                      </span>
                      <time className="text-right text-[10px] font-bold text-[#8b8580]">
                        {step.timeLabel}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#ddd4cc] pt-3 text-[15px] font-black text-[#241610]">
              <span>Total Amount</span>
              <span>₹{formatRupees(active.total)}</span>
            </div>
          </div>
        </div>
    </section>
  );
}

function PreviousOrders({ orders, accountPhone }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        imageSrc="/emptyplate.webp"
        imageAlt="Empty MANDI KING serving plate"
        title="No previous orders yet"
        message="Your completed and cancelled orders will appear here."
      />
    );
  }

  return (
    <section aria-label="Previous Orders">
      <h2 className="mb-3 text-[17px] font-black text-[#241610]">Previous Orders</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <PreviousOrderCard key={order.id} order={order} accountPhone={accountPhone} />
        ))}
      </div>
    </section>
  );
}

export default function OrderTrackingExperience({
  orders,
  accountPhone = "",
  restaurantProfile = {},
}) {
  const { activeOrder, previousOrders } = splitOrders(orders);
  const [selectedTab, setSelectedTab] = useState("current");

  if (!activeOrder) {
    return (
      <div
        data-testid="previous-orders-surface"
        className="flex-1 bg-[#f6f6f6] px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-2"
      >
        <PreviousOrders orders={previousOrders} accountPhone={accountPhone} />
      </div>
    );
  }

  return (
    <div className="px-4 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-2">
      <div
        role="tablist"
        aria-label="Order views"
        className="mb-4 grid grid-cols-2 rounded-2xl bg-[#f2ece7] p-1"
      >
        <button
          id="current-order-tab"
          type="button"
          role="tab"
          aria-selected={selectedTab === "current"}
          aria-controls="current-order-panel"
          onClick={() => setSelectedTab("current")}
          className={`min-h-11 rounded-xl px-3 text-[12px] font-black transition-colors ${
            selectedTab === "current"
              ? "bg-[#32120d] text-white shadow-sm"
              : "text-[#74675f]"
          }`}
        >
          Current Order
        </button>
        <button
          id="previous-orders-tab"
          type="button"
          role="tab"
          aria-selected={selectedTab === "previous"}
          aria-controls="previous-orders-panel"
          onClick={() => setSelectedTab("previous")}
          className={`min-h-11 rounded-xl px-3 text-[12px] font-black transition-colors ${
            selectedTab === "previous"
              ? "bg-[#32120d] text-white shadow-sm"
              : "text-[#74675f]"
          }`}
        >
          Previous Orders
        </button>
      </div>

      {selectedTab === "current" ? (
        <div
          id="current-order-panel"
          role="tabpanel"
          aria-labelledby="current-order-tab"
        >
          <CurrentOrder
            order={activeOrder}
            accountPhone={accountPhone}
            restaurantProfile={restaurantProfile}
          />
        </div>
      ) : (
        <div
          id="previous-orders-panel"
          role="tabpanel"
          aria-labelledby="previous-orders-tab"
          data-testid="previous-orders-surface"
          className="-mx-4 min-h-[430px] bg-[#f6f6f6] px-4 pt-1"
        >
          <PreviousOrders orders={previousOrders} accountPhone={accountPhone} />
        </div>
      )}
    </div>
  );
}
