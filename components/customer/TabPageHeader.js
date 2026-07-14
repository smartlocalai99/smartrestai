export default function TabPageHeader({ title, subtitle }) {
  return (
    <header className="bg-white px-5 pb-2 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <h1 className="text-[26px] font-black tracking-tight text-[#241610]">{title}</h1>
      {subtitle ? (
        <p className="mt-0.5 text-[13px] font-semibold text-[#7b6251]">{subtitle}</p>
      ) : null}
    </header>
  );
}
