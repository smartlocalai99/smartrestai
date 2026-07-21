import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { IoArrowBack } from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";
import PageHead from "@/components/customer/PageHead";
import { safeRedirect } from "@/lib/safeRedirect";

const OTP_LENGTH = 4;
const VALID_OTP = "1234";
const RESEND_SECONDS = 30;

function PhoneStep({ phone, onChange, onSubmit, isSending }) {
  const isValid = phone.length === 10;

  return (
    <motion.form
      key="phone"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col h-full items-center px-6 pt-12"
      onSubmit={(event) => {
        event.preventDefault();
        if (isValid) onSubmit();
      }}
    >
      <div className="relative w-full max-w-[280px] h-[220px]">
        <Image src="/bannerlogin.png" alt="Welcome Foodie" fill className="object-contain" priority />
      </div>

      <div className="text-center mt-6">
        <h1 className="text-[28px] font-black text-[#222222]">
          Fuel your <span className="text-[#32120d]">Cravings!</span>
        </h1>
        <p className="mt-2 text-[13px] font-medium text-gray-400 max-w-[260px] mx-auto leading-relaxed">
          Please enter your valid mobile number to get verified
        </p>
      </div>

      <div className="mt-8 flex h-14 w-full max-w-md items-center gap-3 rounded-[12px] bg-[#f2f2f2] px-4 border border-transparent focus-within:border-[#32120d]/30 focus-within:bg-white transition-colors duration-200">
        <span className="text-[18px]">🇮🇳</span>
        <span className="text-[15px] font-black text-gray-700">+91</span>
        <span className="h-6 w-px bg-gray-300" />
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          autoFocus
          value={phone}
          onChange={(event) => {
            const nextValue = event.target.value.replace(/\D/g, "").slice(0, 10);
            onChange(nextValue);
            if (nextValue.length === 10 && phone.length < 10) {
              onSubmit();
            }
          }}
          placeholder="9866531011"
          aria-label="Mobile number"
          className="min-w-0 flex-1 bg-transparent text-[16px] font-bold tracking-wide text-gray-800 outline-none placeholder:text-gray-400"
        />
      </div>

      <motion.button
        type="submit"
        disabled={!isValid || isSending}
        whileTap={isValid ? { scale: 0.97 } : undefined}
        className="mt-6 flex h-[54px] w-full max-w-md items-center justify-center gap-2 rounded-[24px] bg-[#32120d] text-[16px] font-bold text-white shadow-md transition-opacity duration-150 disabled:opacity-50"
      >
        {isSending ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          "Login"
        )}
      </motion.button>
    </motion.form>
  );
}

function OtpStep({ phone, onVerified, onBack }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);
  const shakeControls = useAnimation();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join("");

  const attemptVerify = (candidate) => {
    setIsVerifying(true);
    setError("");
    setTimeout(async () => {
      if (candidate === VALID_OTP) {
        try {
          await onVerified();
        } catch (verificationError) {
          setIsVerifying(false);
          setError(
            verificationError?.message ||
            "Unable to connect your account. Please try again."
          );
        }
      } else {
        setIsVerifying(false);
        setError("That code doesn't match. Try 1234 for this demo.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        shakeControls.start({
          x: [0, -10, 10, -8, 8, -4, 4, 0],
          transition: { duration: 0.45 },
        });
      }
    }, 500);
  };

  const setDigitAt = (index, value) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = clean;
      return next;
    });

    if (clean && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (clean && index === OTP_LENGTH - 1) {
      const fullCode = [...digits.slice(0, index), clean].join("");
      if (fullCode.length === OTP_LENGTH) attemptVerify(fullCode);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (pasted.length === OTP_LENGTH) attemptVerify(pasted);
  };

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col h-full items-center px-6 pt-12"
    >
      <div className="relative w-full max-w-[280px] h-[220px]">
        <Image src="/bannerlogin.png" alt="Verification" fill className="object-contain" priority />
      </div>

      <div className="text-center mt-6">
        <h1 className="text-[28px] font-black text-[#222222]">Verification</h1>
        <p className="mt-2 text-[13px] font-medium text-gray-400 max-w-[280px] mx-auto leading-relaxed">
          We just sent you an SMS With 6 digit verification code on your number
        </p>
      </div>

      <motion.div
        animate={shakeControls}
        onPaste={handlePaste}
        className="mt-8 flex justify-between gap-2 w-full max-w-[320px]"
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={isVerifying}
            onChange={(event) => setDigitAt(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            aria-label={`Digit ${index + 1}`}
            className={`h-14 w-12 rounded-[12px] border-2 text-center text-[18px] font-bold text-gray-800 outline-none transition-colors duration-150 ${error
              ? "border-[#ef4f61] bg-white"
              : digit
                ? "border-[#32120d] bg-white"
                : "border-gray-100 bg-[#f8f8f8] focus:bg-white focus:border-[#32120d]"
              }`}
          />
        ))}
      </motion.div>

      <div className="mt-3 min-h-[20px] text-center">
        {error ? (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px] font-bold text-[#ef4f61]">
            {error}
          </motion.p>
        ) : null}
      </div>

      <motion.button
        type="button"
        disabled={code.length !== OTP_LENGTH || isVerifying}
        onClick={() => attemptVerify(code)}
        whileTap={code.length === OTP_LENGTH ? { scale: 0.97 } : undefined}
        className="mt-2 flex h-[54px] w-full max-w-md items-center justify-center gap-2 rounded-[24px] bg-[#32120d] text-[16px] font-bold text-white shadow-md transition-opacity duration-150 disabled:opacity-50"
      >
        {isVerifying ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          "Verify"
        )}
      </motion.button>

      <div className="mt-5 flex flex-col gap-4 text-center text-[13px] font-semibold text-gray-400">
        <div>
          {secondsLeft > 0 ? (
            <span>Resend code in 0:{String(secondsLeft).padStart(2, "0")}</span>
          ) : (
            <button type="button" onClick={() => setSecondsLeft(RESEND_SECONDS)} className="font-bold text-[#32120d]">
              Resend OTP
            </button>
          )}
        </div>
        <button type="button" onClick={onBack} className="font-bold text-gray-500 underline decoration-gray-300 underline-offset-4 hover:text-gray-700 transition-colors">
          Change mobile number
        </button>
      </div>
    </motion.div>
  );
}

export default function Login() {
  const router = useRouter();
  const { login, isLoggedIn, isHydrated } = useAuth();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);

  const redirectTarget = useMemo(
    () => safeRedirect(router.query.redirect),
    [router.query.redirect]
  );

  useEffect(() => {
    if (isHydrated && isLoggedIn) {
      router.replace(redirectTarget);
    }
  }, [isHydrated, isLoggedIn, redirectTarget, router]);

  const handleSendOtp = () => {
    if (isSending) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep("otp");
    }, 700);
  };

  const handleVerified = async () => {
    await login(phone);
    setTimeout(() => router.replace(redirectTarget), 700);
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
    } else {
      router.back();
    }
  };

  return (
    <>
      <PageHead title="Log in - SmartRest" />

      <main className="fixed inset-0 overflow-hidden bg-white">
        <section className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-white">
          <div className="absolute top-0 left-0 z-20 flex items-center px-5 pt-[calc(1.5rem+env(safe-area-inset-top))]">
            <button
              type="button"
              aria-label="Go back"
              onClick={handleBack}
              className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200"
            >
              <IoArrowBack className="h-5 w-5" />
            </button>
          </div>

          <div className="relative z-10 flex flex-1 flex-col pb-8">
            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <PhoneStep
                  key="phone-step"
                  phone={phone}
                  onChange={setPhone}
                  onSubmit={handleSendOtp}
                  isSending={isSending}
                />
              ) : (
                <OtpStep
                  key="otp-step"
                  phone={phone}
                  onVerified={handleVerified}
                  onBack={() => setStep("phone")}
                />
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </>
  );
}
