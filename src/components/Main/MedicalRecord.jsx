import MedicalRecordIcon from '@/assets/icons/main/medical_record_icon.svg?react';
import PillIcon from '@/assets/icons/pill_icon.svg?react';
import PillNoneIcon from '@/assets/icons/pill_none_icon.svg?react';

export default function MedicalRecord({ hospitalName, medicineName, date, category }) {
  return (
    <div className="flex items-center">
      <div className="flex h-26.25 w-24.25 shrink-0 items-center justify-center overflow-hidden">
        <MedicalRecordIcon className="size-full" />
      </div>
      <div className="flex h-26.25 flex-1 flex-col justify-center gap-1.5 border-b border-[#FAF7F2]">
        <p className="text-[15px] font-semibold tracking-[-0.375px] text-[#413B32]">
          {hospitalName}
        </p>
        <div className="flex items-center gap-1.25">
          {medicineName ? (
            <PillIcon className="size-4.5 shrink-0" />
          ) : (
            <PillNoneIcon className="size-4.5 shrink-0" />
          )}
          <p
            className={`whitespace-nowrap text-[15px] font-bold ${medicineName ? 'text-[#AB4C0A]' : 'text-[#B9B2A6]'}`}
          >
            {medicineName || '불러올 약 정보가 없어요.'}
          </p>
        </div>
        <div className="flex items-center gap-2.75 text-[12px] font-medium">
          <p className="text-[#B9B2A6]">{date}</p>
          <p className="text-[#FFC721]">{category}</p>
        </div>
      </div>
    </div>
  );
}
