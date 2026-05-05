export default function Button({
  backgroundColor,
  textColor = '#FFFFFF',
  children,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`flex w-full min-h-[54px] items-center justify-center rounded-xl px-5 py-[15px] text-[18px] font-semibold leading-[1.6] transition-colors disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor, color: textColor }}
      {...rest}
    >
      {children}
    </button>
  );
}
