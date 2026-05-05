import { useState } from 'react';

export default function Button({
  width = 'w-full',
  bgColor = '#FFC721',
  textColor = '#FFFCF9',
  pressedBgColor,
  pressedTextColor,
  type = 'button',
  onClick,
  disabled = false,
  children,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const currentBg = isPressed && pressedBgColor ? pressedBgColor : bgColor;
  const currentText = isPressed && pressedTextColor ? pressedTextColor : textColor;

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
      className={`flex h-14.25 items-center justify-center rounded-[10.161px] px-4 py-3.5 text-[18px] font-semibold tracking-[-0.45px] transition-colors disabled:cursor-not-allowed ${width}`}
      style={{ backgroundColor: currentBg, color: currentText }}
    >
      {children}
    </button>
  );
}
