export default function TabPageHeader({ title, subtitle, variant = "top" }) {
  if (variant === "section") {
    return (
      <header className="bg-white px-5 pb-2 pt-5">
        <h2 className="text-[20px] font-black tracking-tight text-[#241610]">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] font-semibold text-[#7b6251]">{subtitle}</p>
        ) : null}
      </header>
    );
  }

  return (
    <header className="bg-[#32120d] px-5 pb-5 pt-[calc(1.5rem+env(safe-area-inset-top))] text-white">
      <h1 className="text-[24px] font-black tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-0.5 text-[13px] font-semibold text-white/55">{subtitle}</p>
      ) : null}
    </header>
  );
}
