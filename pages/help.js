import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IoCallOutline,
  IoChevronDown,
  IoLogoWhatsapp,
  IoMailOutline,
} from "react-icons/io5";
import AppShell from "@/components/customer/AppShell";
import PageHead from "@/components/customer/PageHead";
import TabPageHeader from "@/components/customer/TabPageHeader";

const SUPPORT_PHONE = "+919000000000";
const SUPPORT_EMAIL = "hello@smartrest.in";

const CONTACT_OPTIONS = [
  {
    label: "Call us",
    detail: "+91 90000 00000",
    icon: IoCallOutline,
    href: `tel:${SUPPORT_PHONE}`,
  },
  {
    label: "WhatsApp",
    detail: "Chat with our team",
    icon: IoLogoWhatsapp,
    href: `https://wa.me/${SUPPORT_PHONE.replace("+", "")}`,
  },
  {
    label: "Email",
    detail: SUPPORT_EMAIL,
    icon: IoMailOutline,
    href: `mailto:${SUPPORT_EMAIL}`,
  },
];

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Open the Orders tab from the bottom navigation. Every order you place shows its live status there, from preparing to out for delivery.",
  },
  {
    q: "What area and hours do you deliver in?",
    a: "We deliver across Kadapa daily from 11 AM to 11 PM. If you're near our kitchen, orders usually arrive within 30–40 minutes.",
  },
  {
    q: "Can I cancel or change my order after placing it?",
    a: "Call or WhatsApp us right away — we can usually adjust an order before the kitchen starts cooking, but not once preparation has begun.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery and UPI. Set your preferred option under Account → Payment Methods, and you can still change it at checkout.",
  },
  {
    q: "Do you have vegetarian options?",
    a: "Yes — flip the VEG toggle on the home screen to filter the entire menu down to vegetarian dishes only.",
  },
  {
    q: "Is there a delivery fee?",
    a: "A flat ₹40 delivery fee applies to every order, shown clearly on the checkout screen before you pay.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-[#f4eee9] py-3">
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[14px] font-black text-[#241610]">{q}</span>
        <IoChevronDown
          className={`h-4 w-4 shrink-0 text-[#8b8580] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pt-2 text-[13px] font-semibold leading-5 text-[#7d7169]">{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <PageHead title="Help & Support - SmartRest" />

      <AppShell>
        <div className="min-h-full bg-white">
          <TabPageHeader title="Help & Support" subtitle="We're here if something's not right" />

          <div className="grid grid-cols-3 gap-2 px-4 pt-2">
            {CONTACT_OPTIONS.map(({ label, detail, icon: Icon, href }, index) => (
              <motion.a
                key={label}
                href={href}
                target={label === "WhatsApp" ? "_blank" : undefined}
                rel={label === "WhatsApp" ? "noreferrer" : undefined}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.25 }}
                whileTap={{ scale: 0.93 }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-[#f0e9e0] bg-white py-4 text-center transition-colors duration-150 active:bg-[#faf5ef]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f0e8] text-[#b3402a]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[12px] font-black text-[#241610]">{label}</span>
                <span className="px-1 text-[10px] font-semibold leading-tight text-[#a99a8c]">
                  {detail}
                </span>
              </motion.a>
            ))}
          </div>

          <div className="mt-6 px-5">
            <p className="text-[15px] font-black text-[#241610]">Frequently asked questions</p>
            <div className="mt-1">
              {FAQS.map((item, index) => (
                <FaqItem
                  key={item.q}
                  q={item.q}
                  a={item.a}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              ))}
            </div>
          </div>

          <div className="h-8" />
        </div>
      </AppShell>
    </>
  );
}
