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
      className={`h-14 w-full rounded-xl text-[18px] font-semibold leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      style={{ backgroundColor, color: textColor }}
      {...rest}
    >
      {children}
    </button>
  );
}
