export default function PageTitleBox({ children }) {
  return (
    <div className="inline-flex items-center justify-center rounded-[6.214px] bg-[#FAF7F2] px-3.25 py-1">
      <span className="text-[15px] font-medium whitespace-nowrap text-[#706963]">{children}</span>
    </div>
  );
}
