import MoonIcon from '@/assets/icons/searchHospital/moon_icon.svg?react';

export default function NightButton({ isDay = true, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!isDay}
      aria-label={isDay ? '밤 모드로 전환' : '낮 모드로 전환'}
      className="relative size-12.25 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_2px_8px_1px_#dce0e7]"
    >
      <span
        className={`absolute left-1/2 top-1/2 size-12.25 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity ${
          isDay ? 'opacity-30' : 'opacity-100'
        }`}
        style={{
          backgroundImage: 'linear-gradient(145.56deg, #47404D 27.4%, #201B24 89.7%)',
        }}
      />
      <MoonIcon className="absolute left-1/2 top-1/2 size-9.25 -translate-x-1/2 -translate-y-1/2" />
    </button>
  );
}
