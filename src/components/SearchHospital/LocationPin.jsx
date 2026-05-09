import DayPin from '@/assets/icons/searchHospital/day_pin.svg?react';
import NightPin from '@/assets/icons/searchHospital/night_pin.svg?react';

export default function LocationPin({ isDay = true, onClick }) {
  const Pin = isDay ? DayPin : NightPin;

  return (
    <button type="button" onClick={onClick} className="block">
      <Pin className="h-[79px] w-15" />
    </button>
  );
}
