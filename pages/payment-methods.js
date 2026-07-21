import { motion } from "motion/react";
import { IoCashOutline, IoCheckmarkCircle, IoPhonePortraitOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { SiPaytm, SiPhonepe } from "react-icons/si";
import AppShell from "@/components/customer/AppShell";
import PageHead from "@/components/customer/PageHead";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { usePayment } from "@/context/PaymentContext";
import useRequireAuth from "@/hooks/useRequireAuth";

const ICONS = { cod: IoCashOutline, upi: IoPhonePortraitOutline };

const UPI_APPS = [
  { label: "PhonePe", Icon: SiPhonepe, color: "text-[#5f259f]" },
  { label: "Google Pay", Icon: FcGoogle, color: "", isColored: true },
  { label: "Paytm", Icon: SiPaytm, color: "text-[#00baf2]" },
];

export default function PaymentMethods() {
  const { isReady } = useRequireAuth();
  const { methodId, setMethodId, methods } = usePayment();

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
            {methods.map((method, index) => {
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
                    {method.id === "upi" ? (
                      <span className="mt-3 flex flex-wrap gap-2">
                        {UPI_APPS.map(({ label, Icon: AppIcon, color, isColored }) => (
                          <span
                            key={label}
                            role="img"
                            aria-label={label}
                            title={label}
                            className="grid h-10 w-12 place-items-center gap-0.5 rounded-xl border border-[#e9e0d8] bg-white shadow-[0_4px_12px_rgba(50,18,13,0.06)]"
                          >
                            {isColored ? (
                              <span className="flex items-center gap-0.5">
                                <AppIcon aria-hidden="true" className="h-4 w-4" />
                                <span className="text-[10px] font-bold text-[#5f554c]">Pay</span>
                              </span>
                            ) : (
                              <AppIcon aria-hidden="true" className={`h-6 w-6 ${color}`} />
                            )}
                          </span>
                        ))}
                      </span>
                    ) : null}
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
