import AppShell from "@/components/customer/AppShell";
import EmptyState from "@/components/customer/EmptyState";
import OrderTrackingExperience from "@/components/customer/OrderTrackingExperience";
import PageHead from "@/components/customer/PageHead";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function Orders() {
  const { isReady } = useRequireAuth();
  const { user } = useAuth();
  const { orders, isLoadingOrders, ordersError, refreshOrders } = useOrders();
  const isEmpty = !isLoadingOrders && orders.length === 0;

  if (!isReady) return null;

  return (
    <>
      <PageHead title="Your Orders - SmartRest" />

      <AppShell contentClassName={isEmpty ? "bg-[#f6f6f6]" : ""}>
        <div
          className={`flex min-h-full flex-col ${
            !isLoadingOrders && orders.length === 0 ? "bg-[#f6f6f6]" : "bg-white"
          }`}
        >
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
          ) : isEmpty ? (
            <EmptyState
              imageSrc="/emptyplate.webp"
              imageAlt="Empty MANDI KING serving plate"
              title="Your first feast awaits"
              message="Place your first order and follow every delicious detail from our kitchen to your doorstep."
              ctaLabel="Start your order"
              ctaHref="/"
            />
          ) : (
            <OrderTrackingExperience orders={orders} accountPhone={user?.phone} />
          )}
        </div>
      </AppShell>
    </>
  );
}
