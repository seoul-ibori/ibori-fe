export default function Button({
  width = 'w-full',
  bgColor = '#FFC721',
  textColor = '#FFFCF9',
  type = 'button',
  onClick,
  disabled = false,
  children,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14.25 items-center justify-center rounded-[10.161px] px-4 py-3.5 text-[18px] font-semibold tracking-[-0.45px] disabled:opacity-50 ${width}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {children}
    </button>
  );
}
