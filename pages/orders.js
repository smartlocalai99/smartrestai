import Image from "next/image";
import AppShell from "@/components/customer/AppShell";
import EmptyState from "@/components/customer/EmptyState";
import PageHead from "@/components/customer/PageHead";
import { imageForItem } from "@/components/customer/ShopByCategories";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { useOrders } from "@/context/OrdersContext";
import useRequireAuth from "@/hooks/useRequireAuth";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function OrderCard({ order }) {
  const previewItems = order.items.slice(0, 3);

  return (
    <div className="rounded-[22px] border border-[#f0e9e0] bg-white p-4 shadow-[0_10px_24px_rgba(43,17,12,0.06)]">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff4de] px-2.5 py-1 text-[11px] font-black text-[#a56a10]">
          Preparing
        </span>
        <span className="text-[11px] font-bold text-[#8b8580]">{formatDate(order.placedAt)}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-3">
          {previewItems.map(({ item, sectionTitle }) => (
            <span
              key={item.id}
              className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-[#f4eee9]"
            >
              <Image
                src={imageForItem(item, sectionTitle)}
                alt=""
                aria-hidden="true"
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
          ))}
        </div>
        <p className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#5f554c]">
          {order.items.map(({ item }) => item.title).join(", ")}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#f4eee9] pt-3">
        <span className="text-[12px] font-semibold text-[#7d7169]">
          {order.totalItems} item{order.totalItems === 1 ? "" : "s"}
        </span>
        <span className="text-[15px] font-black text-[#241610]">₹{order.total}</span>
      </div>
    </div>
  );
}

export default function Orders() {
  const { isReady } = useRequireAuth();
  const { orders, isLoadingOrders, ordersError, refreshOrders } = useOrders();

  if (!isReady) return null;

  return (
    <>
      <PageHead title="Your Orders - SmartRest" />

      <AppShell>
        <div className="min-h-full bg-white">
          <TabPageHeader title="Orders" subtitle="Track your current and past orders" />

          {ordersError ? (
            <div className="mx-4 mt-2 flex items-center gap-3 rounded-xl bg-[#fdf1ef] px-3 py-2.5">
              <p className="min-w-0 flex-1 text-[12px] font-bold text-[#c0402a]">{ordersError}</p>
              <button
                type="button"
                onClick={() => refreshOrders().catch(() => {})}
                className="shrink-0 text-[12px] font-black text-[#128647]"
              >
                Retry
              </button>
            </div>
          ) : null}

          {isLoadingOrders ? (
            <div className="grid min-h-48 place-items-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#128647]/25 border-t-[#128647]" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              imageSrc="/emptyplate.webp"
              imageAlt="Empty MANDI KING serving plate"
              title="Your first feast awaits"
              message="Place your first order and follow every delicious detail from our kitchen to your doorstep."
              ctaLabel="Start your order"
              ctaHref="/"
            />
          ) : (
            <div className="space-y-3 px-4 pb-10 pt-2">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </>
  );
}
