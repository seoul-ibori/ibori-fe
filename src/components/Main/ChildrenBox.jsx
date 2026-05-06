import SleepBabyIcon from '@/assets/icons/sleep_baby_icon.svg?react';

export default function ChildrenBox({ name, imageUrl, labelColor = '#5AA7FF', selected = false }) {
  return (
    <div className="flex flex-col items-center gap-1.25">
      <div
        className="relative size-11.5 overflow-hidden rounded-[15.871px]"
        style={{ backgroundColor: labelColor }}
      >
        <SleepBabyIcon className="absolute inset-0 size-full opacity-30" />
        {imageUrl && (
          <img src={imageUrl} alt={name} className="absolute inset-0 size-full object-cover" />
        )}
        {selected && (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_4px_2px_0px_rgba(255,255,255,0.2)]" />
        )}
      </div>
      <div
        className="flex items-center justify-center rounded-[5px] px-2 py-0.5"
        style={{ backgroundColor: labelColor }}
      >
        <span className="text-[11px] font-medium tracking-[-0.44px] whitespace-nowrap text-[#FFFCF9]">
          {name}
        </span>
      </div>
    </div>
  );
}
