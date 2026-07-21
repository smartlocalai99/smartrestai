import { useRouter } from "next/router";
import { motion } from "motion/react";
import {
  IoCheckmarkCircle,
  IoChevronForward,
  IoClose,
  IoLocationOutline,
} from "react-icons/io5";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";

export default function HomeAddressSheet({ onClose }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const {
    addresses,
    defaultAddress,
    setDefault,
    isLoadingAddresses,
    isMutatingAddress,
    addressError,
  } = useAddresses();
  const hasSavedAddresses = isLoggedIn && addresses.length > 0;

  const handleSelect = async (address) => {
    if (address.id === defaultAddress?.id) {
      onClose();
      return;
    }

    try {
      await setDefault(address.id);
      onClose();
    } catch {
      // AddressContext publishes the readable error and the sheet stays open.
    }
  };

  const handleManage = () => {
    onClose();
    router.push("/addresses");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-address-sheet-title"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[78dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-6 pt-3 shadow-2xl"
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-[#ded5ce]" />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <h2 id="home-address-sheet-title" className="text-[18px] font-black text-[#241610]">
              Choose delivery address
            </h2>
            <p className="mt-0.5 text-[12px] font-semibold text-[#8b8580]">
              Select where you want your order delivered
            </p>
          </div>
          <motion.button
            type="button"
            aria-label="Close address selector"
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f4eee9] text-[#5f554c]"
          >
            <IoClose className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        </div>

        {isLoadingAddresses ? (
          <div className="grid min-h-28 place-items-center" aria-label="Loading saved addresses">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#32120d]/25 border-t-[#32120d]" />
          </div>
        ) : hasSavedAddresses ? (
          <div role="radiogroup" aria-label="Saved delivery addresses" className="mt-4 space-y-2">
            {addresses.map((address) => {
              const isSelected = address.id === defaultAddress?.id;

              return (
                <motion.button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${address.label}, ${address.line}`}
                  key={address.id}
                  disabled={isMutatingAddress}
                  onClick={() => handleSelect(address)}
                  whileTap={isMutatingAddress ? undefined : { scale: 0.98 }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left disabled:opacity-60 ${
                    isSelected
                      ? "border-[#32120d] bg-[#f8f1ef]"
                      : "border-[#ece4dc] bg-white"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff7df] text-[#8f2f1d]">
                    <IoLocationOutline className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-black text-[#241610]">
                      {address.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] font-semibold text-[#6f655e]">
                      {address.line}
                    </span>
                  </span>
                  {isSelected ? (
                    <IoCheckmarkCircle className="h-5 w-5 shrink-0 text-[#32120d]" aria-hidden="true" />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ece4dc] bg-[#faf7f4] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff7df] text-[#8f2f1d]">
              <IoLocationOutline className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[13px] font-black text-[#241610]">Kadapa</span>
              <span className="mt-0.5 block text-[12px] font-semibold text-[#8b8580]">
                Add an address for accurate delivery
              </span>
            </span>
          </div>
        )}

        {addressError ? (
          <p className="mt-3 rounded-xl bg-[#fdf1ef] px-3 py-2 text-[12px] font-bold text-[#c0402a]">
            {addressError}
          </p>
        ) : null}

        <motion.button
          type="button"
          onClick={handleManage}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex h-12 w-full items-center justify-center gap-1 rounded-xl bg-[#32120d] text-[13px] font-black text-white"
        >
          Add or manage addresses
          <IoChevronForward className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      </motion.section>
    </motion.div>
  );
}
