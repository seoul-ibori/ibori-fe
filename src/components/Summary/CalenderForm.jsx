import MedicineIcon from '@/assets/icons/medicine.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import PlaceIcon from '@/assets/icons/place.svg?react';
import Button from '@/components/common/Button';

function InfoItem({ icon, text, highlight = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-6 items-center justify-center rounded-full bg-[#FFC721]">
        {icon}
      </span>
      <p
        className={`text-[12px] font-medium leading-none ${
          highlight ? 'text-[#E28702] font-semibold' : 'text-[#706963]'
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export default function CalenderForm({ label, time, location, memo }) {
  return (
    <div className="mx-6 mb-4 rounded-[22px] border border-[#FFC721] bg-white px-5 pb-5 pt-7">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-[18px] font-semibold leading-none text-[#252525]">{label}</p>
        <p className="text-[15px] font-medium leading-none text-[#706963]">{time}</p>
      </div>

      <div className="space-y-4">
        <InfoItem
          icon={<PlaceIcon className="size-3 [&_path]:fill-[#AB4C0A]" />}
          text={location || '-'}
        />
        {memo?.trim() ? (
          <InfoItem icon={<PencilIcon className="size-3 [&_path]:fill-[#AB4C0A]" />} text={memo} />
        ) : null}
        <InfoItem
          icon={<MedicineIcon className="size-[9px] [&_path]:fill-[#AB4C0A]" />}
          text="항노르디젠 화이트정10mg"
          highlight
        />
      </div>

      <Button
        backgroundColor="#FFC721"
        textColor="#FFFFFF"
        className="mt-6 rounded-[14px] text-[18px] font-semibold leading-none"
      >
        일정에 녹음 추가하기
      </Button>
    </div>
  );
}
