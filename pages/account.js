import { useRouter } from "next/router";
import {
  IoChevronForward,
  IoHeartOutline,
  IoHelpCircleOutline,
  IoLocationOutline,
  IoLogOutOutline,
  IoNotificationsOutline,
  IoReceiptOutline,
  IoWalletOutline,
} from "react-icons/io5";
import AppShell from "@/components/customer/AppShell";
import PageHead from "@/components/customer/PageHead";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function Account() {
  const { isReady } = useRequireAuth();
  const { user, logout } = useAuth();
  const { defaultAddress } = useAddresses();
  const { method } = usePayment();
  const router = useRouter();

  if (!isReady) return null;

  const rows = [
    {
      label: "Saved addresses",
      icon: IoLocationOutline,
      href: "/addresses",
      subtitle: defaultAddress ? defaultAddress.line : "Add a delivery address",
    },
    { label: "Favourites", icon: IoHeartOutline, href: "/favorites" },
    { label: "Order history", icon: IoReceiptOutline, href: "/orders" },
    { label: "Payment methods", icon: IoWalletOutline, href: "/payment-methods", subtitle: method.label },
    { label: "Notifications", icon: IoNotificationsOutline, href: "/notifications" },
    { label: "Help & support", icon: IoHelpCircleOutline, href: "/help" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <PageHead title="Account - SmartRest" />

      <AppShell>
        <div className="min-h-full bg-white">
          <section className="bg-[#32120d] px-5 pb-6 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-white/40">
              Account
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f4c45f] text-[20px] font-black text-[#3c1712]">
                {user?.phone ? user.phone.slice(-2) : "SR"}
              </span>
              <div>
                <p className="text-[18px] font-black leading-tight">
                  +91 {user?.phone ?? "—"}
                </p>
                <p className="text-[12px] font-semibold text-white/50">Kadapa, Andhra Pradesh</p>
              </div>
            </div>
          </section>

          <TabPageHeader title="Settings" variant="section" />

          <div className="px-5 pb-4">
            <div className="overflow-hidden rounded-2xl border border-[#f0e9e0]">
              {rows.map(({ label, icon: Icon, href, subtitle }, index) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => router.push(href)}
                  className={`flex w-full items-center gap-3 bg-white px-4 py-3.5 text-left transition-colors duration-150 active:bg-[#faf5ef] ${
                    index !== rows.length - 1 ? "border-b border-[#f4eee9]" : ""
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f7f0e8] text-[#b3402a]">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-[#241610]">{label}</span>
                    {subtitle ? (
                      <span className="mt-0.5 block truncate text-[11px] font-semibold text-[#a99a8c]">
                        {subtitle}
                      </span>
                    ) : null}
                  </span>
                  <IoChevronForward className="h-4 w-4 shrink-0 text-[#c9c0b7]" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#f3d4d0] py-3.5 text-[14px] font-black text-[#c0402a] transition-colors duration-150 active:bg-[#fdf3f1]"
            >
              <IoLogOutOutline className="h-[18px] w-[18px]" />
              Log out
            </button>
          </div>
        </div>
      </AppShell>
    </>
  );
}
