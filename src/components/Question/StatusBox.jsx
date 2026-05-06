export default function StatusBox({ children, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[51px] w-full items-center justify-center overflow-hidden rounded-[10px] border px-9 py-6 text-[15px] font-medium whitespace-nowrap transition-colors ${
        selected
          ? 'border-[#FFC721] bg-[#FFF8E1] text-[#E28702]'
          : 'border-[#EBE4D9] bg-white text-[#A8A19A]'
      }`}
    >
      {children}
    </button>
  );
}
