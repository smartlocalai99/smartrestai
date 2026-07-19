import { useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "motion/react";
import {
  IoAlertCircleOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoHomeOutline,
  IoLocationOutline,
  IoNavigateOutline,
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
import { getCurrentCoords, reverseGeocode } from "@/lib/reverseGeocode";
import { safeRedirect } from "@/lib/safeRedirect";

const LABELS = [
  { id: "Home", icon: IoHomeOutline },
  { id: "Work", icon: IoBriefcaseOutline },
  { id: "Other", icon: IoLocationOutline },
];

const emptyForm = { label: "Home", line: "", landmark: "", phone: "", lat: null, lng: null };

function LabelIcon({ label, className }) {
  const Icon = LABELS.find((l) => l.id === label)?.icon ?? IoLocationOutline;
  return <Icon className={className} />;
}

function AddressSheet({ initialValue, onClose, onSave, isSaving, saveError }) {
  const [form, setForm] = useState(initialValue ?? emptyForm);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const isValid = form.line.trim().length > 3;

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocateError("");
    try {
      const { lat, lon } = await getCurrentCoords();
      const { line, landmark } = await reverseGeocode(lat, lon);
      setForm((f) => ({ ...f, line, landmark: landmark || f.landmark, lat, lng: lon }));
    } catch (error) {
      setLocateError(error.message || "Couldn't get your location. Enter it manually.");
    } finally {
      setIsLocating(false);
    }
  };

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
            <motion.button
              key={id}
              type="button"
              onClick={() => setForm((f) => ({ ...f, label: id }))}
              whileTap={{ scale: 0.93 }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-black transition-colors duration-150 ${
                form.label === id
                  ? "border-[#32120d] bg-[#f5ecea] text-[#32120d]"
                  : "border-[#e4dcd2] text-[#5f554c]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {id}
            </motion.button>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          whileTap={isLocating ? undefined : { scale: 0.97 }}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#32120d] text-[13px] font-black text-[#32120d] disabled:opacity-60"
        >
          {isLocating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#32120d]/30 border-t-[#32120d]" />
          ) : (
            <IoNavigateOutline className="h-4 w-4" />
          )}
          {isLocating ? "Finding your location…" : "Use current location"}
        </motion.button>

        {locateError ? (
          <p className="mt-2 flex items-start gap-1.5 text-[12px] font-semibold text-[#c0402a]">
            <IoAlertCircleOutline className="mt-0.5 h-4 w-4 shrink-0" />
            {locateError}
          </p>
        ) : null}

        <label className="mt-4 block">
          <span className="text-[12px] font-bold text-[#8b8580]">Address</span>
          <textarea
            required
            rows={2}
            value={form.line}
            onChange={(event) => setForm((f) => ({ ...f, line: event.target.value }))}
            placeholder="House / flat no., street, area"
            className="mt-1 w-full resize-none rounded-xl border border-[#e4dcd2] px-3 py-2.5 text-[14px] font-semibold text-[#241610] outline-none focus:border-[#32120d]"
          />
        </label>

        <label className="mt-3 block">
          <span className="text-[12px] font-bold text-[#8b8580]">Landmark (optional)</span>
          <input
            type="text"
            value={form.landmark}
            onChange={(event) => setForm((f) => ({ ...f, landmark: event.target.value }))}
            placeholder="Near…"
            className="mt-1 w-full rounded-xl border border-[#e4dcd2] px-3 py-2.5 text-[14px] font-semibold text-[#241610] outline-none focus:border-[#32120d]"
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
            className="mt-1 w-full rounded-xl border border-[#e4dcd2] px-3 py-2.5 text-[14px] font-semibold text-[#241610] outline-none focus:border-[#32120d]"
          />
        </label>

        <div className="mt-5 flex gap-3">
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.96 }}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#e4dcd2] text-[14px] font-black text-[#5f554c]"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={!isValid || isSaving}
            whileTap={isValid && !isSaving ? { scale: 0.96 } : undefined}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#32120d] text-[14px] font-black text-white disabled:opacity-40"
          >
            {isSaving ? "Saving…" : "Save address"}
          </motion.button>
        </div>
        {saveError ? (
          <p className="mt-3 text-center text-[12px] font-bold text-[#c0402a]">{saveError}</p>
        ) : null}
      </motion.form>
    </motion.div>
  );
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, isBusy }) {
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
              <span className="rounded-full bg-[#f5ecea] px-2 py-0.5 text-[10px] font-black text-[#32120d]">
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
        <motion.button
          type="button"
          onClick={onSetDefault}
          disabled={address.isDefault || isBusy}
          whileTap={address.isDefault || isBusy ? undefined : { scale: 0.94 }}
          className="inline-flex items-center gap-1 text-[12px] font-black text-[#a56a10] disabled:opacity-40"
        >
          {address.isDefault ? <IoStar className="h-4 w-4" /> : <IoStarOutline className="h-4 w-4" />}
          {address.isDefault ? "Default" : "Set as default"}
        </motion.button>
        <motion.button
          type="button"
          onClick={onEdit}
          disabled={isBusy}
          whileTap={isBusy ? undefined : { scale: 0.94 }}
          className="ml-auto inline-flex items-center gap-1 text-[12px] font-black text-[#5f554c]"
        >
          <IoPencilOutline className="h-4 w-4" />
          Edit
        </motion.button>
        <motion.button
          type="button"
          onClick={onDelete}
          disabled={isBusy}
          whileTap={isBusy ? undefined : { scale: 0.94 }}
          className="inline-flex items-center gap-1 text-[12px] font-black text-[#ef4f61]"
        >
          <IoTrashOutline className="h-4 w-4" />
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Addresses() {
  const { isReady } = useRequireAuth();
  const {
    addresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault,
    isLoadingAddresses,
    isMutatingAddress,
    addressError,
  } = useAddresses();
  const [sheet, setSheet] = useState(null); // null | "new" | address object
  const [justSaved, setJustSaved] = useState(false);
  const router = useRouter();

  if (!isReady) return null;

  const redirectParam = typeof router.query.redirect === "string" ? router.query.redirect : null;

  const handleSave = async (data) => {
    try {
      if (sheet && sheet !== "new") {
        await updateAddress(sheet.id, data);
      } else {
        await addAddress(data);
      }
      setSheet(null);

      if (redirectParam) {
        router.push(safeRedirect(redirectParam));
        return;
      }

      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
    } catch {
      // The context keeps the sheet open and provides the readable error.
    }
  };

  return (
    <>
      <PageHead title="Saved Addresses - SmartRest" />

      <AppShell showCheckoutButton={false}>
        <div className="min-h-full bg-white">
          <TabPageHeader title="Saved Addresses" subtitle="Where should we deliver your order?" />

          {redirectParam && addresses.length === 0 ? (
            <div className="mx-4 mt-3 rounded-2xl border border-[#f3d4d0] bg-[#fdf6f4] px-4 py-3">
              <p className="text-[13px] font-black text-[#c0402a]">Add an address to continue</p>
              <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#a56a58]">
                We need a delivery address before you can place your order.
              </p>
            </div>
          ) : null}

          {addressError && !sheet ? (
            <p className="mx-4 mt-3 rounded-xl bg-[#fdf1ef] px-3 py-2 text-[12px] font-bold text-[#c0402a]">
              {addressError}
            </p>
          ) : null}

          {isLoadingAddresses ? (
            <div className="grid min-h-48 place-items-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#32120d]/25 border-t-[#32120d]" />
            </div>
          ) : addresses.length === 0 ? (
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
                    isBusy={isMutatingAddress}
                    onEdit={() => setSheet(address)}
                    onDelete={() => removeAddress(address.id).catch(() => {})}
                    onSetDefault={() => setDefault(address.id).catch(() => {})}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="px-4 pb-6">
            <motion.button
              type="button"
              onClick={() => setSheet("new")}
              disabled={isLoadingAddresses || isMutatingAddress}
              whileTap={isLoadingAddresses || isMutatingAddress ? undefined : { scale: 0.97 }}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-[#d8c6c2] text-[13px] font-black text-[#32120d]"
            >
              + Add New Address
            </motion.button>
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
            isSaving={isMutatingAddress}
            saveError={addressError}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {justSaved ? (
          <motion.div
            initial={{ opacity: 0, y: -16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -16, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-[calc(1rem+env(safe-area-inset-top))] z-[60] flex items-center gap-2 rounded-full bg-[#241610] px-4 py-2.5 text-white shadow-xl"
          >
            <IoCheckmarkCircle className="h-4 w-4 text-[#32120d]" />
            <span className="text-[13px] font-bold">Address saved</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
