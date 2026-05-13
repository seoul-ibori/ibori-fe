import { useState } from 'react';

export default function Button({
  width = 'w-full',
  bgColor = '#FFC721',
  textColor = '#FFFCF9',
  pressedBgColor,
  pressedTextColor,
  icon,
  pressedIcon,
  type = 'button',
  onClick,
  disabled = false,
  children,
  className = '',
}) {
  const [isPressed, setIsPressed] = useState(false);

  const currentBg = isPressed && pressedBgColor ? pressedBgColor : bgColor;
  const currentText = isPressed && pressedTextColor ? pressedTextColor : textColor;
  const currentIcon = isPressed && pressedIcon ? pressedIcon : icon;

  const release = () => setIsPressed(false);

  return (
    <button
      type={type}
      onClick={onClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      disabled={disabled}
      className={`flex h-13.25 items-center justify-center gap-2.5 rounded-[10.161px] px-4 py-3.5 text-[18px] font-semibold tracking-[-0.4px] transition-colors disabled:cursor-not-allowed ${width} ${className}`}
      style={{ backgroundColor: currentBg, color: currentText }}
    >
      {currentIcon}
      {children}
    </button>
  );
}
