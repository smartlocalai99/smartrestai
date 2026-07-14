import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  IoFastFoodOutline,
  IoGiftOutline,
  IoLockClosedOutline,
  IoNotificationsOutline,
  IoTimeOutline,
} from "react-icons/io5";
import AppShell from "@/components/customer/AppShell";
import PageHead from "@/components/customer/PageHead";
import TabPageHeader from "@/components/customer/TabPageHeader";
import useRequireAuth from "@/hooks/useRequireAuth";

const STORAGE_KEY = "smartrest_notification_prefs";

const PREFERENCES = [
  {
    id: "orderUpdates",
    label: "Order updates",
    description: "Order confirmed, being prepared, out for delivery.",
    icon: IoFastFoodOutline,
    locked: true,
  },
  {
    id: "offers",
    label: "Offers & discounts",
    description: "Coupons and limited-time deals on your favourite dishes.",
    icon: IoGiftOutline,
  },
  {
    id: "reminders",
    label: "Delivery reminders",
    description: "A nudge when your usual order time rolls around.",
    icon: IoTimeOutline,
  },
];

const defaultPrefs = { orderUpdates: true, offers: true, reminders: false };

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#128647]" : "bg-[#e4dcd2]"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}

export default function Notifications() {
  const { isReady } = useRequireAuth();
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs({ ...defaultPrefs, ...JSON.parse(stored) });
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const updatePref = (id, value) => {
    setPrefs((current) => {
      const next = { ...current, [id]: value };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  };

  if (!isReady) return null;

  return (
    <>
      <PageHead title="Notifications - SmartRest" />

      <AppShell>
        <div className="min-h-full bg-white">
          <TabPageHeader title="Notifications" subtitle="Choose what you'd like to hear about" />

          <div className="space-y-3 px-4 pb-8 pt-2">
            {PREFERENCES.map(({ id, label, description, icon: Icon, locked }, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                className="flex items-start gap-3 rounded-[20px] border border-[#f0e9e0] bg-white p-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f7f0e8] text-[#b3402a]">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-black text-[#241610]">{label}</p>
                  <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#7d7169]">
                    {description}
                  </p>
                </div>
                {locked ? (
                  <span className="mt-1 flex shrink-0 items-center gap-1 text-[10px] font-black text-[#a99a8c]">
                    <IoLockClosedOutline className="h-3.5 w-3.5" />
                  </span>
                ) : null}
                <Toggle
                  checked={prefs[id]}
                  disabled={locked}
                  onChange={(value) => updatePref(id, value)}
                />
              </motion.div>
            ))}
          </div>

          <div className="mx-4 mb-8 flex items-start gap-2 rounded-xl bg-[#faf5ef] p-3 text-[12px] font-semibold leading-4 text-[#7d7169]">
            <IoNotificationsOutline className="mt-0.5 h-4 w-4 shrink-0 text-[#a99a8c]" />
            Order updates can&apos;t be turned off — they&apos;re how you&apos;ll know when your
            food is on its way.
          </div>
        </div>
      </AppShell>
    </>
  );
}
