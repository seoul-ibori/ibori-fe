import SleepBabyIcon from '@/assets/icons/sleep_baby_icon.svg?react';
import { PROFILE_COLOR_MAP } from '@/constants/profileColorData';

export default function ChildrenImgBox({
  imageUrl,
  labelColor = 'SKY_BLUE',
  selected = false,
  className = 'size-11.5 rounded-[15.871px]',
  shadowClassName = 'shadow-[inset_0px_4px_2px_0px_rgba(255,255,255,0.2)]',
}) {
  const mappingColor =
    PROFILE_COLOR_MAP[labelColor] ??
    (typeof labelColor === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(labelColor.trim())
      ? labelColor.trim()
      : null) ??
    PROFILE_COLOR_MAP.SKY_BLUE;
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: mappingColor }}
    >
      <SleepBabyIcon className="absolute inset-0 size-full opacity-90" />
      {imageUrl && (
        <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      {selected && (
        <div
          className={`pointer-events-none absolute inset-0 rounded-[inherit] ${shadowClassName}`}
        />
      )}
    </div>
  );
}
