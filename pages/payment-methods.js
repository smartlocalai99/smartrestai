import { motion } from "motion/react";
import { IoCardOutline, IoCashOutline, IoCheckmarkCircle, IoPhonePortraitOutline } from "react-icons/io5";
import AppShell from "@/components/customer/AppShell";
import PageHead from "@/components/customer/PageHead";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { PAYMENT_METHODS, usePayment } from "@/context/PaymentContext";
import useRequireAuth from "@/hooks/useRequireAuth";

const ICONS = { cod: IoCashOutline, upi: IoPhonePortraitOutline, card: IoCardOutline };

export default function PaymentMethods() {
  const { isReady } = useRequireAuth();
  const { methodId, setMethodId } = usePayment();

  if (!isReady) return null;

  return (
    <>
      <PageHead title="Payment Methods - SmartRest" />

      <AppShell>
        <div className="min-h-full bg-white">
          <TabPageHeader
            title="Payment Methods"
            subtitle="Choose how you'd like to pay at checkout"
          />

          <div className="space-y-3 px-4 pb-6 pt-2">
            {PAYMENT_METHODS.map((method, index) => {
              const Icon = ICONS[method.id];
              const isSelected = methodId === method.id;

              return (
                <motion.button
                  type="button"
                  key={method.id}
                  onClick={() => setMethodId(method.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-start gap-3 rounded-[20px] border p-4 text-left transition-colors duration-150 ${
                    isSelected ? "border-[#32120d] bg-[#f5ecea]" : "border-[#f0e9e0] bg-white"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      isSelected ? "bg-[#32120d] text-white" : "bg-[#f7f0e8] text-[#b3402a]"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-black text-[#241610]">{method.label}</p>
                    <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#7d7169]">
                      {method.note}
                    </p>
                  </div>

                  {isSelected ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      className="shrink-0 text-[#32120d]"
                    >
                      <IoCheckmarkCircle className="h-6 w-6" />
                    </motion.span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>

          <p className="px-5 pb-8 text-[12px] font-semibold leading-5 text-[#a99a8c]">
            This is the payment method we&apos;ll pre-select for you at checkout. You can always
            switch it there before placing an order.
          </p>
        </div>
      </AppShell>
    </>
  );
}
