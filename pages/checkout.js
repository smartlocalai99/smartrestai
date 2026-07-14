import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import {
  IoArrowBack,
  IoBagHandleOutline,
  IoCardOutline,
  IoCashOutline,
  IoChevronForward,
  IoLocationOutline,
  IoPhonePortraitOutline,
  IoPricetagOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { LuMinus, LuPlus } from "react-icons/lu";
import PageHead from "@/components/customer/PageHead";
import { imageForItem } from "@/components/customer/ShopByCategories";
import { useAddresses } from "@/context/AddressContext";
import { DELIVERY_FEE, useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { usePayment } from "@/context/PaymentContext";
import useRequireAuth from "@/hooks/useRequireAuth";
import { playOrderSuccessSound } from "@/lib/sounds";

const PAYMENT_ICONS = { cod: IoCashOutline, upi: IoPhonePortraitOutline, card: IoCardOutline };

const COUPONS = { SPICE10: 0.1 };

function BasketRow({ entry, onIncrement, onDecrement, onRemove }) {
  const { item, sectionTitle, quantity } = entry;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 py-3"
    >
      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f4eee9]">
        <Image
          src={imageForItem(item, sectionTitle)}
          alt=""
          aria-hidden="true"
          fill
          sizes="64px"
          className="object-cover"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-black text-[#241610]">{item.title}</p>
        <p className="mt-0.5 text-[13px] font-bold text-[#8b8580]">₹{item.price} each</p>
        <div className="mt-2 inline-flex h-8 items-center overflow-hidden rounded-lg border border-[#e4dcd2]">
          <motion.button
            type="button"
            aria-label={`Remove one ${item.title}`}
            onClick={onDecrement}
            whileTap={{ scale: 0.85 }}
            className="grid h-full w-7 place-items-center text-[#5f554c]"
          >
            <LuMinus className="h-3.5 w-3.5" />
          </motion.button>
          <span className="grid w-6 place-items-center overflow-hidden text-center text-[12px] font-black text-[#241610]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={quantity}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {quantity}
              </motion.span>
            </AnimatePresence>
          </span>
          <motion.button
            type="button"
            aria-label={`Add one more ${item.title}`}
            onClick={onIncrement}
            whileTap={{ scale: 0.85 }}
            className="grid h-full w-7 place-items-center text-[#5f554c]"
          >
            <LuPlus className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <p className="text-[14px] font-black text-[#241610]">₹{item.price * quantity}</p>
        <motion.button
          type="button"
          aria-label={`Remove ${item.title} from basket`}
          onClick={onRemove}
          whileTap={{ scale: 0.85 }}
          className="text-[#c9c0b7] transition-colors duration-150 active:text-[#ef4f61]"
        >
          <IoTrashOutline className="h-[18px] w-[18px]" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function SuccessScreen({ orderId, total, router }) {
  useEffect(() => {
    playOrderSuccessSound();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-1 flex-col items-center justify-center px-8 text-center"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
        className="grid h-24 w-24 place-items-center rounded-full bg-[#1c9b5f]"
      >
        <motion.svg viewBox="0 0 24 24" className="h-12 w-12" fill="none">
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          />
        </motion.svg>
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="mt-6 text-[22px] font-black text-[#241610]">Order placed!</p>
        <p className="mt-2 text-[14px] font-semibold leading-5 text-[#7d7169]">
          Order <span className="font-black text-[#241610]">#{orderId}</span> for ₹{total} is
          being prepared. It should reach you in 30–40 minutes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="mt-8 flex w-full flex-col gap-3"
      >
        <button
          type="button"
          onClick={() => router.push("/orders")}
          className="flex h-[52px] items-center justify-center rounded-2xl bg-[#128647] text-[15px] font-black text-white shadow-[0_14px_26px_rgba(18,134,71,0.3)]"
        >
          Track order
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex h-[52px] items-center justify-center rounded-2xl border border-[#e4dcd2] text-[15px] font-black text-[#241610]"
        >
          Back to home
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Checkout() {
  const { isReady } = useRequireAuth();
  const { items, changeQuantity, checkoutSummary, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { defaultAddress } = useAddresses();
  const { method } = usePayment();
  const router = useRouter();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const couponShake = useAnimation();

  if (!isReady) return null;

  const subtotal = checkoutSummary.totalAmount;
  const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.rate) : 0;
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const total = Math.max(subtotal - discount + deliveryFee, 0);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const rate = COUPONS[code];
    if (rate) {
      setAppliedCoupon({ code, rate });
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponError("That code isn't valid. Try SPICE10.");
      couponShake.start({
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.4 },
      });
    }
  };

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    setTimeout(() => {
      const order = {
        id: Math.random().toString(36).slice(2, 8).toUpperCase(),
        items,
        totalItems: checkoutSummary.totalItems,
        total,
        placedAt: new Date().toISOString(),
      };
      placeOrder(order);
      clearCart();
      setPlacedOrder(order);
      setIsPlacing(false);
    }, 900);
  };

  return (
    <>
      <PageHead title="Checkout - SmartRest" />

      <main className="h-dvh w-screen overflow-hidden bg-[#f3ede4] sm:grid sm:place-items-center sm:p-6">
        <section className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-2xl sm:rounded-[30px]">
          <header className="flex items-center gap-3 border-b border-[#f4eee9] px-5 pb-3 pt-[calc(1.25rem+env(safe-area-inset-top))]">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => router.back()}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f2ee] text-[#241610]"
            >
              <IoArrowBack className="h-[18px] w-[18px]" />
            </button>
            <h1 className="text-[18px] font-black text-[#241610]">
              {placedOrder ? "Order confirmed" : "Your Order"}
            </h1>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[calc(1.5rem+env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AnimatePresence mode="wait">
              {placedOrder ? (
                <SuccessScreen
                  key="success"
                  orderId={placedOrder.id}
                  total={placedOrder.total}
                  router={router}
                />
              ) : items.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-1 flex-col items-center justify-center px-8 text-center"
                >
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-[#f7f0e8] text-[#b3402a]">
                    <IoBagHandleOutline className="h-9 w-9" />
                  </span>
                  <p className="mt-5 text-[19px] font-black text-[#241610]">Your basket is empty</p>
                  <p className="mt-2 max-w-[240px] text-[13px] font-semibold leading-5 text-[#7d7169]">
                    Add a few dishes from the menu to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="mt-6 rounded-full bg-[#128647] px-6 py-3 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(18,134,71,0.28)]"
                  >
                    Browse menu
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="basket"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5"
                >
                  <section className="mt-4 rounded-[22px] border border-[#f0e9e0] bg-white p-4 shadow-[0_10px_24px_rgba(43,17,12,0.05)]">
                    <p className="text-[15px] font-black text-[#241610]">Order Summary</p>

                    <div className="divide-y divide-[#f4eee9]">
                      <AnimatePresence initial={false}>
                        {items.map((entry) => (
                          <BasketRow
                            key={entry.item.id}
                            entry={entry}
                            onIncrement={() =>
                              changeQuantity(entry.item, entry.quantity + 1, entry.sectionTitle)
                            }
                            onDecrement={() =>
                              changeQuantity(entry.item, entry.quantity - 1, entry.sectionTitle)
                            }
                            onRemove={() => changeQuantity(entry.item, 0, entry.sectionTitle)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => router.push("/")}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-[#c9d9cf] text-[13px] font-black text-[#128647]"
                    >
                      + Add More Items
                    </motion.button>
                  </section>

                  <section className="mt-5 space-y-2">
                    <motion.button
                      type="button"
                      onClick={() => router.push("/addresses?redirect=%2Fcheckout")}
                      whileTap={{ scale: 0.98 }}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left ${
                        defaultAddress ? "border-[#f0e9e0]" : "border-[#f3d4d0] bg-[#fdf6f4]"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7f0e8] text-[#b3402a]">
                        <IoLocationOutline className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#a99a8c]">
                          Deliver to
                          {defaultAddress ? null : (
                            <span className="rounded-full bg-[#ef4f61]/15 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-[#c0402a]">
                              Required
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[13px] font-black text-[#241610]">
                          {defaultAddress ? defaultAddress.line : "Add a delivery address"}
                        </span>
                      </span>
                      <IoChevronForward className="h-4 w-4 shrink-0 text-[#c9c0b7]" />
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => router.push("/payment-methods")}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center gap-3 rounded-2xl border border-[#f0e9e0] p-3.5 text-left"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7f0e8] text-[#b3402a]">
                        {(() => {
                          const PaymentIcon = PAYMENT_ICONS[method.id];
                          return <PaymentIcon className="h-[18px] w-[18px]" />;
                        })()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold uppercase tracking-wide text-[#a99a8c]">
                          Pay via
                        </span>
                        <span className="block truncate text-[13px] font-black text-[#241610]">
                          {method.label}
                        </span>
                      </span>
                      <IoChevronForward className="h-4 w-4 shrink-0 text-[#c9c0b7]" />
                    </motion.button>
                  </section>

                  <section className="mt-5">
                    <p className="text-[14px] font-black text-[#241610]">Discount Coupon</p>
                    <motion.div animate={couponShake} className="mt-2 flex gap-2">
                      <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-[#e4dcd2] px-3">
                        <IoPricetagOutline className="h-4 w-4 shrink-0 text-[#8b8580]" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(event) => {
                            setCouponInput(event.target.value);
                            setCouponError("");
                          }}
                          placeholder="Promo Code"
                          className="min-w-0 flex-1 bg-transparent text-[13px] font-bold uppercase text-[#241610] outline-none placeholder:normal-case placeholder:text-[#a99a8c]"
                        />
                      </div>
                      <motion.button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim()}
                        whileTap={{ scale: 0.94 }}
                        className="h-12 shrink-0 rounded-xl bg-[#128647] px-5 text-[13px] font-black text-white disabled:opacity-40"
                      >
                        Apply
                      </motion.button>
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {couponError ? (
                        <motion.p
                          key="error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-1.5 text-[12px] font-bold text-[#ef4f61]"
                        >
                          {couponError}
                        </motion.p>
                      ) : appliedCoupon ? (
                        <motion.p
                          key="success"
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-1.5 text-[12px] font-bold text-[#1c9b5f]"
                        >
                          {appliedCoupon.code} applied — {Math.round(appliedCoupon.rate * 100)}% off
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </section>

                  <section className="mt-5 space-y-2 border-t border-[#f4eee9] pt-4">
                    <div className="flex items-center justify-between text-[13px] font-semibold text-[#5f554c]">
                      <span>Sub total</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] font-semibold text-[#5f554c]">
                      <span>Delivery fees</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                    {discount > 0 ? (
                      <div className="flex items-center justify-between text-[13px] font-semibold text-[#1c9b5f]">
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between border-t border-[#f4eee9] pt-2 text-[16px] font-black text-[#241610]">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={
                      defaultAddress
                        ? handlePlaceOrder
                        : () => router.push("/addresses?redirect=%2Fcheckout")
                    }
                    disabled={isPlacing}
                    className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#128647] text-[16px] font-black text-white shadow-[0_16px_30px_rgba(18,134,71,0.32)] transition-transform duration-150 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isPlacing ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : defaultAddress ? (
                      `Checkout · ₹${total}`
                    ) : (
                      "Add Delivery Address to Continue"
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </>
  );
}
