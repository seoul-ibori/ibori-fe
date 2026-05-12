export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="pointer-events-none absolute bottom-30 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.75 rounded-full bg-white px-4 py-2.25 shadow-[0px_0px_9px_0px_rgba(112,105,99,0.3)]">
      <div className="flex size-6.25 shrink-0 items-center justify-center rounded-full bg-[#FFC721]">
        <svg viewBox="0 0 24 24" fill="none" className="size-4">
          <path d="M12 7v6" stroke="#FFFCF9" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.2" fill="#FFFCF9" />
        </svg>
      </div>
      <p className="text-[14px] leading-[1.6] font-semibold whitespace-nowrap text-[#1D1B1A]">
        {message}
      </p>
    </div>
  );
}
