import SleepBabyIcon from '@/assets/icons/sleep_baby_icon.svg?react';

export default function ChildrenImgBox({
  imageUrl,
  labelColor = '#5AA7FF',
  selected = false,
  className = 'size-11.5 rounded-[15.871px]',
  shadowClassName = 'shadow-[inset_0px_4px_2px_0px_rgba(255,255,255,0.2)]',
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: labelColor }}
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
