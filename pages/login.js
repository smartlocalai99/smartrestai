import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { IoArrowBack, IoCallOutline, IoCheckmark, IoShieldCheckmark } from "react-icons/io5";
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
      onSubmit={(event) => {
        event.preventDefault();
        if (isValid) onSubmit();
      }}
    >
      <h1 className="text-[28px] font-black leading-[1.05] text-white">
        What&apos;s your
        <br />
        mobile number?
      </h1>
      <p className="mt-3 text-[14px] font-semibold leading-5 text-white/60">
        We&apos;ll text you a one-time code to verify it&apos;s you.
      </p>

      <div className="mt-8 flex h-14 items-center gap-3 rounded-2xl bg-white/10 px-4 ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-[#f4c45f]">
        <IoCallOutline className="h-5 w-5 shrink-0 text-white/50" />
        <span className="text-[16px] font-black text-white/80">+91</span>
        <span className="h-6 w-px bg-white/15" />
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
          placeholder="98765 43210"
          aria-label="Mobile number"
          className="min-w-0 flex-1 bg-transparent text-[16px] font-bold tracking-wide text-white outline-none placeholder:text-white/30"
        />
      </div>

      <motion.button
        type="submit"
        disabled={!isValid || isSending}
        whileTap={isValid ? { scale: 0.97 } : undefined}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#32120d] text-[16px] font-black text-white shadow-[0_16px_30px_rgba(50,18,13,0.35)] transition-opacity duration-150 disabled:opacity-35"
      >
        {isSending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Sending OTP…
          </>
        ) : (
          "Send OTP"
        )}
      </motion.button>

      <p className="mt-5 text-center text-[11px] font-semibold leading-4 text-white/35">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.form>
  );
}

function OtpStep({ phone, onBack, onVerified }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
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
          setIsVerified(true);
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
    >
      <AnimatePresence mode="wait">
        {isVerified ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="grid h-20 w-20 place-items-center rounded-full bg-[#32120d]"
            >
              <motion.svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                />
              </motion.svg>
            </motion.span>
            <p className="mt-5 text-[20px] font-black text-white">You&apos;re in!</p>
            <p className="mt-1 text-[13px] font-semibold text-white/55">Taking you back now…</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }}>
            <button
              type="button"
              onClick={onBack}
              className="mb-5 inline-flex items-center gap-1 text-[13px] font-bold text-white/50"
            >
              <IoArrowBack className="h-4 w-4" />
              Change number
            </button>

            <h1 className="text-[26px] font-black leading-[1.1] text-white">Enter the code</h1>
            <p className="mt-2 text-[14px] font-semibold leading-5 text-white/60">
              We sent a {OTP_LENGTH}-digit code to{" "}
              <span className="text-white">+91 {phone}</span>
            </p>

            <motion.div
              animate={shakeControls}
              onPaste={handlePaste}
              className="mt-8 flex justify-between gap-3"
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
                  className={`h-16 w-16 rounded-2xl border-2 bg-white/10 text-center text-[24px] font-black text-white outline-none transition-colors duration-150 ${
                    error ? "border-[#ef4f61]" : "border-white/15 focus:border-[#f4c45f]"
                  }`}
                />
              ))}
            </motion.div>

            <div className="mt-4 min-h-[20px] text-center">
              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[12px] font-bold text-[#ef4f61]"
                >
                  {error}
                </motion.p>
              ) : null}
            </div>

            <button
              type="button"
              disabled={code.length !== OTP_LENGTH || isVerifying}
              onClick={() => attemptVerify(code)}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#32120d] text-[16px] font-black text-white shadow-[0_16px_30px_rgba(50,18,13,0.35)] transition-opacity duration-150 disabled:opacity-35"
            >
              {isVerifying ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                "Verify & Continue"
              )}
            </button>

            <div className="mt-6 text-center text-[13px] font-semibold text-white/45">
              {secondsLeft > 0 ? (
                <span>Resend code in 0:{String(secondsLeft).padStart(2, "0")}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSecondsLeft(RESEND_SECONDS)}
                  className="font-black text-[#f4c45f]"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

  return (
    <>
      <PageHead title="Log in - SmartRest" />

      <main className="h-full w-full overflow-hidden bg-[#1c0f0a]">
        <section className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[#32120d]">
          <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-[#8f2f1d]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#f4c45f]/10 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3 px-5 pt-[calc(1.5rem+env(safe-area-inset-top))]">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => router.back()}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            >
              <IoArrowBack className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.14em] text-white/40">
              <IoShieldCheckmark className="h-4 w-4" />
              Secure login
            </span>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-24">
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
                  onBack={() => setStep("phone")}
                  onVerified={handleVerified}
                />
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </>
  );
}
