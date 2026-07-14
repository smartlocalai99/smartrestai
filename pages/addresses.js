import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IoBriefcaseOutline,
  IoHomeOutline,
  IoLocationOutline,
  IoPencilOutline,
  IoStar,
  IoStarOutline,
  IoTrashOutline,
} from "react-icons/io5";
import AppShell from "@/components/customer/AppShell";
import EmptyState from "@/components/customer/EmptyState";
import PageHead from "@/components/customer/PageHead";
import TabPageHeader from "@/components/customer/TabPageHeader";
import { useAddresses } from "@/context/AddressContext";
import useRequireAuth from "@/hooks/useRequireAuth";

const LABELS = [
  { id: "Home", icon: IoHomeOutline },
  { id: "Work", icon: IoBriefcaseOutline },
  { id: "Other", icon: IoLocationOutline },
];

const emptyForm = { label: "Home", line: "", landmark: "", phone: "" };

function LabelIcon({ label, className }) {
  const Icon = LABELS.find((l) => l.id === label)?.icon ?? IoLocationOutline;
  return <Icon className={className} />;
}

function AddressSheet({ initialValue, onClose, onSave }) {
  const [form, setForm] = useState(initialValue ?? emptyForm);
  const isValid = form.line.trim().length > 3;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (isValid) onSave(form);
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="w-full max-w-[430px] rounded-t-[28px] bg-white p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-[#e4dcd2]" />
        <p className="text-[17px] font-black text-[#241610]">
          {initialValue ? "Edit address" : "Add new address"}
        </p>

        <div className="mt-4 flex gap-2">
          {LABELS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, label: id }))}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-black transition-colors duration-150 ${
                form.label === id
                  ? "border-[#128647] bg-[#eafff2] text-[#128647]"
                  : "border-[#e4dcd2] text-[#5f554c]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {id}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-[12px] font-bold text-[#8b8580]">Address</span>
          <textarea
            required
            rows={2}
            value={form.line}
            onChange={(event) => setForm((f) => ({ ...f, line: event.target.value }))}
            placeholder="House / flat no., street, area"
            className="mt-1 w-full resize-none rounded-xl border border-[#e4dcd2] px-3 py-2.5 text-[14px] font-semibold text-[#241610] outline-none focus:border-[#128647]"
          />
        </label>

        <label className="mt-3 block">
          <span className="text-[12px] font-bold text-[#8b8580]">Landmark (optional)</span>
          <input
            type="text"
            value={form.landmark}
            onChange={(event) => setForm((f) => ({ ...f, landmark: event.target.value }))}
            placeholder="Near…"
            className="mt-1 w-full rounded-xl border border-[#e4dcd2] px-3 py-2.5 text-[14px] font-semibold text-[#241610] outline-none focus:border-[#128647]"
          />
        </label>

        <label className="mt-3 block">
          <span className="text-[12px] font-bold text-[#8b8580]">Contact number (optional)</span>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(event) =>
              setForm((f) => ({ ...f, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))
            }
            placeholder="98765 43210"
            className="mt-1 w-full rounded-xl border border-[#e4dcd2] px-3 py-2.5 text-[14px] font-semibold text-[#241610] outline-none focus:border-[#128647]"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#e4dcd2] text-[14px] font-black text-[#5f554c]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#128647] text-[14px] font-black text-white disabled:opacity-40"
          >
            Save address
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="rounded-[20px] border border-[#f0e9e0] bg-white p-4 shadow-[0_10px_24px_rgba(43,17,12,0.05)]"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f7f0e8] text-[#b3402a]">
          <LabelIcon label={address.label} className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-black text-[#241610]">{address.label}</p>
            {address.isDefault ? (
              <span className="rounded-full bg-[#eafff2] px-2 py-0.5 text-[10px] font-black text-[#128647]">
                DEFAULT
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] font-semibold leading-5 text-[#5f554c]">{address.line}</p>
          {address.landmark ? (
            <p className="text-[12px] font-semibold text-[#a99a8c]">Near {address.landmark}</p>
          ) : null}
          {address.phone ? (
            <p className="mt-1 text-[12px] font-bold text-[#8b8580]">+91 {address.phone}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-[#f4eee9] pt-3">
        <button
          type="button"
          onClick={onSetDefault}
          disabled={address.isDefault}
          className="inline-flex items-center gap-1 text-[12px] font-black text-[#a56a10] disabled:opacity-40"
        >
          {address.isDefault ? <IoStar className="h-4 w-4" /> : <IoStarOutline className="h-4 w-4" />}
          {address.isDefault ? "Default" : "Set as default"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto inline-flex items-center gap-1 text-[12px] font-black text-[#5f554c]"
        >
          <IoPencilOutline className="h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 text-[12px] font-black text-[#ef4f61]"
        >
          <IoTrashOutline className="h-4 w-4" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default function Addresses() {
  const { isReady } = useRequireAuth();
  const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddresses();
  const [sheet, setSheet] = useState(null); // null | "new" | address object

  if (!isReady) return null;

  const handleSave = (data) => {
    if (sheet && sheet !== "new") {
      updateAddress(sheet.id, data);
    } else {
      addAddress(data);
    }
    setSheet(null);
  };

  return (
    <>
      <PageHead title="Saved Addresses - SmartRest" />

      <AppShell>
        <div className="min-h-full bg-white">
          <TabPageHeader title="Saved Addresses" subtitle="Where should we deliver your order?" />

          {addresses.length === 0 ? (
            <EmptyState
              icon={IoLocationOutline}
              title="No saved addresses"
              message="Add a delivery address so checkout is one tap next time."
            />
          ) : (
            <div className="space-y-3 px-4 pb-4 pt-2">
              <AnimatePresence>
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={() => setSheet(address)}
                    onDelete={() => removeAddress(address.id)}
                    onSetDefault={() => setDefault(address.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="px-4 pb-6">
            <button
              type="button"
              onClick={() => setSheet("new")}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-[#c9d9cf] text-[13px] font-black text-[#128647]"
            >
              + Add New Address
            </button>
          </div>
        </div>
      </AppShell>

      <AnimatePresence>
        {sheet ? (
          <AddressSheet
            key="sheet"
            initialValue={sheet !== "new" ? sheet : null}
            onClose={() => setSheet(null)}
            onSave={handleSave}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
